# 🌸 BudgetBloom

**BudgetBloom** is a personal finance tracker built with React and TailwindCSS. It allows users to manage expenses, set savings goals, and visualize spending trends — all with a clean interface and dark mode support.

## ✨ Features

- 🔐 **Authentication**: Secure login & registration with JWT token storage.
- 📋 **Expense Tracker**: Add, edit, delete, filter, and sort expenses.
- 🎯 **Goal Management**: Set financial goals and track your progress.
- 📊 **Dashboard**: Visual summary of spending by category and goal completion.
- 🌗 **Dark Mode Toggle**: Persisted user theme preference using `localStorage`.
- 🧠 **Responsive UI**: Fully styled using TailwindCSS and mobile-friendly.

## 📦 Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express (Assumed)
- **Auth**: JWT-based token auth
- **State Management**: React hooks + props

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MayurChawla/BudgetBloom.git
cd budgetbloom
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the frontend

```bash
npm run dev
# or
npm start
```

> Make sure your backend (e.g., Express server) is running on `http://localhost:4000`

## 🌗 Dark Mode

- Uses TailwindCSS's `dark` variant.
- User can toggle theme using a button.
- Selected mode is saved in `localStorage` and restored on reload.

```js
// Example localStorage usage
localStorage.setItem('theme', 'dark'); // or 'light'
```

## 🔐 Authentication

- JWT token stored in `localStorage`
- Token is attached as `Authorization` header in API requests

```js
fetch('/expenses', {
  headers: {
    Authorization: localStorage.getItem('token')
  }
});
```

## 📂 Project Structure

```
src/
├── components/
│   ├── ExpenseList.jsx
│   ├── GoalList.jsx
│   ├── Dashboard.jsx
│   └── DarkModeToggle.jsx
├── pages/
│   ├── Login.jsx
│   └── Register.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## 🔍 Filtering & Sorting

### Filter by Category

Dropdown with options like Food, Transport, etc.

### Sort Options

- `Newest` — Sorted by most recent date
- `Highest` — Sorted by amount descending

Sorting is handled in the frontend based on selection:

```js
if (sort === 'newest') {
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
} else if (sort === 'highest') {
  data.sort((a, b) => b.amount - a.amount);
}
```

## 📈 Roadmap

- [ ] Add category-wise charting with `Recharts`
- [ ] Monthly budgets and summaries
- [ ] Mobile app (React Native)
- [ ] Google OAuth support

## 🛠 Environment Variables

If needed, you can create a `.env` file for your backend URL:

```
VITE_API_URL=http://localhost:4000
```

Then access it in code with:

```js
const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses`, { ... });
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## 📄 License

MIT © [Your Name or Org]


Please check the look and feel :

![ss1](https://github.com/user-attachments/assets/276c4b14-3e15-4dc0-b95d-9865be82b6d4)

![ss2](https://github.com/user-attachments/assets/db992c27-0616-45ea-a6b6-5dbaf117a672)

![ss3](https://github.com/user-attachments/assets/5e7f023c-e964-4eda-a339-ce9ccfb7cffa)

![ss4](https://github.com/user-attachments/assets/230e1b56-e113-41f6-8f11-c0e32e69e64c)

