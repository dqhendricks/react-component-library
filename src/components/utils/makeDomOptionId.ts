import { unicodeToBase64 } from './unicodeToBase64';

export function makeDomOptionId(listboxId: string, value: string) {
  return `${listboxId}--${unicodeToBase64(value)}`;
}
