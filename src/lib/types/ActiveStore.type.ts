interface ActiveStore {
  global: string | null;
  switched_at: string | null;
}

type ActiveProfileScope = 'global' | 'local';

export type { ActiveStore, ActiveProfileScope };
