import React from 'react';

type LiProps = React.ComponentPropsWithoutRef<'li'>;

export type SelectSearchableOptionProps = React.PropsWithChildren<
  Omit<
    LiProps,
    | 'id'
    | 'role'
    | 'aria-selected'
    | 'aria-disabled'
    | 'aria-hidden'
    | 'hidden'
    | 'ref'
  > & {
    itemId: string; // used to uniquely identify this option within the SelectSearchable context
    value: string;
    disabled?: boolean;
  }
>;

/**
 * Data-only marker.
 * OptionList reads these props and renders the actual <li>.
 */
export const SelectSearchableOption = React.memo(function SelectSearchableOption(
  _props: SelectSearchableOptionProps,
) {
  return null;
});