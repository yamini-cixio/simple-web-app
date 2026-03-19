import { useState, useEffect } from 'react';

const API_URL = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTodos([data, ...todos]);
      setNewTodo('');
      setError('');
    } catch (err) {
      setError('Failed to add todo: ' + err.message);
    }
  }

  async function toggleTodo(id, completed) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setError('Failed to update todo: ' + err.message);
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      setError('Failed to delete todo: ' + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Todo App</h1>
      <p style={{ color: '#666' }}>Node.js + React + MongoDB</p>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={addTodo} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          style={{ flex: 1, padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', fontSize: 16, borderRadius: 6, border: 'none', background: '#4CAF50', color: '#fff', cursor: 'pointer' }}
        >
          Add
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : todos.length === 0 ? (
        <p style={{ color: '#999' }}>No todos yet. Add one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderBottom: '1px solid #eee',
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo._id, todo.completed)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : '#333',
                }}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo._id)}
                style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
