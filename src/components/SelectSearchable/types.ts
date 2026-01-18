export type SelectSearchableOptionRecord = {
  id: string; // stable DOM id for aria-activedescendant, etc.
  value: string;
  label: string; // display / typeahead string
  disabled?: boolean;
};