import { useI18n, type Lang } from "@/lib/i18n";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  de: "Deutsch",
  en: "English",
  it: "Italiano",
};

export function LangSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-xs font-semibold transition-colors hover:bg-muted/60 bg-background"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span>{lang.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-md border border-border bg-background shadow-lg z-50 overflow-hidden">
          {(["fr", "de", "en", "it"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/60 ${
                lang === l
                  ? "bg-[hsl(var(--gold))] text-[hsl(var(--gold-foreground))]"
                  : "text-foreground"
              }`}
            >
              <span className="font-bold w-5">{l.toUpperCase()}</span>
              <span className="text-muted-foreground">{LANG_LABELS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
