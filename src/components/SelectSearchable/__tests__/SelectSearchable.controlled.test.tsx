import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SelectSearchable } from '..';

describe('SelectSearchable (control mode)', () => {
  it('warns once per mode transition, including under StrictMode', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const root = (value: string | undefined) => (
        <StrictMode>
          <SelectSearchable.Root value={value} />
        </StrictMode>
      );
      const { rerender } = render(root(undefined));
      expect(warning).not.toHaveBeenCalled();

      rerender(root('alice'));
      expect(warning).toHaveBeenCalledTimes(1);
      expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('from uncontrolled to controlled'));

      rerender(root(''));
      expect(warning).toHaveBeenCalledTimes(1);

      rerender(root(undefined));
      expect(warning).toHaveBeenCalledTimes(2);
      expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('from controlled to uncontrolled'));

      rerender(root(undefined));
      expect(warning).toHaveBeenCalledTimes(2);
    } finally {
      warning.mockRestore();
    }
  });
});
