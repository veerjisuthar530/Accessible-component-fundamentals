import {
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
}

interface TabsProps {
  label: string;
  items: TabItem[];
}

export function Tabs({ label, items }: TabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAndSelect = (index: number) => {
    const nextIndex = (index + items.length) % items.length;
    setSelectedIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusAndSelect(selectedIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusAndSelect(selectedIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(items.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tabs-list">
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
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedIndex(index)}
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
