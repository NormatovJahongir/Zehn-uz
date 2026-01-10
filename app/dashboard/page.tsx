'use client';

import React from 'react';
import PeopleModal from '../../components/PeopleModal';
import PeopleTable from '../../components/PeopleTable';
import type { PersonFormValues } from '../../components/PeopleModal';
import { v4 as uuidv4 } from 'uuid';

interface Person extends PersonFormValues {
  id: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [people, setPeople] = React.useState<Person[]>([]);

  function handleCreate(values: PersonFormValues) {
    const newPerson: Person = {
      ...values,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setPeople((prev) => [newPerson, ...prev]);
  }

  function handleDelete(id: string) {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">People Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Add Student / Teacher
            </button>
          </div>
        </header>

        <section className="mb-6">
          <PeopleModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={handleCreate}
          />
        </section>

        <section>
          <PeopleTable people={people} onDelete={handleDelete} />
        </section>
      </div>
    </main>
  );
}