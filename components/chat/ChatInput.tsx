'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, MapPin, Loader2 } from 'lucide-react';

interface Suggestion {
  label: string;
  value: string;
}

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const MIN_QUERY = 3;
const DEBOUNCE_MS = 350;

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // The address query is everything typed after the most recent "@". Addresses
  // contain spaces, so the token runs to the end of the input rather than
  // stopping at whitespace the way a username mention would.
  const mentionAt = value.lastIndexOf('@');
  const mentionQuery = mentionAt === -1 ? null : value.slice(mentionAt + 1);

  useEffect(() => {
    if (mentionQuery === null) {
      setOpen(false);
      setSuggestions([]);
      return;
    }
    const q = mentionQuery.trim();
    if (q.length < MIN_QUERY) {
      setSuggestions([]);
      setOpen(true); // show the "keep typing" hint
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      setOpen(true);
      try {
        const res = await fetch('/api/address-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setActiveIndex(0);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [mentionQuery]);

  // Close the dropdown when clicking outside the input area.
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const selectSuggestion = useCallback((s: Suggestion) => {
    setValue(prev => {
      const at = prev.lastIndexOf('@');
      const base = at === -1 ? prev : prev.slice(0, at);
      return `${base}${s.value} `;
    });
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }, []);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue('');
    setOpen(false);
    setSuggestions([]);
    onSend(text);
  }, [value, disabled, onSend]);

  const menuOpen = open && (loading || suggestions.length > 0 || (mentionQuery !== null && mentionQuery.trim().length < MIN_QUERY));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // CJK IME composition: Enter confirms the candidate, so never treat it as
    // submit/select while composing (229 covers Safari's unreliable final event).
    const isComposing = e.nativeEvent.isComposing || e.keyCode === 229;
    if (isComposing) {
      if (e.key === 'Enter') e.preventDefault();
      return;
    }

    if (menuOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => (i + 1) % suggestions.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length); return; }
      if (e.key === 'Enter') { e.preventDefault(); selectSuggestion(suggestions[activeIndex]); return; }
    }
    if (open && e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {menuOpen && (
        <div
          role="listbox"
          className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
            <MapPin size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Clark County addresses</span>
            {loading && <Loader2 size={14} className="text-slate-400 animate-spin ml-auto" />}
          </div>

          {suggestions.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-1">
              {suggestions.map((s, i) => (
                <li key={s.value} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                      i === activeIndex ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="leading-snug">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-slate-400">
              {mentionQuery !== null && mentionQuery.trim().length < MIN_QUERY
                ? 'Keep typing the address to see matches…'
                : loading
                ? 'Searching…'
                : 'No matching Clark County addresses found.'}
            </p>
          )}
        </div>
      )}

      <form
        onSubmit={e => { e.preventDefault(); submit(); }}
        className="flex items-center gap-2"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type @ to search an address, or ask a question…"
          disabled={disabled}
          role="combobox"
          aria-expanded={menuOpen}
          aria-autocomplete="list"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <Send size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
}
