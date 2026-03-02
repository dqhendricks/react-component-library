import React, { useLayoutEffect, useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableOptionRecord,
  type SelectSearchableHeaderRecord,
  type SelectSearchableDividerRecord,
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

function isOptionElement(node: unknown): node is OptionElement {
  return React.isValidElement(node) && node.type === SelectSearchableOption;
}

function isCategoryHeaderElement(node: unknown): node is CategoryHeaderElement {
  return React.isValidElement(node) && node.type === SelectSearchableOptionCategoryHeader;
}

function isDividerElement(node: unknown): node is DividerElement {
  return React.isValidElement(node) && node.type === SelectSearchableOptionDivider;
}

type ParsedRow =
  | {
      type: 'option';
      index: number;
      rowId: string;
      domId: string;
      value: string;
      label: string;
      disabled?: boolean;
    }
  | {
      type: 'header';
      index: number;
      rowId: string;
    }
  | {
      type: 'divider';
      index: number;
      rowId: string;
    };

function assertUniqueRowId(
  rowType: 'Option' | 'OptionCategoryHeader' | 'OptionDivider',
  rowId: string | undefined,
  seenRowIds: Set<string>,
) {
  if (!rowId) {
    throw new Error(`SelectSearchable.${rowType} requires a unique rowId prop.`);
  }

  if (seenRowIds.has(rowId)) {
    throw new Error(
      `SelectSearchable rowId "${rowId}" is duplicated within the same OptionList. rowId values must be unique.`,
    );
  }

  seenRowIds.add(rowId);
}

export function SelectSearchableOptionList({ children, ...userProps }: SelectSearchableOptionListProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId) ?? 'cs-listbox';
  const multiple = useSelectSearchableStore(store, (s) => s.multiple);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const activeDescendantId = useSelectSearchableStore(store, (s) => s.activeDescendantId);
  const optionListEl = useSelectSearchableStore(store, (s) => s.optionListEl);

  const hiddenList = !open || disabled;

  const collection = useMemo(() => {
    const arr = React.Children.toArray(children) as OptionListChild[];
    const rows: ParsedRow[] = [];
    const seenRowIds = new Set<string>();
    const options: SelectSearchableOptionRecord[] = [];
    let hasNonOptionRows = false;

    for (const [index, el] of arr.entries()) {
      if (isOptionElement(el)) {
        const props = el.props;
        assertUniqueRowId('Option', props.rowId, seenRowIds);

        const domId = makeDomOptionId(listboxId, props.rowId);
        const label = extractNodeText(props.children);
        options.push({
          id: domId,
          value: props.value,
          label,
          disabled: props.disabled,
        });
        rows.push({
          type: 'option',
          index,
          rowId: props.rowId,
          domId,
          label,
          value: props.value,
          disabled: props.disabled,
        });
        continue;
      }

      if (isCategoryHeaderElement(el)) {
        const props = (el as CategoryHeaderElement).props;
        assertUniqueRowId('OptionCategoryHeader', props.rowId, seenRowIds);
        hasNonOptionRows = true;
        rows.push({ type: 'header', index, rowId: props.rowId });
        continue;
      }

      if (isDividerElement(el)) {
        const props = (el as DividerElement).props;
        assertUniqueRowId('OptionDivider', props.rowId, seenRowIds);
        hasNonOptionRows = true;
        rows.push({ type: 'divider', index, rowId: props.rowId });
        continue;
      }
    }

    const headers: SelectSearchableHeaderRecord[] = [];
    const dividers: SelectSearchableDividerRecord[] = [];

    if (!hasNonOptionRows) {
      return { options, headers, dividers };
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row.type === 'header') {
        const optionIds: string[] = [];
        for (let j = i + 1; j < rows.length; j++) {
          const candidate = rows[j];
          if (candidate.type === 'header') break;
          if (candidate.type === 'option') optionIds.push(candidate.domId);
        }
        headers.push({ rowId: row.rowId, optionIds });
        continue;
      }

      if (row.type === 'divider') {
        const beforeOptionIds: string[] = [];
        for (let j = i - 1; j >= 0; j--) {
          const candidate = rows[j];
          if (candidate.type !== 'option') break;
          beforeOptionIds.unshift(candidate.domId);
        }

        const afterOptionIds: string[] = [];
        for (let j = i + 1; j < rows.length; j++) {
          const candidate = rows[j];
          if (candidate.type !== 'option') break;
          afterOptionIds.push(candidate.domId);
        }

        const nextAuthored = rows[i + 1];
        dividers.push({
          rowId: row.rowId,
          beforeOptionIds,
          afterOptionIds,
          nextHeaderRowId: nextAuthored?.type === 'header' ? nextAuthored.rowId : undefined,
        });
      }
    }

    return { options, headers, dividers };
  }, [children, listboxId]);

  // Register selectable rows and structural metadata in one store update.
  useLayoutEffect(() => {
    return store.registerCollection(collection);
  }, [store, collection]);

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
