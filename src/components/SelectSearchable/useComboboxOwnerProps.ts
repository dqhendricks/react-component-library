import { useSelectSearchableStoreContext, useSelectSearchableStore } from './SelectSearchableStoreContext';
import { useSelectNavigationKeyDown } from './useSelectNavigationKeyDown';

export function useComboboxOwnerProps() {
  const store = useSelectSearchableStoreContext();
  const listboxId = useSelectSearchableStore(store, s => s.listboxId);
  const ariaLabel = useSelectSearchableStore(store, s => s.ariaLabel);
  const ariaLabelledBy = useSelectSearchableStore(store, s => s.ariaLabelledBy);
  const open = useSelectSearchableStore(store, s => s.open);
  const activeDescendantId = useSelectSearchableStore(store, s => s.activeDescendantId);
  const disabled = useSelectSearchableStore(store, s => s.disabled);

  const onNavKeyDown = useSelectNavigationKeyDown();

  return {
    role: 'combobox' as const,
    'aria-controls': open ? listboxId : undefined,
    'aria-expanded': open,
    'aria-activedescendant': activeDescendantId ?? undefined,
    'aria-haspopup': 'listbox' as const,
    'aria-autocomplete': 'list' as const,
    'aria-disabled': disabled || undefined,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    onKeyDown: onNavKeyDown,
  };
}