import React, { useMemo } from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";
import { mergeProps } from "./mergeProps";

export type SelectSearchableTriggerValueProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children"
> & {
  placeholder?: string;
};

export function SelectSearchableTriggerValue({
  placeholder = "Select…",
  ...rest
}: SelectSearchableTriggerValueProps) {
  const store = useSelectSearchableStoreContext();

  const value = useSelectSearchableStore(store, (s) => s.value);
  const nativeSelectEl = useSelectSearchableStore(store, (s) => s.nativeSelectEl);

  const display = useMemo<React.ReactNode>(() => {
    if (Array.isArray(value)) {
      if (!value.length) return placeholder;
      return `${value.length} selected`;
    }

    if (value == null || value === "") return placeholder;

    const v = String(value);
    const fromRegistry = store.getOptionByValue(v)?.label;
    if (fromRegistry) return fromRegistry;

    const idx = nativeSelectEl?.selectedIndex ?? -1;
    return (idx >= 0 ? nativeSelectEl?.options[idx]?.text : undefined) ?? v;
  }, [value, placeholder, store, nativeSelectEl]);

  const ourProps: React.ComponentPropsWithoutRef<"span"> = {
    className: styles.triggerValue,
  };

  const merged = mergeProps(rest, ourProps);

  return <span {...merged}>{display}</span>;
}