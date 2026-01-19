import React, { useCallback, useEffect, useId, useMemo } from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";
import { mergeProps } from "./mergeProps";

type LiProps = React.ComponentPropsWithoutRef<"li">;

export type SelectSearchableOptionProps = React.PropsWithChildren<
  Omit<
    LiProps,
    | "role"
    | "aria-selected"
    | "aria-disabled"
    | "aria-hidden"
    | "hidden"
    | "ref"
  > & {
    value: string;
    disabled?: boolean;
  }
>;

function asArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

export const SelectSearchableOption = React.memo(function SelectSearchableOption({
  value,
  disabled = false,
  children,
  id: userId, // If id is set, it must be unique and stable
  ...userProps
}: SelectSearchableOptionProps) {
  const reactId = useId();
  const optionId = userId ?? `cs-opt-${reactId}`;

  const nodeRef = React.useRef<HTMLLIElement | null>(null);

  const store = useSelectSearchableStoreContext();

  const isSelected = useSelectSearchableStore(store, (s) => s.selectedValueSet.has(value));
  const isActive = useSelectSearchableStore(store, (s) => s.activeDescendantId === optionId);
  const isVisible = useSelectSearchableStore(store, (s) => s.visibleIds.has(optionId));

  const label = useMemo(() => (typeof children === "string" ? children : value), [children, value]);

  useEffect(() => {
    return store.registerOption({ id: optionId, value, label, disabled, node: nodeRef.current });
  }, [store, optionId, value, label, disabled]);

  const commit = useCallback(() => {
    if (disabled) return;

    const s = store.getSnapshot();

    if (!s.multiple) {
      store.commitValue(value);
      return;
    }

    const current = asArray(s.value);
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);

    store.commitValue(Array.from(set));
  }, [store, disabled, value]);

  const hidden = !isVisible;

  const ourProps: LiProps = {
    id: optionId,
    role: "option",
    "aria-selected": isSelected,
    "aria-disabled": disabled || undefined,
    hidden,
    "aria-hidden": hidden || undefined,
    className: [
      styles.option,
      isSelected ? styles.optionSelected : "",
      isActive ? styles.optionActive : "",
      disabled ? styles.optionDisabled : "",
    ]
      .filter(Boolean)
      .join(" "),
    onMouseEnter: () => {
      if (!disabled) store.setActiveDescendantId(optionId);
    },
    onMouseDown: (e) => {
      // Default: keep focus on trigger/search
      e.preventDefault();
    },
    onClick: () => {
      commit();
    },
  };

  const merged = mergeProps(userProps, ourProps);

  return <li
    {...merged}
    data-option-id={optionId}
    ref={nodeRef}
  >
    {children}
  </li>;
});

SelectSearchableOption.displayName = "SelectSearchableOption";