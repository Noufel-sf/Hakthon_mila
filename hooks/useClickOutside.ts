import { useEffect, useRef, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent | KeyboardEvent) => void;

export interface UseClickOutsideOptions<T extends HTMLElement = HTMLElement> {
  /**
   * Whether the click-outside listener is currently active.
   * Useful to only listen when a menu or modal is open.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether pressing the Escape key should also trigger the handler.
   * @default true
   */
  onEscape?: boolean;

  /**
   * Custom DOM events to listen to for click outside detection.
   * @default ['mousedown', 'touchstart']
   */
  events?: ('mousedown' | 'mouseup' | 'touchstart' | 'touchend')[];

  /**
   * Optional pre-existing ref to attach to instead of creating a new one.
   */
  ref?: RefObject<T | null>;
}

/**
 * Custom React hook that detects clicks outside of the referenced element.
 * Supports touch devices, escape key handling, and enabling/disabling dynamically.
 *
 * @example
 * // Pattern 1: Hook creates and returns the ref
 * const menuRef = useClickOutside(() => setIsOpen(false), { enabled: isOpen });
 * return <div ref={menuRef}>...</div>;
 *
 * @example
 * // Pattern 2: Passing an existing ref
 * const myRef = useRef<HTMLDivElement>(null);
 * useClickOutside(() => setIsOpen(false), { ref: myRef, enabled: isOpen });
 * return <div ref={myRef}>...</div>;
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  options: UseClickOutsideOptions<T> = {}
): RefObject<T | null> {
  const {
    enabled = true,
    onEscape = true,
    events = ['mousedown', 'touchstart'],
    ref: externalRef,
  } = options;

  const internalRef = useRef<T | null>(null);
  const targetRef = externalRef || internalRef;

  // Keep latest handler reference without re-triggering effects
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = targetRef.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      savedHandler.current(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (onEscape && event.key === 'Escape') {
        savedHandler.current(event);
      }
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, listener);
    });

    if (onEscape) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
      if (onEscape) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [enabled, onEscape, targetRef, events]);

  return targetRef;
}

export default useClickOutside;
