export { useRef, useEffect, useState } from "react";
export type { PointerEvent, KeyboardEvent, CSSProperties } from "react";
/** Production stand-in for the Grok canvas theme hook. */
export const useGrokTheme = (): { text: { primary: string }; border: { default: string } } =>
  ({ text: { primary: "#eee" }, border: { default: "#555" } });
