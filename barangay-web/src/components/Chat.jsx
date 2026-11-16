import { useEffect, useState, useRef } from 'react';
import { messageAPI, userAPI } from '../api';
import useIsMobile from '../useIsMobile';
import Icon from './Icons';

export default function Chat({ setPage, user }) {
  const isAdmin = user.role === 'admin';
  const isMobile = useIsMobile();

  const [partnerId, setPartnerId] = useState(isAdmin ? null : 1);
  const [partnerName, setPartnerName] = useState(isAdmin ? '' : 'Barangay Administrator');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  // Admin quick-reply templates (para sa mga common na tanong)
  const QUICK_REPLIES = [
    'Kumusta! Ano ang kailangan niyong impormasyon?',
    'Ang Barangay Clearance ay kailangan ng valid ID at cedula.',
    'Ang Certificate of Indigency ay para sa medical/financial assistance.',
    'Pwede na kayong mag-claim ng inyong dokumento sa barangay hall.',
    'Approved na ang inyong request. Salamat!',
    'Pakilagay ang inyong Request ID para ma-check ko.',
  ];

  // Admin: load list of residents to chat with
  useEffect(() => {
    if (isAdmin) {
      userAPI.getResidents()
        .then((res) => {
          if (res.data.success) setResidents(res.data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Load messages whenever partner changes
  useEffect(() => {
    if (!partnerId) { setMessages([]); return; }
    messageAPI.getMessages(partnerId)
      .then((res) => {
        if (res.data.success) setMessages(res.data.data);
      })
      .catch(() => {});
  }, [partnerId]);

  // Poll every 3s
  useEffect(() => {
    if (!partnerId) return;
    const interval = setInterval(() => {
      messageAPI.getMessages(partnerId)
        .then((res) => {
          if (res.data.success) setMessages(res.data.data);
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || !partnerId) return;
    try {
      await messageAPI.sendMessage({ receiver_id: partnerId, message: msg });
      setInput('');
      const res = await messageAPI.getMessages(partnerId);
      if (res.data.success) setMessages(res.data.data);
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="empty-state">Loading chat...</div>;

  // Filter residents by search (admin)
  const filteredResidents = residents.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- Resident view ----------
  if (!isAdmin) {
    // ===== MOBILE CHAT (PWA design) =====
    if (isMobile) {
      return (
        <div className="mchat">
          <div className="mchat-head">
            <div className="mchat-avatar"><Icon name="building" size={22} color="#c2410c" /></div>
            <div className="mchat-head-info">
              <strong>Barangay Administrator</strong>
              <small>● Online</small>
            </div>
          </div>

          <div className="mchat-messages">
            {messages.map((m) => {
              const sent = m.sender_id === user.user_id;
              return (
                <div key={m.id} className={`mchat-row ${sent ? 'me' : 'them'}`}>
                  <div className={`mchat-bubble ${sent ? 'sent' : 'received'}`}>
                    <div>{m.message}</div>
                    <div className="mchat-time">{formatTime(m.created_at)}</div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="mchat-empty">
                Walang messages pa. Simulan ang usapan!<br />
                Halimbawa: “Ano ang requirements para sa Barangay Clearance?”
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mchat-inputbar">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={handleKey}
            />
            <button className="mchat-send" onClick={() => sendMessage()} aria-label="Send">
              <Icon name="send" size={20} color="#fff" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="page">
        <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>
        <h1>Live Chat</h1>
        <p className="welcome-text">Kausapin ang Barangay Administrator para sa anumang impormasyon.</p>

        <div style={{ display: 'flex', gap: '1rem', height: 520 }}>
          <div style={{ flex: '0 0 240px', borderRight: '1px solid #ddd' }}>
            <h3 style={{ padding: '1rem', margin: 0, background: '#f8f9fa' }}>Contacts</h3>
            <div style={{ padding: '0.5rem 0' }}>
              <button
                onClick={() => { setPartnerId(1); setPartnerName('Barangay Administrator'); setMessages([]); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                  borderBottom: '1px solid #eee', background: partnerId === 1 ? '#eef4f7' : 'transparent',
                  border: 'none', cursor: 'pointer', fontWeight: partnerId === 1 ? '700' : '400',
                  color: partnerId === 1 ? '#ea580c' : '#333',
                }}
              >
                🏛️ Barangay Administrator
              </button>
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid #eee', fontSize: '0.8rem', color: '#666' }}>
              <strong>Tip:</strong> Magtanong tungkol sa clearance, indigency, ID, requirements, at schedule ng pag-claim.
            </div>
          </div>

          <div className="card" style={{ flex: 1, padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', background: '#fff', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{partnerName || 'Select a contact'}</h3>
              <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>● Online</span>
            </div>
            <div className="chat-box" style={{ height: 'calc(100% - 110px)' }}>
              <div className="chat-messages" ref={messagesEndRef}>
                {messages.map((m) => (
                  <div key={m.id} className={`chat-message ${m.sender_id === user.user_id ? 'sent' : 'received'}`}>
                    <div>{m.message}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: m.sender_id === user.user_id ? 'right' : 'left' }}>
                      {formatTime(m.created_at)}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && partnerId && (
                  <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>
                    Walang messages pa. Simulan ang usapan! Halimbawa: "Ano ang requirements para sa Barangay Clearance?"
                  </div>
                )}
              </div>
              <div className="chat-input-area">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." onKeyPress={handleKey} />
                <button className="btn btn-primary" onClick={() => sendMessage()} style={{ padding: '0.7rem 1rem' }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Admin view ----------
  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>
      <h1>Live Chat — Admin</h1>
      <p className="welcome-text">Makipag-usap sa mga resident para sa impormasyon tungkol sa clearance, indigency, ID, at iba pa.</p>

      <div style={{ display: 'flex', gap: '1rem', height: 540 }}>
        <div style={{ flex: '0 0 280px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ padding: '1rem', margin: 0, background: '#f8f9fa' }}>Residents ({residents.length})</h3>
          <input
            type="text"
            placeholder="Hanapin ang resident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem' }}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredResidents.length === 0 && (
              <p style={{ padding: '1rem', color: '#666', fontSize: '0.85rem' }}>Walang resident na tumutugma.</p>
            )}
            {filteredResidents.map((r) => (
              <button
                key={r.user_id}
                onClick={() => { setPartnerId(r.user_id); setPartnerName(r.full_name); setMessages([]); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                  borderBottom: '1px solid #eee', background: partnerId === r.user_id ? '#eef4f7' : 'transparent',
                  border: 'none', cursor: 'pointer', fontWeight: partnerId === r.user_id ? '700' : '400',
                  color: partnerId === r.user_id ? '#ea580c' : '#333',
                }}
              >
                <div style={{ fontWeight: 700 }}>{r.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>{r.email}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1, padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #eee', background: '#fff', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{partnerName || 'Pumili ng resident'}</h3>
            {partnerId && <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>● Active</span>}
          </div>
          <div className="chat-box" style={{ height: 'calc(100% - 150px)' }}>
            <div className="chat-messages" ref={messagesEndRef}>
              {!partnerId && (
                <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>Pumili ng resident sa listahan para makipag-chat.</div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`chat-message ${m.sender_id === user.user_id ? 'sent' : 'received'}`}>
                  <div>{m.message}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: m.sender_id === user.user_id ? 'right' : 'left' }}>
                    {formatTime(m.created_at)}
                  </div>
                </div>
              ))}
              {messages.length === 0 && partnerId && (
                <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>Walang messages pa. Simulan ang usapan!</div>
              )}
            </div>
          </div>

          {/* Quick replies for admin */}
          {partnerId && (
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: '#fafafa' }}>
              {QUICK_REPLIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    fontSize: '0.72rem', padding: '0.35rem 0.6rem', borderRadius: 12,
                    border: '1px solid #ea580c', background: '#fff', color: '#ea580c',
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {q.length > 32 ? q.slice(0, 30) + '…' : q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={partnerId ? 'Type a message...' : 'Pumili muna ng resident'} onKeyPress={handleKey} disabled={!partnerId} />
            <button className="btn btn-primary" onClick={() => sendMessage()} style={{ padding: '0.7rem 1rem' }} disabled={!partnerId}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
