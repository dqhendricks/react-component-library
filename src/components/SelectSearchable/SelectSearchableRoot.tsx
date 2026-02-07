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

function normalizeByMode(
  next: SelectSearchableValue,
  multiple: boolean,
): SelectSearchableValue {
  return multiple
    ? (Array.isArray(next) ? next : next === undefined ? [] : [next])
    : (Array.isArray(next) ? (next[0] ?? undefined) : next);
}

type CommonRootProps = PropsWithChildren<
  Omit<
    ComponentPropsWithoutRef<"select">,
    | "children"
    | "onBlur"
    | "size"
    | "autoComplete"
    | "value"
    | "defaultValue"
    | "multiple"
    | "onChange"
  > & {
    onBlur?: React.FocusEventHandler<HTMLElement>;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }
>;

type SelectSearchableRootPropsSingle = CommonRootProps & {
  multiple?: false | undefined;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type SelectSearchableRootPropsMultiple = CommonRootProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type SelectSearchableRootProps =
  | SelectSearchableRootPropsSingle
  | SelectSearchableRootPropsMultiple;

/**
 * Root container for the SelectSearchable composite component.
 *
 * Renders a visually-custom select while maintaining an underlying native `select`
 * for form compatibility and accessibility.
 */
export function SelectSearchableRoot({
  id,
  multiple = false,
  className,
  style,
  children,
  onValueChange,
  onBlur,
  value: controlledValue,
  defaultValue,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...selectProps
}: SelectSearchableRootProps) {
  const reactId = useId();
  const controlId = id ?? `ss-${reactId}`;
  const rootId = `${controlId}--root`;
  const listboxId = `${controlId}--listbox`;
  const nativeSelectId = `${controlId}--native`;

  const disabled = !!selectProps.disabled;

  const isControlled = controlledValue != null;
  const [uncontrolledValue, setUncontrolledValue] = useState<SelectSearchableValue>(defaultValue);
  const value = (isControlled ? controlledValue : uncontrolledValue) as SelectSearchableValue;

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

  // A11y
  useEffect(() => {
    store.setA11y({ ariaLabel, ariaLabelledBy });
  }, [store, ariaLabel, ariaLabelledBy]);

  // flags
  useEffect(() => {
    store.setFlags({ disabled, multiple });
  }, [store, disabled, multiple]);

  // injected callbacks
  useEffect(() => {
    store.setOnTriggerBlur(onBlur);
  }, [store, onBlur]);

  // normalize value on `multiple` mode change
  useEffect(() => {
    if (isControlled) return;
    setUncontrolledValue((prev) => normalizeByMode(prev, multiple));
  }, [multiple, isControlled]);

  // keep store value in sync
  useEffect(() => {
    store.setValue(value);
  }, [store, value]);

  // Root controls commit (controlled/uncontrolled) and close+focus behavior
  const commitValue = useCallback((next: SelectSearchableValue) => {
    if (disabled) return;

    const normalized = normalizeByMode(next, multiple);
    if (!isControlled) setUncontrolledValue(normalized);

    if (multiple) {
      (onValueChange as ((v: string[] | undefined) => void) | undefined)?.(
        (normalized as string[]).length ? (normalized as string[]) : undefined
      );
    } else {
      (onValueChange as ((v: string | undefined) => void) | undefined)?.(
        normalized as string | undefined
      );
    }

    if (!multiple) {
      store.setOpen(false);
      store.getSnapshot().triggerEl?.focus();
    }
  }, [disabled, isControlled, multiple, onValueChange, store]);

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

  // Close on outside click
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
        // Consumer styling hooks
        data-part='root'
      >
        <select
          {...selectProps}
          ref={(el) => store.setNativeSelectEl(el)}
          id={nativeSelectId}
          value={value === undefined ? (multiple ? [] : "") : value}
          multiple={multiple}
          onChange={onChange || (() => {})}
          className={styles.hiddenSelect}
          tabIndex={-1}
          aria-hidden="true"
        >
          {Array.isArray(value) ? (
            value.map((val) => (
              <option key={String(val)} value={val}>
                {String(val)}
              </option>
            ))
          ) : value !== undefined ? (
            <option value={value}>{String(value)}</option>
          ) : null }
        </select>

        {children}
      </div>
    </SelectSearchableStoreContext.Provider>
  );
}