import { unicodeToBase64 } from './unicodeToBase64';

export function makeDomOptionId(listboxId: string, rowId: string) {
  return `${listboxId}--${unicodeToBase64(rowId)}`;
}
