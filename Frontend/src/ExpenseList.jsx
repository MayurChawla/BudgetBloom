import React, { useEffect, useState } from 'react';

export default function ExpenseList({ reloadSignal }) {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({ amount: '', category: '', note: '', date: '' });

  // const load = async () => {
  //   const token = localStorage.getItem('token');
  //   const query = new URLSearchParams();
  //   if (filter) query.append('category', filter);
  //   if (sort) query.append('sort', sort);

  //   const res = await fetch(`http://localhost:4000/expenses?${query.toString()}`, {
  //     headers: { Authorization: token }
  //   });
  //   const data = await res.json();
  //   setExpenses(data);
  // };
const load = async () => {
  const token = localStorage.getItem('token');
  const query = new URLSearchParams();
  if (filter) query.append('category', filter);

  const res = await fetch(`http://localhost:4000/expenses?${query.toString()}`, {
    headers: { Authorization: token }
  });
  let data = await res.json();

  // Sort on frontend
  if (sort === 'newest') {
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sort === 'highest') {
    data.sort((a, b) => b.amount - a.amount);
  }

  setExpenses(data);
};
  useEffect(() => { load(); }, [filter, sort, reloadSignal]);

  const deleteExpense = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    load();
  };

  const updateExpense = async () => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/expenses/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(formState)
    });
    setEditingId(null);
    load();
  };

  return (
    <div className="mt-6 w-full max-w-2xl text-black">
      <div className="flex justify-between mb-2">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Categories</option>
          {['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="p-2 border rounded">
          <option value="newest">Newest</option>
          <option value="highest">Highest</option>
        </select>
      </div>
      {expenses.map(e => (
        <div key={e._id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded mb-2 shadow">
          {editingId === e._id ? (
            <div className="flex flex-col w-full">
              <input className="mb-1 p-1 border rounded" type="number" value={formState.amount} onChange={e => setFormState({ ...formState, amount: e.target.value })} />
              <select className="mb-1 p-1 border rounded" value={formState.category} onChange={e => setFormState({ ...formState, category: e.target.value })}>
                {['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="mb-1 p-1 border rounded" type="text" value={formState.note} onChange={e => setFormState({ ...formState, note: e.target.value })} />
              <input className="mb-1 p-1 border rounded" type="date" value={formState.date.split('T')[0]} onChange={e => setFormState({ ...formState, date: e.target.value })} />
              <div className="flex gap-2">
                <button className="text-green-500" onClick={updateExpense}>Save</button>
                <button className="text-gray-500" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <div>
                <div className="font-bold dark:text-white">{e.category}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(e.date).toLocaleDateString()}</div>
                {e.note && <div className="text-sm text-gray-600 dark:text-gray-300">{e.note}</div>}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">${e.amount}</div>
                <button onClick={() => deleteExpense(e._id)} className="text-red-500 text-sm">Delete</button>
                <button onClick={() => {
                  setEditingId(e._id);
                  setFormState({ amount: e.amount, category: e.category, note: e.note, date: e.date });
                }} className="text-blue-500 text-sm ml-2">Edit</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
