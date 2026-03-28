import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUsers } from 'react-icons/fi';
import { useRoom } from '../context/RoomContext';

const USER_COLORS = [
  '#7c3aed','#2563eb','#059669','#d97706','#dc2626',
  '#0891b2','#7c3aed','#db2777','#65a30d','#ea580c',
];

const getColor = (username) => {
  let hash = 0;
  for (const ch of username) hash += ch.charCodeAt(0);
  return USER_COLORS[hash % USER_COLORS.length];
};

const Avatar = ({ username }) => (
  <div className="user-avatar" style={{ background: getColor(username) }} title={username}>
    {username[0].toUpperCase()}
  </div>
);

function ChatMessage({ msg }) {
  if (msg.isSystem) {
    return <div className="chat-system">{msg.message}</div>;
  }
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="chat-msg">
      <Avatar username={msg.username} />
      <div className="chat-msg-body">
        <div className="chat-msg-header">
          <span className="chat-username">{msg.username}</span>
          <span className="chat-time">{time}</span>
        </div>
        <div className="chat-msg-text">{msg.message}</div>
      </div>
    </div>
  );
}

export default function CollabPanel() {
  const { users, messages, sendChatMessage, roomId, inRoom, leaveRoom } = useRoom();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChatMessage(input.trim());
    setInput('');
  };

  if (!inRoom) {
    return (
      <div className="panel-content">
        <div className="panel-empty">
          <FiUsers size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>Not in a room.</p>
          <p>Click <strong>Collaborate</strong> in the toolbar to start.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-content">
      {/* Room header */}
      <div className="collab-header">
        <div>
          <div className="collab-room-label">Room</div>
          <div className="collab-room-id">{roomId}</div>
        </div>
        <button className="btn btn-sm btn-danger" onClick={leaveRoom}>Leave</button>
      </div>

      {/* Online users */}
      <div className="collab-users-section">
        <div className="collab-section-title">
          <FiUsers size={12} /> Online ({users.length})
        </div>
        <div className="collab-users-list">
          {users.map((u) => (
            <div key={u.socketId} className="collab-user-row">
              <Avatar username={u.username} />
              <span className="collab-user-name">{u.username}</span>
              <span className="online-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="chat-section">
        <div className="collab-section-title">💬 Chat</div>
        <div className="chat-messages">
          {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message…"
          />
          <button className="icon-btn send-btn" onClick={handleSend} disabled={!input.trim()}>
            <FiSend size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
