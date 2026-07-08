/// <reference types="vite/client" />

// Declared as `unknown` on purpose: enabling resolveJsonModule would make
// TypeScript infer a giant literal type from the ~1 MB dataset, which is slow
// and memory-heavy. We instead cast the loaded JSON to our own types.
declare module '*.json' {
  const value: unknown;
  export default value;
}
