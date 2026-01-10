import React from 'react';
import RegisterForm from '../../components/RegisterForm';

export const metadata = {
  title: 'Register',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}