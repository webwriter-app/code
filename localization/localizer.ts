import type { LocaleModule, MsgFn, MsgOptions, TemplateLike, TemplateMap } from "@lit/localize";
import { runtimeMsg } from "@lit/localize/internal/runtime-msg.js";
import type { ReactiveElement } from "lit";
// @ts-ignore Lit generates JavaScript locale codes in this package.
import { sourceLocale, targetLocales } from "./generated/locale-codes.js";

const supported = new Map<string, string>([sourceLocale, ...targetLocales].map(locale => [locale.toLowerCase(), locale]));
const defaults = new Map([
  ["zh", "zh-Hans"], ["no", "nb"], ["pt", "pt-PT"], ["sr", "sr-Cyrl"], ["sr-ijekavsk", "sr-Cyrl"], ["cnr", "sr-Latn"],
]);

function resolveLocale(language: string): string {
  const tag = language.trim().toLowerCase();
  const parts = tag.split("-");
  const base = parts[0] ?? "";
  while (parts.length > 1) {
    const locale = supported.get(parts.join("-"));
    if (locale) return locale;
    parts.pop();
  }
  // Bare language codes remain distinct; infer a script only for a more specific request.
  if (tag !== base) {
    try {
      const { script } = new Intl.Locale(tag).maximize();
      const locale = supported.get(`${base}-${script?.toLowerCase()}`);
      if (locale) return locale;
    } catch {
      // Invalid authored tags use the same fallback as unsupported tags.
    }
  }
  return supported.get(base) ?? supported.get(defaults.get(base)?.toLowerCase() ?? "") ?? sourceLocale;
}

function parentElement(element: Element): Element | null {
  const parent = element.parentElement;
  if (parent) return parent;
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

/** A missing lang inherits; an explicitly empty lang falls back to the source language. */
export function effectiveLanguage(host: Element): string {
  for (let element: Element | null = host; element; element = parentElement(element)) {
    const lang = element.getAttribute("lang");
    if (lang !== null) return lang;
  }
  return sourceLocale;
}

const modules = new Map<string, Promise<LocaleModule>>();
function loadLocale(locale: string) {
  let pending = modules.get(locale);
  if (!pending) {
    pending = import(`./generated/${locale}.ts`);
    modules.set(locale, pending);
    void pending.catch(() => modules.delete(locale));
  }
  return pending;
}

export const sourceMsg = ((template: TemplateLike, options?: MsgOptions) =>
  runtimeMsg(undefined, template, options)) as MsgFn;

export function createLocalizer(host: ReactiveElement, onLocaleChange?: () => void) {
  let activeLocale: string = sourceLocale;
  let templates: TemplateMap | undefined;
  let revision = 0;
  const translate = (template: TemplateLike, options?: MsgOptions) => runtimeMsg(templates, template, options);

  async function setLocale(language: string) {
    const locale = resolveLocale(language);
    const request = ++revision;
    if (locale === activeLocale) return;
    const defaultLocale = supported.get(defaults.get(locale.toLowerCase())?.toLowerCase() ?? "");
    const candidates = new Set([locale, defaultLocale, resolveLocale(locale.split("-")[0] ?? "")]);
    const catalogs = await Promise.all([...candidates].reverse().map(async candidate => {
      if (!candidate || candidate === sourceLocale) return undefined;
      return (await loadLocale(candidate)).templates;
    }));
    if (request !== revision) return;
    templates = Object.assign({}, ...catalogs);
    activeLocale = locale;
    onLocaleChange?.();
    host.requestUpdate();
    if (host.isConnected) host.dispatchEvent(new Event("optionschange", { bubbles: true }));
  }

  function refresh() {
    void setLocale(effectiveLanguage(host)).catch(error => console.error("Could not load widget translations", error));
  }

  let observer: MutationObserver | undefined;
  host.addController({
    hostConnected() {
      observer = new MutationObserver(refresh);
      for (let element: Element | null = host; element; element = parentElement(element)) {
        observer.observe(element, { attributes: true, attributeFilter: ["lang"] });
      }
      refresh();
    },
    hostDisconnected() {
      observer?.disconnect();
      observer = undefined;
      ++revision;
    },
  });
  return { msg: translate as MsgFn, getLocale: () => activeLocale, setLocale };
}

/** Keep older drawer translations as a fallback when the catalog lacks a message. */
export function drawerLabel(translated: string, previous: Record<string, string>, locale: string) {
  const key = Object.keys(previous).find(key => key.toLowerCase() === locale.toLowerCase());
  const fallback = (key ? previous[key] : undefined) ?? previous[locale.split("-")[0] ?? ""];
  return { _: translated === previous["en"] ? fallback ?? translated : translated };
}
