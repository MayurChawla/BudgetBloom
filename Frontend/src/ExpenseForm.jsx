import React, { useState } from 'react';

export default function ExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const submit = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ amount: Number(amount), category, note, date })
    });
    if (res.ok) {
      await res.json();
      setAmount(''); setNote('');
      onAdd();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full max-w-md">
      <h3 className="text-xl font-semibold mb-2 dark:text-white">Add Expense</h3>
      <input className="w-full mb-2 p-2 border rounded" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <select className="w-full mb-2 p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)}>
        {['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'].map(c => <option key={c}>{c}</option>)}
      </select>
      <input className="w-full mb-2 p-2 border rounded" type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
      <input className="w-full mb-2 p-2 border rounded" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button className="w-full bg-green-600 text-white p-2 rounded" onClick={submit}>Add Expense</button>
    </div>
  );
}
