
// File: frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import SavingsGoal from './SavingsGoal';
import Dashboard from './Dashboard';
import ExpenseCalendar from './ExpenseCalendar';
import Nudges from './Nudges';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then fallback to system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  });

  const token = localStorage.getItem('token');
  const [view, setView] = useState(token ? 'dashboard' : 'login');
  const [reload, setReload] = useState(Date.now());

  const refresh = () => setReload(Date.now());
  useEffect(() => {
    const root = document.documentElement;
    console.log(darkMode);
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div>
      {darkMode ? <>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors">
          <header className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">BudgetBloom</h1>
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
          </header>
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {view === 'register' && <Register switchView={() => setView('login')} />}
            {view === 'login' && <Login switchView={() => setView('register')} />}
            {view === 'dashboard' && <>
              <Nudges token={token} />
              <ExpenseForm onAdd={refresh} />
              <ExpenseList reloadSignal={reload} />
              <Dashboard></Dashboard>
              <ExpenseCalendar></ExpenseCalendar>
              {/* <SavingsGoal></SavingsGoal> */}
            </>}
          </div>
        </div>
      </> : <>
      <div className="min-h-screen">
          <header className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">BudgetBloom</h1>
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="px-4 py-2 rounded bg-gray-300 transition"
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
          </header>
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {view === 'register' && <Register switchView={() => setView('login')} />}
            {view === 'login' && <Login switchView={() => setView('register')} />}
            {view === 'dashboard' && <>
              <Nudges token={token} />
              <ExpenseForm onAdd={refresh} />
              <ExpenseList reloadSignal={reload} />
              <Dashboard></Dashboard>
              <ExpenseCalendar></ExpenseCalendar>
              <SavingsGoal></SavingsGoal>
            </>}
          </div>
        </div>
      </>}

    </div>
  )
}

export default App;
