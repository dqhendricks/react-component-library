import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PropsWithChildren,
  type ComponentPropsWithoutRef,
} from "react";
import styles from "./SelectSearchable.module.css";
import {
  SelectSearchableStoreContext,
  createSelectSearchableStore,
  type SelectSearchableValue,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";

type NativeSelectProps = ComponentPropsWithoutRef<"select">;
type SelectValue = NonNullable<NativeSelectProps["value"]>;

export type SelectSearchableRootProps = PropsWithChildren<
  Omit<NativeSelectProps, "children" | "onBlur" | "size" | "autocomplete"> & {
    rootId?: string;
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
  onBlur,
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

  const storeRef = useRef<ReturnType<typeof createSelectSearchableStore> | null>(null);
  if (!storeRef.current) storeRef.current = createSelectSearchableStore();
  const store = storeRef.current;

  // Subscribe ONLY to open so we can attach/detach outside-click listeners at the right time.
  // Everything else can use store.getSnapshot() in handlers/effects.
  const open = useSelectSearchableStore(store, (s) => s.open);

  // identity
  useEffect(() => {
    store.setIdentity({ controlId, listboxId });
  }, [store, controlId, listboxId]);

  // flags
  useEffect(() => {
    store.setFlags({ disabled, multiple });
  }, [store, disabled, multiple]);

  // injected callbacks
  useEffect(() => {
    store.setOnTriggerBlur(onBlur);
  }, [store, onBlur]);

  // keep store value in sync
  useEffect(() => {
    store.setValue(value);
  }, [store, value]);

  // Root controls commit (controlled/uncontrolled) and close+focus behavior
  const commitValue = useCallback(
    (next: SelectSearchableValue) => {
      if (disabled) return;

      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);

      if (!multiple) {
        store.setOpen(false);
        store.getSnapshot().triggerEl?.focus();
      }
    },
    [disabled, isControlled, multiple, onValueChange, store],
  );

  useEffect(() => {
    store.setCommitValue(commitValue);
    return () => store.setCommitValue(null);
  }, [store, commitValue]);

  // Dispatch native change event (keeps external onChange listeners happy)
  useEffect(() => {
    store.dispatchNativeChange();
  }, [store, value]);

  // Set active descendant on programmatic value changes.
  useEffect(() => {
    const snap = store.getSnapshot();

    const currentActive = snap.activeDescendantId;

    // Helper: set active only if it changes
    const setActiveIfChanged = (next: string | null) => {
      if (next !== currentActive) store.setActiveDescendantId(next);
    };

    // Helper: find first visible + enabled option (DOM order)
    const findFirstVisible = (): string | null => {
      for (const id of snap.orderedIds) {
        if (!snap.visibleIds.has(id)) continue;
        const opt = snap.options.get(id);
        if (!opt || opt.disabled) continue;
        return id;
      }
      return null;
    };

    // Multi-select: keep active if still navigable (exists, enabled, visible).
    if (multiple) {
      if (currentActive) {
        const opt = snap.options.get(currentActive);
        const stillNavigable =
          !!opt && !opt.disabled && snap.visibleIds.has(currentActive);

        if (stillNavigable) return;
      }

      // Otherwise fall back to first visible option
      setActiveIfChanged(findFirstVisible());
      return;
    }

    // Single-select: active should match the selected value
    const selectedValue = snap.value == null || Array.isArray(snap.value)
      ? null
      : String(snap.value);

    if (!selectedValue) {
      setActiveIfChanged(null);
      return;
    }

    const selectedId = snap.valueToId.get(selectedValue) ?? null;
    setActiveIfChanged(selectedId);
  }, [store, value, multiple]);

  // Close on outside click (works with portaled dropdown)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (ev: PointerEvent) => {
      const t = ev.target as Node | null;
      if (!t) return;

      const { triggerEl, dropdownEl } = store.getSnapshot();

      if (triggerEl?.contains(t)) return;
      if (dropdownEl?.contains(t)) return;

      store.setOpen(false);
      triggerEl?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [store, open]);

  return (
    <SelectSearchableStoreContext.Provider value={store}>
      <div
        id={rootId}
        className={[styles.root, disabled ? styles.disabled : "", className].filter(Boolean).join(" ")}
        style={style}
      >
        <select
          {...selectProps}
          ref={(el) => store.setNativeSelectEl(el)}
          id={nativeSelectId}
          value={value}
          onChange={onChange}
          className={styles.hiddenSelect}
          tabIndex={-1}
          aria-hidden="true"
        >
          {Array.isArray(value) && value.length ? (
            value.map((val) => (
              <option key={String(val)} value={val}>
                {String(val)}
              </option>
            ))
          ) : (
            <option value={value}>{String(value ?? "")}</option>
          )}
        </select>

        {children}
      </div>
    </SelectSearchableStoreContext.Provider>
  );
}