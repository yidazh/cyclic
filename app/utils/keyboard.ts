/**
 * Keyboard utility functions
 */

/**
 * Check if target is an input element
 */
export function isInputElement(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  return (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable
  );
}

/**
 * Normalize keyboard event to key string
 */
export function normalizeKey(e: KeyboardEvent): string {
  const modifiers = [];
  if (e.altKey) modifiers.push('Alt');
  if (e.ctrlKey) modifiers.push('Ctrl');
  if (e.metaKey) modifiers.push('Meta');
  if (e.shiftKey) modifiers.push('Shift');

  const key = e.key === ' ' ? 'Space' : e.key;

  if (modifiers.length > 0) {
    return `${modifiers.join('+')}+${key}`;
  }

  return key.toLowerCase();
}

/**
 * Check if keyboard event matches a shortcut string
 */
export function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  return normalizeKey(e) === shortcut;
}
