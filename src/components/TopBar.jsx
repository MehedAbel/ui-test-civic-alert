import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { CivicShieldLogo, UserAvatarIcon } from './CivicBrand.jsx';

export function TopBar({ currentView }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isCitizen = user.role === 'Citizen';

  const navItems = isCitizen
    ? [
        { view: 'map', to: '/map', label: 'Community Map' },
        { view: 'reports', to: '/reports', label: 'My Reports' },
      ]
    : user.role === 'Official'
      ? [{ view: 'official', to: '/official', label: 'Operations Queue' }]
      : [{ view: 'admin', to: '/admin', label: 'Role Directory' }];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-civic-header text-white shadow-sm">
      <div className="mx-auto flex h-[var(--civic-topbar-h)] max-w-[var(--civic-topbar-max-w)] items-center justify-between gap-6 px-4 sm:px-6">
        {/* Zone 1: Brand Lockup */}
        <Link
          to={navItems[0].to}
          onClick={closeMobileMenu}
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-civic-control"
        >
          <CivicShieldLogo variant="light" className="w-7 h-7" />
          <span>Civic Alert</span>
        </Link>

        {/* Zone 2 & 3: Right-aligned nav links + theme + avatar matching reference layout */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.view}
                to={item.to}
                end
                className={({ isActive }) => {
                  const active = isActive || currentView === item.view;
                  return `py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-civic-control ${
                    active
                      ? 'text-white underline decoration-2 underline-offset-8'
                      : 'text-white/90 hover:text-white'
                  }`;
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-civic-pill bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <NavLink
            to="/profile"
            end
            onClick={closeMobileMenu}
            aria-label="Profile"
            title={`${user.fullName} — Profile & Account`}
            className={({ isActive }) =>
              `rounded-civic-pill p-0.5 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isActive || currentView === 'profile' ? 'ring-2 ring-white' : ''
              }`
            }
          >
            <UserAvatarIcon className="w-8 h-8" />
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-civic-control bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-civic-header-drawer px-4 py-3 space-y-1">
          <div className="px-2 py-1 text-xs text-white/80">
            {user.fullName} · {user.role}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.view}
              to={item.to}
              end
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block w-full text-left rounded-civic-control px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive || currentView === item.view
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            end
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `block w-full text-left rounded-civic-control px-3 py-2 text-sm font-semibold transition-colors ${
                isActive || currentView === 'profile'
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:bg-white/10'
              }`
            }
          >
            Profile
          </NavLink>
          <button
            type="button"
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="w-full text-left rounded-civic-control px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/30 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
