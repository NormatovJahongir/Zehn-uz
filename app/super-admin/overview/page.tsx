'use client';

import React from 'react';

type Center = {
  id: string;
  name: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  managerId?: string;
  createdAt?: string;
};

type AdminStats = {
  totalStudents: number;
  totalCenters: number;
  totalRevenue: number;
  currency?: string;
  centers: Center[];
};

export default function SuperAdminOverviewPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as AdminStats;
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  function formatCurrency(amount: number | undefined, currency = 'USD') {
    if (amount === undefined || amount === null) return '—';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  function exportCentersCSV(centers: Center[]) {
    if (!centers || centers.length === 0) return;
    const headers = ['id', 'name', 'address', 'city', 'state', 'postalCode', 'country', 'phone', 'email', 'latitude', 'longitude', 'managerId', 'createdAt'];
    const rows = centers.map((c) => [
      c.id,
      c.name,
      c.addressLine1 ?? '',
      c.city ?? '',
      c.state ?? '',
      c.postalCode ?? '',
      c.country ?? '',
      c.phone ?? '',
      c.email ?? '',
      String(c.latitude ?? ''),
      String(c.longitude ?? ''),
      c.managerId ?? '',
      c.createdAt ?? '',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Super Admin — Overview</h1>
            <p className="text-sm text-gray-600">Key totals and registered centers across the platform.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats()}
              className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Refresh
            </button>

            <button
              onClick={() => stats && exportCentersCSV(stats.centers)}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={loading || !stats || stats.centers.length === 0}
            >
              Export Centers CSV
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-28 bg-white rounded-lg animate-pulse" />
            <div className="h-28 bg-white rounded-lg animate-pulse" />
            <div className="h-28 bg-white rounded-lg animate-pulse" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded">
            Failed to load stats: {error}
          </div>
        ) : stats ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Students</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalStudents}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Centers</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalCenters}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalRevenue, stats.currency ?? 'USD')}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Registered Centers</h2>
                <div className="text-sm text-gray-500">{stats.centers.length} centers</div>
              </div>

              {stats.centers.length === 0 ? (
                <div className="text-sm text-gray-600">No centers registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Address</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Contact</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Coordinates</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                      {stats.centers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-500">ID: {c.id}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div>{c.addressLine1 ?? '—'}</div>
                            <div className="text-xs text-gray-500">{[c.city, c.state, c.postalCode].filter(Boolean).join(', ')}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div>{c.phone ?? '—'}</div>
                            <div className="text-xs text-gray-500">{c.email ?? '—'}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {typeof c.latitude === 'number' && typeof c.longitude === 'number'
                              ? `${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}`
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}