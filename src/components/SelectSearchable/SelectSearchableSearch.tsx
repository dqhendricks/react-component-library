import React, { useEffect, useMemo, useRef } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { useSelectNavigationKeyDown } from './useSelectNavigationKeyDown';
import { mergeProps } from '../utils/mergeProps';
import { resolveAriaAttributes } from '../utils/resolveAriaAttributes';

export type SelectSearchableSearchProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  | 'role'
  | 'value'
  | 'defaultValue'
  | 'autoFocus'
  | 'aria-invalid'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-activedescendant'
  | 'aria-autocomplete'
>;

export function SelectSearchableSearch({
  placeholder = 'Search…',
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledByProp,
  'aria-description': ariaDescriptionProp,
  'aria-describedby': ariaDescribedByProp,
  'aria-errormessage': ariaErrorMessageProp,
  ...rest
}: SelectSearchableSearchProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, s => s.listboxId);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const searchQuery = useSelectSearchableStore(store, (s) => s.searchQuery);
  const activeDescendantId = useSelectSearchableStore(store, s => s.activeDescendantId) ?? undefined;
  const ariaInvalidBool = useSelectSearchableStore(store, s => s.ariaInvalidBool);

  const field = useSelectSearchableStore(store, s => s.fieldAccessibility);
  const localAria = {
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledByProp,
    'aria-description': ariaDescriptionProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-errormessage': ariaErrorMessageProp,
  };
  const aria = resolveAriaAttributes(field, localAria);

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
    ...aria,
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
        data-invalid={ariaInvalidBool ? 'true' : undefined}
      />
    </>
  );
}