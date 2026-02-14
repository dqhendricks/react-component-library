import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PropsWithChildren,
  type ComponentPropsWithoutRef,
} from 'react';
import styles from './SelectSearchable.module.css';
import {
  SelectSearchableStoreContext,
  createSelectSearchableStore,
  type SelectSearchableValue,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { assignRef } from '../utils/assignRef';
import { proxyToNativeSelect, type FocusLikeEventHandler } from './proxyToNativeSelect';

function normalizeByMode(
  next: SelectSearchableValue,
  multiple: boolean,
): SelectSearchableValue {
  return multiple
    ? (Array.isArray(next) ? next : next === undefined ? [] : [next])
    : (Array.isArray(next) ? (next[0] ?? undefined) : next);
}

type CommonRootProps = PropsWithChildren<
  Pick<
    ComponentPropsWithoutRef<'select'>,
    | 'id'
    | 'name'
    | 'disabled'
    | 'required'
    | 'form'
    | 'onChange'
    | 'onInvalid'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-description'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-errormessage'
  > & {
    onFocus?: FocusLikeEventHandler;
    onBlur?: FocusLikeEventHandler;
  }
>;

type SelectSearchableRootPropsSingle = CommonRootProps & {
  multiple?: false | undefined;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type SelectSearchableRootPropsMultiple = CommonRootProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type SelectSearchableRootProps =
  | SelectSearchableRootPropsSingle
  | SelectSearchableRootPropsMultiple;

/**
 * Root container for the SelectSearchable composite component.
 *
 * Renders a visually-custom select while maintaining an underlying native `select`
 * for form compatibility and accessibility.
 */
export const SelectSearchableRoot = React.forwardRef<
  HTMLSelectElement,
  SelectSearchableRootProps
>(function SelectSearchableRoot(
  {
    // native select props
    name,
    multiple = false,
    disabled = false,
    required,
    form,
    value: controlledValue,
    defaultValue,
    onChange,
    onValueChange,
    onInvalid,
    // composite props
    id,
    onFocus,
    onBlur,
    // aria props
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-description': ariaDescription,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-errormessage': ariaErrorMessage,
    // root props
    children,
  },
  forwardedRef,
) {
  const reactId = useId();
  const triggerId = id ?? `ss-${reactId}`;
  const labelId = `${triggerId}--label`;
  const errorId = `${triggerId}--error`;
  const dropdownId = `${triggerId}--dropdown`;
  const listboxId = `${triggerId}--listbox`;
  const nativeSelectId = `${triggerId}--native`;

  const isControlled = controlledValue != null;
  const [uncontrolledValue, setUncontrolledValue] = useState<SelectSearchableValue>(defaultValue);
  const value = (isControlled ? controlledValue : uncontrolledValue) as SelectSearchableValue;

  const storeRef = useRef<ReturnType<typeof createSelectSearchableStore> | null>(null);
  if (!storeRef.current) storeRef.current = createSelectSearchableStore();
  const store = storeRef.current;

  // Subscribe ONLY to open so we can attach/detach outside-click listeners at the right time.
  // Everything else can use store.getSnapshot() in handlers/effects.
  const open = useSelectSearchableStore(store, (s) => s.open);

  // prop sync
  useEffect(() => {
    store.setIdentity({ labelId, errorId, triggerId, dropdownId, listboxId });
    store.setA11y({ ariaLabel, ariaLabelledBy, ariaDescription, ariaDescribedBy, ariaInvalid, ariaErrorMessage });
    store.setFlags({ disabled, multiple });
  }, [triggerId, listboxId, ariaLabel, ariaLabelledBy, ariaDescription, ariaDescribedBy, ariaInvalid, ariaErrorMessage, disabled, multiple]);

  // value sync
  useEffect(() => {
    store.setValue(value);
  }, [value]);

  // normalize value on `multiple` mode change
  useEffect(() => {
    if (isControlled) return;
    setUncontrolledValue((prev) => normalizeByMode(prev, multiple));
  }, [multiple, isControlled]);

  // Root controls commit (controlled/uncontrolled) and close+focus behavior
  const commitValue = useCallback((next: SelectSearchableValue) => {
    if (disabled) return;

    const normalized = normalizeByMode(next, multiple);
    if (!isControlled) setUncontrolledValue(normalized);

    if (multiple) {
      (onValueChange as ((v: string[] | undefined) => void) | undefined)?.(
        (normalized as string[]).length ? (normalized as string[]) : undefined
      );
    } else {
      (onValueChange as ((v: string | undefined) => void) | undefined)?.(
        normalized as string | undefined
      );
    }

    if (!multiple) {
      store.setOpen(false);
      store.getSnapshot().triggerEl?.focus();
    }
  }, [disabled, isControlled, multiple, onValueChange]);

  useEffect(() => {
    store.setCommitValue(commitValue);
    return () => store.setCommitValue(null);
  }, [commitValue]);

  // Dispatch native change event (keeps external onChange listeners happy)
  useEffect(() => {
    store.dispatchNativeChange();
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (ev: PointerEvent) => {
      const t = ev.target as Node | null;
      if (!t) return;

      const { triggerEl, dropdownEl } = store.getSnapshot();

      if (triggerEl?.contains(t)) return;
      if (dropdownEl?.contains(t)) return;

      store.setOpen(false);
      triggerEl?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  // Handle onFocus/onBlur universally for the control
  useEffect(() => {
    const isInside = (node: EventTarget | null) => {
      if (!(node instanceof Node)) return false;

      const snap = store.getSnapshot();
      if (snap.triggerEl?.contains(node)) return true;
      if (snap.dropdownEl?.contains(node)) return true;
      return false;
    };

    const onFocusIn = (e: FocusEvent) => {
      // entered from outside?
      if (isInside(e.target) && !isInside(e.relatedTarget)) {
        const snap = store.getSnapshot();
        onFocus?.(proxyToNativeSelect(e, snap.nativeSelectEl, 'focus'));
      }
    };

    const onFocusOut = (e: FocusEvent) => {
      // leaving to outside?
      if (isInside(e.target) && !isInside(e.relatedTarget)) {
        const snap = store.getSnapshot();
        onBlur?.(proxyToNativeSelect(e, snap.nativeSelectEl, 'blur'));
      }
    };

    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('focusout', onFocusOut, true);
    return () => {
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('focusout', onFocusOut, true);
    };
  }, [onFocus, onBlur]);


  return (
    <SelectSearchableStoreContext.Provider value={store}>
      <>
        <select
          ref={(el) => {
            store.setNativeSelectEl(el);
            assignRef(forwardedRef, el);
          }}
          id={nativeSelectId}
          name={name}
          value={value === undefined ? (multiple ? [] : '') : value}
          multiple={multiple}
          form={form}
          required={required}
          disabled={disabled}
          onChange={onChange || (() => {})}
          onInvalid={onInvalid}
          className={styles.hiddenSelect}
          tabIndex={-1}
          aria-hidden='true'
        >
          {Array.isArray(value) ? (
            value.map((val) => (
              <option key={String(val)} value={val}>
                {String(val)}
              </option>
            ))
          ) : value !== undefined ? (
            <option value={value}>{String(value)}</option>
          ) : null }
        </select>

        {children}
      </>
    </SelectSearchableStoreContext.Provider>
  );
});