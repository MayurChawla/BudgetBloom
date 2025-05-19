// File: frontend/src/SavingsGoal.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SavingsGoal = () => {
  const [goalAmount, setGoalAmount] = useState('');
  const [goalData, setGoalData] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchGoal = async () => {
    try {
      const res = await axios.get('http://localhost:4000/goal', {
        headers: { Authorization: token },
      });
      setGoalData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:4000/goal',
        { amount: parseFloat(goalAmount) },
        { headers: { Authorization: token } }
      );
      setMessage('Goal updated successfully');
      setGoalAmount('');
      fetchGoal();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const Ring = ({ percent }) => {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <svg height={radius * 2} width={radius * 2} className="mx-auto">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#10b981"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-sm fill-current"
        >
          {Math.round(percent)}%
        </text>
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Monthly Savings Goal</h2>
      <form onSubmit={submitGoal} className="flex items-center gap-2 mb-4">
        <input
          type="number"
          step="0.01"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          className="flex-1 px-3 py-2 rounded border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder="Enter goal amount"
          required
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Set Goal
        </button>
      </form>
      {message && <p className="text-green-600 dark:text-green-400 mb-2">{message}</p>}

      {goalData && (
        <div className="text-gray-700 dark:text-gray-300">
          <Ring percent={goalData.percent} />
          <p className="mt-4">Goal: ₹{goalData.goal}</p>
          <p>Spent: ₹{goalData.spent}</p>
          <p>Remaining: ₹{goalData.remaining}</p>
          {goalData.overspending && (
            <p className="text-red-500 font-semibold mt-2">You are overspending!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SavingsGoal;
