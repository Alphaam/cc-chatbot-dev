"""Export the approved PDF to a fixed-layout, 4K PowerPoint.

Requires PyMuPDF and the Node package pptxgenjs in the export environment.
The website does not need either dependency. NODE_PATH can point to an
external installation of pptxgenjs.
"""

import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

import pymupdf


NODE_EXPORT = r"""
const fs = require('node:fs');
const PptxGenJS = require('pptxgenjs');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'SOURCE', width: input.width, height: input.height });
pptx.layout = 'SOURCE';
pptx.author = 'HR&A Tech & Society Studio';
pptx.subject = 'Fixed-layout export preserving the approved presentation';
pptx.title = 'HR&A Tech & Society Studio';
// PptxGenJS writes the company property directly into app.xml without escaping.
pptx.company = 'HR&amp;A';
pptx.lang = 'en-US';
pptx.revision = '1';
for (const [index, page] of input.pages.entries()) {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  slide.addImage({
    path: page.image,
    x: 0, y: 0, w: input.width, h: input.height,
    altText: page.text,
    objectName: `Slide ${index + 1}: preserved 4K artwork`,
  });
  slide.addNotes([
    'Fixed-layout fidelity edition. Slide text, icons, and layout are preserved as a single 4K image to prevent font substitution and reflow. Individual text boxes are not editable. The editable web source and selectable-text PDF remain available separately.',
    '',
    page.text,
  ].join('\n'));
}
pptx.writeFile({ fileName: input.output, compression: true }).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
"""


def validate(output, pages, width, height):
    ns = {
        'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    }
    with ZipFile(output) as archive:
        assert archive.testzip() is None, 'Corrupt PowerPoint package'
        for name in archive.namelist():
            if name.endswith(('.xml', '.rels')):
                ET.fromstring(archive.read(name))
        presentation = ET.fromstring(archive.read('ppt/presentation.xml'))
        assert len(presentation.find('p:sldIdLst', ns)) == len(pages)
        dimensions = presentation.find('p:sldSz', ns)
        expected = (round(width * 914400), round(height * 914400))
        assert (int(dimensions.get('cx')), int(dimensions.get('cy'))) == expected
        for index, page in enumerate(pages, start=1):
            slide = ET.fromstring(archive.read(f'ppt/slides/slide{index}.xml'))
            pictures = slide.findall('.//p:pic', ns)
            assert len(pictures) == 1, f'Unexpected artwork count on slide {index}'
            assert not slide.findall('.//p:sp', ns), 'Unexpected text reflow risk'
            picture = pictures[0]
            transform = picture.find('p:spPr/a:xfrm', ns)
            offset = transform.find('a:off', ns)
            extent = transform.find('a:ext', ns)
            assert (int(offset.get('x')), int(offset.get('y'))) == (0, 0)
            assert (int(extent.get('cx')), int(extent.get('cy'))) == expected
            assert picture.find('p:blipFill/a:srcRect', ns) is None, 'Unexpected crop'
            image_id = picture.find('p:blipFill/a:blip', ns).get(f'{{{ns["r"]}}}embed')
            relationships = ET.fromstring(archive.read(f'ppt/slides/_rels/slide{index}.xml.rels'))
            relationship = next(rel for rel in relationships if rel.get('Id') == image_id)
            image_path = 'ppt/' + relationship.get('Target').removeprefix('../')
            source_hash = hashlib.sha256(Path(page['image']).read_bytes()).digest()
            assert hashlib.sha256(archive.read(image_path)).digest() == source_hash, 'Image changed during packaging'
            assert f'ppt/notesSlides/notesSlide{index}.xml' in archive.namelist()
            assert all(rel.get('TargetMode') != 'External' for rel in relationships), 'External dependency'
    print(f'Validated {len(pages)} slides: exact artwork, matching dimensions, no cropping, no font dependencies, and complete transcripts in notes.')


def main():
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=root / 'public/presentation/studio-rebuilt.pdf')
    parser.add_argument('--output', type=Path, default=root / 'public/presentation/studio-rebuilt.pptx')
    args = parser.parse_args()
    with pymupdf.open(args.source) as document, tempfile.TemporaryDirectory(prefix='studio-pptx-') as directory:
        assert len(document) == 10, 'Expected the approved 10-slide deck'
        width, height = document[0].rect.width / 72, document[0].rect.height / 72
        pages = []
        for index, page in enumerate(document):
            assert page.rect == document[0].rect, 'Mixed page dimensions'
            text = page.get_text().strip()
            assert len(text) > 200, f'Missing source content on slide {index + 1}'
            image = Path(directory) / f'slide-{index + 1:02}.png'
            page.get_pixmap(matrix=pymupdf.Matrix(3840 / page.rect.width, 3840 / page.rect.width), alpha=False).save(image)
            pages.append({'image': str(image), 'text': text})
        subprocess.run(['node', '-e', NODE_EXPORT], input=json.dumps({
            'width': width,
            'height': height,
            'pages': pages,
            'output': str(args.output.resolve()),
        }), text=True, check=True)
        validate(args.output, pages, width, height)
        print(f'Created {args.output.name}: {args.output.stat().st_size / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
