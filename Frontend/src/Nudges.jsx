// frontend/src/Nudges.jsx
import { useEffect, useState } from 'react';

export default function Nudges({ token }) {
  const [nudges, setNudges] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/nudges', {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => setNudges(data || []));
  }, [token]);

  if (nudges.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 my-4 rounded-xl shadow-md">
      <h2 className="font-semibold text-lg mb-2">🏁 Goal Encouragement</h2>
      <ul className="list-disc ml-5 space-y-1">
        {nudges.map((nudge, index) => (
          <li key={index}>{nudge}</li>
        ))}
      </ul>
    </div>
  );
}
