import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch(`${API}/todos`)
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const addTodo = async () => {
    const text = input.trim();
    if (!text) return;
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const todo = await res.json();
    setTodos(prev => [...prev, todo]);
    setInput('');
  };

  const toggleTodo = async (id: number) => {
    const res = await fetch(`${API}/todos/${id}`, { method: 'PATCH' });
    const updated = await res.json();
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id: number) => {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Todo App</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, textAlign: 'left' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
          style={{ flex: 1, padding: '8px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          onClick={addTodo}
          style={{ padding: '8px 16px', fontSize: 16, borderRadius: 4, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Add
        </button>
      </div>

      {todos.length === 0 && <p style={{ color: '#999' }}>No todos yet. Add one above!</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={{ flex: 1, fontSize: 16, textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? '#aaa' : '#000' }}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{ background: 'none', border: 'none', color: '#e00', fontSize: 18, cursor: 'pointer' }}
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
