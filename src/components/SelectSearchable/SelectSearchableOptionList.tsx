import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableValue,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';
import { extractNodeText } from '../utils/extractNodeText';
import { unicodeToBase64 } from '../utils/unicodeToBase64';
import { SelectSearchableOption, type SelectSearchableOptionProps } from './SelectSearchableOption';

type UlProps = React.ComponentPropsWithoutRef<'ul'>;
type LiProps = React.ComponentPropsWithoutRef<'li'>;

// Only allow Option children
type OptionChildren =
  | React.ReactElement<SelectSearchableOptionProps, typeof SelectSearchableOption>
  | Array<React.ReactElement<SelectSearchableOptionProps, typeof SelectSearchableOption>>;

export type SelectSearchableOptionListProps = Omit<
  UlProps,
  'id' | 'role' | 'ref' | 'aria-hidden' | 'aria-multiselectable' | 'children'
> & {
  children: OptionChildren;
};

function asArray(v: SelectSearchableValue | undefined): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

function makeDomOptionId(listboxId: string, itemId: string) {
  return `${listboxId}--${unicodeToBase64(itemId)}`;
}

type ParsedOption = {
  domId: string;
  props: SelectSearchableOptionProps;
  label: string;
};

export function SelectSearchableOptionList({ children, ...userProps }: SelectSearchableOptionListProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId) ?? 'cs-listbox';
  const multiple = useSelectSearchableStore(store, (s) => s.multiple);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);

  const selectedValueSet = useSelectSearchableStore(store, (s) => s.selectedValueSet);
  const activeDescendantId = useSelectSearchableStore(store, (s) => s.activeDescendantId);
  const visibleIds = useSelectSearchableStore(store, (s) => s.visibleIds);

  const hiddenList = !open || disabled;

  const nodeMapRef = useRef(new Map<string, HTMLLIElement | null>());

  const options: ParsedOption[] = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];

    return arr.map((el) => {
      const props = el.props;
      const domId = makeDomOptionId(listboxId, props.itemId);
      const label = extractNodeText(props.children);
      return { domId, props, label };
    });
  }, [children, listboxId]);

  // Batch register all options (requires store.registerOptions)
  useLayoutEffect(() => {
    return store.registerOptions(
      options.map((o) => ({
        id: o.domId,
        value: o.props.value,
        label: o.label,
        disabled: o.props.disabled,
        node: null, // store no longer scrolls; OptionList does
      })),
    );
  }, [store, options]);

  // OptionList owns scrolling now
  useLayoutEffect(() => {
    if (!activeDescendantId) return;
    nodeMapRef.current.get(activeDescendantId)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeDescendantId]);

  const commit = useCallback(
    (value: string, optDisabled: boolean | undefined) => {
      if (optDisabled) return;

      const s = store.getSnapshot();

      if (!s.multiple) {
        store.commitValue(value);
        return;
      }

      const current = asArray(s.value);
      const set = new Set(current);
      if (set.has(value)) set.delete(value);
      else set.add(value);

      store.commitValue(Array.from(set));
    },
    [store],
  );

  const setActive = useCallback(
    (id: string, optDisabled: boolean | undefined) => {
      if (optDisabled) return;
      store.setActiveDescendantId(id);
    },
    [store],
  );

  const ourProps: UlProps = {
    id: listboxId,
    role: 'listbox',
    'aria-hidden': hiddenList || undefined,
    'aria-multiselectable': multiple || undefined,
    className: styles.optionList,
  };

  const merged = mergeProps(userProps, ourProps);

  return (
    <ul {...merged} ref={store.setOptionListEl} data-part="list">
      {options.map(({ domId, props }) => {
        const { itemId: _itemId, value, disabled: optDisabled, children: optChildren, ...liProps } = props;

        const isSelected = selectedValueSet.has(value);
        const isActive = activeDescendantId === domId;
        const hidden = !visibleIds.has(domId);

        const ourLiProps: LiProps = {
          id: domId,
          role: 'option',
          'aria-selected': isSelected,
          'aria-disabled': optDisabled || undefined,
          hidden,
          'aria-hidden': hidden || undefined,
          className: [
            styles.option,
            isSelected ? styles.optionSelected : '',
            isActive ? styles.optionActive : '',
            optDisabled ? styles.optionDisabled : '',
          ]
            .filter(Boolean)
            .join(' '),
          onMouseEnter: () => setActive(domId, optDisabled),
          onMouseDown: (ev) => ev.preventDefault(),
          onClick: () => commit(value, optDisabled),
        };

        const mergedLiProps = mergeProps(liProps, ourLiProps);

        return (
          <li
            key={domId}
            {...mergedLiProps}
            data-option-id={domId}
            ref={(n) => {
              nodeMapRef.current.set(domId, n);
            }}
            data-part="option"
            data-selected={isSelected || undefined}
            data-active={isActive || undefined}
            data-disabled={optDisabled || undefined}
            data-hidden={hidden || undefined}
          >
            {optChildren}
          </li>
        );
      })}
    </ul>
  );
}