export interface UserSettingsDocument {
  id: string;
  pathToKey: string | null;
  keys: Record<string, string | { key: string; iv: string; shared?: boolean }>;
}
