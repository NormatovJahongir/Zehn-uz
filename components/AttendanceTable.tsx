'use client';

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import clsx from 'clsx';

/**
 * Zod schema and types
 * - score: optional number between 0 and 100. Empty inputs are allowed (treated as undefined).
 * - status: "PRESENT" | "ABSENT"
 */
const entrySchema = z.object({
  studentId: z.string(),
  name: z.string(),
  // coerce empty string -> undefined, non-empty -> number
  score: z
    .preprocess((v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      // v may be string from input
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    }, z.number().min(0, 'Score must be ≥ 0').max(100, 'Score must be ≤ 100').optional()),
  status: z.enum(['PRESENT', 'ABSENT']),
});

const attendanceSchema = z.object({
  date: z.string().nonempty('Select a date'),
  entries: z.array(entrySchema),
});

export type AttendanceForm = z.infer<typeof attendanceSchema>;
export type AttendanceEntry = z.infer<typeof entrySchema>;

interface AttendanceTableProps {
  students: { id: string; name: string }[]; // list of students to show
  initialDate?: string; // yyyy-mm-dd
  // onSave will receive the validated attendance payload
  onSave?: (payload: AttendanceForm) => void;
  // optional key for localStorage persistence (for demo)
  storageKey?: string;
}

export default function AttendanceTable({
  students,
  initialDate,
  onSave,
  storageKey = 'attendance:demo',
}: AttendanceTableProps) {
  const defaultDate = initialDate ?? new Date().toISOString().slice(0, 10);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    register,
  } = useForm<AttendanceForm>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: defaultDate,
      entries: students.map((s) => ({
        studentId: s.id,
        name: s.name,
        status: 'ABSENT' as const,
        score: undefined,
      })),
    },
  });

  // Keep entries reactive
  const { fields, replace } = useFieldArray({
    control,
    name: 'entries',
  });

  // load saved attendance for date when date changes (from localStorage)
  const watchedDate = watch('date');

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, AttendanceForm>;
      if (parsed && parsed[watchedDate]) {
        // replace entries with saved data (but keep only students in current prop)
        const saved = parsed[watchedDate];
        const normalized = students.map((s) => {
          const found = saved.entries.find((e) => e.studentId === s.id);
          return {
            studentId: s.id,
            name: s.name,
            status: (found?.status as AttendanceEntry['status']) ?? 'ABSENT',
            score: typeof found?.score === 'number' ? found.score : undefined,
          };
        });
        replace(normalized);
      } else {
        // no saved entry for that date -> reset to defaults
        replace(
          students.map((s) => ({
            studentId: s.id,
            name: s.name,
            status: 'ABSENT' as const,
            score: undefined,
          }))
        );
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDate, students]);

  async function onSubmit(values: AttendanceForm) {
    // persist to localStorage (demo) and call onSave if provided
    try {
      const raw = localStorage.getItem(storageKey);
      const all = raw ? (JSON.parse(raw) as Record<string, AttendanceForm>) : {};
      all[values.date] = values;
      localStorage.setItem(storageKey, JSON.stringify(all));
      onSave?.(values);
      // Optionally show a short success flash: simple alert for now
      // Replace with toast in your app
      // eslint-disable-next-line no-alert
      alert('Attendance saved.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save attendance', err);
      // eslint-disable-next-line no-alert
      alert('Failed to save attendance.');
    }
  }

  function markAll(status: AttendanceEntry['status']) {
    const updated = fields.map((f) => ({
      ...f,
      status,
    }));
    replace(updated as any);
  }

  function clearScores() {
    const updated = fields.map((f) => ({
      ...f,
      score: undefined,
    }));
    replace(updated as any);
  }

  const entries = watch('entries') ?? [];

  const presentCount = entries.filter((e) => e.status === 'PRESENT').length;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className={clsx(
                  'px-3 py-2 border rounded w-40 text-sm',
                  errors.date ? 'border-red-400' : 'border-gray-300'
                )}
              />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Quick actions</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markAll('PRESENT')}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Mark all Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll('ABSENT')}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Mark all Absent
                </button>
                <button
                  type="button"
                  onClick={() => clearScores()}
                  className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
                >
                  Clear scores
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Present: <span className="font-medium text-gray-800">{presentCount}</span> /{' '}
              <span className="font-medium text-gray-800">{fields.length}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              Save attendance
            </button>

            <button
              type="button"
              onClick={() =>
                reset({
                  date: defaultDate,
                  entries: students.map((s) => ({
                    studentId: s.id,
                    name: s.name,
                    status: 'ABSENT' as const,
                    score: undefined,
                  })),
                })
              }
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {fields.map((field, idx) => {
                const errorForIndex = (errors.entries && (errors.entries as any)[idx]) ?? null;
                return (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{field.name}</div>
                      <div className="text-xs text-gray-500">ID: {field.studentId}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Controller
                        name={`entries.${idx}.status` as const}
                        control={control}
                        render={({ field: ctlField }) => (
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                value="PRESENT"
                                checked={ctlField.value === 'PRESENT'}
                                onChange={() => ctlField.onChange('PRESENT')}
                                className="form-radio h-4 w-4 text-green-600"
                              />
                              <span className="text-sm">Present</span>
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                value="ABSENT"
                                checked={ctlField.value === 'ABSENT'}
                                onChange={() => ctlField.onChange('ABSENT')}
                                className="form-radio h-4 w-4 text-red-600"
                              />
                              <span className="text-sm">Absent</span>
                            </label>
                          </div>
                        )}
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="max-w-xs">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="Score (0-100)"
                          {...register(`entries.${idx}.score` as const)}
                          className={clsx(
                            'px-2 py-1 border rounded w-32 text-sm',
                            errorForIndex?.score ? 'border-red-400' : 'border-gray-300'
                          )}
                        />
                        {errorForIndex?.score && (
                          <p className="text-xs text-red-600 mt-1">{(errorForIndex as any).score?.message}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}