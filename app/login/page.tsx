'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Patient Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </main>
  );
}
