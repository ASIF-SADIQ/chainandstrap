import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, Pause, Package, Clock, CheckCircle, Settings, AlertTriangle, List, Users, ShoppingCart, Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';

const API_BASE = 'http://137.184.102.82:5000/api'; // Aapke Droplet ka IP

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'settings', 'logs'
  const [stats, setStats] = useState({ total: 0, pending: 0, posted: 0 });
  
  // Inventory State
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  
  // Settings State
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ username: '', access_token: '', board_id: '' });
  const [showTokens, setShowTokens] = useState({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);

  // Logs State
  const [logs, setLogs] = useState([]);

  // Users State
  const [users, setUsers] = useState([]);
  const ADMIN_TOKEN = localStorage.getItem('cs_admin_token') || '';

  // Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [newProduct, setNewProduct] = useState({
    Title: '',
    vendor: '',
    Handle: '',
    'Variant Price': '',
    'Image Src': '',
    'Body (HTML)': '',
    status: 'pending'
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'inventory') fetchProducts();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, search]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data.stats);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products?search=${search}`);
      setProducts(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/settings`);
      if (res.data.settings) {
        setAccounts(res.data.settings.accounts || []);
        setIsAutomationRunning(res.data.settings.automationRunning);
      }
    } catch (err) { console.error(err); }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/logs`);
      setLogs(res.data.logs);
    } catch (err) { console.error(err); }
  };

  const toggleAutomation = async () => {
    try {
      const newState = !isAutomationRunning;
      await axios.post(`${API_BASE}/settings`, { automationRunning: newState });
      setIsAutomationRunning(newState);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      // NOTE: Pass your admin JWT token here
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Users fetch failed - Make sure admin token is set:', err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Orders fetch failed:', err.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      // Refresh orders
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err.message);
      alert('Failed to update status');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.Title || !newProduct.Handle || !newProduct['Variant Price']) {
      alert('Title, Handle, and Price are required.');
      return;
    }

    setProductSaving(true);
    try {
      await axios.post(`${API_BASE}/products`, newProduct, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      alert('Product added successfully!');
      setShowAddModal(false);
      setNewProduct({
        Title: '',
        vendor: '',
        Handle: '',
        'Variant Price': '',
        'Image Src': '',
        'Body (HTML)': '',
        status: 'pending'
      });
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add product');
    } finally {
      setProductSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Anti-Gravity Engine</h1>
            <p className="text-gray-500 mt-1">Master Control Panel for Pinterest Automation</p>
          </div>
          <button 
            onClick={toggleAutomation}
            className={`flex items-center px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md ${
              isAutomationRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isAutomationRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isAutomationRunning ? 'Halt Engine' : 'Ignite Engine'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-100 p-4 rounded-lg mr-4"><Package className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Total Database</p>
              <h2 className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-yellow-100 p-4 rounded-lg mr-4"><Clock className="text-yellow-600" /></div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Pending Bags</p>
              <h2 className="text-2xl font-bold text-gray-900">{stats.pending.toLocaleString()}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-green-100 p-4 rounded-lg mr-4"><CheckCircle className="text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Successfully Posted</p>
              <h2 className="text-2xl font-bold text-gray-900">{stats.posted.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center px-6 py-3 font-semibold whitespace-nowrap ${activeTab === 'inventory' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}><List className="w-4 h-4 mr-2"/> Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center px-6 py-3 font-semibold whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}><ShoppingCart className="w-4 h-4 mr-2"/> Orders</button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center px-6 py-3 font-semibold whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}><Settings className="w-4 h-4 mr-2"/> API Settings</button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center px-6 py-3 font-semibold whitespace-nowrap ${activeTab === 'logs' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}><AlertTriangle className="w-4 h-4 mr-2"/> Error Logs</button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center px-6 py-3 font-semibold whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}><Users className="w-4 h-4 mr-2"/> Customers</button>
        </div>

        {/* Tab Content: Inventory */}
        {activeTab === 'inventory' && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center flex-1 mr-4">
                <Search className="text-gray-400 mr-3 animate-pulse" />
                <input type="text" placeholder="Search any bag by title..." className="w-full outline-none text-gray-700" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-md cursor-pointer select-none active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="p-4 border-b">Image</th>
                  <th className="p-4 border-b">Title</th>
                  <th className="p-4 border-b">Price</th>
                  <th className="p-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-4"><img src={p['Image Src']} alt="Bag" className="w-12 h-12 object-cover rounded-md" /></td>
                    <td className="p-4 text-gray-900 font-medium">{p.Title}</td>
                    <td className="p-4">${p['Variant Price']}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'posted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-1">Pinterest Account Manager</h2>
              <p className="text-gray-500 text-sm">Add up to 7 Pinterest accounts. The engine rotates between them automatically to avoid bans.</p>
            </div>

            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">📌 Pin Preview (How each post will look)</h3>
              <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 space-y-1 font-mono">
                <p><span className="font-bold">Title:</span> [Product Name]</p>
                <p><span className="font-bold">Description:</span></p>
                <p className="pl-4 text-gray-600">✨ [Product Title] | $[Price]</p>
                <p className="pl-4 text-gray-600">Elevate your style with this premium piece from Chain & Straps. Click to shop now!</p>
                <p className="pl-4 text-blue-500">#LuxuryFashion #DesignerBags #OOTD #StyleInspo #[VendorName] #ChainAndStraps</p>
                <p><span className="font-bold">Link:</span> <span className="text-blue-600">chainandstrap.store/product/[handle]</span></p>
              </div>
            </div>

            {accounts.length > 0 && (
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Configured Accounts ({accounts.length})</h3>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="p-4 border-b">#</th>
                      <th className="p-4 border-b">Username</th>
                      <th className="p-4 border-b">Access Token</th>
                      <th className="p-4 border-b">Board ID</th>
                      <th className="p-4 border-b">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50 text-sm">
                        <td className="p-4 text-gray-400">{i + 1}</td>
                        <td className="p-4 font-semibold text-gray-900">{acc.username}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-gray-500">
                              {showTokens[i] ? acc.access_token : `${(acc.access_token || '').slice(0, 8)}••••••••`}
                            </span>
                            <button onClick={() => setShowTokens(p => ({...p, [i]: !p[i]}))} className="text-gray-400 hover:text-gray-700">
                              {showTokens[i] ? <EyeOff size={14}/> : <Eye size={14}/>}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-gray-500">{acc.board_id}</td>
                        <td className="p-4">
                          <button
                            onClick={async () => {
                              const updated = accounts.filter((_, idx) => idx !== i);
                              setSettingsSaving(true);
                              await axios.post(`${API_BASE}/settings`, { accounts: updated });
                              setAccounts(updated);
                              setSettingsSaving(false);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center"><Plus size={16} className="mr-2"/>Add New Pinterest Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pinterest Username</label>
                  <input
                    type="text"
                    placeholder="e.g. chainandstraps"
                    value={newAccount.username}
                    onChange={e => setNewAccount(p => ({...p, username: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Access Token</label>
                  <input
                    type="password"
                    placeholder="Pinterest OAuth Token"
                    value={newAccount.access_token}
                    onChange={e => setNewAccount(p => ({...p, access_token: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Board ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789"
                    value={newAccount.board_id}
                    onChange={e => setNewAccount(p => ({...p, board_id: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newAccount.username || !newAccount.access_token || !newAccount.board_id) {
                    alert('Please fill all 3 fields.');
                    return;
                  }
                  setSettingsSaving(true);
                  const updated = [...accounts, newAccount];
                  await axios.post(`${API_BASE}/settings`, { accounts: updated });
                  setAccounts(updated);
                  setNewAccount({ username: '', access_token: '', board_id: '' });
                  setSettingsSaving(false);
                }}
                disabled={settingsSaving}
                className="flex items-center space-x-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-semibold"
              >
                <Save size={16}/>
                <span>{settingsSaving ? 'Saving...' : 'Save Account'}</span>
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-800 mb-2">📋 How to Get Your Pinterest Access Token</h3>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                <li>Go to <strong>developers.pinterest.com</strong> and log in with your Pinterest account.</li>
                <li>Click <strong>"My Apps"</strong> and create a New App.</li>
                <li>Under permissions, enable <strong>"Pins: Read & Write"</strong> and <strong>"Boards: Read"</strong>.</li>
                <li>Generate an <strong>Access Token</strong> from the App page and paste it above.</li>
                <li>To find your <strong>Board ID</strong>: open a Pinterest board, the number in the URL is the ID (e.g. pinterest.com/user/<strong>123456789</strong>/).</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab Content: Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <h2 className="text-xl font-bold mb-4 px-2">Automation Activity</h2>
            {logs.length === 0 ? <p className="text-gray-500 px-2">No errors logged yet. System is healthy!</p> : (
               <ul>
                 {logs.map(log => (
                   <li key={log._id} className="p-3 border-b flex items-start text-sm">
                     <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                     <div>
                        <p className="font-semibold text-gray-900">{log.productHandle}</p>
                        <p className="text-gray-600">{log.message}</p>
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Registered Customers ({users.length})</h2>
              <button onClick={fetchUsers} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Refresh</button>
            </div>
            {users.length === 0 ? (
              <p className="p-6 text-gray-500">No registered users yet. Set your admin JWT token in localStorage as 'cs_admin_token'.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                    <th className="p-4 border-b">#</th>
                    <th className="p-4 border-b">Name</th>
                    <th className="p-4 border-b">Email</th>
                    <th className="p-4 border-b">Phone</th>
                    <th className="p-4 border-b">Role</th>
                    <th className="p-4 border-b">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-4 text-gray-400">{i + 1}</td>
                      <td className="p-4 font-semibold text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-700">{u.email}</td>
                      <td className="p-4 text-gray-500">{u.phone || '—'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Manage Orders ({orders.length})</h2>
              <button onClick={fetchOrders} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Refresh</button>
            </div>
            {orders.length === 0 ? (
              <p className="p-6 text-gray-500">No orders found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                    <th className="p-4 border-b">Order ID</th>
                    <th className="p-4 border-b">Date</th>
                    <th className="p-4 border-b">Customer</th>
                    <th className="p-4 border-b">Total</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-4 font-mono text-xs text-gray-500">{o._id.substring(o._id.length - 8).toUpperCase()}</td>
                      <td className="p-4 text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{o.shippingAddress?.firstName || o.user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{o.shippingAddress?.email || o.user?.email}</p>
                      </td>
                      <td className="p-4 font-bold text-gray-900">${o.totalAmount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          o.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                          o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-black focus:border-black block w-full p-2"
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8 animate-scale-up">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Package className="text-black w-5 h-5" />
                  <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer p-1"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Louis Vuitton OnTheGo PM Monogram"
                      value={newProduct.Title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const handle = title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                        setNewProduct(prev => ({
                          ...prev,
                          Title: title,
                          Handle: handle
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Handle */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">URL Handle (Slug) *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. louis-vuitton-onthego-pm"
                      value={newProduct.Handle}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, Handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Vendor / Brand */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Brand / Vendor</label>
                    <input 
                      type="text"
                      placeholder="e.g. Louis Vuitton"
                      value={newProduct.vendor}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, vendor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Variant Price */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        placeholder="250.00"
                        value={newProduct['Variant Price']}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, 'Variant Price': e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pinterest Bot Status</label>
                    <select
                      value={newProduct.status}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="pending">Pending (Will be posted by bot)</option>
                      <option value="posted">Posted (Skip bot posting)</option>
                    </select>
                  </div>

                  {/* Image Src */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image URL</label>
                    <input 
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newProduct['Image Src']}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, 'Image Src': e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    {newProduct['Image Src'] && (
                      <div className="mt-2 relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                          src={newProduct['Image Src']} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100?text=Invalid+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Description / Body HTML */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (HTML / Text)</label>
                    <textarea 
                      rows="4"
                      placeholder="Product description..."
                      value={newProduct['Body (HTML)']}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, 'Body (HTML)': e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black font-sans"
                    ></textarea>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3 bg-white sticky bottom-0">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={productSaving}
                    className="flex items-center justify-center bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {productSaving ? (
                      <>
                        <Clock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="-ml-1 mr-2 h-4 w-4" />
                        Add Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
