import React, { useCallback } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';

export type SelectSearchableErrorProps = Omit<
  React.ComponentPropsWithoutRef<'p'>,
  'id'
> & {
  hideWhenValid?: boolean;
};

export function SelectSearchableError({
  children,
  hideWhenValid,
  ...rest
}: SelectSearchableErrorProps) {
  const store = useSelectSearchableStoreContext();

  const errorId = useSelectSearchableStore(store, (s) => s.errorId);
  const ariaInvalidBool = useSelectSearchableStore(store, (s) => s.ariaInvalidBool);

  // Register the actual DOM element, including hideWhenValid transitions.
  const errorRef = useCallback((el: HTMLParagraphElement | null) => {
    store.setHasError(el !== null);
  }, [store]);

  if (hideWhenValid && !ariaInvalidBool) return null;

  const ourErrorProps: React.ComponentPropsWithoutRef<'p'> = {
    className: styles.error,
  };

  const merged = mergeProps(rest, ourErrorProps);

  return (
    <p
      {...merged}
      ref={errorRef}
      id={errorId}
      data-part="error"
      data-invalid={ariaInvalidBool ? 'true' : undefined}
    >
      {children}
    </p>
  );
}
