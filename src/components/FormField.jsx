import React from 'react';

export const CIVIC_INPUT_CLASS =
  'w-full rounded-civic-control border border-civic-border-strong bg-civic-input px-3.5 py-2 text-sm text-civic-text placeholder:text-civic-text-faint focus:outline-none focus:ring-2 focus:ring-civic-primary';

export function getEditableInputClass(isEditing, readOnlySubtle = false) {
  if (isEditing && !readOnlySubtle) {
    return 'w-full rounded-civic-control border border-civic-primary bg-civic-input px-3 py-2 text-sm text-civic-text focus:outline-none focus:ring-2 focus:ring-civic-primary';
  }
  return 'w-full rounded-civic-control border border-civic-border-soft bg-civic-input-readonly px-3 py-2 text-sm text-civic-text focus:outline-none';
}

export function FormField({ id, label, children, error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-civic-text-secondary mb-1"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
