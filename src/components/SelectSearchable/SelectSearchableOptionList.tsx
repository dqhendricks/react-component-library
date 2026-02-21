import React, { useLayoutEffect, useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';
import { extractNodeText } from '../utils/extractNodeText';
import { SelectSearchableOption, type SelectSearchableOptionProps } from './SelectSearchableOption';
import { makeDomOptionId } from '../utils/makeDomOptionId';

type UlProps = React.ComponentPropsWithoutRef<'ul'>;

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
  const activeDescendantId = useSelectSearchableStore(store, (s) => s.activeDescendantId);
  const optionListEl = useSelectSearchableStore(store, (s) => s.optionListEl);

  const hiddenList = !open || disabled;

  const options: ParsedOption[] = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];

    return arr.map((el) => {
      const props = el.props;
      const domId = makeDomOptionId(listboxId, props.itemId);
      const label = extractNodeText(props.children);
      return { domId, props, label };
    });
  }, [children, listboxId]);

  // Batch register all options (order + labels + disabled metadata).
  useLayoutEffect(() => {
    return store.registerOptions(
      options.map((o) => ({
        id: o.domId,
        value: o.props.value,
        label: o.label,
        disabled: o.props.disabled,
      })),
    );
  }, [store, options]);

  // Keep active option visible.
  useLayoutEffect(() => {
    if (!activeDescendantId || !optionListEl) return;

    const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(activeDescendantId)
      : activeDescendantId;

    const node = optionListEl.querySelector<HTMLElement>(`[data-option-id="${escapedId}"]`);
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [activeDescendantId, optionListEl]);

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
      {children}
    </ul>
  );
}
