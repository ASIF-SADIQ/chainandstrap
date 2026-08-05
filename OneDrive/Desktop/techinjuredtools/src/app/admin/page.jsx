"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserPlus, Users, Edit2, Save, Calendar, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create User Form State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newCredits, setNewCredits] = useState(50);
  const [newValidityDays, setNewValidityDays] = useState(30);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editCredits, setEditCredits] = useState(0);
  const [editExpireDate, setEditExpireDate] = useState("");

  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setSessionToken(session.access_token);
      
      // Fetch profile to check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
        
      if (!profile || !profile.is_admin) {
        router.push("/dashboard");
        return;
      }
      
      setIsAdmin(true);
      fetchUsers(session.access_token);
    };
    checkAdmin();
  }, [router]);

  const fetchUsers = async (token) => {
    try {
      setFetchError(null);
      const currentToken = token || sessionToken;
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      } else {
        setFetchError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setFetchError(err.message);
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          username: newUsername,
          credits: newCredits,
          validityDays: newValidityDays
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setCreateMsg("User created successfully with timeline!");
      setNewEmail("");
      setNewPassword("");
      setNewUsername("");
      setNewCredits(50);
      setNewValidityDays(30);
      fetchUsers(); // Refresh list
    } catch (err) {
      setCreateMsg(`Error: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditCredits(user.credits);
    if (user.credits_expire_at) {
      const d = new Date(user.credits_expire_at);
      const dateStr = d.toISOString().split('T')[0];
      setEditExpireDate(dateStr);
    } else {
      const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setEditExpireDate(d.toISOString().split('T')[0]);
    }
  };

  const saveCredits = async (id) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ 
          id, 
          credits: editCredits,
          expireAtDate: editExpireDate 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        if (data.warning) {
          alert(data.message);
        }
        setEditingId(null);
        fetchUsers(); // Refresh list
      } else {
        alert("Failed to update credits: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to update credits: " + err.message);
    }
  };

  const getExpiryStatus = (expireAtStr) => {
    if (!expireAtStr) return { label: 'No limit', color: 'var(--muted-foreground)' };
    const expireDate = new Date(expireAtStr);
    const now = new Date();
    const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { label: 'Expired', color: '#ef4444', days: 0 };
    }
    return { label: `${diffDays}d remaining`, color: '#22c55e', days: diffDays };
  };

  if (!mounted) return null;

  if (loading) {
    return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}} suppressHydrationWarning><div className="spinner"></div></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="app-container" suppressHydrationWarning>
      <header className="studio-header">
        <div className="brand" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <ShieldCheck className="text-primary" />
          Admin Control Center
        </div>
        <button onClick={() => router.push("/dashboard")} className="btn btn-secondary">
          Back to Studio
        </button>
      </header>

      <main className="workspace" style={{ gridTemplateColumns: '350px 1fr' }}>
        
        {/* Left Panel: Create User */}
        <aside className="panel">
          <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <UserPlus size={20}/> Create Client
          </h2>
          
          <form onSubmit={handleCreateUser}>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label className="dropzone-label">Email</label>
              <input 
                type="email" 
                className="text-input" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label className="dropzone-label">Password</label>
              <input 
                type="text" 
                className="text-input" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label className="dropzone-label">Username</label>
              <input 
                type="text" 
                className="text-input" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label className="dropzone-label">Initial Credits</label>
              <input 
                type="number" 
                className="text-input" 
                value={newCredits} 
                onChange={e => setNewCredits(Number(e.target.value))} 
                required 
                min={0}
              />
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label className="dropzone-label">Credit Timeline (Validity)</label>
              <select 
                className="text-input" 
                value={newValidityDays} 
                onChange={e => setNewValidityDays(Number(e.target.value))}
                style={{ background: 'var(--background)' }}
              >
                <option value={30}>30 Days (1 Month)</option>
                <option value={60}>60 Days (2 Months)</option>
                <option value={90}>90 Days (3 Months)</option>
                <option value={15}>15 Days</option>
                <option value={7}>7 Days</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={createLoading}>
              {createLoading ? "Creating..." : "Generate Account"}
            </button>
            
            {createMsg && (
              <div style={{marginTop: '1rem', fontSize: '0.875rem', color: createMsg.includes('Error') ? 'var(--destructive)' : 'var(--success)'}}>
                {createMsg}
              </div>
            )}
          </form>
        </aside>

        {/* Right Panel: Manage Users */}
        <section className="panel" style={{ overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Users size={20}/> Client Database
            </h2>

            {/* Quick Stats Summary */}
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Total Clients: </span>
                <strong style={{ color: 'white' }}>{users.length}</strong>
              </div>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Total Remaining Credits: </span>
                <strong style={{ color: 'var(--primary)' }}>
                  {users.reduce((acc, u) => acc + (u.credits || 0), 0)} Credits
                </strong>
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  <th style={{ padding: '0.75rem' }}>Username</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem' }}>Admin?</th>
                  <th style={{ padding: '0.75rem' }}>Remaining Credits</th>
                  <th style={{ padding: '0.75rem' }}>Timeline / Expiry</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const status = getExpiryStatus(user.credits_expire_at);
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>{user.username}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--muted-foreground)' }}>{user.email || 'N/A'}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>{user.id}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {user.is_admin ? <span style={{color: 'var(--primary)', fontWeight: 600}}>Yes</span> : 'No'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {editingId === user.id ? (
                          <input 
                            type="number" 
                            className="text-input" 
                            style={{ width: '90px', padding: '0.25rem 0.5rem' }}
                            value={editCredits}
                            onChange={e => setEditCredits(Number(e.target.value))}
                          />
                        ) : (
                          <span style={{ 
                            fontWeight: 700, 
                            padding: '0.25rem 0.65rem', 
                            borderRadius: '999px', 
                            fontSize: '0.8rem',
                            background: user.credits > 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                            color: user.credits > 0 ? '#22c55e' : '#ef4444',
                            border: user.credits > 0 ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                            display: 'inline-block'
                          }}>
                            {user.credits} Credits
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {editingId === user.id ? (
                          <input 
                            type="date" 
                            className="text-input" 
                            style={{ width: '135px', padding: '0.25rem 0.4rem', background: 'var(--background)', fontSize: '0.75rem', color: 'white' }}
                            value={editExpireDate}
                            onChange={e => setEditExpireDate(e.target.value)}
                          />
                        ) : (
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.8rem', color: status.color, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={12} /> {status.label}
                            </div>
                            {user.credits_expire_at && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                Exp: {new Date(user.credits_expire_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {editingId === user.id ? (
                          <button onClick={() => saveCredits(user.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>
                            <Save size={16} />
                          </button>
                        ) : (
                          <button onClick={() => startEditing(user)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {fetchError && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--destructive)' }}>
                      Error: {fetchError}
                    </td>
                  </tr>
                )}
                {!fetchError && users.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                      No clients found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
