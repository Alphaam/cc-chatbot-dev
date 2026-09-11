'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, MapPin, Loader2 } from 'lucide-react';

interface Suggestion {
  mapboxId: string;
  label: string;
}

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const MIN_QUERY = 3;
// Mapbox typeahead is fast, so a short debounce keeps it feeling instant while
// still collapsing bursts of keystrokes into a single suggest request.
const DEBOUNCE_MS = 150;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

// Bias results to Clark County, NV: proximity centers ranking on Las Vegas and
// the bbox (west,south,east,north) fences suggestions to the county area.
const CLARK_PROXIMITY = '-115.1398,36.1699';
const CLARK_BBOX = '-115.9,35.0,-114.0,36.85';

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  // Mirrors `value` so async callbacks read the latest text without re-binding.
  const valueRef = useRef('');
  valueRef.current = value;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // One Mapbox session groups all suggest calls with the retrieve that ends
  // them, so a whole lookup bills as a single request. Regenerated after each
  // selection so the next address search starts a fresh session.
  const sessionRef = useRef<string>('');
  if (!sessionRef.current && typeof crypto !== 'undefined') {
    sessionRef.current = crypto.randomUUID();
  }

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
        const url = new URL('https://api.mapbox.com/search/searchbox/v1/suggest');
        url.searchParams.set('q', q);
        url.searchParams.set('access_token', MAPBOX_TOKEN ?? '');
        url.searchParams.set('session_token', sessionRef.current);
        url.searchParams.set('country', 'us');
        url.searchParams.set('types', 'address');
        url.searchParams.set('language', 'en');
        url.searchParams.set('limit', '6');
        url.searchParams.set('proximity', CLARK_PROXIMITY);
        url.searchParams.set('bbox', CLARK_BBOX);
        const res = await fetch(url, { signal: abortRef.current.signal });
        const data = await res.json();
        const items: Suggestion[] = (data.suggestions ?? []).map((s: any) => ({
          mapboxId: s.mapbox_id,
          label: s.full_address || [s.name, s.place_formatted].filter(Boolean).join(', '),
        }));
        setSuggestions(items);
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

  const selectSuggestion = useCallback(async (s: Suggestion) => {
    // Capture the text before "@" once. Both the optimistic fill and the later
    // retrieve fill replace from this same base, so the address is never
    // duplicated (the "@" token is gone after the first fill).
    const at = valueRef.current.lastIndexOf('@');
    const base = at === -1 ? '' : valueRef.current.slice(0, at);

    // Optimistically fill with the label so selection feels instant, then
    // retrieve the canonical full address (this call closes the billing session).
    setValue(`${base}${s.label} `);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();

    try {
      const url = new URL(`https://api.mapbox.com/search/searchbox/v1/retrieve/${s.mapboxId}`);
      url.searchParams.set('access_token', MAPBOX_TOKEN ?? '');
      url.searchParams.set('session_token', sessionRef.current);
      const res = await fetch(url);
      const data = await res.json();
      const full = data?.features?.[0]?.properties?.full_address;
      if (full) setValue(`${base}${full} `);
    } catch {
      // Keep the label we already filled if retrieve fails.
    } finally {
      // Start a fresh session for the next address search.
      if (typeof crypto !== 'undefined') sessionRef.current = crypto.randomUUID();
    }
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
                <li key={s.mapboxId} role="option" aria-selected={i === activeIndex}>
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
