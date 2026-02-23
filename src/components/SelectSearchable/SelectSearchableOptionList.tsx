import React, { useLayoutEffect, useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';
import { extractNodeText } from '../utils/extractNodeText';
import { SelectSearchableOption, type SelectSearchableOptionProps } from './SelectSearchableOption';
import {
  SelectSearchableOptionCategoryHeader,
  type SelectSearchableOptionCategoryHeaderProps,
} from './SelectSearchableOptionCategoryHeader';
import {
  SelectSearchableOptionDivider,
  type SelectSearchableOptionDividerProps,
} from './SelectSearchableOptionDivider';
import { makeDomOptionId } from '../utils/makeDomOptionId';

type UlProps = React.ComponentPropsWithoutRef<'ul'>;

type OptionElement = React.ReactElement<SelectSearchableOptionProps, typeof SelectSearchableOption>;
type CategoryHeaderElement = React.ReactElement<
  SelectSearchableOptionCategoryHeaderProps,
  typeof SelectSearchableOptionCategoryHeader
>;
type DividerElement = React.ReactElement<SelectSearchableOptionDividerProps, typeof SelectSearchableOptionDivider>;
type OptionListChild = OptionElement | CategoryHeaderElement | DividerElement;

type OptionListChildren = OptionListChild | OptionListChild[];

export type SelectSearchableOptionListProps = Omit<
  UlProps,
  'id' | 'role' | 'ref' | 'aria-hidden' | 'aria-multiselectable' | 'children'
> & {
  children: OptionListChildren;
};

type ParsedOption = {
  domId: string;
  props: SelectSearchableOptionProps;
  label: string;
};

function isOptionElement(node: unknown): node is OptionElement {
  return React.isValidElement(node) && node.type === SelectSearchableOption;
}

function isCategoryHeaderElement(node: unknown): node is CategoryHeaderElement {
  return React.isValidElement(node) && node.type === SelectSearchableOptionCategoryHeader;
}

function isDividerElement(node: unknown): node is DividerElement {
  return React.isValidElement(node) && node.type === SelectSearchableOptionDivider;
}

type RowType = 'option' | 'header' | 'divider';
type ParsedRow = {
  type: RowType;
  index: number;
  element: OptionListChild;
  domId?: string;
  label?: string;
  value?: string;
  disabled?: boolean;
};

export function SelectSearchableOptionList({ children, ...userProps }: SelectSearchableOptionListProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId) ?? 'cs-listbox';
  const multiple = useSelectSearchableStore(store, (s) => s.multiple);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const activeDescendantId = useSelectSearchableStore(store, (s) => s.activeDescendantId);
  const optionListEl = useSelectSearchableStore(store, (s) => s.optionListEl);
  const visibleIds = useSelectSearchableStore(store, (s) => s.visibleIds);

  const hiddenList = !open || disabled;

  const rows: ParsedRow[] = useMemo(() => {
    const arr = React.Children.toArray(children) as OptionListChild[];

    return arr.flatMap((el, index) => {
      if (isOptionElement(el)) {
        const props = el.props;
        const domId = makeDomOptionId(listboxId, props.itemId);
        const label = extractNodeText(props.children);
        return {
          type: 'option',
          index,
          element: el,
          domId,
          label,
          value: props.value,
          disabled: props.disabled,
        };
      }

      if (isCategoryHeaderElement(el)) {
        return { type: 'header', index, element: el };
      }

      if (isDividerElement(el)) {
        return { type: 'divider', index, element: el };
      }

      return [];
    });
  }, [children, listboxId]);

  const options: ParsedOption[] = useMemo(
    () =>
      rows
        .filter((row): row is ParsedRow & { type: 'option'; domId: string; label: string; value: string } => row.type === 'option')
        .map((row) => ({
          domId: row.domId,
          props: row.element.props as SelectSearchableOptionProps,
          label: row.label,
        })),
    [rows],
  );

  const hasSpecialRows = useMemo(
    () => rows.some((row) => row.type !== 'option'),
    [rows],
  );

  const renderedRows = useMemo(() => {
    if (!hasSpecialRows) {
      return rows.map((row) => row.element);
    }

    const headerHasVisibleOption = new Set<number>();

    let currentHeaderRowIndex: number | null = null;
    for (const row of rows) {
      if (row.type === 'header') {
        currentHeaderRowIndex = row.index;
        continue;
      }
      if (row.type !== 'option') continue;
      if (!row.domId || !visibleIds.has(row.domId)) continue;
      if (currentHeaderRowIndex != null) headerHasVisibleOption.add(currentHeaderRowIndex);
    }

    const provisionalVisible = new Map<number, boolean>();
    for (const row of rows) {
      if (row.type === 'option') {
        provisionalVisible.set(row.index, !!row.domId && visibleIds.has(row.domId));
      } else if (row.type === 'header') {
        provisionalVisible.set(row.index, headerHasVisibleOption.has(row.index));
      } else {
        // Divider candidates are normalized in the next step.
        provisionalVisible.set(row.index, true);
      }
    }

    const visibleRows = rows.filter((row) => provisionalVisible.get(row.index));
    const visibleIndexByRow = new Map<number, number>();
    visibleRows.forEach((row, i) => visibleIndexByRow.set(row.index, i));

    const hasVisibleNonDividerBefore = (index: number) => {
      for (const candidate of rows) {
        if (candidate.index >= index) break;
        if (!provisionalVisible.get(candidate.index)) continue;
        if (candidate.type === 'divider') continue;
        return true;
      }
      return false;
    };

    return rows.map((row, rowPosition) => {
      if (row.type === 'option') return row.element;

      if (row.type === 'header') {
        return provisionalVisible.get(row.index) ? row.element : null;
      }

      if (visibleRows[0]?.index === row.index) return null;

      // Structural rule: a divider directly before a header follows that header's visibility.
      const nextAuthored = rows[rowPosition + 1];
      const prevAuthored = rows[rowPosition - 1];
      if (nextAuthored?.type === 'header') {
        if (prevAuthored?.type !== 'option') return null;
        if (!hasVisibleNonDividerBefore(row.index)) return null;
        return provisionalVisible.get(nextAuthored.index) ? row.element : null;
      }

      const visiblePosition = visibleIndexByRow.get(row.index);
      if (visiblePosition == null) return null;

      const prev = visibleRows[visiblePosition - 1];
      const next = visibleRows[visiblePosition + 1];
      const keepDivider = prev?.type === 'option' && next?.type === 'option';
      return keepDivider ? row.element : null;
    });
  }, [rows, visibleIds, hasSpecialRows]);

  // Batch register all selectable options (order + labels + disabled metadata).
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
      {renderedRows}
    </ul>
  );
}
