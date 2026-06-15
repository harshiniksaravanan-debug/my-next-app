'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Item {
  _id: string;
  name: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch(`${API_URL}/api/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await fetch(`${API_URL}/api/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        setEditingId(null);
      } else {
        await fetch(`${API_URL}/api/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
      }
      setName('');
      setDescription('');
      fetchItems();
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  }

  async function toggleComplete(item: Item) {
    await fetch(`${API_URL}/api/items/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !item.completed }),
    });
    fetchItems();
  }

  async function deleteItem(id: string) {
    await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
    fetchItems();
  }

  function editItem(item: Item) {
    setName(item.name);
    setDescription(item.description);
    setEditingId(item._id);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Items Manager
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingId ? 'Update Item' : 'Add Item'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setName(''); setDescription(''); }}
              className="w-full mt-2 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </form>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">No items yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item._id}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <div>
                    <span className={`text-gray-900 font-medium ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editItem(item)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
