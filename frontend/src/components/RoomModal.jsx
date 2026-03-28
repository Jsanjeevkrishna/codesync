import { useState } from 'react';
import { FiUsers, FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { useRoom } from '../context/RoomContext';

const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export default function RoomModal({ onClose }) {
  const { joinRoom, inRoom, leaveRoom, roomId: activeRoomId } = useRoom();
  const [mode, setMode]         = useState('choose'); // 'choose' | 'create' | 'join'
  const [username, setUsername] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [copied, setCopied]     = useState(false);

  const handleCreate = () => {
    const id = generateRoomId();
    setGeneratedId(id);
    setMode('create');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinCreated = () => {
    if (!username.trim()) return;
    joinRoom(generatedId, username.trim());
    onClose();
  };

  const handleJoinExisting = () => {
    if (!username.trim() || !roomInput.trim()) return;
    joinRoom(roomInput.trim().toUpperCase(), username.trim());
    onClose();
  };

  if (inRoom) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-title">🧑‍💻 In Room: <code>{activeRoomId}</code></div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 13 }}>
            Share the Room ID with others so they can join.
          </p>
          <div className="room-id-display">
            <span>{activeRoomId}</span>
            <button className="icon-btn" onClick={() => { navigator.clipboard.writeText(activeRoomId); }}>
              <FiCopy size={14} />
            </button>
          </div>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-danger" onClick={() => { leaveRoom(); onClose(); }}>
              Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title">🧑‍💻 Collaborate</div>
          <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
        </div>

        {mode === 'choose' && (
          <div className="room-choose">
            <button className="room-choice-btn" onClick={handleCreate}>
              <FiUsers size={24} />
              <span>Create Room</span>
              <small>Get a shareable Room ID</small>
            </button>
            <button className="room-choice-btn" onClick={() => setMode('join')}>
              <FiUsers size={24} />
              <span>Join Room</span>
              <small>Enter an existing Room ID</small>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="room-form">
            <div className="room-id-display">
              <strong>{generatedId}</strong>
              <button className="icon-btn" onClick={handleCopy} title="Copy Room ID">
                {copied ? <FiCheck size={14} style={{ color: 'var(--accent-green)' }} /> : <FiCopy size={14} />}
              </button>
            </div>
            <p className="room-hint">Share this ID with your collaborators, then enter your name below.</p>
            <input
              className="modal-input"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinCreated()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setMode('choose')}>Back</button>
              <button className="btn btn-primary" onClick={handleJoinCreated} disabled={!username.trim()}>
                Start Session
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="room-form">
            <input
              className="modal-input"
              placeholder="Room ID (e.g. AB12CD)"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              autoFocus
            />
            <input
              className="modal-input"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinExisting()}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setMode('choose')}>Back</button>
              <button className="btn btn-primary" onClick={handleJoinExisting}
                disabled={!username.trim() || !roomInput.trim()}>
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
