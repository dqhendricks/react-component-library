import * as React from 'react';

export type SelectSearchableValue = string | string[] | undefined;

export type SelectSearchableOptionRecord = {
  id: string; // stable DOM id for aria-activedescendant, etc.
  value: string;
  label: string; // display / search string
  disabled?: boolean;
};

export type SelectSearchableHeaderRecord = {
  rowId: string;
  optionIds: string[];
};

export type SelectSearchableDividerRecord = {
  rowId: string;
  beforeOptionIds: string[];
  afterOptionIds: string[];
  nextHeaderRowId?: string;
};

type State = {
  // Identity / wiring
  labelId?: string;
  errorId?: string;
  triggerId?: string;
  dropdownId?: string;
  listboxId?: string;

  // A11y
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescription?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: React.AriaAttributes['aria-invalid'];
  ariaInvalidBool: boolean;
  ariaErrorMessage?: string;

  // Native-ish flags
  disabled: boolean;
  multiple: boolean;

  // State
  value: SelectSearchableValue;
  selectedValueSet: ReadonlySet<string>; // Fast lookup for option's isSelected check
  open: boolean;
  activeDescendantId: string | null;

  hasLabel: boolean;
  hasError: boolean;
  hasSearch: boolean;
  searchQuery: string;

  // Derived
  visibleIds: Set<string>; // derived once per searchQuery/options change
  orderedIds: string[]; // derived from option registration order

  // Elements
  triggerEl: HTMLElement | null;
  dropdownEl: HTMLElement | null;
  optionListEl: HTMLElement | null;
  nativeSelectEl: HTMLSelectElement | null;

  // Registered rows
  options: Map<string, SelectSearchableOptionRecord>;
  valueToId: Map<string, string>; // helps fast lookup by value
  headersByRowId: Map<string, SelectSearchableHeaderRecord>;
  dividersByRowId: Map<string, SelectSearchableDividerRecord>;
};

type Listener = () => void;

export type SelectSearchableStore = {
  // subscribe/get
  subscribe: (l: Listener) => () => void;
  getSnapshot: () => State;

  // identity
  setIdentity: (p: {
    labelId: string;
    errorId: string;
    triggerId: string;
    dropdownId: string;
    listboxId: string;
  }) => void;

  // A11y
  setA11y: (p: {
    ariaLabel?: string;
    ariaLabelledBy?: string,
    ariaDescription?: string,
    ariaDescribedBy?: string,
    ariaInvalid?: React.AriaAttributes['aria-invalid'],
    ariaErrorMessage?: string,
  }) => void;

  // config
  setFlags: (p: { disabled: boolean; multiple: boolean }) => void;

  // state setters
  setValue: (value: SelectSearchableValue) => void;
  setOpen: (open: boolean) => void;

  setActiveDescendantId: (id: string | null) => void;

  setHasLabel: (has: boolean) => void;
  setHasError: (has: boolean) => void;
  setHasSearch: (has: boolean) => void;
  setSearchQuery: (q: string) => void;

  setTriggerEl: (el: HTMLElement | null) => void;
  setDropdownEl(el: HTMLElement | null): void
  setOptionListEl: (el: HTMLElement | null) => void;
  setNativeSelectEl: (el: HTMLSelectElement | null) => void;

  // row registration
  registerCollection: (p: {
    options: SelectSearchableOptionRecord[];
    headers: SelectSearchableHeaderRecord[];
    dividers: SelectSearchableDividerRecord[];
  }) => () => void;

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
  if (value === undefined) return new Set();
  return Array.isArray(value) ? new Set(value) : new Set([value]);
}

function matchesSearch(query: string, label: string) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(label).includes(q);
}

function computeVisibleIds(
  options: Map<string, SelectSearchableOptionRecord>,
  searchQuery: string,
): Set<string> {
  const next = new Set<string>();

  for (const [id, opt] of options) {
    if (opt.disabled) continue;
    if (matchesSearch(searchQuery, opt.label)) next.add(id);
  }

  return next;
}

function ariaInvalidToBool(value: React.AriaAttributes['aria-invalid']): boolean {
  return value === true || value === 'true' || value === 'grammar' || value === 'spelling';
}

export function createSelectSearchableStore(): SelectSearchableStore {
  const listeners = new Set<Listener>();

  let commitValueFn: ((next: SelectSearchableValue) => void) | null = null;

  const state: State = {
    labelId: undefined,
    errorId: undefined,
    triggerId: undefined,
    dropdownId: undefined,
    listboxId: undefined,

    ariaLabel: undefined,
    ariaLabelledBy: undefined,
    ariaDescription: undefined,
    ariaDescribedBy: undefined,
    ariaInvalid: undefined,
    ariaInvalidBool: false,
    ariaErrorMessage: undefined,

    disabled: false,
    multiple: false,

    value: '',
    selectedValueSet: new Set(),
    open: false,
    activeDescendantId: null,

    hasLabel: false,
    hasError: false,
    hasSearch: false,
    searchQuery: '',

    visibleIds: new Set(),
    orderedIds: [],

    triggerEl: null,
    dropdownEl: null,
    optionListEl: null,
    nativeSelectEl: null,

    options: new Map(),
    valueToId: new Map(),
    headersByRowId: new Map(),
    dividersByRowId: new Map(),
  };

  function emit() {
    for (const l of listeners) l();
  }

  function setState(mut: () => void) {
    mut();
    emit();
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
      });
      return;
    }
  }

  // ensures activeDescendentId stays valid after state changes
  function reconcileActiveDescendant() {
    const currentActive = state.activeDescendantId;

    // If current active exists but is invalid clear it
    if (currentActive) {
      const opt = state.options.get(currentActive);
      const stillNavigable =
        !!opt && !opt.disabled && state.visibleIds.has(currentActive);

      if (!stillNavigable) {
        state.activeDescendantId = null;
      }

      return;
    }

    // No active yet
    if (!state.multiple) {
      const selectedValue =
        state.value === undefined || Array.isArray(state.value)
          ? undefined
          : state.value;

      if (selectedValue !== undefined) {
        state.activeDescendantId =
          state.valueToId.get(selectedValue) ?? null;
      }
    } else {
      state.activeDescendantId = null;
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
        state.labelId = p.labelId;
        state.errorId = p.errorId;
        state.triggerId = p.triggerId;
        state.dropdownId = p.dropdownId;
        state.listboxId = p.listboxId;
      });
    },

    setA11y(p) {
      setState(() => {
        state.ariaLabel = p.ariaLabel;
        state.ariaLabelledBy = p.ariaLabelledBy;
        state.ariaDescription = p.ariaDescription;
        state.ariaDescribedBy = p.ariaDescribedBy;
        state.ariaInvalid = p.ariaInvalid;
        state.ariaInvalidBool = ariaInvalidToBool(p.ariaInvalid);
        state.ariaErrorMessage = p.ariaErrorMessage;
      });
    },

    setFlags(p) {
      setState(() => {
        state.disabled = p.disabled;
        state.multiple = p.multiple;
        reconcileActiveDescendant();
      });
    },

    setValue(value) {
      setState(() => {
        state.value = value;
        state.selectedValueSet = toSelectedSet(value);
        reconcileActiveDescendant();
      });
    },

    setOpen(open) {
      setState(() => {
        state.open = open;
      });
    },

    setActiveDescendantId(id) {
      setState(() => {
        state.activeDescendantId = id;
      });
    },

    setHasLabel(has) {
      setState(() => {
        state.hasLabel = has;
      });
    },

    setHasError(has) {
      setState(() => {
        state.hasError = has;
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
        state.visibleIds = computeVisibleIds(state.options, q);

        // If active becomes non-visible, clear
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
    },

    setNativeSelectEl(el) {
      setState(() => {
        state.nativeSelectEl = el;
      });
    },

    registerCollection({ options: opts, headers, dividers }) {
      setState(() => {
        const nextOptions = new Map<string, SelectSearchableOptionRecord>();
        const nextValueToId = new Map<string, string>();
        const nextOrderedIds = opts.map((o) => o.id);
        const nextHeaders = new Map<string, SelectSearchableHeaderRecord>();
        const nextDividers = new Map<string, SelectSearchableDividerRecord>();

        for (const opt of opts) {
          nextOptions.set(opt.id, opt);
          // if duplicate values exist, last one wins
          nextValueToId.set(opt.value, opt.id);
        }

        for (const header of headers) {
          nextHeaders.set(header.rowId, header);
        }

        for (const divider of dividers) {
          nextDividers.set(divider.rowId, divider);
        }

        state.options = nextOptions;
        state.valueToId = nextValueToId;
        state.orderedIds = nextOrderedIds;
        state.visibleIds = computeVisibleIds(nextOptions, state.searchQuery);
        state.headersByRowId = nextHeaders;
        state.dividersByRowId = nextDividers;

        if (state.activeDescendantId && !nextOptions.has(state.activeDescendantId)) {
          state.activeDescendantId = null;
        }

        reconcileActiveDescendant();
      });

      return () => {
        setState(() => {
          state.options = new Map();
          state.valueToId = new Map();
          state.visibleIds = new Set();
          state.orderedIds = [];
          state.headersByRowId = new Map();
          state.dividersByRowId = new Map();
          if (state.activeDescendantId) state.activeDescendantId = null;
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
  if (!v) throw new Error('SelectSearchable components must be used within <SelectSearchableRoot>.');
  return v;
}
