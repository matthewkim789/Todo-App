import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all todos
app.get('/todos', async (req, res) => {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(todos);
});

// Create a todo
app.post('/todos', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const todo = await prisma.todo.create({ data: { text } });
  res.status(201).json(todo);
});

// Update a todo's text
app.put('/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const todo = await prisma.todo.update({ where: { id }, data: { text } });
    res.json(todo);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

// Toggle a todo complete/incomplete
app.patch('/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const todo = await prisma.todo.findUniqueOrThrow({ where: { id } });
    const updated = await prisma.todo.update({ where: { id }, data: { completed: !todo.completed } });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
