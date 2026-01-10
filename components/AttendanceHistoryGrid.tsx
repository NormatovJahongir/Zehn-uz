'use client';

import React from 'react';
import clsx from 'clsx';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  date: string; // ISO yyyy-mm-dd
  status: AttendanceStatus;
}

/**
 * Props:
 * - records: optional explicit records to render (most recent first)
 * - days: if records not provided, show last `days` days (default 30) and try to hydrate from localStorage key `attendance:<dateKey>` if provided
 * - dateKey: optional key prefix to read persisted attendance in localStorage (not required)
 */
interface Props {
  records?: AttendanceRecord[];
  days?: number;
  dateKey?: string;
  className?: string;
}

const statusColor = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  EXCUSED: 'bg-blue-100 text-blue-800',
} as const;

function formatDayLabel(isoDate: string) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isoDateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AttendanceHistoryGrid({ records, days = 30, dateKey, className }: Props) {
  const [items, setItems] = React.useState<AttendanceRecord[]>(() => records ?? []);

  React.useEffect(() => {
    if (records && records.length) {
      setItems(records);
      return;
    }

    // If no explicit records passed, attempt to build last `days` days,
    // optionally reading saved attendance from localStorage if dateKey is provided.
    const built: AttendanceRecord[] = [];
    for (let i = 0; i < days; i++) {
      const iso = isoDateNDaysAgo(i);
      let status: AttendanceStatus = 'ABSENT';

      if (dateKey) {
        try {
          const raw = localStorage.getItem(dateKey);
          if (raw) {
            const all = JSON.parse(raw) as Record<string, { date: string; entries: Array<{ studentId: string; status: AttendanceStatus }> }>;
            const day = all[iso];
            // if any present for the student this demo can't know which student; use aggregate heuristic:
            if (day) {
              // if any entry is PRESENT count day as PRESENT; else ABSET
              const anyPresent = (day.entries ?? []).some((e) => e.status === 'PRESENT');
              status = anyPresent ? 'PRESENT' : 'ABSENT';
            }
          }
        } catch {
          // ignore parsing errors
        }
      }

      built.push({ date: iso, status });
    }

    setItems(built);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, days, dateKey]);

  // Summary counts
  const counts = React.useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 } as Record<AttendanceStatus, number>;
    items.forEach((r) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
    });
    return c;
  }, [items]);

  return (
    <div className={clsx('bg-white rounded-lg shadow p-4', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Attendance History</h3>
          <p className="text-sm text-gray-600">Last {items.length} days</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            <span>Present: <strong className="ml-1">{counts.PRESENT}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            <span>Absent: <strong className="ml-1">{counts.ABSENT}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" />
            <span>Late: <strong className="ml-1">{counts.LATE}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
        {items.map((r) => (
          <div key={r.date} className="flex flex-col items-center">
            <div
              title={`${r.date} — ${r.status}`}
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium',
                r.status === 'PRESENT' && 'bg-green-100 text-green-800',
                r.status === 'ABSENT' && 'bg-red-100 text-red-800',
                r.status === 'LATE' && 'bg-yellow-100 text-yellow-800',
                r.status === 'EXCUSED' && 'bg-blue-100 text-blue-800'
              )}
            >
              {/* small dot or short label */}
              {r.status === 'PRESENT' ? 'P' : r.status === 'ABSENT' ? 'A' : r.status === 'LATE' ? 'L' : 'E'}
            </div>
            <div className="text-xs text-gray-500 mt-1">{formatDayLabel(r.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}