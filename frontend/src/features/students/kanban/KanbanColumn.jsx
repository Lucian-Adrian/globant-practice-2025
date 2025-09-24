import * as React from 'react';
import KanbanCard from './KanbanCard';
import { useDroppable } from '@dnd-kit/core';
import { useTranslate } from 'react-admin';

const STATUS_TINTS = {
  PENDING: 'rgba(156,163,175,0.12)', // gray-400 light
  ACTIVE: 'rgba(96,165,250,0.15)',
  INACTIVE: 'rgba(251,191,36,0.15)',
  GRADUATED: 'rgba(134,239,172,0.15)'
};

export default function KanbanColumn({ title, statusId, items, loading, count, hasMore, onLoadMore }) {
  const t = useTranslate();
  const { isOver, setNodeRef } = useDroppable({ id: statusId });
  return (
    <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={{ color: '#6b7280' }}>({count})</span>
      </div>
      <div
        ref={setNodeRef}
        style={{
          background: STATUS_TINTS[statusId] || 'rgba(229,231,235,0.4)',
          border: `1px dashed ${isOver ? '#2563eb' : '#e5e7eb'}`,
          padding: 8,
          borderRadius: 10,
          minHeight: 160,
          transition: 'border-color .15s',
        }}
        aria-label={title}
      >
        {loading && <div style={{ padding: 8, color: '#6b7280' }}>{t('common.students.board.loading', 'Loading…')}</div>}
        {!loading && items.length === 0 && (
          <div style={{ padding: 8, color: '#6b7280' }}>{t('common.students.board.empty', 'No items')}</div>
        )}
        {items.map((s) => (
          <KanbanCard key={s.id} student={s} />
        ))}
        {!loading && hasMore && (
          <div style={{ marginTop: 8 }}>
            <button onClick={onLoadMore} style={{ padding: '6px 10px' }}>{t('common.students.board.actions.load_more', 'Load more')}</button>
          </div>
        )}
      </div>
    </div>
  );
}
