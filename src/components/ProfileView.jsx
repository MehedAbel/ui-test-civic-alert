import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { apiClient } from '../services/apiClient.js';
import { formatDateShort, validateProfileUpdate } from '../utils/civicLogic.js';
import { UserAvatarIcon } from './CivicBrand.jsx';
import { CIVIC_INPUT_CLASS, FormField, getEditableInputClass } from './FormField.jsx';

export function ProfileView() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  if (!user) return null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const validationErr = validateProfileUpdate({ fullName, phoneNumber });
    if (validationErr) {
      setProfileError(validationErr);
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);

    try {
      await updateProfile({
        fullName,
        phoneNumber,
        neighborhood,
        bio,
        preferredTheme: theme,
      });
      setProfileMessage('Personal details saved.');
      setIsEditing(false);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'Unable to save profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    setSavingPassword(true);

    try {
      await apiClient.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Unable to change password.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <main className="mx-auto max-w-[var(--civic-profile-max-w)] px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-civic-text">
            My Profile
          </h1>
          <p className="mt-0.5 text-xs text-civic-text-subtle">
            {user.role} account · Member since{' '}
            <span className="tabular-nums">
              {formatDateShort(user.createdAtUtc)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsEditing((prev) => !prev);
            setProfileMessage(null);
            setProfileError(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-civic-control bg-civic-primary hover:bg-civic-primary-hover px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" aria-hidden="true" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
        </button>
      </div>

      {profileMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-civic-panel border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{profileMessage}</span>
        </div>
      )}

      {profileError && (
        <div
          role="alert"
          className="rounded-civic-panel border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
        >
          {profileError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-4 rounded-civic-card bg-civic-surface border border-civic-border shadow-civic-card p-6 space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <UserAvatarIcon className="w-16 h-16" />
            <h2 className="text-base font-bold text-civic-accent">
              {user.fullName}
            </h2>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-3.5">
            <FormField id="profile-fullname" label="Full Name">
              <input
                id="profile-fullname"
                type="text"
                required
                readOnly={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={getEditableInputClass(isEditing)}
              />
            </FormField>

            <FormField id="profile-email" label="Email">
              <input
                id="profile-email"
                type="email"
                readOnly
                value={user.email}
                className={`${getEditableInputClass(false)} text-civic-text-subtle`}
              />
            </FormField>

            <FormField id="profile-phone" label="Phone Number">
              <input
                id="profile-phone"
                type="tel"
                readOnly={!isEditing}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 234-8910"
                className={getEditableInputClass(isEditing)}
              />
            </FormField>

            <FormField id="profile-neighborhood" label="Neighborhood / District">
              <input
                id="profile-neighborhood"
                type="text"
                readOnly={!isEditing}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Oakwood District"
                className={getEditableInputClass(isEditing)}
              />
            </FormField>

            <FormField id="profile-bio" label="Notes / Bio">
              <textarea
                id="profile-bio"
                rows={2}
                readOnly={!isEditing}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Optional note..."
                className={getEditableInputClass(isEditing)}
              />
            </FormField>

            {isEditing && (
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover disabled:opacity-60 px-5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </form>
        </section>

        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-civic-card bg-civic-surface border border-civic-border shadow-civic-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-civic-text">
              <UserIcon className="w-5 h-5 text-civic-accent" aria-hidden="true" />
              <h2>Account Settings</h2>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-civic-text-muted">
                Would you like to sign out of the application?
              </p>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-civic-control bg-rose-500 hover:bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="pt-4 border-t border-civic-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-civic-text">
                  Display Theme
                </p>
                <p className="text-xs text-civic-text-subtle">
                  Switch between light and dark interface appearance.
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1 rounded-civic-pill bg-civic-surface-subtle">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`inline-flex items-center gap-1.5 rounded-civic-pill px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    theme === 'light'
                      ? 'bg-civic-primary text-white shadow-xs'
                      : 'text-civic-text-muted'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`inline-flex items-center gap-1.5 rounded-civic-pill px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-civic-primary text-white shadow-xs'
                      : 'text-civic-text-muted'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-civic-card bg-civic-surface border border-civic-border shadow-civic-card p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-civic-text">Security</h2>
              <p className="text-xs text-civic-text-subtle">
                Update your account password (minimum 8 characters).
              </p>
            </div>

            {passwordError && (
              <div
                role="alert"
                className="rounded-civic-control border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-800 dark:text-rose-200"
              >
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-civic-control border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{passwordMessage}</span>
              </div>
            )}

            <form
              onSubmit={handlePasswordChange}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"
            >
              <FormField id="current-password" label="Current Password">
                <input
                  id="current-password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={CIVIC_INPUT_CLASS}
                />
              </FormField>

              <FormField id="new-password" label="New Password">
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={CIVIC_INPUT_CLASS}
                />
              </FormField>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover disabled:opacity-60 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
