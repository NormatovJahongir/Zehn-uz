'use client';

import React from 'react';
import clsx from 'clsx';

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  score: number;
}

interface Props {
  entries: LeaderboardEntry[]; // unsorted; component will sort descending by score
  limit?: number;
  className?: string;
}

const medalBg = ['bg-yellow-100 text-yellow-800', 'bg-gray-100 text-gray-800', 'bg-amber-100 text-amber-800'];

export default function Leaderboard({ entries, limit = 10, className }: Props) {
  const sorted = React.useMemo(() => {
    return [...entries].sort((a, b) => b.score - a.score).slice(0, limit);
  }, [entries, limit]);

  return (
    <div className={clsx('bg-white rounded-lg shadow p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Leaderboard</h3>
        <p className="text-sm text-gray-600">Top {sorted.length}</p>
      </div>

      <ol className="space-y-2">
        {sorted.map((e, idx) => (
          <li
            key={e.studentId}
            className="flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-50"
            aria-posinset={idx + 1}
          >
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  idx < 3 ? medalBg[idx] : 'bg-indigo-50 text-indigo-700'
                )}
              >
                {idx + 1}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{e.name}</div>
                <div className="text-xs text-gray-500">ID: {e.studentId}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{e.score}</div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </li>
        ))}
      </ol>

      {sorted.length === 0 && <div className="text-sm text-gray-600 mt-2">No scores yet.</div>}
    </div>
  );
}