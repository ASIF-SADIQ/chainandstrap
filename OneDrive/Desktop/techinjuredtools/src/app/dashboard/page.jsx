"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Coins, LogOut, Lock, Unlock, Clock, Video, Music, ArrowLeft, 
  Sparkles, LayoutGrid, ShieldCheck, User, X, Mail, Calendar, ChevronDown 
} from "lucide-react";

const TOOLS = {
  "wan2.2": {
    id: "wan2.2",
    name: "Wan 2.2 Cinematic Video Studio",
    badge: "✨ Powered by Wan 2.2 Animate",
    description: "Transform static reference images into fluid, ultra-realistic character animations. Replace characters seamlessly with state-of-the-art holistic replication.",
    iframeUrl: "https://www.modelscope.cn/studios/Wan-AI/Wan2.2-Animate",
    marginTop: "-640px",
    height: "2500px",
    icon: Video,
    gradient: "linear-gradient(to right, #8b5cf6, #3b82f6)",
    color: "#8b5cf6",
    cardBg: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.2)",
    previewImg: "/hero-preview.png"
  },
  "musicbench": {
    id: "musicbench",
    name: "MusicBench AI Music Generator",
    badge: "🎵 Powered by MusicBench AI",
    description: "Generate high-fidelity AI music, original songs, soundscapes, and sound compositions directly from text descriptions.",
    iframeUrl: "https://www.modelscope.cn/studios/hicicada/MusicBench",
    marginTop: "-410px",
    height: "2200px",
    icon: Music,
    gradient: "linear-gradient(to right, #ec4899, #8b5cf6)",
    color: "#ec4899",
    cardBg: "rgba(236, 72, 153, 0.08)",
    borderColor: "rgba(236, 72, 153, 0.2)",
    previewImg: null
  }
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hasJoinedWA, setHasJoinedWA] = useState(true);
  const [credits, setCredits] = useState(0);
  const [creditsExpireAt, setCreditsExpireAt] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userId, setUserId] = useState(null); 
  const [sessionToken, setSessionToken] = useState(null);
  const router = useRouter();
  
  const [activeToolId, setActiveToolId] = useState("wan2.2");
  const [showStudio, setShowStudio] = useState(false);
  const [unlockingToolId, setUnlockingToolId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoinWA = () => {
    // Open the user's actual WhatsApp Group link
    window.open("https://chat.whatsapp.com/Ldn4FUEh8hrKihAWG0CVlo?s=sh&p=a&ilr=4", "_blank");
    
    // Auto-unlock after they click the link (simulating verification)
    setTimeout(() => {
      localStorage.setItem('whatsapp_joined', 'true');
      setHasJoinedWA(true);
    }, 2000);
  };

  const getExpirationInfo = (expireAtStr) => {
    if (!expireAtStr) return null;
    const expireDate = new Date(expireAtStr);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { isExpired: true, text: "Expired" };
    }
    return { isExpired: false, text: `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}` };
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }
        setUserId(session.user.id);
        setSessionToken(session.access_token);
        
        // Fetch complete user profile via backend API (bypasses RLS issues)
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();

        if (res.ok && data.user) {
          const u = data.user;
          setUserProfile(u);
          setIsAdmin(u.is_admin);
          setCredits(u.credits);
          setCreditsExpireAt(u.credits_expire_at);

          if (!u.is_admin && u.credits_expire_at) {
            const expInfo = getExpirationInfo(u.credits_expire_at);
            if (expInfo?.isExpired) {
              setErrorMsg("Your monthly credits have expired. Please contact admin via WhatsApp to top up.");
            }
          }

          if (!u.is_admin && typeof window !== 'undefined') {
            const waJoined = localStorage.getItem('whatsapp_joined');
            if (waJoined !== 'true') {
              setHasJoinedWA(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleUnlockStudio = async (toolId) => {
    if (!isAdmin) {
      const expInfo = getExpirationInfo(creditsExpireAt);
      if (expInfo?.isExpired || credits <= 0) {
        setErrorMsg("Insufficient or expired credits. Please contact admin via WhatsApp to top up.");
        return;
      }
    }
    
    setUnlockingToolId(toolId);
    setErrorMsg("");

    try {
      // Securely deduct credit via our Next.js API
      const res = await fetch('/api/v1/deduct-credit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (!isAdmin) {
          setCredits(data.remaining);
        }
        setActiveToolId(toolId);
        setIframeLoading(true);
        setShowStudio(true);
      } else {
        setErrorMsg(data.error || "Failed to unlock studio. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setUnlockingToolId(null);
    }
  };

  const expInfo = getExpirationInfo(creditsExpireAt);
  const activeTool = TOOLS[activeToolId];

  if (!mounted) return null;

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, var(--background) 100%)', color: 'white' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', borderTopColor: '#8b5cf6', borderWidth: '4px' }}></div>
        <h2 style={{ marginTop: '2rem', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '1px' }}>Authenticating Workspace...</h2>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Securely fetching your profile and credits.</p>
      </div>
    );
  }

  return (
    <div className="app-container" suppressHydrationWarning style={{ position: 'relative' }}>
      
      {/* WhatsApp Gate Modal */}
      {!hasJoinedWA && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '1.5rem',
            padding: '2.5rem', maxWidth: '450px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Sparkles size={30} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Action Required</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Welcome! To use these premium AI tools for free, you must first join our official WhatsApp Group.
            </p>
            <button 
              onClick={handleJoinWA}
              style={{
                width: '100%', padding: '1rem', background: '#22c55e', color: 'black', fontWeight: 700,
                borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
              }}
            >
              Join WhatsApp Group
            </button>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
              (Dashboard will unlock automatically after joining)
            </div>
          </div>
        </div>
      )}

      <header className="studio-header" style={{ opacity: hasJoinedWA ? 1 : 0.2, pointerEvents: hasJoinedWA ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="brand">Tech Injured Tools</div>
          {showStudio && (
            <button 
              onClick={() => setShowStudio(false)} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              <LayoutGrid size={15} /> All AI Tools
            </button>
          )}
        </div>

        <div className="flex items-center" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAdmin && (
            <button 
              onClick={() => router.push("/admin")} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.45rem 0.85rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}
            >
              <ShieldCheck size={16} className="text-primary" /> Admin Panel
            </button>
          )}

          <div className="credit-badge" style={{ padding: '0.45rem 0.85rem' }}>
            <Coins size={16} className="text-primary" />
            <span>{isAdmin ? `${credits} Credits (Admin)` : `${credits} Credits`}</span>
          </div>

          {!isAdmin && creditsExpireAt && (
            <div style={{
              fontSize: '0.78rem',
              color: expInfo?.isExpired ? '#ef4444' : 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255,255,255,0.05)',
              padding: '0.45rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              fontWeight: 500
            }}>
              <Clock size={13} style={{ color: expInfo?.isExpired ? '#ef4444' : 'var(--primary)' }} />
              <span>{expInfo?.text}</span>
            </div>
          )}

          {/* User Profile Button */}
          <button 
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: isAdmin ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'white'
            }}>
              {userProfile?.username ? userProfile.username[0].toUpperCase() : <User size={14} />}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile?.username || "Profile"}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* User Profile Dropdown Modal */}
      {showProfileModal && (
        <div style={{
          position: 'absolute',
          top: '4.25rem',
          right: '1.5rem',
          width: '330px',
          background: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User className="text-primary" size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>Account Profile</span>
            </div>
            <button 
              onClick={() => setShowProfileModal(false)}
              style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            
            {/* Username */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Username</div>
                <div style={{ fontWeight: 600, color: 'white' }}>{userProfile?.username || 'N/A'}</div>
              </div>
            </div>

            {/* Gmail / Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Gmail / Email</div>
                <div style={{ fontWeight: 600, color: 'white', wordBreak: 'break-all' }}>{userProfile?.email || 'N/A'}</div>
              </div>
            </div>

            {/* Remaining Credits */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Coins size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Remaining Credits</div>
                <div style={{ fontWeight: 700, color: credits > 0 ? '#22c55e' : '#ef4444' }}>
                  {isAdmin ? `${credits} Credits (Unlimited Admin)` : `${credits} Credits`}
                </div>
              </div>
            </div>

            {/* Credit Timeline / Expiry */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={16} style={{ color: '#eab308', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Credit Timeline / Expiry</div>
                <div style={{ fontWeight: 500, color: 'white' }}>
                  {isAdmin 
                    ? 'No Expiry (Super Admin)' 
                    : creditsExpireAt 
                      ? `${getExpirationInfo(creditsExpireAt)?.text} (${new Date(creditsExpireAt).toLocaleDateString()})` 
                      : 'No Expiry Set'}
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={16} style={{ color: isAdmin ? 'var(--primary)' : 'var(--muted-foreground)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Account Role</div>
                <div style={{ fontWeight: 600, color: isAdmin ? 'var(--primary)' : 'white' }}>
                  {isAdmin ? 'Super Admin' : 'Client Account'}
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isAdmin && (
              <button 
                onClick={() => { setShowProfileModal(false); router.push("/admin"); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              >
                <ShieldCheck size={15} className="text-primary" /> Open Admin Control Center
              </button>
            )}

            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <LogOut size={15} /> Logout Account
            </button>
          </div>
        </div>
      )}

      <main className="workspace" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {!showStudio ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%', padding: '3rem 2rem 5rem 2rem', textAlign: 'center', background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15), transparent 70%)', overflowY: 'auto' }}>
            
            {/* Header Section */}
            <div style={{ maxWidth: '850px', width: '100%', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <Sparkles size={16} /> AI Multi-Tool Studio Suite
              </div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Choose Your Next-Gen <br />
                <span style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Creation Tool</span>
              </h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto' }}>
                Select an AI studio below to launch. Each session consumes 1 Credit for unlimited generations during your active session.
              </p>
              
              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginTop: '1.5rem', fontSize: '0.95rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Modules Grid */}
            <div style={{ width: '100%', maxWidth: '1050px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', textAlign: 'left', marginBottom: '2.5rem' }}>
              
              {Object.values(TOOLS).map((tool) => {
                const IconComponent = tool.icon;
                const isUnlocking = unlockingToolId === tool.id;

                return (
                  <div 
                    key={tool.id}
                    style={{
                      background: 'rgba(24, 24, 27, 0.75)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '1.25rem',
                      padding: '2rem',
                      border: `1px solid ${tool.borderColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                      transition: 'transform 0.3s ease, border-color 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', background: tool.cardBg, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: tool.cardBg, color: tool.color, padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', border: `1px solid ${tool.borderColor}` }}>
                        <IconComponent size={14} />
                        {tool.badge}
                      </div>

                      <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                        {tool.name}
                      </h3>

                      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>
                        {tool.description}
                      </p>
                    </div>

                    <div>
                      <button 
                        onClick={() => handleUnlockStudio(tool.id)} 
                        disabled={unlockingToolId !== null || (!isAdmin && credits <= 0)}
                        className="btn btn-primary" 
                        style={{ 
                          width: '100%', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.6rem', 
                          padding: '1rem 1.5rem', 
                          fontSize: '1.05rem', 
                          borderRadius: '0.75rem', 
                          background: tool.gradient,
                          boxShadow: `0 0 25px ${tool.cardBg}`, 
                          transition: 'all 0.3s ease' 
                        }}
                      >
                        {isUnlocking ? (
                          <div className="spinner" style={{ width: '20px', height: '20px', margin: 0 }}></div>
                        ) : (
                          <>
                            <Unlock size={18} />
                            Launch Studio
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', marginLeft: '0.4rem' }}>{isAdmin ? 'Free (Admin)' : '1 Credit'}</span>
                          </>
                        )}
                      </button>

                      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                        <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', opacity: 0.7 }} />
                        Session active until refresh or close
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Illustration Preview Area */}
            <div style={{ width: '100%', maxWidth: '1050px', position: 'relative', borderRadius: '1rem', padding: '1rem', background: 'rgba(24, 24, 27, 0.5)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem', background: 'rgba(39, 39, 42, 0.5)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
              </div>
              <img 
                src="/hero-preview.png" 
                alt="Animation Studio Preview" 
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', marginTop: '2.5rem', filter: 'contrast(1.1) brightness(1.1)' }} 
              />
            </div>
            
          </div>
        ) : (
          <div style={{ width: '100%', height: '1400px', position: 'relative', overflow: 'hidden' }}>
            {iframeLoading && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="spinner" style={{ width: '60px', height: '60px', borderTopColor: '#8b5cf6', borderWidth: '4px' }}></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginTop: '1.5rem' }}>Initializing AI Studio...</h3>
                <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
                  Please wait while we securely connect to the heavy computing cluster. This may take a few seconds.
                </p>
              </div>
            )}
            <iframe 
              src={activeTool.iframeUrl}
              onLoad={() => setIframeLoading(false)}
              style={{ width: '100%', height: activeTool.height, border: 'none', marginTop: activeTool.marginTop, opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.5s ease' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

      </main>
    </div>
  );
}
