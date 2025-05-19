// File: frontend/src/components/Dashboard.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const drawPieChart = (ctx, data) => {
  // Clear the canvas first
  ctx.clearRect(0, 0, 200, 200);
  
  // If no data, return early
  if (data.length === 0) return;

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  // If total is 0, return early
  if (total === 0) return;

  let startAngle = 0;
  const colors = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

  data.forEach((d, i) => {
    const angle = (d.amount / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 80, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += angle;
  });
};

const drawBarChart = (ctx, data) => {
  ctx.clearRect(0, 0, 500, 200);
  const maxAmount = Math.max(...data.map(d => d.amount), 100);
  const barWidth = 12;
  const gap = 4;

  data.forEach((d, i) => {
    const x = i * (barWidth + gap);
    const y = 200 - (d.amount / maxAmount) * 180;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(x, y, barWidth, 200 - y);
    ctx.fillStyle = '#000';
    ctx.font = '8px sans-serif';
    ctx.fillText(new Date(d.date).getDate(), x, 195);
  });
};

const drawProgressRing = (canvas, percent) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 120, 120);
  ctx.beginPath();
  ctx.arc(60, 60, 50, 0, 2 * Math.PI);
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(60, 60, 50, -0.5 * Math.PI, (percent / 100) * 2 * Math.PI - 0.5 * Math.PI);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(percent)}%`, 60, 65);
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [goal, setGoal] = useState({ goal: 0, spent: 0, percent: 0 });
  const pieCanvasRef = useRef();
  const barCanvasRef = useRef();
  const ringCanvasRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res1 = await axios.get('http://localhost:4000/expenses', {
        headers: { Authorization: token }
      });
      const res2 = await axios.get('http://localhost:4000/goal', {
        headers: { Authorization: token }
      });
      setExpenses(res1.data);
      setGoal(res2.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const byCategory = {};
    const byDay = {};
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    expenses.forEach(exp => {
      const dateStr = new Date(exp.date).toISOString().split('T')[0];
      if (new Date(exp.date) >= thirtyDaysAgo) {
        byDay[dateStr] = (byDay[dateStr] || 0) + exp.amount;
      }
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    const pieData = Object.entries(byCategory).map(([category, amount]) => ({ category, amount }));
    console.log(pieData);
    const barData = Object.entries(byDay).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, amount]) => ({ date, amount }));

    drawBarChart(barCanvasRef.current.getContext('2d'), barData);
    drawProgressRing(ringCanvasRef.current, goal.percent);
      if (pieCanvasRef.current && expenses.length > 0) {
          const byCategory = {};

          expenses.forEach(exp => {
              byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
          });

          const pieData = Object.entries(byCategory).map(([category, amount]) => ({
              category,
              amount
          }));

          drawPieChart(pieCanvasRef.current.getContext('2d'), pieData);
      }
  }, [expenses, goal]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Spend by Category</h2>
          <canvas ref={pieCanvasRef} width={200} height={200} style={{ border: '1px solid red' }}></canvas>
        </div>

        <div className="bg-white p-4 rounded-xl shadow col-span-2">
          <h2 className="text-lg font-semibold mb-2">Daily Spend (Last 30 Days)</h2>
          <canvas ref={barCanvasRef} width={500} height={200}></canvas>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow w-48">
        <h2 className="text-lg font-semibold mb-2">Savings Goal Progress</h2>
        <canvas ref={ringCanvasRef} width={120} height={120}></canvas>
      </div>
    </div>
  );
};

export default Dashboard;
