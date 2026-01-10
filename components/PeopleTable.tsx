'use client';

import React from 'react';
import type { PersonFormValues } from './PeopleModal';

interface Person extends PersonFormValues {
  id: string;
  createdAt: string;
}

interface PeopleTableProps {
  people: Person[];
  onDelete: (id: string) => void;
}

export default function PeopleTable({ people, onDelete }: PeopleTableProps) {
  if (people.length === 0) {
    return <div className="text-sm text-gray-600">No people added yet.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {people.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.role}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.phone}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.subject || '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.group || '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}