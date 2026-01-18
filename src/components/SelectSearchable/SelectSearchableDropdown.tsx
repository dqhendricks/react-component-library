import React, { useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./SelectSearchable.module.css";
import { useSelectSearchableContext } from "./SelectSearchableContext";

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
  const { open, disabled, listboxId, triggerEl, setListboxEl } = useSelectSearchableContext();
  const [floating, setFloating] = useState<FloatingStyle | null>(null);
  const hidden = !open || disabled;

  useLayoutEffect(() => {
    if (!open || disabled) return;
    if (!triggerEl) return;

    const compute = () => {
      const r = triggerEl.getBoundingClientRect();
      const gap = 6;
      const margin = 8;

      const spaceBelow = window.innerHeight - r.bottom - margin;
      const spaceAbove = r.top - margin;

      const placement: Placement =
        spaceBelow >= 160 || spaceBelow >= spaceAbove ? "down" : "up";

      const maxHeight = Math.max(
        80,
        (placement === "down" ? spaceBelow : spaceAbove) - gap,
      );

      const top = placement === "down" ? r.bottom + gap : r.top - gap;

      const maxWidth = window.innerWidth - margin * 2;

      // Clamp left so dropdown stays within viewport margins.
      // Also ensure there's room for at least minWidth.
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
    if (!floating) return null;

    const style: React.CSSProperties =
      floating.placement === "down"
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
          };

    return (
      <ul
        id={listboxId}
        ref={setListboxEl}
        role="listbox"
        aria-hidden={hidden || undefined}
        className={[
          styles.dropdown,
          floating.placement === "up" ? styles.dropdownUp : styles.dropdownDown,
          hidden ? styles.dropdownClosed : null,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {children}
      </ul>
    );
  }, [open, disabled, triggerEl, floating, listboxId, children]);

  if (!node) return null;
  return createPortal(node, document.body);
}