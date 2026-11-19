import React from 'react';

export function CivicShieldLogo({
  variant = 'light',
  className = 'w-7 h-7',
}) {
  if (variant === 'light') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={className}
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M16 3L5 7.5V15.5C5 22.4 9.7 28.4 16 30C22.3 28.4 27 22.4 27 15.5V7.5L16 3Z"
          fill="#FFFFFF"
        />
        <path
          d="M16 5.2V27.6C21 26.2 24.8 21.3 24.8 15.5V8.9L16 5.2Z"
          fill="var(--civic-primary)"
        />
        <path
          d="M16 5.2L7.2 8.9V15.5C7.2 21.3 11 26.2 16 27.6V5.2Z"
          fill="var(--civic-primary-soft)"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M16 3L5 7.5V15.5C5 22.4 9.7 28.4 16 30C22.3 28.4 27 22.4 27 15.5V7.5L16 3Z"
        fill="#E2E8F0"
      />
      <path
        d="M16 4.4L6.4 8.3V15.5C6.4 21.7 10.5 27.1 16 28.6V4.4Z"
        fill="var(--civic-primary-soft)"
      />
      <path
        d="M16 4.4V28.6C21.5 27.1 25.6 21.7 25.6 15.5V8.3L16 4.4Z"
        fill="var(--civic-primary-hover)"
      />
    </svg>
  );
}

export function UserAvatarIcon({ className = 'w-8 h-8' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="20" cy="20" r="20" fill="#FB923C" />
      <path
        d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
        fill="#FDBA74"
      />
      <path
        d="M8.5 34.5C10.8 29.2 15 26 20 26C25 26 29.2 29.2 31.5 34.5C28.3 37.9 24.3 40 20 40C15.7 40 11.7 37.9 8.5 34.5Z"
        fill="#4F46E5"
      />
    </svg>
  );
}
