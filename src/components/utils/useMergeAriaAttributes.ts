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

  const ariaLabelMerged = mergeAriaList([ariaLabelRoot, ariaLabelProp]);

  const ariaLabelledByMerged = mergeAriaList([
    ariaLabelledBySubComponent,
    ariaLabelledByRoot,
    ariaLabelledByProp,
  ]);

  const ariaDescriptionMerged = mergeAriaList([ariaDescriptionRoot, ariaDescriptionProp]);

  const ariaDescribedByMerged = mergeAriaList([
    ariaDescribedByRoot,
    ariaDescribedByProp,
    ariaInvalidBool && ariaErrorMessageRoot,
    ariaInvalidBool && ariaErrorMessageProp,
  ]);

  return {
    ariaLabelMerged,
    ariaLabelledByMerged,
    ariaDescriptionMerged,
    ariaDescribedByMerged,
  };
}