export function mergeAriaList(
  refList: Array<string | false | undefined>,
): string | undefined {
  const tokens = refList
    .filter((v): v is string => typeof v === 'string')
    .flatMap(v => v.split(/\s+/))
    .map(t => t.trim())
    .filter(Boolean);

  const merged = Array.from(new Set(tokens)).join(' ');
  return merged || undefined;
}