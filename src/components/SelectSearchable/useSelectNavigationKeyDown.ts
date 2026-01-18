import type React from "react";
import { useSelectSearchableContext, type SelectSearchableValue } from "./SelectSearchableContext";

function isEventComposing(e: React.KeyboardEvent<HTMLElement>) {
  // React exposes this on nativeEvent for IME; also guard older shapes
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
  const {
    disabled,
    multiple,
    open,
    setOpen,
    activeDescendantId,
    setActiveDescendantId,
    value,
    commitValue,
    getOptions,
    searchQuery,
    triggerEl,
  } = useSelectSearchableContext();

  return (e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (isEventComposing(e)) return;

    const optsAll = getOptions();
    if (!optsAll.length) return;

    // If user has typed a query, we can prefer matching options for navigation.
    // (Simple contains-match on label; tweak later.)
    const q = searchQuery.trim().toLowerCase();
    const opts = optsAll.filter((o) => !o.disabled && (!q || o.label.toLowerCase().includes(q)));

    if (!opts.length) return;

    const idx = activeDescendantId ? opts.findIndex((o) => o.id === activeDescendantId) : -1;

    const setActiveByIndex = (nextIdx: number) => {
      const clamped = Math.max(0, Math.min(opts.length - 1, nextIdx));
      setActiveDescendantId(opts[clamped].id);
    };

    const setActiveToValue = () => {
      const current = asArray(value);
      const first = current[0];
      if (!first) return;
      const match = opts.find((o) => o.value === first);
      if (match) setActiveDescendantId(match.id);
    };

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!open) setOpen(true);
        if (idx < 0) {
          // Prefer current value if present; else first option
          setActiveToValue();
          if (!activeDescendantId) setActiveByIndex(0);
        } else {
          setActiveByIndex(idx + 1);
        }
        return;
      }

      case 'ArrowUp': {
        e.preventDefault();
        if (!open) setOpen(true);
        if (idx < 0) {
          setActiveToValue();
          if (!activeDescendantId) setActiveByIndex(opts.length - 1);
        } else {
          setActiveByIndex(idx - 1);
        }
        return;
      }

      case 'Home': {
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveByIndex(0);
        return;
      }

      case 'End': {
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveByIndex(opts.length - 1);
        return;
      }

      case 'PageDown': {
        e.preventDefault();
        if (!open) setOpen(true);
        const jump = 10;
        setActiveByIndex(idx < 0 ? jump : idx + jump);
        return;
      }

      case 'PageUp': {
        e.preventDefault();
        if (!open) setOpen(true);
        const jump = 10;
        setActiveByIndex(idx < 0 ? 0 : idx - jump);
        return;
      }

      case 'Enter': {
        if (!open) return; // let other handlers open it
        e.preventDefault();

        const active = activeDescendantId
          ? opts.find((o) => o.id === activeDescendantId)
          : undefined;

        if (!active) return;

        if (multiple) {
          const current = asArray(value);
          const next = toggleInArray(current, active.value);
          commitValue(next as unknown as SelectSearchableValue);
        } else {
          commitValue(active.value as unknown as SelectSearchableValue);
          setOpen(false);
        }
        return;
      }

      case 'Escape':
      case 'Tab': {
        if (!open) return;
        e.preventDefault();
        setOpen(false);
        triggerEl?.focus();
        return;
      }

      default:
        return;
    }
  };
}
