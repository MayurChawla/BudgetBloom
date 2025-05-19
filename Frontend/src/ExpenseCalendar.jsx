// File: frontend/src/components/ExpenseCalendar.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExpenseCalendar() {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const res = await axios.get(`http://localhost:4000/expenses?start=${start}&end=${end}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setExpenses(res.data);
    };
    fetchExpenses();
  }, []);

  const getDailyTotals = () => {
    const totals = {};
    expenses.forEach(exp => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0];
      if (!totals[dateKey]) totals[dateKey] = 0;
      totals[dateKey] += Number(exp.amount);
    });
    return totals;
  };

  const handleDayClick = (date) => {
    const clicked = new Date(date);
    const filtered = expenses.filter(e => {
      const d = new Date(e.date);
      return d.toDateString() === clicked.toDateString();
    });
    setSelectedDate(clicked.toDateString());
    setSelectedExpenses(filtered);
  };

  const renderCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const rows = [];
    const dailyTotals = getDailyTotals();

    let day = 1;
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startDay) {
          row.push(<td key={j}></td>);
        } else if (day <= daysInMonth) {
          const dateStr = new Date(year, month, day).toISOString().split('T')[0];
          const total = dailyTotals[dateStr] || 0;
          row.push(
            <td
              key={j}
              className="border p-2 cursor-pointer hover:bg-blue-100 text-center"
              onClick={() => handleDayClick(dateStr)}
            >
              <div className="font-semibold">{day}</div>
              <div className="text-sm text-blue-600">₹{Number(total).toFixed(2)}</div>
            </td>
          );
          day++;
        } else {
          row.push(<td key={j}></td>);
        }
      }
      rows.push(<tr key={i}>{row}</tr>);
    }
    return rows;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📅 Monthly Expense Calendar</h2>
      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <th key={day} className="p-2 border">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Expenses on {selectedDate}</h3>
          {selectedExpenses.length === 0 ? (
            <p className="text-gray-600">No expenses recorded.</p>
          ) : (
            <ul className="space-y-1">
              {selectedExpenses.map((exp, index) => (
                <li key={index} className="p-2 bg-white border rounded shadow">
                  ₹{exp.amount} - {exp.category} {exp.note && `- ${exp.note}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
