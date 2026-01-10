'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export type Role = 'TEACHER' | 'STUDENT';

export const personSchema = z
  .object({
    role: z.enum(['TEACHER', 'STUDENT']),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .min(7, 'Phone is too short')
      .max(20, 'Phone is too long')
      .regex(/^[0-9+()\-\s]*$/, 'Phone may contain only digits and +()- characters'),
    subject: z.string().optional(),
    group: z.string().optional(),
  })
  .refine(
    (data) => {
      // subject required for teachers
      if (data.role === 'TEACHER') {
        return typeof data.subject === 'string' && data.subject.trim().length > 0;
      }
      return true;
    },
    { message: 'Subject is required for teachers', path: ['subject'] }
  );

export type PersonFormValues = z.infer<typeof personSchema>;

interface PeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (values: PersonFormValues) => void;
  initial?: Partial<PersonFormValues>;
  title?: string;
}

export default function PeopleModal({ isOpen, onClose, onCreate, initial, title = 'Add Person' }: PeopleModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      role: 'STUDENT',
      name: '',
      phone: '',
      subject: '',
      group: '',
      ...initial,
    },
  });

  const role = watch('role');

  React.useEffect(() => {
    if (!isOpen) {
      reset({ role: 'STUDENT', name: '', phone: '', subject: '', group: '' });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6 m-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded focus:outline-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit((values) => {
            onCreate(values);
            onClose();
          })}
          className="space-y-4"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              {...register('name')}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Full name"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              {...register('phone')}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.phone ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="+1234567890"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Subject only relevant for teachers */}
          {role === 'TEACHER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                {...register('subject')}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.subject ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. Mathematics"
              />
              {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <input
              {...register('group')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Group A"
            />
            {errors.group && <p className="text-xs text-red-600 mt-1">{errors.group.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}