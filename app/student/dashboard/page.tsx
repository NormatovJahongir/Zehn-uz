'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AttendanceHistoryGrid, { AttendanceRecord } from '../../../components/AttendanceHistoryGrid';
import Leaderboard, { LeaderboardEntry } from '../../../components/Leaderboard';

// center map must be client-only; import client component (it already handles leaflet CSS)
const CenterMapClient = dynamic(() => import('../../../components/CenterMapClient'), { ssr: false });

/**
 * Student dashboard demo page.
 * - Attendance: read attendance entries from localStorage key(s) or use sample
 * - Leaderboard: shows sample ranking data (replace with API)
 * - Center map: reads saved coords from localStorage key 'admin:center:coords' (as used in admin settings)
 *
 * This page is client-side so it can access localStorage and run map libraries.
 */

function readSavedCenterCoords(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem('admin:center:coords');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed;
  } catch {
    // ignore
  }
  return null;
}

function readAttendanceForStudent(studentId: string, lookbackDays = 30): AttendanceRecord[] {
  // This demo reads attendance from localStorage by scanning keys that look like attendance snapshots.
  // If your app stores per-date attendance under a single key use that instead.
  const out: AttendanceRecord[] = [];
  try {
    // attempt to read any saved attendance blobs (this is a best-effort demo)
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('attendance'));
    // collect last `lookbackDays` dates
    for (let i = 0; i < lookbackDays; i++) {
      const iso = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      let dayStatus: AttendanceRecord['status'] = 'ABSENT';
      for (const k of keys) {
        try {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const parsed = JSON.parse(raw) as Record<string, { date: string; entries: Array<{ studentId: string; status: AttendanceRecord['status'] }> }>;
          const day = parsed[iso];
          if (!day) continue;
          const found = (day.entries ?? []).find((e) => e.studentId === studentId);
          if (found) {
            dayStatus = found.status;
            break;
          }
        } catch {
          // ignore parse issues
        }
      }
      out.push({ date: iso, status: dayStatus });
    }
  } catch {
    // fallback to empty
  }
  return out;
}

export default function StudentDashboardPage() {
  // demo student identity
  const studentIdRef = React.useRef('s1');
  const [centerCoords, setCenterCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    const coords = readSavedCenterCoords();
    setCenterCoords(coords);
  }, []);

  // sample leaderboard data (replace with API)
  const leaderboardSample: LeaderboardEntry[] = [
    { studentId: 's3', name: 'Celine Park', score: 98.5 },
    { studentId: 's1', name: 'Alice Johnson', score: 92.0 },
    { studentId: 's2', name: 'Bob Smith', score: 88.3 },
    { studentId: 's4', name: 'Daniel Kim', score: 84.2 },
  ];

  // attendance: read the last 28 days for the demo student
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);

  React.useEffect(() => {
    const arr = readAttendanceForStudent(studentIdRef.current, 28);
    setAttendance(arr);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Student Dashboard</h1>
            <p className="text-sm text-gray-600">Overview of attendance, ranking, and center location.</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">You are</div>
            <div className="text-lg font-medium text-gray-900">Alice Johnson</div>
            <div className="text-xs text-gray-500">Student ID: {studentIdRef.current}</div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceHistoryGrid records={attendance} days={28} className="" />
          </div>

          <div>
            <Leaderboard entries={leaderboardSample} limit={6} />
          </div>
        </section>

        <section>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Center Location</h3>
              <div className="text-sm text-gray-600">{centerCoords ? `${centerCoords.lat}, ${centerCoords.lng}` : 'Not set'}</div>
            </div>

            {centerCoords ? (
              <CenterMapClient lat={centerCoords.lat} lng={centerCoords.lng} />
            ) : (
              <div className="text-sm text-gray-600">Center coordinates not configured. Ask an admin to set the center location.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}