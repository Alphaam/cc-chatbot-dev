"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { buildCaseNote } from "@/lib/chat-export";
import { CATEGORY_LABELS, recommendationsText, type Resource } from "@/lib/resource-finder";

export default function ShareRecommendations({
  resources,
  address,
  note,
  onClose,
}: {
  resources: Resource[];
  address: string;
  note?: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [includeAddress, setIncludeAddress] = useState(false);
  const [referral, setReferral] = useState(
    resources.length === 1 ? resources[0].id : "",
  );
  const [status, setStatus] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const selected = resources.find((resource) => resource.id === referral);
  const referralLabel = (resource: Resource) => `${resource.name} · ${t(CATEGORY_LABELS[resource.category])}`;
  const text = note
    ? buildCaseNote(
        {
          messages: [],
          query: t("Internet, device access, and digital skills resources"),
          address: includeAddress ? address : undefined,
          referrals: resources.map(referralLabel),
        },
        t,
        selected ? referralLabel(selected) : undefined,
      )
    : recommendationsText(resources, t, includeAddress ? address : undefined);
  const email = `mailto:?subject=${encodeURIComponent(t("Clark County digital resources"))}&body=${encodeURIComponent(text)}`;
  const sms = `sms:${typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(text)}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(note ? "Case note copied." : "Details copied.");
    } catch {
      textRef.current?.focus();
      textRef.current?.select();
      setStatus(
        "Clipboard access is blocked. Copy the selected text manually.",
      );
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-foreground/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background p-5 text-foreground shadow-lg">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Dialog.Title className="text-xl font-semibold">
                {t(note ? "Copy Case Note" : "Share recommendations")}
              </Dialog.Title>
              <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">
                {t(
                  note
                    ? "Choose the matched resource for this note. Review before sharing."
                    : "Review the details below. Email and text open your own app; nothing is sent automatically.",
                )}
              </Dialog.Description>
            </div>
            <FieldGroup>
              {note && resources.length > 1 && (
                <Field>
                  <FieldLabel htmlFor="note-referral">
                    {t("Matched referral")}
                  </FieldLabel>
                  <select
                    id="note-referral"
                    value={referral}
                    onChange={(event) => {
                      setReferral(event.target.value);
                      setStatus("");
                    }}
                    className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">{t("Select a matched resource.")}</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {referralLabel(resource)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeAddress}
                  onChange={(event) => {
                    setIncludeAddress(event.target.checked);
                    setStatus("");
                  }}
                  className="size-4 accent-primary"
                />
                {t("Include client address")}
              </label>
              <Field>
                <FieldLabel htmlFor="recommendation-preview">
                  {t(note ? "Case note" : "Details to share")}
                </FieldLabel>
                <Textarea
                  ref={textRef}
                  id="recommendation-preview"
                  readOnly
                  value={text}
                  rows={10}
                  className="min-h-56"
                />
              </Field>
            </FieldGroup>
            <p role="status" className="text-sm text-primary">
              {t(status)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void copy()} disabled={note && !selected}>
                {t(note ? "Copy Case Note" : "Copy details")}
              </Button>
              {!note && (
                <>
                  <Button
                    variant="outline"
                    render={<a href={email} />}
                    nativeButton={false}
                  >
                    {t("Open email app")}
                  </Button>
                  <Button
                    variant="outline"
                    render={<a href={sms} />}
                    nativeButton={false}
                  >
                    {t("Open text app")}
                  </Button>
                </>
              )}
              <Dialog.Close render={<Button variant="ghost" />}>
                {t("Close")}
              </Dialog.Close>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(
                "Exports may contain personal information. Store and share securely.",
              )}
            </p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
