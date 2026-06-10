/// <reference types="vite/client" />

declare const __BOOKS_API_KEY_CONFIGURED__: boolean;

interface ImportMetaEnv {
  readonly VITE_GOOGLE_BOOKS_API_KEY?: string;
  readonly VITE_USE_GOOGLE_BOOKS_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
