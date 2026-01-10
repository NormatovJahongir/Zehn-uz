'use client';

import React from 'react';
import AttendanceTable, { AttendanceForm, AttendanceEntry } from '../../../components/AttendanceTable';
import { v4 as uuidv4 } from 'uuid';

/**
 * Demo page that uses AttendanceTable
 * Replace the sampleStudents with data from your API
 */

const sampleStudents = [
  { id: 's1', name: 'Alice Johnson' },
  { id: 's2', name: 'Bob Smith' },
  { id: 's3', name: 'Celine Park' },
  { id: 's4', name: 'Daniel Kim' },
];

export default function TeacherAttendancePage() {
  const [saved, setSaved] = React.useState<AttendanceForm | null>(null);

  function handleSave(payload: AttendanceForm) {
    // Example: keep a simple last-saved view in state so we can show a preview
    setSaved(payload);
    // In a real app: call your API, e.g. fetch('/api/attendance', { method: 'POST', body: JSON.stringify(payload) })
    // You can add teacher id / course id metadata there as needed.
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Attendance & Exam Scores</h1>
          <div className="text-sm text-gray-600">Mark present/absent and enter exam scores for each student.</div>
        </header>

        <section>
          <AttendanceTable students={sampleStudents} onSave={handleSave} storageKey={`attendance:${uuidv4()}`} />
        </section>

        {saved && (
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-medium mb-2">Last saved</h2>
            <div className="text-sm text-gray-700 mb-2">Date: {saved.date}</div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {saved.entries.map((e: AttendanceEntry) => (
                    <tr key={e.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">{e.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{e.status}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{typeof e.score === 'number' ? e.score : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}