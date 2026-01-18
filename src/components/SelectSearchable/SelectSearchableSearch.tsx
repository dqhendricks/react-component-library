import React, { useEffect, useMemo, useRef } from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";
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
  const store = useSelectSearchableStoreContext();

  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const searchQuery = useSelectSearchableStore(store, (s) => s.searchQuery);

  // Derived visibility is computed once per query in the store;
  // we just use it here to pick the first visible option.
  const orderedIds = useSelectSearchableStore(store, (s) => s.orderedIds);
  const visibleIds = useSelectSearchableStore(store, (s) => s.visibleIds);
  const options = useSelectSearchableStore(store, (s) => s.options);

  const comboboxOwnerProps = useComboboxOwnerProps();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Mark that the search input is the combobox "owner" while mounted.
  useEffect(() => {
    store.setHasSearch(true);
    return () => store.setHasSearch(false);
  }, [store]);

  useEffect(() => {
    if (!autoFocus) return;
    if (!open || disabled) return;
    inputRef.current?.focus();
  }, [open, disabled, autoFocus]);

  // Set active descendant to first visible match when query changes
  const firstMatchId = useMemo(() => {
    // If query is empty, don't force an active option.
    if (!searchQuery.trim()) return null;

    for (const id of orderedIds) {
      if (!visibleIds.has(id)) continue;
      if (options.get(id)?.disabled) continue;
      return id;
    }
    return null;
  }, [searchQuery, orderedIds, visibleIds, options]);

  useEffect(() => {
    if (firstMatchId) store.setActiveDescendantId(firstMatchId);
  }, [firstMatchId, store]);

  const ourInputProps: React.ComponentPropsWithoutRef<"input"> = {
    className: [styles.searchInput, className].filter(Boolean).join(" "),
    type: "text",
    disabled,
    placeholder,
    value: searchQuery,
    onChange: (e) => store.setSearchQuery(e.currentTarget.value),
  };

  const merged = mergeProps(rest as any, { ...ourInputProps, ...comboboxOwnerProps } as any);

  return <input ref={inputRef} {...merged} />;
}