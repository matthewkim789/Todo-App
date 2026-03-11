import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const { getToken } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  useEffect(() => {
    authFetch(`${API}/todos`)
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const addTodo = async () => {
    const text = input.trim();
    if (!text) return;
    const res = await authFetch(`${API}/todos`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    const todo = await res.json();
    setTodos(prev => [...prev, todo]);
    setInput('');
  };

  const toggleTodo = async (id: number) => {
    const res = await authFetch(`${API}/todos/${id}`, { method: 'PATCH' });
    const updated = await res.json();
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id: number) => {
    await authFetch(`${API}/todos/${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
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

      {todos.length === 0 && <p style={{ color: '#999' }}>No todos yet. Add one above!</p>}

      <div style={{ display: 'flex', gap: 8, marginTop: 24, textAlign: 'left' }}>
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
    </>
  );
}

function App() {
  return (
    <div style={{ maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>My Todo App</h1>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <SignedOut>
        <p style={{ color: '#666' }}>Sign in to manage your todos.</p>
        <SignInButton mode="modal">
          <button style={{ padding: '10px 24px', fontSize: 16, borderRadius: 4, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <TodoApp />
      </SignedIn>
    </div>
  );
}

export default App;
