export interface ExportMessage {
  role: 'user' | 'assistant';
  text: string;
  archived?: boolean;
  superseded?: boolean;
  stopped?: boolean;
  answerKey?: string;
  address?: string;
  records?: string[];
}

export interface ChatExportData {
  messages: ExportMessage[];
  address?: string;
  recommendation?: string;
}

type Translate = (key: string) => string;

export function buildChatExport(data: ChatExportData, t: Translate, now = new Date()) {
  const timestamp = now.toISOString();
  const active = data.messages.filter(m => !m.archived && !m.superseded && !m.stopped && m.text.trim());
  const requests = active.filter(m => m.role === 'user' && !m.answerKey);
  const answers = active.filter(m => m.role === 'user' && m.answerKey);
  const records = [...new Set(active.flatMap(m => m.records ?? []))];
  const lastReply = active.filter(m => m.role === 'assistant').at(-1);
  const missing = t('Not recorded');
  const bullets = (lines: string[]) => lines.length ? lines.map(line => `- ${line}`).join('\n') : missing;
  const section = (title: string, value: string) => `${t(title)}:\n${value}`;

  const summary = [
    t('Interaction summary'),
    section('Exported at (UTC)', timestamp),
    section('Current address', data.address || missing),
    section('Recent user requests (verbatim, up to 5)', bullets(requests.slice(-5).map(m => m.text))),
    section('Current recorded answers', bullets(answers.map(m => m.text))),
    section('Lookup records (not confirmed referrals)', bullets(records.slice(0, 6)) + (records.length > 6 ? `\n${t('Additional records are included in the chat download.')}` : '')),
    section('Current recommendation', data.recommendation || missing),
    section('Latest assistant response (verbatim)', lastReply?.text || missing),
    section('Referral outcome', t('Not verified by the tool. Add the confirmed outcome after review.')),
    section('Next steps', t('Add agreed follow-up actions after review.')),
    t('Template assembled from the current address context. Earlier addresses, superseded answers, and interrupted replies are excluded. Review for accuracy before sharing.'),
  ].join('\n\n');

  const transcript = [
    t('Clark County Digital Equity Assistant'),
    t('Chat transcript'),
    section('Exported at (UTC)', timestamp),
    t('Conversation text and lookup records are included. Suggested resources do not confirm eligibility, availability, or receipt of service.'),
    ...data.messages.filter(m => m.text.trim() || m.stopped || m.records?.length).map(m => {
      const flags = [m.archived && t('Historical address context'), m.superseded && t('Superseded answer'), m.stopped && t('Interrupted response')].filter(Boolean);
      return [
        `${t(m.role === 'user' ? 'User' : 'Assistant')}${flags.length ? ` [${flags.join('; ')}]` : ''}:`,
        m.text,
        m.address ? `${t('Lookup address')}: ${m.address}` : '',
        m.records?.length ? section('Lookup records (not confirmed referrals)', bullets(m.records)) : '',
      ].filter(Boolean).join('\n');
    }),
    ...(data.recommendation ? [section('Current recommendation', data.recommendation)] : []),
  ].join('\n\n');

  return { summary, transcript, filename: `chat-${timestamp.replace(/[:.]/g, '-')}.txt` };
}
