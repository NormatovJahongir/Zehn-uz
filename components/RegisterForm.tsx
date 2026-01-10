'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // small enum for the client form
  role: z.enum(['ADMIN', 'STUDENT']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        // replace with your success flow
        router.push('/'); // or '/welcome' etc.
      } else {
        const json = await res.json();
        setServerError(json?.error || json?.message || 'Registration failed');
      }
    } catch (err) {
      setServerError('Network error. Please try again.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-md rounded-lg p-6 space-y-4"
      noValidate
    >
      <h2 className="text-2xl font-semibold text-gray-800">Create an account</h2>

      {serverError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="you@example.com"
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.password ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="At least 8 characters"
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          {...register('role')}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ADMIN">Admin</option>
          <option value="STUDENT">Student</option>
        </select>
        {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded disabled:opacity-60"
      >
        {isSubmitting ? 'Creating...' : 'Create account'}
      </button>
    </form>
  );
}