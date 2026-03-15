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
import {
  SelectSearchableOption,
  type SelectSearchableOptionProps,
  type SelectSearchableOptionInternalProps,
} from './SelectSearchableOption';
import {
  SelectSearchableOptionCategoryHeader,
  type SelectSearchableOptionCategoryHeaderProps,
  type SelectSearchableOptionCategoryHeaderInternalProps,
} from './SelectSearchableOptionCategoryHeader';
import {
  SelectSearchableOptionDivider,
  type SelectSearchableOptionDividerProps,
  type SelectSearchableOptionDividerInternalProps,
} from './SelectSearchableOptionDivider';
import { makeDomOptionId } from '../utils/makeDomOptionId';

type UlProps = React.ComponentPropsWithoutRef<'ul'>;

type OptionElement = React.ReactElement<
  SelectSearchableOptionProps & SelectSearchableOptionInternalProps
>;
type CategoryHeaderElement = React.ReactElement<
  SelectSearchableOptionCategoryHeaderProps &
  SelectSearchableOptionCategoryHeaderInternalProps
>;
type DividerElement = React.ReactElement<
  SelectSearchableOptionDividerProps &
  SelectSearchableOptionDividerInternalProps
>;
type OptionListChild = OptionElement | CategoryHeaderElement | DividerElement;
type OptionListChildren = OptionListChild | OptionListChild[];

export type SelectSearchableOptionListProps = Omit<
  UlProps,
  'id' | 'role' | 'ref' | 'aria-hidden' | 'aria-multiselectable' | 'children'
> & {
  children: OptionListChildren;
};

function ActiveOptionAutoScroll() {
  const store = useSelectSearchableStoreContext();
  const activeDescendantId = useSelectSearchableStore(store, (s) => s.activeDescendantId);
  const optionListEl = useSelectSearchableStore(store, (s) => s.optionListEl);

  useLayoutEffect(() => {
    if (!activeDescendantId || !optionListEl) return;

    const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(activeDescendantId)
      : activeDescendantId;

    const node = optionListEl.querySelector<HTMLElement>(`[data-option-id="${escapedId}"]`);
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [activeDescendantId, optionListEl]);

  return null;
}

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
      rowId: string;
      domId: string;
    }
  | {
      type: 'header';
      rowId: string;
    }
  | {
      type: 'divider';
      rowId: string;
    };

function assertUniqueStructuralRowId(rowId: string, seenRowIds: Set<string>) {
  if (seenRowIds.has(rowId)) {
    throw new Error(
      `SelectSearchable rowId "${rowId}" is duplicated within the same OptionList. rowId values must be unique.`,
    );
  }

  seenRowIds.add(rowId);
}

function assertNoDuplicateValueForKeylessOption(
  value: string,
  seenValuesForKeylessOptions: Set<string>,
) {
  if (seenValuesForKeylessOptions.has(value)) {
    throw new Error(
      `SelectSearchable.Option value "${value}" is duplicated for keyless options. Provide a unique, stable React key for duplicate values.`,
    );
  }

  seenValuesForKeylessOptions.add(value);
}

function resolveOptionIdentity(
  option: OptionElement,
  listboxId: string,
  seenValuesForKeylessOptions: Set<string>,
) {
  const key = option.key == null ? undefined : String(option.key);

  if (!key) {
    assertNoDuplicateValueForKeylessOption(option.props.value, seenValuesForKeylessOptions);
  }

  const rowId = key ? `key:${key}` : `value:${option.props.value}`;
  const domId = makeDomOptionId(listboxId, rowId);

  return { rowId, domId };
}

function resolveStructuralRowId(
  rowType: 'header' | 'divider',
  element: CategoryHeaderElement | DividerElement,
  structuralIndex: number,
  seenRowIds: Set<string>,
) {
  const key = element.key == null ? undefined : String(element.key);
  const rowId = key
    ? `${rowType}-key:${key}`
    : `${rowType}-index:${structuralIndex}`;

  assertUniqueStructuralRowId(rowId, seenRowIds);
  return rowId;
}

function cloneStructuralChild<T extends CategoryHeaderElement | DividerElement>(
  child: T,
  rowId: string,
) {
  return React.cloneElement(child, {
    key: rowId,
    __internalRowId: rowId,
  });
}

export function SelectSearchableOptionList({ children, ...userProps }: SelectSearchableOptionListProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId) ?? 'cs-listbox';
  const multiple = useSelectSearchableStore(store, (s) => s.multiple);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);

  const hiddenList = !open || disabled;

  const collection = useMemo(() => {
    const rows: ParsedRow[] = [];
    const seenStructuralRowIds = new Set<string>();
    const seenValuesForKeylessOptions = new Set<string>();
    const options: SelectSearchableOptionRecord[] = [];
    const renderedChildren: React.ReactNode[] = [];
    let hasNonOptionRows = false;
    let structuralIndex = 0;

    React.Children.forEach(children as React.ReactNode, (child) => {
      if (isOptionElement(child)) {
        const { rowId, domId } = resolveOptionIdentity(child, listboxId, seenValuesForKeylessOptions);
        const { value, disabled: optionDisabled, children: optionChildren } = child.props;
        const label = extractNodeText(optionChildren);

        options.push({
          id: domId,
          value,
          label,
          disabled: optionDisabled,
        });

        rows.push({
          type: 'option',
          rowId,
          domId,
        });

        renderedChildren.push(
          React.cloneElement(child, {
            key: rowId,
            __internalDomId: domId,
          }),
        );
        return;
      }

      if (isCategoryHeaderElement(child)) {
        const rowId = resolveStructuralRowId('header', child, structuralIndex, seenStructuralRowIds);
        structuralIndex += 1;
        hasNonOptionRows = true;
        rows.push({ type: 'header', rowId });
        renderedChildren.push(cloneStructuralChild(child, rowId));
        return;
      }

      if (isDividerElement(child)) {
        const rowId = resolveStructuralRowId('divider', child, structuralIndex, seenStructuralRowIds);
        structuralIndex += 1;
        hasNonOptionRows = true;
        rows.push({ type: 'divider', rowId });
        renderedChildren.push(cloneStructuralChild(child, rowId));
        return;
      }
    });

    const headers: SelectSearchableHeaderRecord[] = [];
    const dividers: SelectSearchableDividerRecord[] = [];

    if (!hasNonOptionRows) {
      return { options, headers, dividers, renderedChildren };
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

    return { options, headers, dividers, renderedChildren };
  }, [children, listboxId]);

  // Register selectable rows and structural metadata in one store update.
  useLayoutEffect(() => {
    return store.registerCollection(collection);
  }, [store, collection]);

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
      <ActiveOptionAutoScroll />
      {collection.renderedChildren}
    </ul>
  );
}
