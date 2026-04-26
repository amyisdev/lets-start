/// <reference types="vite/client" />
/** biome-ignore-all lint/correctness/noUnusedVariables: This file overried vite */

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
