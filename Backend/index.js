
const express = require('express');
const crypto = require('crypto');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let usersCollection, expensesCollection, goalsCollection;

app.use(cors());
app.use(express.json());

client.connect().then(() => {
  const db = client.db('budgetbloom');
  usersCollection = db.collection('users');
  expensesCollection = db.collection('expenses');
  goalsCollection = db.collection('goals');
});

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const hashed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashed;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const existing = await usersCollection.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const { salt, hash } = hashPassword(password);
  const token = generateToken();
  const result = await usersCollection.insertOne({ email, hash, salt, token });
  res.status(201).json({ token });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await usersCollection.findOne({ email });
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken();
  await usersCollection.updateOne({ _id: user._id }, { $set: { token } });
  res.json({ token });
});

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const user = await usersCollection.findOne({ token });
  if (!user) return res.status(403).json({ message: 'Invalid token' });

  req.user = user;
  next();
};

// Sample protected route
app.get('/profile', authMiddleware, (req, res) => {
  res.json({ email: req.user.email });
});

// Expense Routes
app.post('/expenses', authMiddleware, async (req, res) => {
  const { amount, category, note, date } = req.body;
  if (!amount || !category || !date) return res.status(400).json({ message: 'Required fields missing' });
  const result = await expensesCollection.insertOne({
    userId: req.user._id,
    amount,
    category,
    note,
    date: new Date(date)
  });
  res.status(201).json(result);
});

app.get('/expenses', authMiddleware, async (req, res) => {
  const { category, sort, start, end } = req.query;
  const query = { userId: req.user._id };

  if (category) query.category = category;
  if (start || end) query.date = {};
  if (start) query.date.$gte = new Date(start);
  if (end) query.date.$lte = new Date(end);

  let cursor = expensesCollection.find(query);

  if (sort === 'newest') cursor = cursor.sort({ date: -1 });
  if (sort === 'highest') cursor = cursor.sort({ amount: -1 });

  const expenses = await cursor.toArray();
  res.json(expenses);
});

app.put('/expenses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { amount, category, note, date } = req.body;
  const result = await expensesCollection.updateOne(
    { _id: new ObjectId(id), userId: req.user._id },
    { $set: { amount, category, note, date: new Date(date) } }
  );
  res.json(result);
});

app.delete('/expenses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const result = await expensesCollection.deleteOne({ _id: new ObjectId(id), userId: req.user._id });
  res.json(result);
});

// Savings Goal Routes
app.post('/goal', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ message: 'Amount required' });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const result = await goalsCollection.updateOne(
    { userId: req.user._id, year, month },
    { $set: { amount } },
    { upsert: true }
  );
  res.json(result);
});

app.get('/goal', authMiddleware, async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const expenses = await expensesCollection.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]).toArray();

  const spent = expenses[0]?.total || 0;
  const goal = await goalsCollection.findOne({ userId: req.user._id, year: now.getFullYear(), month: now.getMonth() });

  if (!goal) return res.json({ goal: 0, spent, percent: 0, remaining: 0, overspending: false });

  const percent = Math.min((spent / goal.amount) * 100, 100);
  const remaining = Math.max(goal.amount - spent, 0);
  const overspending = spent > goal.amount;

  res.json({ goal: goal.amount, spent, percent, remaining, overspending });
});

// Goal Nudges Route
app.get('/nudges', authMiddleware, async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const lastWeek = new Date(startOfWeek);
  lastWeek.setDate(startOfWeek.getDate() - 7);

  const [thisWeek, prevWeek] = await Promise.all([
    expensesCollection.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]).toArray(),
    expensesCollection.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: lastWeek, $lt: startOfWeek }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]).toArray()
  ]);

  const goalDoc = await goalsCollection.findOne({ userId: req.user._id, year: now.getFullYear(), month: now.getMonth() });
  const currentMonthExpenses = await expensesCollection.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]).toArray();

  const nudges = ["example Nudges.!"];
  const totalSpent = currentMonthExpenses[0]?.total || 0;

  if (goalDoc && totalSpent >= goalDoc.amount * 0.5 && totalSpent < goalDoc.amount) {
    nudges.push("You're halfway to your savings goal!");
  }

  thisWeek.forEach(cat => {
    const prev = prevWeek.find(p => p._id === cat._id);
    if (prev && cat.total > prev.total * 2) {
      nudges.push(`${cat._id} spending doubled this week!`);
    }
  });

  // Check for today = 0 spending
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySpending = await expensesCollection.findOne({ userId: req.user._id, date: { $gte: today, $lt: tomorrow } });
  if (todaySpending) {
    nudges.push("Try a no-spend day tomorrow?");
  }

  res.json(nudges);
});

app.listen(4000, () => console.log('Server running on port 4000'));