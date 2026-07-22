import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

/**
 * Tabs
 * Implements the W3C ARIA APG "Tabs" pattern (automatic activation):
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * Requirements covered:
 * - Container: role="tablist" with an accessible name
 * - Each tab: role="tab", aria-selected, aria-controls -> panel id, id
 * - Each panel: role="tabpanel", aria-labelledby -> tab id, tabIndex=0
 * - Roving tabindex: only the selected tab is in the Tab sequence (tabIndex 0),
 *   all others are -1. Tab moves focus in/out of the whole tablist as one stop.
 * - ArrowLeft/ArrowRight move focus between tabs and wrap around; the newly
 *   focused tab is activated immediately (automatic activation model).
 * - Home/End jump to the first/last tab.
 */

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  label: string;
  items: TabItem[];
  defaultSelectedIndex?: number;
  onChange?: (index: number) => void;
}

export function Tabs({
  label,
  items,
  defaultSelectedIndex = 0,
  onChange,
}: TabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (items.length === 0) return 0;
    const safeIndex = Math.min(Math.max(defaultSelectedIndex, 0), items.length - 1);
    return items[safeIndex]?.disabled ? 0 : safeIndex;
  });
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (items.length === 0) return;

    const hasSelectedItem = !items[selectedIndex]?.disabled;
    if (!hasSelectedItem) {
      const fallbackIndex = items.findIndex((item) => !item.disabled);
      if (fallbackIndex >= 0) {
        setSelectedIndex(fallbackIndex);
      }
    }
  }, [items, selectedIndex]);

  const findNextEnabledIndex = (startIndex: number, direction: 1 | -1) => {
    if (items.length === 0) return -1;

    let nextIndex = startIndex;
    for (let step = 0; step < items.length; step += 1) {
      nextIndex = (nextIndex + direction + items.length) % items.length;
      if (!items[nextIndex]?.disabled) {
        return nextIndex;
      }
    }

    return -1;
  };

  const focusAndSelect = (currentIndex: number, direction: 1 | -1) => {
    if (items.length === 0) return;

    const nextIndex = findNextEnabledIndex(currentIndex + direction, direction);
    if (nextIndex === -1) return;

    setSelectedIndex(nextIndex);
    onChange?.(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = Number(event.currentTarget.dataset.index);
    if (Number.isNaN(currentIndex)) return;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusAndSelect(currentIndex, 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusAndSelect(currentIndex, -1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0, 1);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(items.length - 1, -1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} aria-orientation="horizontal" className="tabs-list">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${item.id}`}
              aria-disabled={item.disabled || undefined}
              data-index={index}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                setSelectedIndex(index);
                onChange?.(index);
              }}
              onKeyDown={handleKeyDown}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={index !== selectedIndex}
          tabIndex={0}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
