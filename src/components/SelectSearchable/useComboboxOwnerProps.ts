
import { useSelectSearchableContext } from "./SelectSearchableContext";
import { useSelectNavigationKeyDown } from "./useSelectNavigationKeyDown";

export function useComboboxOwnerProps() {
  const { listboxId, open, activeDescendantId, disabled } = useSelectSearchableContext();
  const onNavKeyDown = useSelectNavigationKeyDown();

  return {
    role: "combobox" as const,
    "aria-controls": listboxId,
    "aria-expanded": open,
    "aria-activedescendant": activeDescendantId ?? undefined,
    "aria-haspopup": "listbox" as const,
    "aria-autocomplete": "list" as const,
    "aria-disabled": disabled || undefined,
    onKeyDown: onNavKeyDown,
  };
}
