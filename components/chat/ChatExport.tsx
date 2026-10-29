'use client';

import { useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildChatExport, type ChatExportData } from '@/lib/chat-export';
import { useLanguage } from './LanguageProvider';

export default function ChatExport({ getData, disabled }: { getData: () => ChatExportData; disabled: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [copying, setCopying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function download() {
    try {
      const { transcript, filename } = buildChatExport(getData(), t);
      const url = URL.createObjectURL(new Blob([transcript], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('Chat download requested.');
    } catch {
      setStatus('Download failed. Please try again.');
    }
  }

  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(draft);
      setStatus('Summary copied.');
    } catch {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      setStatus('Clipboard access is blocked. Copy the selected text manually.');
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="border-b border-border bg-card text-card-foreground px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" disabled={disabled} onClick={download}><Download aria-hidden="true" data-icon="inline-start" />{t('Download chat')}</Button>
          <Dialog.Root open={open} onOpenChange={next => {
            setOpen(next);
            setStatus('');
            setDraft(next ? buildChatExport(getData(), t).summary : '');
          }}>
            <Dialog.Trigger render={<Button variant="ghost" size="sm" disabled={disabled} />}><Copy aria-hidden="true" data-icon="inline-start" />{t('Copy summary')}</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 bg-foreground/40" />
              <Dialog.Popup className="fixed top-1/2 left-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background text-foreground p-5 shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Dialog.Title className="text-lg font-semibold">{t('Review interaction summary')}</Dialog.Title>
                    <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">{t('Edit the draft, record the outcome, and remove personal details before sharing. No AI credits are used.')}</Dialog.Description>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">{t('Summary text')}</span>
                    <textarea ref={textareaRef} value={draft} onChange={event => { setDraft(event.target.value); setStatus(''); }} rows={12} className="min-h-40 w-full resize-y rounded-lg border border-input bg-background text-foreground p-3 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
                  </label>
                  <p role="status" className="text-sm text-muted-foreground">{t(status)}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Dialog.Close render={<Button variant="outline" />}>{t('Close')}</Dialog.Close>
                    <Button disabled={!draft.trim() || copying} onClick={copy}><Copy aria-hidden="true" data-icon="inline-start" />{t(copying ? 'Copying…' : 'Copy summary')}</Button>
                  </div>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <p className="text-sm text-muted-foreground">{t('Exports may contain personal information. Store and share securely.')}</p>
        {!open && status && <p role="status" className="text-sm text-muted-foreground">{t(status)}</p>}
      </div>
    </div>
  );
}
