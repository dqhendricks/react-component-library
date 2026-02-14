import * as React from 'react';
import { mergeAriaList } from './mergeAriaList';

type AriaInvalid = React.AriaAttributes['aria-invalid'];

function ariaInvalidToBool(value: AriaInvalid): boolean {
  return value === true || value === 'true' || value === 'grammar' || value === 'spelling';
}

export type MergeAriaAttributesArgs = {
  ariaInvalid?: AriaInvalid;
  ariaLabelProp?: string;
  ariaLabelRoot?: string;
  ariaDescriptionProp?: string;
  ariaDescriptionRoot?: string;
  ariaLabelledByProp?: string;
  ariaLabelledByRoot?: string;
  ariaLabelledBySubComponent?: string;
  ariaDescribedByProp?: string;
  ariaDescribedByRoot?: string;
  ariaErrorMessageProp?: string;
  ariaErrorMessageRoot?: string;
};

export function useMergeAriaAttributes({
  ariaInvalid,
  ariaLabelProp,
  ariaLabelRoot,
  ariaLabelledByProp,
  ariaLabelledByRoot,
  ariaLabelledBySubComponent,
  ariaDescriptionProp,
  ariaDescriptionRoot,
  ariaDescribedByProp,
  ariaDescribedByRoot,
  ariaErrorMessageProp,
  ariaErrorMessageRoot,
}: MergeAriaAttributesArgs) {
  const ariaInvalidBool = ariaInvalidToBool(ariaInvalid);

  const ariaLabelMerged = mergeAriaList([ariaLabelProp, ariaLabelRoot]);

  const ariaLabelledByMerged = mergeAriaList([
    ariaLabelledByProp,
    ariaLabelledByRoot,
    ariaLabelledBySubComponent,
  ]);

  const ariaDescriptionMerged = mergeAriaList([ariaDescriptionProp, ariaDescriptionRoot]);

  const ariaDescribedByMerged = mergeAriaList([
    ariaDescribedByProp,
    ariaDescribedByRoot,
    ariaInvalidBool && ariaErrorMessageProp,
    ariaInvalidBool && ariaErrorMessageRoot,
  ]);

  return {
    ariaLabelMerged,
    ariaLabelledByMerged,
    ariaDescriptionMerged,
    ariaDescribedByMerged,
  };
}