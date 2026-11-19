import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { formatDateShort } from '../utils/civicLogic.js';

export function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getAdminUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRoleChange = async (user, role) => {
    setUpdatingId(user.id);
    try {
      const updated = await apiClient.assignUserRole(user.id, role, user.isActive);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-[var(--civic-portal-max-w)] px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-civic-panel bg-civic-header text-white flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-civic-text">
            System Administration &amp; Role Assignment
          </h1>
          <p className="text-sm text-civic-text-subtle">
            Manually assign Official and Admin roles. Public registration only permits Citizen accounts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-56 rounded-civic-card bg-civic-surface shadow-civic-card animate-pulse" />
      ) : (
        <div className="overflow-x-auto rounded-civic-card border border-civic-border bg-civic-surface shadow-civic-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-civic-border-soft text-xs font-semibold text-civic-accent">
              <tr>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5">Assigned Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-civic-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-civic-hover">
                  <td className="px-5 py-3.5 font-medium text-civic-text">
                    {u.fullName}
                  </td>
                  <td className="px-5 py-3.5 text-civic-text-muted">{u.email}</td>
                  <td className="px-5 py-3.5 text-civic-text-subtle font-mono tabular-nums text-xs">
                    {formatDateShort(u.createdAtUtc)}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      aria-label={`Role for ${u.fullName}`}
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="rounded-civic-control border border-civic-border-strong bg-civic-input px-3 py-1.5 text-xs font-semibold text-civic-text focus:outline-none focus:ring-2 focus:ring-civic-primary"
                    >
                      <option value="Citizen">Citizen</option>
                      <option value="Official">Official</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
