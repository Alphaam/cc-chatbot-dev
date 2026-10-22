import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { translate, translateCopy, translateServiceType, spanish } from '../lib/i18n.ts';
import { resourceSpanish } from '../lib/resource-translations.ts';
import { SERVICES, SERVICE_TYPES } from '../lib/services.ts';
import { HOUSEHOLD_SIZE_OPTIONS, DEVICE_COUNT_OPTIONS, USAGE_PROFILE_OPTIONS, getProviderWebsite } from '../lib/plan-utils.ts';
import { downloadCsv, toCsv } from '../lib/csv.ts';

test('guided options and service categories all have Spanish labels without changing values', () => {
  const options = [...HOUSEHOLD_SIZE_OPTIONS, ...DEVICE_COUNT_OPTIONS, ...USAGE_PROFILE_OPTIONS];
  for (const { label } of options) assert.ok(spanish[label], label);
  for (const type of SERVICE_TYPES) assert.ok(spanish[type], type);
  assert.equal(HOUSEHOLD_SIZE_OPTIONS[1].value, '2-3');
  assert.equal(USAGE_PROFILE_OPTIONS[0].value, 'basic');
});

test('every nonempty resource description has an exact Spanish translation', () => {
  for (const service of SERVICES) {
    if (service.description) assert.ok(resourceSpanish[service.description], `${service.name}: ${service.description}`);
  }
  assert.equal(resourceSpanish['A new, untranslated description'], undefined);
});

test('translations preserve interpolation variables and emergency numbers', () => {
  for (const [source, target] of Object.entries(spanish)) {
    const variables = text => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
    assert.deepEqual(variables(target), variables(source), source);
    assert.ok(!target.includes('—'), source);
  }
  const emergency = 'For emergencies, call 911 · Mental health crisis, call or text 988 · Social services, call 211';
  assert.deepEqual(translate('es', emergency).match(/\d+/g), ['911', '988', '211']);
});

test('confirmation templates preserve the exact address', () => {
  const address = '1700 Pinto Lane, Las Vegas, NV 89106';
  const copy = { key: 'Did you mean **{address}**?', values: { address } };
  assert.equal(translateCopy('es', copy), `¿Se refiere a **${address}**?`);
  assert.equal(translateCopy('en', copy), `Did you mean **${address}**?`);
});

test('answer templates translate presentation, not stable IDs', () => {
  assert.equal(translateCopy('es', { key: 'Household: {value}', values: { value: '2-3 people' } }), 'Hogar: 2-3 personas');
  assert.equal(translateServiceType('es', 'Digital Skills Training, Device Access Resources'), 'Capacitación en habilidades digitales, Acceso a dispositivos');
  assert.equal(translateCopy('es', { key: 'Here are the {type} resources near this address.', values: { type: 'Device Access Resources' } }), 'Estos son los recursos de la categoría «acceso a dispositivos» cerca de esta dirección.');
});

test('unknown locale catalog entries preserve original source text', () => {
  assert.equal(translate('es', 'Provider Name'), 'Provider Name');
  assert.equal(translate('es', 'Phone: {phone}', { phone: '(702) 123-4567' }), 'Teléfono: (702) 123-4567');
});

test('server metadata follows the saved language and rejects unsupported locales', async () => {
  const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'generateMetadata');
  assert.ok(fn);
  const compiled = ts.transpileModule(fn.getText(ast), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  for (const value of ['es', 'en', 'unsupported', undefined]) {
    const exports = {};
    const cookies = async () => ({ get: () => value ? { value } : undefined });
    new Function('exports', 'cookies', 'translate', compiled.outputText)(exports, cookies, translate);
    const metadata = await exports.generateMetadata();
    const locale = value === 'es' ? 'es' : 'en';
    assert.equal(metadata.title, translate(locale, 'Clark County Digital Equity Assistant'));
    assert.equal(metadata.description, translate(locale, 'Find internet plans and digital inclusion resources for Clark County, Nevada. Available in English and Spanish.'));
  }
});

test('resource translations preserve numeric eligibility, pricing, and contact details', () => {
  for (const [source, target] of Object.entries(resourceSpanish)) {
    const numbers = value => (value.match(/\d+(?:\.\d+)?/g) ?? []).sort();
    assert.deepEqual(numbers(target), numbers(source), source);
    for (const url of source.match(/\b[\w-]+\.(?:org|com)\b/g) ?? []) assert.ok(target.includes(url), url);
    assert.ok(!target.includes('—'), source);
  }
});

test('AI resource context includes exact source descriptions and contact details', () => {
  const source = readFileSync(new URL('../components/chat/Chatbot.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('Chatbot.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'describeService');
  assert.ok(fn);
  const compiled = ts.transpileModule(fn.getText(ast), { compilerOptions: { target: ts.ScriptTarget.ES2022 } });
  const describe = new Function(`${compiled.outputText}\nreturn describeService;`)();
  for (const service of SERVICES) {
    const context = describe(service);
    if (service.description) assert.ok(context.includes(service.description), service.name);
    if (service.languages) assert.ok(context.includes(`Listed service languages: ${service.languages}`), service.name);
    if (service.phone) assert.ok(context.includes(service.phone), service.name);
    if (service.url) assert.ok(context.includes(service.url), service.name);
  }
});

function loadSharingFunctions(filename) {
  const source = readFileSync(new URL(`../components/chat/${filename}`, import.meta.url), 'utf8');
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = new Set(['formatPrice', 'PLAN_CSV_HEADER', 'planCsvRows', 'formatPlanSms', 'SERVICE_CSV_HEADER', 'serviceCsvRows', 'formatServiceSms']);
  // Load the real pure formatters without mounting their client components or resolving Next aliases.
  const declarations = ast.statements.filter(node => ts.isVariableStatement(node) && node.declarationList.declarations.some(decl => names.has(decl.name.getText(ast))));
  const code = declarations.map(node => node.getText(ast)).join('\n');
  const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  new Function('exports', 'translate', 'translateServiceType', 'getProviderWebsite', compiled.outputText)(exports, translate, translateServiceType, getProviderWebsite);
  return exports;
}

test('Spanish plan SMS and CSV preserve facts and translate labels', () => {
  const { formatPlanSms, planCsvRows } = loadSharingFunctions('PlanCard.tsx');
  const plan = { provider: 'Cox', planName: 'QA fixture', technology: 'Fiber', price: '$65.00 ', downloadMbps: '100', uploadMbps: '25', lowIncome: 'Y', liDiscount: '$10.00', contract: 'Y', contractMonths: '12', meetsThreshold: true, introDiscount: '$5', introPeriod: '3', installFee: '$20' };
  const sms = formatPlanSms(plan, '1700 Pinto Lane, Las Vegas, NV 89106', 'es');
  assert.ok(sms.includes('INTERNET EN 1700 Pinto Lane, Las Vegas, NV 89106'));
  assert.ok(sms.includes('Cox (Fibra óptica)'));
  assert.ok(sms.includes('100 Mbps de descarga / 25 Mbps de subida'));
  assert.ok(sms.includes('Precio: $65.00/mes'));
  assert.ok(sms.includes('Contrato: 12 meses'));
  assert.ok(sms.includes('Descuento por bajos ingresos: $10.00'));
  assert.ok(!sms.includes('$$'));
  const [headers, row] = planCsvRows([plan], 'es');
  assert.deepEqual(headers, ['Plan', 'Proveedor', 'Tecnología', 'Precio/mes', 'Descarga (Mbps)', 'Subida (Mbps)', 'Descuento por bajos ingresos', 'Contrato', 'Alcanza 100/25 Mbps']);
  assert.deepEqual(row, ['QA fixture', 'Cox', 'Fibra óptica', '$65.00', '100', '25', '$10.00', '12 meses', 'Sí']);
  assert.equal(planCsvRows([{ ...plan, contract: 'N' }], 'en')[1][7], 'No contract');
});

test('Spanish service sharing preserves names, addresses, phones, and URLs', () => {
  const { formatServiceSms, serviceCsvRows } = loadSharingFunctions('ServiceCard.tsx');
  const service = { name: 'QA Resource', type: 'Digital Skills Training, Device Access Resources', distanceMiles: 1.5, address: '1700 Pinto Lane, Las Vegas, NV 89106', phone: '(702) 123-4567', url: 'https://example.org' };
  const sms = formatServiceSms(service, 'es');
  for (const value of [service.name, service.address, service.phone, service.url, 'Distancia: 1.5 millas', 'Tipo: Capacitación en habilidades digitales, Acceso a dispositivos']) assert.ok(sms.includes(value), value);
  const [headers, row] = serviceCsvRows([service], 'es');
  assert.deepEqual(headers, ['Nombre', 'Tipo', 'Distancia (millas)', 'Teléfono', 'Dirección', 'Sitio web']);
  assert.equal(row[0], service.name);
  assert.equal(row[3], service.phone);
  assert.equal(row[4], service.address);
  assert.equal(row[5], service.url);
  assert.equal(serviceCsvRows([{ ...service, address: 'Online / National' }], 'es')[1][4], 'En línea / Nacional');
  const hotline = { ...service, phone: 'Dial 2-1-1 or (866) 535-5654' };
  assert.ok(formatServiceSms(hotline, 'es').includes('Teléfono: Marque 2-1-1 o (866) 535-5654'));
  assert.equal(serviceCsvRows([hotline], 'es')[1][3], 'Marque 2-1-1 o (866) 535-5654');
});

test('CSV downloads include UTF-8 BOM and preserve Spanish accents and quoted addresses', async t => {
  let blob;
  const anchor = { click() {} };
  t.mock.method(URL, 'createObjectURL', value => { blob = value; return 'blob:qa'; });
  t.mock.method(URL, 'revokeObjectURL', () => {});
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => anchor, body: { appendChild() {}, removeChild() {} } } });
  t.after(() => { if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument); else delete globalThis.document; });
  const rows = [['Teléfono', 'Dirección'], ['(702) 123-4567', 'Las Vegas, NV']];
  downloadCsv('recursos.csv', rows);
  assert.equal(anchor.download, 'recursos.csv');
  assert.deepEqual([...new Uint8Array(await blob.arrayBuffer()).slice(0, 3)], [239, 187, 191]);
  assert.equal(await blob.text(), toCsv(rows));
  assert.ok(toCsv(rows).includes('"Las Vegas, NV"'));
});

test('literal UI translation calls always have a catalog entry', () => {
  for (const filename of readdirSync(new URL('../components/chat/', import.meta.url)).filter(name => name.endsWith('.tsx'))) {
    const source = readFileSync(new URL(`../components/chat/${filename}`, import.meta.url), 'utf8');
    const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function checkLiteral(node) {
      if (!node) return;
      if (ts.isStringLiteral(node) && node.text) assert.ok(spanish[node.text], `${filename}: ${node.text}`);
      if (ts.isConditionalExpression(node)) { checkLiteral(node.whenTrue); checkLiteral(node.whenFalse); }
    }
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const name = node.expression.getText(ast);
        if (['t', 'setAnnouncement', 'appendAssistantText'].includes(name)) checkLiteral(node.arguments[0]);
        if (name === 'translate') checkLiteral(node.arguments[1]);
      }
      if (ts.isPropertyAssignment(node) && ['label', 'header', 'content', 'suffix'].includes(node.name.getText(ast))) checkLiteral(node.initializer);
      if (ts.isJsxAttribute(node) && ['emptyMessage', 'placeholder', 'title'].includes(node.name.getText(ast))) checkLiteral(node.initializer);
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
