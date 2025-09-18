export type InterpolationMap = { [key: string]: string | boolean | number | null };

export interface TranslationService {
  translate: (label: string, interpolations?: InterpolationMap) => string;
  changeLang: (lang: 'pl' | 'en') => Promise<void>;
  ready: () => Promise<void>;
}
