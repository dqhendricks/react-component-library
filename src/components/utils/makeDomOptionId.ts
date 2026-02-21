import { unicodeToBase64 } from './unicodeToBase64';

export function makeDomOptionId(listboxId: string, itemId: string) {
  return `${listboxId}--${unicodeToBase64(itemId)}`;
}
