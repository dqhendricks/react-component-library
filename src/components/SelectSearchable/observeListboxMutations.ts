export type ObserveListboxMutationsOptions = {
  subtree?: boolean; // default true
  attributes?: boolean; // default false
  attributeFilter?: string[];
};

/**
 * Observe structural changes (add/remove/reorder) under a listbox container.
 * NOTE: This does NOT fire for CSS visibility changes (display/visibility).
 */
export function observeListboxMutations(
  el: HTMLElement,
  onChange: () => void,
  opts: ObserveListboxMutationsOptions = {},
): () => void {
  const mo = new MutationObserver(() => onChange());

  mo.observe(el, {
    childList: true,
    subtree: opts.subtree ?? true,
    attributes: opts.attributes ?? false,
    attributeFilter: opts.attributeFilter,
  });

  return () => mo.disconnect();
}
