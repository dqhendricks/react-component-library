export function mergeAriaList(refList: (string | false | undefined)[], delimiter = ' ') {
  return Array.from(
    new Set(refList.filter(Boolean))
  ).join(delimiter) || undefined;
}