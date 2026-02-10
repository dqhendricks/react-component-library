import React, { useEffect, useMemo, useRef } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { useSelectNavigationKeyDown } from './useSelectNavigationKeyDown';
import { mergeProps } from '../utils/mergeProps';

export type SelectSearchableSearchProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  | 'role'
  | 'value'
  | 'defaultValue'
  | 'autoFocus'
  | 'aria-label'
  | 'aria-labeledby'
  | 'aria-invalid'
  | 'aria-errormessage'
>;

export function SelectSearchableSearch({
  placeholder = 'Search…',
  ...rest
}: SelectSearchableSearchProps) {
  const store = useSelectSearchableStoreContext();

  const labelId = useSelectSearchableStore(store, (s) => s.labelId);
  const listboxId = useSelectSearchableStore(store, s => s.listboxId);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const searchQuery = useSelectSearchableStore(store, (s) => s.searchQuery);
  const activeDescendantId = useSelectSearchableStore(store, s => s.activeDescendantId) ?? undefined;
  const hasLabel = useSelectSearchableStore(store, (s) => s.hasLabel);
  const ariaLabel = useSelectSearchableStore(store, s => s.ariaLabel);
  const ariaLabelledBy = useSelectSearchableStore(store, s => s.ariaLabelledBy);

  // Derived visibility is computed once per query in the store;
  // we just use it here to pick the first visible option.
  const orderedIds = useSelectSearchableStore(store, (s) => s.orderedIds);
  const visibleIds = useSelectSearchableStore(store, (s) => s.visibleIds);
  const options = useSelectSearchableStore(store, (s) => s.options);
  const onKeyDown = useSelectNavigationKeyDown();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Mark that the search input is the combobox 'owner' while mounted.
  useEffect(() => {
    store.setHasSearch(true);
    return () => store.setHasSearch(false);
  }, []);

  useEffect(() => {
    if (!open || disabled) return;
    inputRef.current?.focus();
  }, [open, disabled]);

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
  }, [firstMatchId]);

  // Process labelled by
  const ariaLabelledByMerged = Array.from(
    new Set([
      hasLabel && labelId,
      ariaLabelledBy,
    ].filter(Boolean))
  ).join(' ') || undefined;

  const ourInputProps: React.ComponentPropsWithoutRef<'input'> = {
    className: styles.searchInput,
    type: 'text',
    disabled,
    placeholder,
    value: searchQuery,
    onChange: (e) => store.setSearchQuery(e.currentTarget.value),
    role: 'combobox',
    'aria-expanded': open,
    'aria-controls': listboxId,
    'aria-activedescendant': activeDescendantId,
    'aria-autocomplete': 'list',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledByMerged,
    onKeyDown,
  };

  const merged = mergeProps(rest, ourInputProps);

  return (
    <>
      <input
        ref={inputRef}
        {...merged}
        // Consumer styling hooks
        data-part='search'
      />
    </>
  );
}