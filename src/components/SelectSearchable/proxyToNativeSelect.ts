export interface FocusLikeEvent<T extends HTMLElement = HTMLElement> {
  type: 'focus' | 'blur';
  target: T | EventTarget | null;
  currentTarget: T | EventTarget | null;
  relatedTarget: EventTarget | null;
  preventDefault(): void;
  stopPropagation(): void;
}

export function proxyToNativeSelect(
  e: FocusEvent,
  nativeElement: HTMLSelectElement | null,
  type: 'focus' | 'blur'
): FocusLikeEvent {
  return {
    type,
    target: nativeElement ?? e.target,
    currentTarget: nativeElement ?? e.currentTarget,
    relatedTarget: e.relatedTarget ?? null,
    preventDefault() {},
    stopPropagation() {},
  };
}