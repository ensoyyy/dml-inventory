import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Check, XCircle, CornerDownLeft, LogOut } from 'lucide-react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SignUp from './SignUp';


function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        onLogin(data);
        navigate(data.role === 'admin' ? '/admin' : '/user');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <img src="University-of-San-Carlos-Logo.png" alt="University of San Carlos Logo" className="absolute top-2 left-6 w-64 h-32 object-contain" />
      <img src="Cpelogo.png" alt="Computer Engineering Logo" className="absolute top-6 left-56 w-48 h-24 object-contain" />
      <h1 className="text-6xl font-extrabold text-blue-500 drop-shadow-lg leading-[1.2] py-6">
        Digital Microprocessors Laboratory
      </h1>
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <img src="University-of-San-Carlos-Logo.png" alt="University of San Carlos Logo" className="absolute top-2 left-6 w-64 h-32 object-contain" />
      <img src="Cpelogo.png" alt="Computer Engineering Logo" className="absolute top-6 left-56 w-48 h-24 object-contain" />
      <h1 className="text-6xl font-extrabold mt-0 mb-16 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
        Digital Microprocessors Laboratory
      </h1>
      <h1 className="text-4xl font-extrabold mb-8 mt-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
        Select Your Role
      </h1>
      <div className="space-x-4">
        <button
          className="px-6 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 text-white rounded shadow-md hover:brightness-110 transition-all duration-200"
          onClick={() => navigate('/user')}
        >
          Student
        </button>
        <button
          className="px-6 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 text-white rounded shadow-md hover:brightness-110 transition-all duration-200"
          onClick={() => navigate('/admin')}
        >
          Lab Manager
        </button>
      </div>
    </div>
  );
}

function UserDashboard({ items, borrowRequests, onBorrowRequest, user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [notification, setNotification] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Show alerts for due/overdue items for this student
    if (!user.name) return;
    const today = new Date();
    const dueAlerts = borrowRequests
      .filter(r => r.studentName === user.name && r.status === 'approved')
      .map(r => {
        const due = new Date(r.dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `Item "${r.itemName}" is overdue!`;
        if (diff === 0) return `Item "${r.itemName}" is due today!`;
        if (diff <= 2) return `Item "${r.itemName}" is due in ${diff} day(s).`;
        return null;
      })
      .filter(Boolean);
    setAlerts(dueAlerts);
  }, [borrowRequests, user.name]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequest = () => {
    if (!dueDate) {
      setNotification('Please enter your due date.');
      return;
    }
    if (!quantity || quantity < 1 || quantity > (selectedItem?.quantity || 1)) {
      setNotification('Please enter a valid quantity.');
      return;
    }
    onBorrowRequest(selectedItem, user.name, dueDate, quantity);
    setNotification('Request submitted!');
    setSelectedItem(null);
    setDueDate('');
    setQuantity(1);
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 min-h-screen">
    {/* Header Row - improved layout */}
    <div className="flex items-center justify-between mb-8 bg-[#4296f5] px-8 py-4 rounded-t-lg">
      <div className="flex flex-col items-start space-y-2">
        <div className="text-3xl font-extrabold text-white leading-tight">Student</div>
        <div className="text-3xl font-extrabold text-white leading-tight">Dashboard</div>
        <div className="flex items-center space-x-4 mt-2">
          <button
            onClick={onLogout}
            className="flex items-center px-6 py-2 bg-red-500 text-white rounded-md shadow-md text-lg font-semibold hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut size={22} className="mr-2" />
            Logout
          </button>
          <span className="text-white font-semibold text-lg">Hi, {user.name}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4 ml-8">
        <img src="CPElogo.png" alt="CPE Logo" className="w-16 h-16 object-contain" />
        <div className="text-right">
          <div className="text-white text-base font-semibold leading-tight whitespace-nowrap">University of San Carlos | Department of</div>
          <div className="text-white text-2xl font-extrabold leading-tight whitespace-nowrap">COMPUTER ENGINEERING</div>
        </div>
      </div>
    </div>
      {alerts.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          {alerts.map((alert, i) => (
            <div key={i}>{alert}</div>
          ))}
        </div>
      )}
      <div className="mb-4 flex items-center">
        <Search className="mr-2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search inventory..."
          className="px-3 py-2 border border-gray-300 rounded-md w-full max-w-xs"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <table className="min-w-full bg-white rounded-lg overflow-hidden mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredItems.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.category}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.location}</td>
              <td className="px-4 py-3 text-sm">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setSelectedItem(item)}
                  disabled={item.quantity === 0}
                >
                  Request to Borrow
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Request to Borrow: {selectedItem.name}</h3>
            {/* Removed Your Name input, always use user.name */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
              />
              <div className="text-xs text-gray-500 mt-1">Available: {selectedItem?.quantity || 0}</div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => { setSelectedItem(null); setQuantity(1); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleRequest}
              >
                Submit Request
              </button>
            </div>
            {notification && <div className="mt-2 text-blue-600">{notification}</div>}
          </div>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-white">Your Borrow Requests</h3>
        <ul className="space-y-2">
          {borrowRequests.filter(r => r.studentName === user.name).map(req => (
            <li key={req.id} className="p-3 bg-gray-100 rounded">
              <span className="font-medium">{req.itemName}</span> - Due: {req.dueDate} - Status: <span className="capitalize">{req.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AdminDashboard({ items, setItems, borrowRequests, setBorrowRequests, user, onLogout, handleUpdateBorrowRequest }) {
  const [notification, setNotification] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    location: '',
    lastChecked: new Date().toISOString().split('T')[0]
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const categories = ['IC', 'Equipment', 'Device', 'Other'];

  useEffect(() => {
    // Show alerts for due/overdue items for all students
    const today = new Date();
    const dueAlerts = borrowRequests
      .filter(r => r.status === 'approved')
      .map(r => {
        const due = new Date(r.dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `Item "${r.itemName}" (for ${r.studentName}) is overdue!`;
        if (diff === 0) return `Item "${r.itemName}" (for ${r.studentName}) is due today!`;
        if (diff <= 2) return `Item "${r.itemName}" (for ${r.studentName}) is due in ${diff} day(s).`;
        return null;
      })
      .filter(Boolean);
    setAlerts(dueAlerts);
  }, [borrowRequests]);

  const handleApprove = (id) => {
    handleUpdateBorrowRequest(id, 'approved');
    setNotification('Request approved!');
    setTimeout(() => setNotification(''), 2000);
  };
  const handleReject = (id) => {
    handleUpdateBorrowRequest(id, 'rejected');
    setNotification('Request rejected!');
    setTimeout(() => setNotification(''), 2000);
  };
  const handleReturn = (id) => {
    handleUpdateBorrowRequest(id, 'returned');
    setNotification('Item marked as returned!');
    setTimeout(() => setNotification(''), 2000);
  };

  // Inventory management handlers
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || newItem.quantity <= 0) {
      setNotification('Please fill out all required fields.');
      return;
    }
    fetch('http://localhost:5000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then(res => res.json())
      .then(addedItem => {
        setItems(prev => [...prev, addedItem]);
        setNewItem({ name: '', category: '', quantity: 0, location: '', lastChecked: new Date().toISOString().split('T')[0] });
        setShowAddForm(false);
        setNotification('Item added!');
        setTimeout(() => setNotification(''), 2000);
      })
      .catch(() => setNotification('Failed to add item.'));
  };
  const handleEditItem = (id, field, value) => {
    if (editingId === id) {
      setEditItem(prev => ({ ...prev, [field]: value }));
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleSaveEdit = (id) => {
    // Always convert lastChecked to YYYY-MM-DD before sending
    const itemToSave = { ...editItem };
    if (itemToSave.lastChecked && itemToSave.lastChecked.includes('T')) {
      itemToSave.lastChecked = itemToSave.lastChecked.split('T')[0];
    }
    fetch(`http://localhost:5000/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToSave),
    })
      .then(res => res.json())
      .then(() => {
        setEditingId(null);
        setEditItem(null);
        setNotification('Item updated!');
        setTimeout(() => setNotification(''), 2000);
      })
      .catch(() => setNotification('Failed to update item.'));
  };
  const handleDeleteItem = (id) => {
    fetch(`http://localhost:5000/api/items/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(() => {
        setItems(prev => prev.filter(item => item.id !== id));
        setNotification('Item deleted!');
        setTimeout(() => setNotification(''), 2000);
      })
      .catch(() => setNotification('Failed to delete item.'));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 min-h-screen">
      {/* Header Row - improved layout */}
      <div className="flex items-center justify-between mb-8 bg-[#4296f5] px-8 py-4 rounded-t-lg">
        <div className="flex flex-col items-start space-y-2">
          <div className="text-3xl font-extrabold text-white leading-tight">Lab Manager</div>
          <div className="text-3xl font-extrabold text-white leading-tight">Dashboard</div>
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={onLogout}
              className="flex items-center px-6 py-2 bg-red-500 text-white rounded-md shadow-md text-lg font-semibold hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut size={22} className="mr-2" />
              Logout
            </button>
            <span className="text-white font-semibold text-lg">Hi, {user.name}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 ml-8">
          <img src="CPElogo.png" alt="CPE Logo" className="w-16 h-16 object-contain" />
          <div className="text-right">
            <div className="text-white text-base font-semibold leading-tight whitespace-nowrap">University of San Carlos | Department of</div>
            <div className="text-white text-2xl font-extrabold leading-tight whitespace-nowrap">COMPUTER ENGINEERING</div>
          </div>
        </div>
      </div>
      {notification && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{notification}</div>}
      {/* Inventory Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Inventory Management</h3>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
            {showAddForm ? 'Cancel' : 'Add New Item'}
          </button>
        </div>
        {showAddForm && (
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newItem.quantity}
                  onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newItem.location}
                  onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Checked</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newItem.lastChecked}
                  onChange={e => setNewItem({ ...newItem, lastChecked: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddItem}
              >
                Add Item
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last Checked</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        value={editingId === item.id ? editItem?.name : item.name}
                        onChange={e => handleEditItem(item.id, 'name', e.target.value)}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {editingId === item.id ? (
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        value={editingId === item.id ? editItem?.category : item.category}
                        onChange={e => handleEditItem(item.id, 'category', e.target.value)}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      item.category
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        value={editingId === item.id ? editItem?.quantity : item.quantity}
                        onChange={e => handleEditItem(item.id, 'quantity', e.target.value)}
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        value={editingId === item.id ? editItem?.location : item.location}
                        onChange={e => handleEditItem(item.id, 'location', e.target.value)}
                      />
                    ) : (
                      item.location
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {editingId === item.id ? (
                      <input
                        type="date"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        value={editingId === item.id ? editItem?.lastChecked : item.lastChecked}
                        onChange={e => handleEditItem(item.id, 'lastChecked', e.target.value)}
                      />
                    ) : (
                      new Date(item.lastChecked).toLocaleDateString()
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === item.id ? (
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-green-600 hover:text-green-800"
                          onClick={() => handleSaveEdit(item.id)}
                          title="Save"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:text-gray-800"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-blue-600 hover:text-blue-800"
                          onClick={() => startEdit(item)}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Borrow Requests Section moved below inventory management */}
      <h3 className="text-2xl font-bold mb-4 text-white">Borrow Requests</h3>
      <ul className="space-y-2 mb-8">
        {borrowRequests.length === 0 && <li className="text-gray-500">No requests yet.</li>}
        {borrowRequests.map(req => (
          <li key={req.id} className="p-3 bg-white rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-medium">{req.itemName}</span> for <span className="font-medium">{req.studentName}</span> - Due: {req.dueDate} - Status: <span className="capitalize">{req.status}</span>
            </div>
            <div className="flex space-x-2 mt-2 md:mt-0">
              {req.status === 'pending' && (
                <>
                  <button className="p-1 text-green-600 hover:text-green-800" title="Approve" onClick={() => handleApprove(req.id)}><Check size={18} /></button>
                  <button className="p-1 text-red-600 hover:text-red-800" title="Reject" onClick={() => handleReject(req.id)}><XCircle size={18} /></button>
                </>
              )}
              {req.status === 'approved' && (
                <button className="p-1 text-blue-600 hover:text-blue-800" title="Mark as Returned" onClick={() => handleReturn(req.id)}><CornerDownLeft size={18} /></button>
              )}
              {req.status === 'returned' && (
                <span className="text-green-700">Returned</span>
              )}
              {req.status === 'rejected' && (
                <span className="text-red-700">Rejected</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {/* Alerts moved below borrow requests */}
      {alerts.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          {alerts.map((alert, i) => (
            <div key={i}>{alert}</div>
          ))}
        </div>
      )}
      {/* Inventory Summary Section */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4 text-white">Inventory Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow flex flex-col items-center">
            <span className="text-lg font-semibold text-blue-700 mb-2">Total Items</span>
            <span className="text-4xl font-bold text-blue-600">{items.length}</span>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow flex flex-col items-center">
            <span className="text-lg font-semibold text-green-700 mb-2">Total Quantity</span>
            <span className="text-4xl font-bold text-green-600">{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Fetch items from backend API
    fetch('http://localhost:5000/api/items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to fetch items:', err));

    // Fetch borrow requests from backend API
    fetch('http://localhost:5000/api/borrow-requests')
      .then(res => res.json())
      .then(data => setBorrowRequests(data))
      .catch(err => console.error('Failed to fetch borrow requests:', err));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null); // Clear the user state
    localStorage.removeItem('user'); // Remove user data from localStorage
    window.location.href = '/'; // Redirect to the login page
  };

  const handleBorrowRequest = (item, studentName, dueDate, quantity) => {
    if (!item || !studentName || !dueDate || !quantity) {
      console.error('Missing required fields for borrow request');
      return;
    }

    fetch('http://localhost:5000/api/borrow-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, studentName, dueDate, quantity }),
    })
      .then(res => res.json())
      .then(newRequest => {
        // After submitting, fetch the updated list from the backend to ensure admin sees it
        fetch('http://localhost:5000/api/borrow-requests')
          .then(res => res.json())
          .then(data => setBorrowRequests(data))
          .catch(err => console.error('Failed to fetch borrow requests:', err));
      })
      .catch(err => console.error('Failed to create borrow request:', err));
  };

  const handleUpdateBorrowRequest = (id, status) => {
    fetch(`http://localhost:5000/api/borrow-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(() => {
        setBorrowRequests(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
      })
      .catch(err => console.error('Failed to update borrow request status:', err));
  };

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} /> : <Login onLogin={handleLogin} />} />
      <Route path="/user" element={user?.role === 'student' ? <UserDashboard items={items} borrowRequests={borrowRequests} onBorrowRequest={handleBorrowRequest} user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard items={items} setItems={setItems} borrowRequests={borrowRequests} setBorrowRequests={setBorrowRequests} user={user} onLogout={handleLogout} handleUpdateBorrowRequest={handleUpdateBorrowRequest} /> : <Navigate to="/" />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
