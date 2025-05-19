import React, { useState } from 'react';

export default function Register({ switchView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = async () => {
    const res = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      alert('Registered successfully');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-80 dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Register</h2>
      <input className="w-full mb-2 p-2 border rounded" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full mb-2 p-2 border rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={register}>Register</button>
      <p className="text-sm mt-2 text-center dark:text-gray-300">Already have an account? <button className="text-blue-500" onClick={switchView}>Login</button></p>
    </div>
  );
}
