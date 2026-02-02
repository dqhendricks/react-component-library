import * as React from 'react';
import { observeListboxMutations } from './observeListboxMutations';

export type SelectSearchableValue = string | string[];

type SelectSearchableOptionRecord = {
  id: string; // stable DOM id for aria-activedescendant, etc.
  value: string;
  label: string; // display / search string
  disabled?: boolean;
  node: HTMLElement | null;
};

type State = {
  // Identity / wiring
  controlId: string;
  listboxId: string;

  // A11y
  ariaLabel?: string;
  ariaLabelledBy?: string;

  // Native-ish flags
  disabled: boolean;
  multiple: boolean;

  // State
  value: SelectSearchableValue;
  selectedValueSet: ReadonlySet<string>; // Fast lookup for option's isSelected check
  open: boolean;
  onTriggerBlur?: React.FocusEventHandler<HTMLElement>;
  activeDescendantId: string | null;

  hasSearch: boolean;
  searchQuery: string;

  // Derived
  visibleIds: Set<string>; // derived once per searchQuery/options change
  orderedIds: string[]; // derived from DOM order (mutation observed)

  // Elements
  triggerEl: HTMLElement | null;
  dropdownEl: HTMLElement | null
  optionListEl: HTMLElement | null;

  // Option registry
  options: Map<string, SelectSearchableOptionRecord>;
  valueToId: Map<string, string>; // helps fast lookup by value

  // For native change dispatch (optional)
  nativeSelectEl: HTMLSelectElement | null;
};

type Listener = () => void;

export type SelectSearchableStore = {
  // subscribe/get
  subscribe: (l: Listener) => () => void;
  getSnapshot: () => State;

  // config/identity
  setIdentity: (p: {
    controlId: string;
    listboxId: string;
  }) => void;
  setA11y: (p: { ariaLabel?: string; ariaLabelledBy?: string }) => void;
  setFlags: (p: { disabled: boolean; multiple: boolean }) => void;

  // state setters
  setValue: (value: SelectSearchableValue) => void;
  setOpen: (open: boolean) => void;
  setOnTriggerBlur: (fn: React.FocusEventHandler<HTMLElement> | undefined) => void;

  setActiveDescendantId: (id: string | null) => void;

  setHasSearch: (has: boolean) => void;
  setSearchQuery: (q: string) => void;

  setTriggerEl: (el: HTMLElement | null) => void;
  setDropdownEl(el: HTMLElement | null): void
  setOptionListEl: (el: HTMLElement | null) => void;

  setNativeSelectEl: (el: HTMLSelectElement | null) => void;
  dispatchNativeChange: () => void;

  // option registry
  registerOption: (opt: SelectSearchableOptionRecord) => () => void;

  // queries/helpers
  getOptionByValue: (value: string) => SelectSearchableOptionRecord | undefined;

  // order + navigation helpers
  moveActive: (dir: 1 | -1) => void;

  // value commit (injected by Root so it can handle controlled/uncontrolled)
  setCommitValue: (fn: ((next: SelectSearchableValue) => void) | null) => void;
  commitValue: (next: SelectSearchableValue) => void;
};

const normalize = (s: string) => s.trim().toLowerCase();

function toSelectedSet(value: SelectSearchableValue): ReadonlySet<string> {
  if (value == null) return new Set();

  return Array.isArray(value) ? new Set(value) : new Set([value]);
}

function matchesSearch(query: string, label: string) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(label).includes(q);
}

function recomputeVisibleIds(state: State) {
  const next = new Set<string>();
  const q = state.searchQuery;

  for (const [id, opt] of state.options) {
    if (opt.disabled) continue; // usually still visible, but not navigable. flip if you want disabled visible
    if (matchesSearch(q, opt.label)) next.add(id);
  }

  // If you want disabled options to remain visible, do this instead:
  // for (const [id, opt] of state.options) if (matchesSearch(q, opt.label)) next.add(id);

  state.visibleIds = next;
}

export function createSelectSearchableStore(): SelectSearchableStore {
  const listeners = new Set<Listener>();

  let commitValueFn: ((next: SelectSearchableValue) => void) | null = null;

  let cleanupObserve: (() => void) | null = null;

  const state: State = {
    controlId: '',
    listboxId: '',

    ariaLabel: undefined,
    ariaLabelledBy: undefined,

    disabled: false,
    multiple: false,

    value: '',
    selectedValueSet: new Set(),
    open: false,
    activeDescendantId: null,

    hasSearch: false,
    searchQuery: '',

    visibleIds: new Set(),
    orderedIds: [],

    triggerEl: null,
    dropdownEl: null,
    optionListEl: null,

    options: new Map(),
    valueToId: new Map(),

    nativeSelectEl: null,
  };

  function emit() {
    for (const l of listeners) l();
  }

  function setState(mut: () => void) {
    mut();
    emit();
  }

  function recomputeOrderFromDOM() {
    const root = state.optionListEl;
    if (!root) {
      state.orderedIds = [];
      return;
    }

    const ids = Array.from(root.querySelectorAll<HTMLElement>("[data-option-id]"))
      .map((el) => el.dataset.optionId)
      .filter((id): id is string => !!id);

    state.orderedIds = ids;
  }

  function startObservingListbox(el: HTMLElement | null) {
    cleanupObserve?.();
    cleanupObserve = null;

    if (!el) return;

    cleanupObserve = observeListboxMutations(el, () => {
      setState(() => {
        recomputeOrderFromDOM();
        // active might point at removed node id
        if (state.activeDescendantId && !state.options.has(state.activeDescendantId)) {
          state.activeDescendantId = null;
        }
      });
    });

    // initial
    setState(() => {
      recomputeOrderFromDOM();
    });
  }

  function isNavigable(id: string) {
    const opt = state.options.get(id);
    if (!opt) return false;
    if (opt.disabled) return false;
    // For full search select: navigable only if visible
    return state.visibleIds.has(id);
  }

  function moveActive(dir: 1 | -1) {
    const ids = state.orderedIds;
    if (!ids.length) return;

    const currentIndex = state.activeDescendantId ? ids.indexOf(state.activeDescendantId) : -1;

    for (let step = 1; step <= ids.length; step++) {
      let idx = currentIndex + dir * step;
      idx = ((idx % ids.length) + ids.length) % ids.length;

      const id = ids[idx];
      if (!isNavigable(id)) continue;

      setState(() => {
        state.activeDescendantId = id;
        state.options.get(id)?.node?.scrollIntoView?.({ block: "nearest" });
      });
      return;
    }
  }

  const store: SelectSearchableStore = {
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSnapshot() {
      return state;
    },

    setIdentity(p) {
      setState(() => {
        state.controlId = p.controlId;
        state.listboxId = p.listboxId;
      });
    },

    setA11y(p) {
      setState(() => {
        state.ariaLabel = p.ariaLabel;
        state.ariaLabelledBy = p.ariaLabelledBy;
      });
    },

    setFlags(p) {
      setState(() => {
        state.disabled = p.disabled;
        state.multiple = p.multiple;
      });
    },

    setValue(value) {
      setState(() => {
        state.value = value;
        state.selectedValueSet = toSelectedSet(value);
      });
    },

    setOpen(open) {
      setState(() => {
        state.open = open;
      });
    },

    setOnTriggerBlur(fn) {
      setState(() => {
        state.onTriggerBlur = fn;
      });
    },

    setActiveDescendantId(id) {
      setState(() => {
        state.activeDescendantId = id;
      });
    },

    setHasSearch(has) {
      setState(() => {
        state.hasSearch = has;
      });
    },

    setSearchQuery(q) {
      setState(() => {
        state.searchQuery = q;
        recomputeVisibleIds(state);

        // If active becomes non-visible, clear (caller may choose to moveActive(1))
        if (state.activeDescendantId && !state.visibleIds.has(state.activeDescendantId)) {
          state.activeDescendantId = null;
        }
      });
    },

    setTriggerEl(el) {
      setState(() => {
        state.triggerEl = el;
      });
    },

    setDropdownEl(el) {
      setState(() => {
        state.dropdownEl = el;
      });
    },

    setOptionListEl(el) {
      setState(() => {
        state.optionListEl = el;
      });
      startObservingListbox(el);
    },

    setNativeSelectEl(el) {
      setState(() => {
        state.nativeSelectEl = el;
      });
    },

    dispatchNativeChange() {
      const el = state.nativeSelectEl;
      if (!el) return;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },

    registerOption(opt) {
      setState(() => {
        state.options.set(opt.id, opt);
        state.valueToId.set(opt.value, opt.id);
        recomputeVisibleIds(state);
      });

      return () => {
        setState(() => {
          state.options.delete(opt.id);
          state.valueToId.delete(opt.value);
          state.visibleIds.delete(opt.id);
          state.orderedIds = state.orderedIds.filter((x) => x !== opt.id);
          if (state.activeDescendantId === opt.id) state.activeDescendantId = null;
        });
      };
    },

    getOptionByValue(value) {
      const id = state.valueToId.get(value);
      if (!id) return undefined;
      const r = state.options.get(id);
      if (!r) return undefined;
      return r;
    },

    moveActive,

    setCommitValue(fn) {
      commitValueFn = fn;
    },

    commitValue(next) {
      if (state.disabled) return;
      commitValueFn?.(next);
    },
  };

  return store;
}

/**
 * Selector subscription hook.
 * Components only re-render if their selected slice changes.
 */
export function useSelectSearchableStore<T>(
  store: SelectSearchableStore,
  selector: (s: State) => T,
): T {
  return React.useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(store.getSnapshot()),
  );
}

// Context that holds the per-root store instance
export const SelectSearchableStoreContext = React.createContext<SelectSearchableStore | null>(null);

export function useSelectSearchableStoreContext(): SelectSearchableStore {
  const v = React.useContext(SelectSearchableStoreContext);
  if (!v) throw new Error("SelectSearchable components must be used within <SelectSearchableRoot>.");
  return v;
}