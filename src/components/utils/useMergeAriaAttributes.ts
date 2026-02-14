import { mergeAriaList } from './mergeAriaList';

export type MergeAriaAttributesArgs = {
  ariaInvalidBool: boolean;
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
  ariaInvalidBool,
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