'use client';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@/components/ui/button';

export default function ResetConfirmation({ action, onCancel, onConfirm, onClosed }: {
  action: 'home' | 'new' | null;
  onCancel: () => void;
  onConfirm: () => void;
  onClosed: () => void;
}) {
  return (
    <AlertDialog.Root open={action !== null} onOpenChange={open => { if (!open) onCancel(); }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-foreground/40" />
        <AlertDialog.Popup finalFocus={() => { onClosed(); return false; }} className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background text-foreground p-6 shadow-lg">
          <div className="flex flex-col gap-3">
            <AlertDialog.Title className="text-lg font-semibold">Clear this client&apos;s conversation?</AlertDialog.Title>
            <AlertDialog.Description className="text-sm leading-relaxed text-muted-foreground">
              This clears the conversation, draft, address, answers, and results from this screen. {action === 'home' ? 'Home will show the three starting options.' : 'New client will restart your current workflow.'} Previously saved logs are not deleted.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Close render={<Button variant="outline" />}>Cancel</AlertDialog.Close>
              <Button onClick={onConfirm}>Clear and continue</Button>
            </div>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
