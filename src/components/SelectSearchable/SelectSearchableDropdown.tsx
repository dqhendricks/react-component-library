import React, { useLayoutEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";

type Placement = "down" | "up";

type FloatingStyle = {
  top: number;
  left: number;
  minWidth: number;
  maxWidth: number;
  maxHeight: number;
  placement: Placement;
};

export function SelectSearchableDropdown({ children }: React.PropsWithChildren) {
  const store = useSelectSearchableStoreContext();

  const open = useSelectSearchableStore(store, (s) => s.open);
  const disabled = useSelectSearchableStore(store, (s) => s.disabled);
  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId);
  const triggerEl = useSelectSearchableStore(store, (s) => s.triggerEl);

  const [floating, setFloating] = useState<FloatingStyle | null>(null);

  const hidden = !open || disabled;

  const setListboxRef = useCallback(
    (el: HTMLUListElement | null) => {
      store.setListboxEl(el);
    },
    [store],
  );

  useLayoutEffect(() => {
    // Only compute position when interactive/open
    if (!open || disabled) return;
    if (!triggerEl) return;

    const compute = () => {
      const r = triggerEl.getBoundingClientRect();
      const gap = 6;
      const margin = 8;

      const spaceBelow = window.innerHeight - r.bottom - margin;
      const spaceAbove = r.top - margin;

      const placement: Placement = spaceBelow >= 160 || spaceBelow >= spaceAbove ? "down" : "up";

      const maxHeight = Math.max(80, (placement === "down" ? spaceBelow : spaceAbove) - gap);
      const top = placement === "down" ? r.bottom + gap : r.top - gap;
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

    compute();

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, disabled, triggerEl]);

  const node = useMemo(() => {
    if (!triggerEl) return null;

    // If we haven't computed floating yet (e.g., first render while closed),
    // park it offscreen but KEEP IT MOUNTED so options can register.
    const style: React.CSSProperties = floating
      ? floating.placement === "down"
        ? {
            position: "fixed",
            top: floating.top,
            left: floating.left,
            minWidth: floating.minWidth,
            maxWidth: floating.maxWidth,
            maxHeight: floating.maxHeight,
          }
        : {
            position: "fixed",
            top: floating.top,
            left: floating.left,
            minWidth: floating.minWidth,
            maxWidth: floating.maxWidth,
            maxHeight: floating.maxHeight,
            transform: "translateY(-100%)",
          }
      : {
          position: "fixed",
          top: -9999,
          left: -9999,
          maxHeight: 0,
        };

    return (
      <ul
        id={listboxId}
        ref={setListboxRef}
        role="listbox"
        aria-hidden={hidden || undefined}
        className={[
          styles.dropdown,
          floating?.placement === "up" ? styles.dropdownUp : styles.dropdownDown,
          hidden ? styles.dropdownClosed : null,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...style,
          ...(hidden ? { visibility: "hidden", pointerEvents: "none" } : {}),
        }}
      >
        {children}
      </ul>
    );
  }, [triggerEl, floating, hidden, listboxId, children, setListboxRef]);

  if (!node) return null;
  return createPortal(node, document.body);
}