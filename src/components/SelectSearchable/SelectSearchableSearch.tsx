// SelectSearchableSearch.tsx
import React, { useEffect, useMemo, useRef } from "react";
import styles from "./SelectSearchable.module.css";
import { useSelectSearchableContext } from "./SelectSearchableContext";
import { useComboboxOwnerProps } from "./useComboboxOwnerProps";
import { mergeProps } from "./mergeProps";

export type SelectSearchableSearchProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "role" | "value" | "defaultValue" | "onChange"
> & {
  autoFocus?: boolean;
};

export function SelectSearchableSearch({
  className,
  autoFocus = true,
  placeholder = "Search…",
  ...rest
}: SelectSearchableSearchProps) {
  const {
    open,
    disabled,
    searchQuery,
    setSearchQuery,
    getOptions,
    setActiveDescendantId,
    setHasSearch,
  } = useSelectSearchableContext();

  const comboboxOwnerProps = useComboboxOwnerProps();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHasSearch?.(true);
    return () => setHasSearch?.(false);
  }, [setHasSearch]);

  useEffect(() => {
    if (!autoFocus) return;
    if (!open || disabled) return;
    inputRef.current?.focus();
  }, [open, disabled, autoFocus]);

  // Set active descendant to first match on query change
  const firstMatchId = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    for (const opt of getOptions()) {
      if (opt.disabled) continue;
      if (String(opt.label).toLowerCase().includes(q)) return opt.id;
    }
    return null;
  }, [searchQuery, getOptions]);

  useEffect(() => {
    if (firstMatchId) setActiveDescendantId(firstMatchId);
  }, [firstMatchId, setActiveDescendantId]);

  const ourInputProps: React.ComponentPropsWithoutRef<"input"> = {
    className: [styles.searchInput, className].filter(Boolean).join(" "),
    type: "text",
    disabled,
    placeholder,
    value: searchQuery,
    onChange: (e) => setSearchQuery(e.currentTarget.value),
  };

  const merged = mergeProps(
    rest as any,
    { ...ourInputProps, ...comboboxOwnerProps } as any,
  );

  return <input ref={inputRef} {...merged} />;
}