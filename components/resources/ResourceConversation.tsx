"use client";

import { Fragment, useId, useState } from "react";
import { ArrowDown, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import ChatInput, { type SendOptions } from "@/components/chat/ChatInput";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent, MessageHeader } from "@/components/ui/message";
import { MessageScrollerProvider, MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerViewport } from "@/components/ui/message-scroller";
import type { useResourceChat } from "./useResourceChat";

function ReplyText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**")
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : <Fragment key={index}>{part}</Fragment>);
}

export default function ResourceConversation({ chat, floating = false, onSend, disabled = false }: {
  chat: ReturnType<typeof useResourceChat>;
  floating?: boolean;
  onSend: (text: string, options?: SendOptions) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const [collapsedCount, setCollapsedCount] = useState<number | null>(null);
  const collapsed = collapsedCount === chat.messages.length;
  const transcriptId = useId();
  const hasConversation = chat.messages.length > 0 || chat.failed;
  if (!floating && !hasConversation) return null;

  return (
    <aside aria-label={t("Ask the assistant")} className={floating ? "finder-chat-dock" : "finder-chat-inline"}>
      <div className="finder-chat-surface">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="size-4 text-primary" aria-hidden="true" />{t("Ask the assistant")}</h2>
            {hasConversation && <Button variant="ghost" size="sm" aria-expanded={!collapsed} aria-controls={transcriptId} onClick={() => setCollapsedCount(collapsed ? null : chat.messages.length)}>
              {t(collapsed ? "Show conversation" : "Hide conversation")}
              {collapsed ? <ChevronUp data-icon="inline-end" aria-hidden="true" /> : <ChevronDown data-icon="inline-end" aria-hidden="true" />}
            </Button>}
          </div>
        </div>
        {hasConversation && <div id={transcriptId} hidden={collapsed}>
          <div className="finder-chat-transcript">
            <MessageScrollerProvider autoScroll>
            <MessageScroller>
              <MessageScrollerViewport tabIndex={0} aria-label={t("Conversation")}>
                <MessageScrollerContent className="p-4">
                  {chat.messages.map((message) => <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === "user"}>
                    <Message align={message.role === "user" ? "end" : "start"}>
                      <MessageContent>
                        <MessageHeader>{t(message.role === "user" ? "You" : "Assistant")}</MessageHeader>
                        <Bubble variant={message.role === "user" ? "secondary" : "ghost"}>
                          <BubbleContent>
                            <p lang={message.locale} className="whitespace-pre-wrap break-words"><ReplyText text={message.content || t(message.incomplete ? "Reply stopped." : "Thinking…")} /></p>
                            {message.incomplete && message.content && <p className="text-sm text-muted-foreground">{t("Reply stopped.")}</p>}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>)}
                  {chat.failed && <Alert><AlertDescription>
                    <p>{t("The assistant is unavailable right now. You can still search an address.")}</p>
                    <Button variant="outline" size="sm" onClick={() => { setCollapsedCount(null); chat.retry(); }}>{t("Retry")}</Button>
                  </AlertDescription></Alert>}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton aria-label={t("Latest reply")}><ArrowDown aria-hidden="true" /></MessageScrollerButton>
            </MessageScroller>
            </MessageScrollerProvider>
          </div>
        </div>}
        <p role="status" className="sr-only">{chat.busy ? t("Thinking…") : hasConversation ? t("Conversation updated.") : ""}</p>
        {floating && <div className="px-4 pb-4 pt-2">
          <ChatInput disabled={disabled || chat.busy} onStop={chat.busy ? chat.cancel : undefined} placeholder="Ask about these resources, or @ to search address" onSend={(text, options) => { setCollapsedCount(null); onSend(text, options); }} />
        </div>}
      </div>
    </aside>
  );
}
