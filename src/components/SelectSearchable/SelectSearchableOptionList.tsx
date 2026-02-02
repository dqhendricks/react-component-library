import React from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";
import { mergeProps } from "./mergeProps";

type UlProps = React.ComponentPropsWithoutRef<"ul">;

export type SelectSearchableOptionListProps = React.PropsWithChildren<
  Omit<
    UlProps,
    "id" | "role" | "ref" | "aria-hidden" | "aria-multiselectable"
  >
>;

export function SelectSearchableOptionList({
  children,
  ...userProps
}: SelectSearchableOptionListProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId);
  const multiple = useSelectSearchableStore(store, (s) => s.multiple);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);

  const hidden = !open || disabled;

  const ourProps: UlProps = {
    id: listboxId,
    role: "listbox",
    "aria-hidden": hidden || undefined,
    "aria-multiselectable": multiple || undefined,
    className: styles.optionList,
  };

  const merged = mergeProps(userProps, ourProps);

  return (
    <ul
      {...merged}
      ref={store.setOptionListEl}
      // Consumer styling hooks
      data-part='list'
    >
      {children}
    </ul>
  );
}
