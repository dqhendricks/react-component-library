import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableOptionRecord,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';
import { extractNodeText } from '../utils/extractNodeText';
import {
  SelectSearchableOption,
  type SelectSearchableOptionProps,
  type SelectSearchableOptionInternalProps,
} from './SelectSearchableOption';
import { makeDomOptionId } from '../utils/makeDomOptionId';

type UlProps = React.ComponentPropsWithoutRef<'ul'>;

type OptionElement = React.ReactElement<
  SelectSearchableOptionProps & SelectSearchableOptionInternalProps
>;

export type SelectSearchableOptionListProps = Omit<
  UlProps,
  'id' | 'role' | 'ref' | 'aria-hidden' | 'aria-multiselectable' | 'children'
> & {
  children: OptionElement | OptionElement[];
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

export function SelectSearchableOptionList({ children, ...userProps }: SelectSearchableOptionListProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId) ?? 'cs-listbox';
  const multiple = useSelectSearchableStore(store, (s) => s.multiple);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);

  const hiddenList = !open || disabled;

  const collection = useMemo(() => {
    const seenValues = new Set<string>();
    const duplicateValues = new Set<string>();
    const options: SelectSearchableOptionRecord[] = [];
    const renderedChildren: React.ReactNode[] = [];

    React.Children.forEach(children as React.ReactNode, (child) => {
      if (isOptionElement(child)) {
        const { value, disabled: optionDisabled, children: optionChildren } = child.props;
        // Deduplicate before searching or registering options.
        if (seenValues.has(value)) {
          duplicateValues.add(value);
          return;
        }
        seenValues.add(value);
        const domId = makeDomOptionId(listboxId, value);
        const label = extractNodeText(optionChildren);

        options.push({
          id: domId,
          value,
          label,
          disabled: optionDisabled,
        });

        renderedChildren.push(
          React.cloneElement(child, {
            key: `option:${child.key ?? value}`,
            __internalDomId: domId,
          }),
        );
      }
    });

    return { options, renderedChildren, duplicateValues };
  }, [children, listboxId]);

  // Warn once per duplicate value per mounted list, including under StrictMode.
  const warnedValues = useRef(new Set<string>());
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    for (const value of collection.duplicateValues) {
      if (warnedValues.current.has(value)) continue;
      warnedValues.current.add(value);
      console.warn(
        `SelectSearchable.OptionList: duplicate option value ${JSON.stringify(value)}. The first option wins; additional options with this value are ignored.`,
      );
    }
  }, [collection]);

  // Register options in one store update.
  useLayoutEffect(() => {
    store.registerCollection(collection);
  }, [store, collection]);

  // Preserve navigation during collection updates; clear only on unmount.
  useLayoutEffect(() => store.clearCollection, [store]);

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
