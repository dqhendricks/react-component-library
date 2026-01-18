import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ComponentPropsWithoutRef,
} from "react";
import type {
  SelectSearchableOptionRecord,
} from './types';
import {
  SelectSearchableContext,
  type SelectSearchableContextValue,
 } from "./SelectSearchableContext";

import styles from "./SelectSearchable.module.css";

type NativeSelectProps = ComponentPropsWithoutRef<"select">;
type SelectValue = NonNullable<NativeSelectProps["value"]>; // string | number | readonly string[]

// Using native select's props with the below exceptions
export type SelectSearchableRootProps = PropsWithChildren<
  Omit<NativeSelectProps, 'children' | 'onBlur' | 'size' | 'autocomplete'> & {
    rootId?: string; // 'id' is passed to trigger for label's htmlFor prop
    onBlur?: React.FocusEventHandler<HTMLElement>;
    onValueChange?: (value: SelectValue) => void;
  }
>;

export function SelectSearchableRoot({
  id,
  rootId,
  className,
  style,
  children,
  onValueChange,
  onBlur, // keep; we’ll pass via context next
  value: controlledValue,
  defaultValue,
  onChange,
  ...selectProps
}: SelectSearchableRootProps) {
  const reactId = useId();
  const controlId = id ?? `cs-${reactId}`;
  const listboxId = `${controlId}--listbox`;
  const nativeSelectId = `${controlId}--native`;

  const disabled = !!selectProps.disabled;
  const multiple = !!selectProps.multiple;

  const isControlled = controlledValue != null;
  const [uncontrolledValue, setUncontrolledValue] = useState<NativeSelectProps["value"]>(defaultValue);
  const value = (isControlled ? controlledValue : uncontrolledValue) as NativeSelectProps["value"];

  const [open, setOpen] = useState(false);
  const [activeDescendantId, setActiveDescendantId] = useState<string | null>(null);
  const [hasSearch, setHasSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const optionsRef = useRef<Map<string, SelectSearchableOptionRecord>>(new Map());
  const nativeSelectRef = useRef<HTMLSelectElement>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [listboxEl, setListboxEl] = useState<HTMLElement | null>(null);

  const registerOption = useCallback((opt: SelectSearchableOptionRecord) => {
    optionsRef.current.set(opt.id, opt);
  }, []);

  const unregisterOption = useCallback((optId: string) => {
    optionsRef.current.delete(optId);
  }, []);

  const getOptions = useCallback(() => Array.from(optionsRef.current.values()), []);

  const getOptionByValue = useCallback((v: string) => {
    for (const opt of optionsRef.current.values()) if (opt.value === v) return opt;
    return undefined;
  }, []);

  const commitValue = useCallback(
    (next: SelectValue) => {
      if (disabled) return;

      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);

      if (!multiple) {
        setOpen(false);
        triggerEl?.focus();
      }
    },
    [disabled, isControlled, multiple, onValueChange, triggerEl],
  );

  // Dispatch change event
  useEffect(() => {
    const el = nativeSelectRef.current;
    if (!el) return;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, [value]);

  // Set active descendent effect
  useEffect(() => {
    if (Array.isArray(value)) {
      const first = value[0];
      setActiveDescendantId(first != null ? getOptionByValue(String(first))?.id ?? null : null);
      return;
    }
    if (value == null || value === "") {
      setActiveDescendantId(null);
      return;
    }
    setActiveDescendantId(getOptionByValue(String(value))?.id ?? null);
  }, [getOptionByValue, value]);

  // Close listbox on outside click
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (ev: PointerEvent) => {
      const t = ev.target as Node | null;
      if (!t) return;

      // if click is within trigger or within listbox, ignore
      if (triggerEl?.contains(t)) return;
      if (listboxEl?.contains(t)) return;

      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, triggerEl, listboxEl, setOpen]);

  const ctx: SelectSearchableContextValue = useMemo(
    () => ({
      controlId,
      rootId,
      listboxId,
      nativeSelectId,
      disabled,
      multiple,
      value,
      commitValue,
      open,
      setOpen,
      activeDescendantId,
      setActiveDescendantId,
      hasSearch,
      setHasSearch,
      searchQuery,
      setSearchQuery,
      listboxEl,
      setListboxEl,
      onTriggerBlur: onBlur,
      triggerEl,
      setTriggerEl,
      registerOption,
      unregisterOption,
      getOptions,
      getOptionByValue,
      nativeSelectRef,
    }),
    [
      controlId,
      rootId,
      listboxId,
      nativeSelectId,
      disabled,
      multiple,
      value,
      commitValue,
      open,
      activeDescendantId,
      hasSearch,
      searchQuery,
      listboxEl,
      onBlur,
      triggerEl,
      registerOption,
      unregisterOption,
      getOptions,
      getOptionByValue,
    ],
  );

  return (
    <SelectSearchableContext.Provider value={ctx}>
      <div id={rootId} className={[styles.root, disabled ? styles.disabled : "", className].filter(Boolean).join(" ")} style={style}>
        <select
          {...selectProps}
          ref={nativeSelectRef}
          id={nativeSelectId}
          value={value}
          onChange={onChange}
          className={styles.hiddenSelect}
          tabIndex={-1}
          aria-hidden="true"
        >
          {Array.isArray(value) && value.length ? (
            value.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))
          ) : (
            <option value={value}>{value}</option>
          )}
        </select>

        {children}
      </div>
    </SelectSearchableContext.Provider>
  );
}