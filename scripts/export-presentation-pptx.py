"""Export the approved slides with editable text and embedded Albert Sans fonts.

Export-only dependencies: PyMuPDF, fonttools, playwright, pptxgenjs, and
@sparticuz/chromium. Set PYTHONPATH / NODE_PATH to their installations.
The preview server supplies computed typography; the approved PDF supplies
exact baselines, line breaks, colors, and non-text artwork.
"""

import argparse
import io
import json
import re
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED

import pymupdf
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


NODE_CAPTURE = r"""
const { chromium } = require('playwright');
const runtime = require('@sparticuz/chromium');
(async () => {
  const engine = runtime.default || runtime;
  const browser = await chromium.launch({
    executablePath: await engine.executablePath(), args: engine.args,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1536, height: 864 } });
    await page.goto(process.argv[1], { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const slides = await page.locator('.print-deck .rebuilt').evaluateAll(slides => slides.map(slide => {
      const root = slide.getBoundingClientRect();
      const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest('svg')) continue;
        const style = getComputedStyle(node.parentElement);
        const range = document.createRange();
        range.selectNodeContents(node);
        nodes.push({
          text: node.textContent, weight: Number(style.fontWeight),
          size: parseFloat(style.fontSize) * .75,
          tracking: (parseFloat(style.letterSpacing) || 0) * .75,
          underline: style.textDecorationLine.includes('underline'),
          opacity: Number(style.opacity),
          rects: Array.from(range.getClientRects()).map(rect => ({
            x: (rect.x - root.x) * .75, y: (rect.y - root.y) * .75,
          })),
        });
      }
      return nodes;
    }));
    console.log(JSON.stringify(slides));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
"""

NODE_EXPORT = r"""
const fs = require('node:fs');
const PptxGenJS = require('pptxgenjs');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'SOURCE', width: input.width, height: input.height });
pptx.layout = 'SOURCE';
pptx.author = 'HR&A Tech & Society Studio';
pptx.subject = 'Editable text edition with original layout and embedded fonts';
pptx.title = 'HR&A Tech & Society Studio';
// PptxGenJS writes the company property directly into app.xml without escaping.
pptx.company = 'HR&amp;A';
pptx.lang = 'en-US';
pptx.revision = '2';
pptx.theme = { headFontFace: 'Albert Sans Medium', bodyFontFace: 'Albert Sans' };
for (const [index, page] of input.pages.entries()) {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  slide.addImage({
    path: page.image, x: 0, y: 0, w: input.width, h: input.height,
    altText: 'Original illustrations, icons, and decorative layout. All presentation text is in separate editable text boxes.',
    objectName: 'Non-text design artwork',
  });
  for (const [lineIndex, line] of page.lines.entries()) {
    slide.addText(line.text, {
      x: line.x / 72, y: line.y / 72, w: line.width / 72, h: line.height / 72,
      fontFace: line.family, fontSize: line.size, color: line.color,
      charSpacing: line.tracking, margin: 0, breakLine: false,
      valign: 'top', align: 'left', wrap: false, inset: 0,
      paraSpaceBeforePt: 0, paraSpaceAfterPt: 0,
      transparency: line.transparency,
      objectName: `Editable text ${lineIndex + 1}: ${line.text.slice(0, 55)}`,
    });
  }
  slide.addNotes([
    'Editable text edition. Headings, body copy, labels, and footers are native PowerPoint text boxes. Original line breaks are retained in separate boxes to preserve the layout. Albert Sans fonts are embedded with the complete character sets for editing. Illustrations, icons, and decorative layout remain in the background artwork; text inside device screenshots is part of those images.',
    '', page.text,
  ].join('\n'));
}
pptx.writeFile({ fileName: input.output, compression: true }).catch(error => {
  console.error(error); process.exitCode = 1;
});
"""

NS = {
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}
REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
CT_NS = 'http://schemas.openxmlformats.org/package/2006/content-types'
for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)


def typography_for(span, nodes):
    text = span['text'].strip()
    candidates = []
    for node in nodes:
        if (text not in node['text'] and node['text'].strip() not in text) or abs(node['size'] - span['size']) > .15:
            continue
        for rect in node['rects']:
            score = abs(rect['x'] - span['origin'][0]) + abs(rect['y'] - span['bbox'][1])
            candidates.append((score, node))
    assert candidates, f'No source typography found for {text!r}'
    return min(candidates, key=lambda candidate: candidate[0])[1]


def prepare_fonts(directory, weights):
    base = 'https://raw.githubusercontent.com/google/fonts/main/ofl/albertsans/'
    data = urllib.request.urlopen(base + 'AlbertSans%5Bwght%5D.ttf', timeout=60).read()
    license_text = urllib.request.urlopen(base + 'OFL.txt', timeout=60).read()
    names = {400: 'Albert Sans', 500: 'Albert Sans Medium', 600: 'Albert Sans SemiBold', 700: 'Albert Sans Bold'}
    fonts = {}
    for weight in sorted(weights):
        font = instantiateVariableFont(TTFont(io.BytesIO(data)), {'wght': weight}, inplace=True)
        assert font['OS/2'].fsType == 0, 'Font does not permit unrestricted embedding'
        family = names[weight]
        # Distinct static families preserve CSS intermediate weights in PowerPoint.
        font['name'].names = [entry for entry in font['name'].names if entry.nameID not in (1, 2, 3, 4, 6, 16, 17)]
        for name_id, value in {1: family, 2: 'Regular', 3: family + ' 1.0', 4: family, 6: family.replace(' ', '') + '-Regular', 16: family, 17: 'Regular'}.items():
            font['name'].setName(value, name_id, 3, 1, 0x409)
        font['OS/2'].fsSelection &= ~((1 << 0) | (1 << 5))
        font['OS/2'].fsSelection |= (1 << 6)
        font['head'].macStyle = 0
        path = directory / (family.replace(' ', '-') + '.ttf')
        font.save(path)
        fonts[weight] = {
            'family': family, 'path': path,
            'ascent': font['hhea'].ascent / font['head'].unitsPerEm,
        }
    return fonts, license_text


def embed_fonts(output, fonts):
    with ZipFile(output) as source:
        parts = {name: source.read(name) for name in source.namelist()}
    presentation = ET.fromstring(parts['ppt/presentation.xml'])
    presentation.set('embedTrueTypeFonts', '1')
    presentation.set('saveSubsetFonts', '0')
    listing = ET.Element(f'{{{NS["p"]}}}embeddedFontLst')
    notes = presentation.find('p:notesSz', NS)
    presentation.insert(list(presentation).index(notes) + 1, listing)
    rels = ET.fromstring(parts['ppt/_rels/presentation.xml.rels'])
    types = ET.fromstring(parts['[Content_Types].xml'])
    ET.SubElement(types, f'{{{CT_NS}}}Default', {'Extension': 'fntdata', 'ContentType': 'application/x-fontdata'})
    for index, font in enumerate(fonts.values(), 1):
        rid = f'rIdEditableFont{index}'
        file_name = f'fonts/font{index}.fntdata'
        parts['ppt/' + file_name] = font['path'].read_bytes()
        ET.SubElement(rels, f'{{{REL_NS}}}Relationship', {'Id': rid, 'Type': NS['r'] + '/font', 'Target': file_name})
        entry = ET.SubElement(listing, f'{{{NS["p"]}}}embeddedFont')
        ET.SubElement(entry, f'{{{NS["p"]}}}font', {'typeface': font['family'], 'pitchFamily': '34', 'charset': '0'})
        ET.SubElement(entry, f'{{{NS["p"]}}}regular', {f'{{{NS["r"]}}}id': rid})
    for name, element in [('ppt/presentation.xml', presentation), ('ppt/_rels/presentation.xml.rels', rels), ('[Content_Types].xml', types)]:
        parts[name] = ET.tostring(element, encoding='utf-8', xml_declaration=True)
    with ZipFile(output, 'w', ZIP_DEFLATED) as target:
        for name, data in parts.items():
            target.writestr(name, data)


def validate(output, pages, width, height, fonts):
    with ZipFile(output) as archive:
        assert archive.testzip() is None
        for name in archive.namelist():
            if name.endswith(('.xml', '.rels')):
                ET.fromstring(archive.read(name))
        presentation = ET.fromstring(archive.read('ppt/presentation.xml'))
        assert len(presentation.find('p:sldIdLst', NS)) == len(pages)
        assert len(presentation.find('p:embeddedFontLst', NS)) == len(fonts)
        total = 0
        for index, page in enumerate(pages, 1):
            slide = ET.fromstring(archive.read(f'ppt/slides/slide{index}.xml'))
            texts = slide.findall('.//p:sp', NS)
            assert len(texts) == len(page['lines'])
            for element, line in zip(texts, page['lines']):
                assert ''.join(node.text or '' for node in element.findall('.//a:t', NS)) == line['text']
                transform = element.find('p:spPr/a:xfrm', NS)
                offset, extent = transform.find('a:off', NS), transform.find('a:ext', NS)
                for pos, size, maximum in [('x', 'cx', width), ('y', 'cy', height)]:
                    assert int(offset.get(pos)) >= 0
                    assert int(offset.get(pos)) + int(extent.get(size)) <= round(maximum * 914400) + 10
            total += len(texts)
            print(f'Slide {index}: {len(texts)} editable text boxes, all within slide bounds')
    print(f'Validated {total} native text boxes and {len(fonts)} fully embedded font faces.')


def main():
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=root / 'public/presentation/studio-rebuilt.pdf')
    parser.add_argument('--output', type=Path, default=root / 'public/presentation/studio-editable.pptx')
    parser.add_argument('--preview-url', default='http://localhost:3000/presentation')
    parser.add_argument('--font-directory', type=Path)
    parser.add_argument('--baseline-factor', type=float, default=1.0)
    args = parser.parse_args()
    captured = subprocess.run(['node', '-e', NODE_CAPTURE, args.preview_url], check=True, text=True, capture_output=True)
    typography = json.loads(captured.stdout)
    with pymupdf.open(args.source) as document, tempfile.TemporaryDirectory(prefix='studio-pptx-') as temporary:
        directory = Path(temporary)
        assert len(document) == len(typography) == 10
        weights = {node['weight'] for nodes in typography for node in nodes}
        font_directory = args.font_directory or directory
        font_directory.mkdir(parents=True, exist_ok=True)
        fonts, license_text = prepare_fonts(font_directory, weights)
        width, height = document[0].rect.width / 72, document[0].rect.height / 72
        pages = []
        for index, page in enumerate(document):
            text = page.get_text().strip()
            lines = []
            for block in page.get_text('dict', flags=pymupdf.TEXT_PRESERVE_WHITESPACE)['blocks']:
                if block['type'] != 0:
                    continue
                for line in block['lines']:
                    for span in line['spans']:
                        if not span['text'].strip():
                            continue
                        style = typography_for(span, typography[index])
                        font = fonts[style['weight']]
                        size = span['size']
                        lines.append({
                            'text': span['text'], 'family': font['family'], 'size': size,
                            'x': span['origin'][0],
                            'y': span['origin'][1] - size * font['ascent'] * args.baseline_factor,
                            'width': min(span['bbox'][2] - span['bbox'][0] + size * .55, page.rect.width - span['origin'][0]),
                            'height': size * 1.4, 'tracking': style['tracking'],
                            'color': f'{span["color"]:06X}',
                            'transparency': round((1 - span.get('alpha', 255) / 255) * 100),
                        })
            # Work on a copy because the PDF reuses text-bearing forms across pages.
            image = directory / f'artwork-{index + 1:02}.png'
            with pymupdf.open() as background:
                background.insert_pdf(document, from_page=index, to_page=index)
                artwork = background[0]
                for xref in set(artwork.get_contents() + [form[0] for form in artwork.get_xobjects()]):
                    stream = background.xref_stream(xref)
                    background.update_stream(xref, re.sub(rb'\bBT\b.*?\bET\b', b'', stream, flags=re.S))
                artwork = background.reload_page(artwork)
                assert not artwork.get_text().strip(), f'Flattened text remains on slide {index + 1}'
                artwork.get_pixmap(matrix=pymupdf.Matrix(3840 / page.rect.width, 3840 / page.rect.width), alpha=False).save(image)
            pages.append({'image': str(image), 'text': text, 'lines': lines})
        subprocess.run(['node', '-e', NODE_EXPORT], input=json.dumps({
            'width': width, 'height': height, 'pages': pages, 'output': str(args.output.resolve()),
        }), text=True, check=True)
        embed_fonts(args.output, fonts)
        validate(args.output, pages, width, height, fonts)
        with ZipFile(args.output.with_name('studio-editable-fonts.zip'), 'w', ZIP_DEFLATED) as archive:
            archive.writestr('OFL.txt', license_text)
            for font in fonts.values():
                archive.write(font['path'], font['path'].name)
        print(f'Created {args.output.name}: {args.output.stat().st_size / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
