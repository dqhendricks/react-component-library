import type { AriaAttributes } from 'react';

export type NamingAttributes = Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'>;
export type AccessibleAttributes = NamingAttributes & Pick<AriaAttributes,
  'aria-description' | 'aria-describedby' | 'aria-errormessage' | 'aria-invalid'>;
export type FieldAccessibility = AccessibleAttributes & { errorId?: string };

export function hasAccessibleName(source: NamingAttributes): boolean {
  return !!(source['aria-labelledby']?.trim() || source['aria-label']?.trim());
}

/** Choose a whole naming source. A local label must suppress inherited labelledby. */
export function resolveAccessibleName(...sources: NamingAttributes[]): NamingAttributes {
  const source = sources.find(hasAccessibleName);
  if (source?.['aria-labelledby']?.trim()) {
    return { 'aria-labelledby': source['aria-labelledby'] };
  }
  return { 'aria-label': source?.['aria-label'] };
}

/** Preserve supplied attributes; compose only the component's automatic error reference. */
export function resolveAriaAttributes(
  field: FieldAccessibility,
  local: AccessibleAttributes,
): AccessibleAttributes {
  const invalid = field['aria-invalid'];
  const isInvalid = invalid === true || invalid === 'true' || invalid === 'grammar' || invalid === 'spelling';
  const errorMessage = isInvalid
    ? local['aria-errormessage'] ?? field['aria-errormessage']
    : undefined;
  let describedBy = local['aria-describedby'] ?? field['aria-describedby'];
  const descriptionIds: string[] = describedBy?.match(/\S+/g) ?? [];
  const errorIds: string[] = errorMessage?.match(/\S+/g) ?? [];
  // Avoid attaching the same error via both attributes; leave other duplicates alone.
  if (descriptionIds.some(id => errorIds.includes(id))) {
    describedBy = descriptionIds.filter(id => !errorIds.includes(id)).join(' ') || undefined;
  }
  if (isInvalid && field.errorId &&
      !descriptionIds.includes(field.errorId) && !errorIds.includes(field.errorId)) {
    describedBy = describedBy ? `${describedBy} ${field.errorId}` : field.errorId;
  }

  return {
    ...resolveAccessibleName(local, field),
    'aria-description': local['aria-description'] ?? field['aria-description'],
    'aria-describedby': describedBy,
    'aria-errormessage': errorMessage,
    'aria-invalid': invalid,
  };
}
