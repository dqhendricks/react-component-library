interface OptionLike {
  value: string;
  selected: boolean;
  disabled: boolean;
}

interface SelectLikeTarget {
  name: string;
  value: string;
  multiple: boolean;
  options: ReadonlyArray<OptionLike>;
  selectedOptions: ReadonlyArray<OptionLike>;
}

export interface ChangeLikeEvent<TTarget extends SelectLikeTarget = SelectLikeTarget> {
  type: 'change';
  target: TTarget;
  currentTarget: TTarget;
  preventDefault(): void;
  stopPropagation(): void;
}

export type ChangeLikeEventHandler = (e: ChangeLikeEvent) => void;

type ChangeValue = string | string[] | undefined;

function normalizeSelectedValues(value: ChangeValue, multiple: boolean): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return multiple ? value.map(String) : [String(value[0] ?? '')].filter(Boolean);
  return [String(value)];
}

export function proxyToNativeSelectChange(
  nativeElement: HTMLSelectElement | null,
  name: string | undefined,
  value: ChangeValue,
  multiple: boolean,
): ChangeLikeEvent {
  const fieldName = name ?? nativeElement?.name ?? '';

  const selectedValues = normalizeSelectedValues(value, multiple);

  const scalarValue = multiple ? '' : (selectedValues[0] ?? '');

  const selected = selectedValues.map<OptionLike>((v) => ({ value: v, selected: true, disabled: false }));

  const target: SelectLikeTarget = {
    name: fieldName,
    value: scalarValue,
    multiple,
    options: selected,
    selectedOptions: selected,
  };

  return {
    type: 'change',
    target,
    currentTarget: target,
    preventDefault() {},
    stopPropagation() {},
  };
}