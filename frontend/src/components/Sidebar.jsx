import { FiFile, FiSettings, FiUsers } from 'react-icons/fi';
import { useEditor } from '../context/EditorContext';
import { useRoom } from '../context/RoomContext';

export default function Sidebar() {
  const { activePanel, setActivePanel } = useEditor();
  const { inRoom } = useRoom();

  const items = [
    { id: 'files',      icon: <FiFile size={22} />,     title: 'File Manager' },
    { id: 'collab',     icon: <FiUsers size={22} />,    title: 'Collaboration', badge: inRoom },
    { id: 'extensions', icon: <FiSettings size={22} />, title: 'Extensions' },
  ];

  return (
    <div className="sidebar">
      {items.map((item) => (
        <button
          key={item.id}
          className={`sidebar-btn${activePanel === item.id ? ' active' : ''}`}
          onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
          title={item.title}
          style={{ position: 'relative' }}
        >
          {item.icon}
          {item.badge && <span className="sidebar-live-dot" />}
        </button>
      ))}
    </div>
  );
}
