import { SelectSearchableRoot } from './SelectSearchableRoot';
import { SelectSearchableLabel } from './SelectSearchableLabel';
import { SelectSearchableError } from './SelectSearchableError';
import { SelectSearchableTrigger } from './SelectSearchableTrigger';
import { SelectSearchableTriggerValue } from './SelectSearchableTriggerValue';
import { SelectSearchableDropdown } from './SelectSearchableDropdown';
import { SelectSearchableSearch } from './SelectSearchableSearch';
import { SelectSearchableOptionList } from './SelectSearchableOptionList';
import { SelectSearchableOption } from './SelectSearchableOption';

export type { SelectSearchableValue } from './SelectSearchableStoreContext';

export const SelectSearchable = {
    Root: SelectSearchableRoot,
    Label: SelectSearchableLabel,
    Error: SelectSearchableError,
    Trigger: SelectSearchableTrigger,
    TriggerValue: SelectSearchableTriggerValue,
    Dropdown: SelectSearchableDropdown,
    Search: SelectSearchableSearch,
    OptionList: SelectSearchableOptionList,
    Option: SelectSearchableOption,
};