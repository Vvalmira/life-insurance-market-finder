"use client";

import { Check, ChevronDown } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

const SORT_OPTIONS = [
  ["rank", "National rank"],
  ["score", "Opportunity score"],
  ["population", "Residents 60+"],
  ["concentration", "60+ share"],
  ["financialCapacity", "Financial capacity"],
  ["name", "Area name"],
] as const;

interface SortMenuProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    SORT_OPTIONS.findIndex(([optionValue]) => optionValue === value),
  );
  const selectedLabel = SORT_OPTIONS[selectedIndex]?.[1] ?? "National rank";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function focusOption(index: number) {
    const normalizedIndex = (index + SORT_OPTIONS.length) % SORT_OPTIONS.length;
    optionRefs.current[normalizedIndex]?.focus();
  }

  function openAndFocusSelected() {
    setOpen(true);
    window.requestAnimationFrame(() => focusOption(selectedIndex));
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openAndFocusSelected();
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(SORT_OPTIONS.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      className="sort-menu"
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        className="sort-menu-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="sort-options"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>Sort by</span>
        <strong>{selectedLabel}</strong>
        <ChevronDown aria-hidden="true" size={15} />
      </button>

      {open && (
        <div
          className="sort-menu-options"
          id="sort-options"
          role="listbox"
          aria-label="Sort rankings"
        >
          {SORT_OPTIONS.map(([optionValue, label], index) => (
            <button
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              className={optionValue === value ? "selected" : ""}
              key={optionValue}
              type="button"
              role="option"
              aria-selected={optionValue === value}
              onClick={() => selectOption(optionValue)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              <span>{label}</span>
              {optionValue === value && <Check aria-hidden="true" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
