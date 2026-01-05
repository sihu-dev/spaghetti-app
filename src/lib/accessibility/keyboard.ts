/**
 * Keyboard Navigation and Accessibility Utilities
 */

import { useEffect, useCallback, useRef } from "react";

/**
 * Common keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  SAVE: { key: "s", modifiers: ["ctrl"] },
  UNDO: { key: "z", modifiers: ["ctrl"] },
  REDO: { key: "z", modifiers: ["ctrl", "shift"] },
  REDO_ALT: { key: "y", modifiers: ["ctrl"] },
  EXPORT: { key: "e", modifiers: ["ctrl"] },
  ESCAPE: { key: "Escape", modifiers: [] },
  ENTER: { key: "Enter", modifiers: [] },
  TAB: { key: "Tab", modifiers: [] },
  ARROW_UP: { key: "ArrowUp", modifiers: [] },
  ARROW_DOWN: { key: "ArrowDown", modifiers: [] },
  ARROW_LEFT: { key: "ArrowLeft", modifiers: [] },
  ARROW_RIGHT: { key: "ArrowRight", modifiers: [] },
} as const;

interface ShortcutHandler {
  key: string;
  modifiers?: ("ctrl" | "shift" | "alt" | "meta")[];
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook for registering keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const modifiers = shortcut.modifiers || [];

        const ctrlMatch =
          modifiers.includes("ctrl") === (e.ctrlKey || e.metaKey);
        const shiftMatch = modifiers.includes("shift") === e.shiftKey;
        const altMatch = modifiers.includes("alt") === e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook for focus trap within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for arrow key navigation in a list
 */
export function useArrowNavigation<T extends HTMLElement>(
  itemsLength: number,
  options?: {
    loop?: boolean;
    orientation?: "horizontal" | "vertical" | "both";
    onSelect?: (index: number) => void;
  },
) {
  const containerRef = useRef<T>(null);
  const currentIndexRef = useRef(0);

  const { loop = true, orientation = "both", onSelect } = options || {};

  const navigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      let newIndex = currentIndexRef.current;

      if (
        (orientation === "vertical" || orientation === "both") &&
        (direction === "up" || direction === "down")
      ) {
        newIndex += direction === "down" ? 1 : -1;
      }

      if (
        (orientation === "horizontal" || orientation === "both") &&
        (direction === "left" || direction === "right")
      ) {
        newIndex += direction === "right" ? 1 : -1;
      }

      if (loop) {
        newIndex = ((newIndex % itemsLength) + itemsLength) % itemsLength;
      } else {
        newIndex = Math.max(0, Math.min(itemsLength - 1, newIndex));
      }

      currentIndexRef.current = newIndex;

      // Focus the new element
      const container = containerRef.current;
      if (container) {
        const items = container.querySelectorAll<HTMLElement>(
          '[role="option"], [role="menuitem"], [data-nav-item]',
        );
        items[newIndex]?.focus();
      }
    },
    [itemsLength, loop, orientation],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigate("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          navigate("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigate("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          navigate("right");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect?.(currentIndexRef.current);
          break;
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onSelect]);

  return { containerRef, currentIndex: currentIndexRef.current };
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", priority);
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = message;

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    [],
  );

  return announce;
}

/**
 * Skip to main content link component props
 */
export interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

/**
 * Generate ARIA attributes for a color swatch button
 */
export function getColorSwatchAriaProps(
  colorName: string,
  hexValue: string,
  isSelected: boolean,
) {
  return {
    role: "option" as const,
    "aria-selected": isSelected,
    "aria-label": `${colorName} 색상 (${hexValue})${isSelected ? ", 선택됨" : ""}`,
    tabIndex: isSelected ? 0 : -1,
  };
}

/**
 * Generate ARIA attributes for a tab
 */
export function getTabAriaProps(
  tabId: string,
  panelId: string,
  isSelected: boolean,
) {
  return {
    role: "tab" as const,
    id: tabId,
    "aria-selected": isSelected,
    "aria-controls": panelId,
    tabIndex: isSelected ? 0 : -1,
  };
}

/**
 * Generate ARIA attributes for a tab panel
 */
export function getTabPanelAriaProps(panelId: string, tabId: string) {
  return {
    role: "tabpanel" as const,
    id: panelId,
    "aria-labelledby": tabId,
    tabIndex: 0,
  };
}
