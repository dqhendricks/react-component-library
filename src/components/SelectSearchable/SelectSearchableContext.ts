import React, { createContext, useContext } from "react";
import type { SelectSearchableOptionRecord } from "./types";

type NativeSelectProps = React.ComponentPropsWithoutRef<"select">;
export type SelectSearchableValue = NonNullable<NativeSelectProps["value"]>; // string | number | readonly string[]

export type SelectSearchableContextValue = {
  // Identity / wiring
  controlId: string; // goes on Trigger
  rootId?: string; // goes on wrapper div
  listboxId: string;
  nativeSelectId: string; // for debugging

  // Native-ish flags (useful for UI)
  disabled: boolean;
  multiple: boolean;

  // State
  value: NativeSelectProps["value"]; // may be undefined if uncontrolled + no default
  commitValue: (next: SelectSearchableValue) => void;

  open: boolean;
  setOpen: (next: boolean) => void;

  activeDescendantId: string | null;
  setActiveDescendantId: (id: string | null) => void;

  hasSearch: boolean;
  setHasSearch: (next: boolean) => void;
  searchQuery: string;
  setSearchQuery: (next: string) => void;

  // Listbox ref for outside click detection
  listboxEl: HTMLElement | null;
  setListboxEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;

  // Trigger wiring
  onTriggerBlur?: React.FocusEventHandler<HTMLElement>;
  triggerEl: HTMLElement | null;
  setTriggerEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;

  // Option registry
  registerOption: (opt: SelectSearchableOptionRecord) => void;
  unregisterOption: (id: string) => void;

  // Exposed for later (options, ordering, lookup)
  getOptions: () => SelectSearchableOptionRecord[];
  getOptionByValue: (value: string) => SelectSearchableOptionRecord | undefined;

  // Refs for advanced behaviors (outside click, etc.)
  nativeSelectRef: React.RefObject<HTMLSelectElement | null>;
};

export const SelectSearchableContext = createContext<SelectSearchableContextValue | null>(null);

export function useSelectSearchableContext(): SelectSearchableContextValue {
  const ctx = useContext(SelectSearchableContext);
  if (!ctx) throw new Error("useSelectSearchableContext must be used within <SelectSearchableRoot>.");
  return ctx;
}