import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';

type Placement = 'down' | 'up';

type FloatingStyle = {
  top: number;
  left: number;
  minWidth: number;
  maxWidth: number;
  maxHeight: number;
  placement: Placement;
};

type DivProps = React.ComponentPropsWithoutRef<'div'>;

export type SelectSearchableDropdownProps = React.PropsWithChildren<
  Omit<DivProps, 'ref'>
> & {
  maxHeightWithClamp?: number; // Max height, in pixels, and clamped to viewport.
  gap?: number; // Gap between dropdown and trigger element in px.
};

export function SelectSearchableDropdown({
  maxHeightWithClamp = 280,
  gap = 6,
  children,
  ...userProps
}: SelectSearchableDropdownProps) {
  const store = useSelectSearchableStoreContext();

  const controlId = useSelectSearchableStore(store, (s) => s.controlId);
  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const triggerEl = useSelectSearchableStore(store, (s) => s.triggerEl);

  const [floating, setFloating] = useState<FloatingStyle | null>(null);

  const hidden = !open || disabled;

  useLayoutEffect(() => {
    if (!open || disabled) return;
    if (!triggerEl) return;

    const compute = () => {
      const r = triggerEl.getBoundingClientRect();
      const margin = 8;

      const spaceBelow = window.innerHeight - r.bottom - margin;
      const spaceAbove = r.top - margin;

      const placement: Placement =
        spaceBelow >= 160 || spaceBelow >= spaceAbove ? 'down' : 'up';

      const viewportMaxHeight = Math.max(
        80,
        (placement === 'down' ? spaceBelow : spaceAbove) - gap,
      );

      // Default, clamped by viewport
      const maxHeight = Math.min(maxHeightWithClamp, viewportMaxHeight);

      const top = placement === 'down' ? r.bottom + gap : r.top - gap;
      const maxWidth = window.innerWidth - margin * 2;

      const minWidth = Math.round(r.width);
      const left = Math.round(
        Math.min(
          Math.max(margin, r.left),
          window.innerWidth - margin - Math.min(minWidth, maxWidth),
        ),
      );

      setFloating({
        top: Math.round(top),
        left,
        minWidth,
        maxWidth,
        maxHeight,
        placement,
      });
    };

    // Compute on open
    compute();

    // Recompute on resize
    window.addEventListener('resize', compute);

    // Close on scroll
    const onScrollCapture = (ev: Event) => {
      const t = ev.target as Node | null;
      if (!t) return;

      const { dropdownEl, nativeSelectEl } = store.getSnapshot();

      // If the scroll originated from inside the dropdown itself, keep it open.
      if (dropdownEl?.contains(t)) return;
      // Hidden select sometimes scrolls, ignore this as well
      if (nativeSelectEl?.contains(t)) return;

      console.log('close on scroll', t);
      store.setOpen(false);
      triggerEl?.focus();
    };

    window.addEventListener('scroll', onScrollCapture, true);

    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', onScrollCapture, true);
    };
  }, [open, disabled, triggerEl, maxHeightWithClamp, gap, store]);

  if (!triggerEl) return null;

  // Keep mounted even before we've computed position (so options can register)
  const baseStyle: React.CSSProperties = floating
    ? floating.placement === 'down'
      ? {
          position: 'fixed',
          top: floating.top,
          left: floating.left,
          minWidth: floating.minWidth,
          maxWidth: floating.maxWidth,
          maxHeight: floating.maxHeight,
        }
      : {
          position: 'fixed',
          top: floating.top,
          left: floating.left,
          minWidth: floating.minWidth,
          maxWidth: floating.maxWidth,
          maxHeight: floating.maxHeight,
          transform: 'translateY(-100%)',
        }
    : {
        position: 'fixed',
        top: -9999,
        left: -9999,
        maxHeight: 0,
      };

  const ourProps: DivProps = {
    className: [
      styles.dropdown,
      hidden ? styles.dropdownClosed : null,
    ]
      .filter(Boolean)
      .join(' '),
    style: baseStyle,
  };

  const merged = mergeProps(userProps, ourProps);

  return createPortal(
    <div
      {...merged}
      ref={store.setDropdownEl}
      // Consumer styling hooks
      data-part='dropdown'
      data-owner={controlId}
      data-state={hidden ? 'closed' : 'open'}
      data-placement={floating?.placement ?? 'down'}
    >
      {children}
    </div>,
    document.body,
  );
}