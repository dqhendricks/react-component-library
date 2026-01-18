import { useCallback } from "react";
import type React from "react";
import {
  useSelectSearchableStoreContext,
  type SelectSearchableValue,
} from "./SelectSearchableStoreContext";

function isEventComposing(e: React.KeyboardEvent<HTMLElement>) {
  return Boolean((e.nativeEvent as any)?.isComposing);
}

function asArray(v: SelectSearchableValue | undefined): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

function toggleInArray(arr: string[], next: string) {
  const set = new Set(arr);
  if (set.has(next)) set.delete(next);
  else set.add(next);
  return Array.from(set);
}

export function useSelectNavigationKeyDown() {
  const store = useSelectSearchableStoreContext();

  return useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (isEventComposing(e)) return;

      const s = store.getSnapshot();
      if (s.disabled) return;

      if (!s.orderedIds.length) return;

      const findFirstVisible = () =>
        s.orderedIds.find((id) => s.visibleIds.has(id) && !s.options.get(id)?.disabled) ?? null;

      const findLastVisible = () => {
        for (let i = s.orderedIds.length - 1; i >= 0; i--) {
          const id = s.orderedIds[i];
          if (s.visibleIds.has(id) && !s.options.get(id)?.disabled) return id;
        }
        return null;
      };

      const setActiveToCurrentValueIfVisible = () => {
        const current = asArray(s.value as any);
        const first = current[0];
        if (!first) return false;

        const idFromValue = s.valueToId.get(String(first)) ?? null;
        if (!idFromValue) return false;

        const opt = s.options.get(idFromValue);
        if (!opt || opt.disabled) return false;
        if (!s.visibleIds.has(idFromValue)) return false;

        store.setActiveDescendantId(idFromValue);
        return true;
      };

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (!s.open) store.setOpen(true);

          if (!s.activeDescendantId) {
            if (!setActiveToCurrentValueIfVisible()) {
              store.moveActive(1);
            }
            return;
          }

          store.moveActive(1);
          return;
        }

        case "ArrowUp": {
          e.preventDefault();
          if (!s.open) store.setOpen(true);

          if (!s.activeDescendantId) {
            if (!setActiveToCurrentValueIfVisible()) {
              store.moveActive(-1);
            }
            return;
          }

          store.moveActive(-1);
          return;
        }

        case "Home": {
          e.preventDefault();
          if (!s.open) store.setOpen(true);
          store.setActiveDescendantId(findFirstVisible());
          return;
        }

        case "End": {
          e.preventDefault();
          if (!s.open) store.setOpen(true);
          store.setActiveDescendantId(findLastVisible());
          return;
        }

        case "PageDown": {
          e.preventDefault();
          if (!s.open) store.setOpen(true);
          for (let i = 0; i < 10; i++) store.moveActive(1);
          return;
        }

        case "PageUp": {
          e.preventDefault();
          if (!s.open) store.setOpen(true);
          for (let i = 0; i < 10; i++) store.moveActive(-1);
          return;
        }

        case "Enter": {
          if (!s.open) return;
          e.preventDefault();

          const activeId = s.activeDescendantId;
          if (!activeId) return;

          const active = s.options.get(activeId);
          if (!active || active.disabled) return;
          if (!s.visibleIds.has(activeId)) return;

          if (s.multiple) {
            const current = asArray(s.value as any);
            const next = toggleInArray(current, active.value);
            store.commitValue(next as unknown as SelectSearchableValue);
          } else {
            store.commitValue(active.value as unknown as SelectSearchableValue);
            store.setOpen(false);
          }
          return;
        }

        case "Escape": {
          if (!s.open) return;
          e.preventDefault();
          store.setOpen(false);
          s.triggerEl?.focus();
          return;
        }

        case "Tab": {
          if (!s.open) return;
          e.preventDefault();
          store.setOpen(false);
          s.triggerEl?.focus();
          return;
        }

        default:
          return;
      }
    },
    [store],
  );
}