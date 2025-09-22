import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function KanbanCard({ student }) {
  const id = String(student.id);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 10px',
    marginBottom: 8,
    cursor: 'grab',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} tabIndex={0} aria-roledescription="draggable">
      <div style={{ fontWeight: 600 }}>
        {student.first_name} {student.last_name}
      </div>
      <div style={{ fontSize: 12, color: '#4b5563' }}>{student.email}</div>
      {/* Placeholder for future course label */}
    </div>
  );
}
