import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChatExport } from '../lib/chat-export.ts';
import { translate } from '../lib/i18n.ts';

const t = key => key;
const now = new Date('2026-10-28T12:00:00.000Z');

test('download keeps historical, superseded and interrupted content with labels', () => {
  const result = buildChatExport({ messages: [
    { role: 'user', text: 'Old address', archived: true },
    { role: 'user', text: 'Old household answer', superseded: true },
    { role: 'assistant', text: 'Partial reply', stopped: true },
  ] }, t, now);
  assert.match(result.transcript, /Historical address context/);
  assert.match(result.transcript, /Superseded answer/);
  assert.match(result.transcript, /Interrupted response/);
  assert.doesNotMatch(result.summary, /Old address|Old household answer|Partial reply/);
  assert.equal(result.filename, 'chat-2026-10-28T12-00-00-000Z.txt');
});

test('summary includes current answers, quoted responses, records and recommendation', () => {
  const result = buildChatExport({ address: '123 Test Street', recommendation: 'Provider A, $20/mo', messages: [
    { role: 'user', text: 'Find devices' },
    { role: 'user', text: 'Resource type: Devices', answerKey: 'service' },
    { role: 'assistant', text: 'Here are the results.', records: ['Resource A | https://example.org', 'Resource A | https://example.org'] },
  ] }, t, now);
  assert.match(result.summary, /Current address:\n123 Test Street/);
  assert.match(result.summary, /Current recorded answers:\n- Resource type: Devices/);
  assert.match(result.summary, /Latest assistant response \(verbatim\):\nHere are the results\./);
  assert.equal(result.summary.match(/Resource A/g).length, 1);
  assert.match(result.transcript, /https:\/\/example.org/);
  assert.match(result.summary, /Not verified by the tool/);
  assert.match(result.summary, /Provider A, \$20\/mo/);
});

test('summary is bounded while transcript retains all lookup records', () => {
  const records = Array.from({ length: 9 }, (_, i) => `Resource ${i}`);
  const result = buildChatExport({ messages: [{ role: 'assistant', text: 'Results', records }] }, t, now);
  assert.match(result.summary, /Additional records/);
  assert.doesNotMatch(result.summary, /Resource 8/);
  assert.match(result.transcript, /Resource 8/);
});

test('empty and reset sessions have no fabricated results or previous details', () => {
  const result = buildChatExport({ messages: [] }, t, now);
  assert.match(result.summary, /Current address:\nNot recorded/);
  assert.match(result.summary, /Lookup records \(not confirmed referrals\):\nNot recorded/);
  assert.doesNotMatch(result.transcript, /123 Test Street|Provider A/);
});

test('Spanish output localizes headings and preserves entered text', () => {
  const result = buildChatExport({ messages: [{ role: 'user', text: 'Necesito una computadora' }] }, key => translate('es', key), now);
  assert.match(result.summary, /Resumen de la interacción/);
  assert.match(result.transcript, /Usuario:\nNecesito una computadora/);
  assert.doesNotMatch(result.summary, /Current address|Next steps|Referral outcome/);
});
