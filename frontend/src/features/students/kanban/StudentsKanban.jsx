import * as React from 'react';
import { useDataProvider, useNotify, useUpdate } from 'react-admin';
import { DndContext, MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { useTranslation } from 'react-i18next';

const STATUSES = ['PENDING', 'ACTIVE', 'GRADUATED', 'INACTIVE'];
const INITIAL_PER_PAGE = 100;
const LOAD_MORE_STEP = 50;

const makeEmptyColumn = () => ({ items: [], page: 1, perPage: INITIAL_PER_PAGE, loading: false, total: 0 });

export default function StudentsKanban() {
  const { t } = useTranslation();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );
  const [update] = useUpdate();

  const [search, setSearch] = React.useState('');
  const [columns, setColumns] = React.useState(() => ({
    PENDING: makeEmptyColumn(),
    ACTIVE: makeEmptyColumn(),
    GRADUATED: makeEmptyColumn(),
    INACTIVE: makeEmptyColumn(),
  }));
  const [activeCard, setActiveCard] = React.useState(null); // for overlay preview

  const fetchColumn = React.useCallback(async (statusId, perPageOverride) => {
    setColumns((prev) => ({ ...prev, [statusId]: { ...prev[statusId], loading: true } }));
    try {
      const perPage = perPageOverride ?? columns[statusId].perPage;
      const { data, total } = await dataProvider.getList('students', {
        pagination: { page: 1, perPage },
        sort: { field: 'id', order: 'ASC' },
        filter: { status: statusId },
      });
      setColumns((prev) => ({ ...prev, [statusId]: { ...prev[statusId], items: data, loading: false, total, perPage } }));
    } catch (e) {
      setColumns((prev) => ({ ...prev, [statusId]: { ...prev[statusId], loading: false } }));
      notify(e?.message || 'Failed to load students', { type: 'warning' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataProvider, notify]);

  React.useEffect(() => { STATUSES.forEach((s) => { fetchColumn(s); }); }, [fetchColumn]);

  const onLoadMore = (statusId) => {
    const next = (columns[statusId]?.perPage || INITIAL_PER_PAGE) + LOAD_MORE_STEP;
    fetchColumn(statusId, next);
  };

  const filteredItems = (statusId) => {
    const list = columns[statusId]?.items || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  };

  const findStatusOf = (id) => {
    const sid = String(id);
    for (const st of STATUSES) {
      if ((columns[st]?.items || []).some((it) => String(it.id) === sid)) return st;
    }
    return null;
  };

  const getRecord = (id) => {
    const sid = String(id);
    for (const st of STATUSES) {
      const rec = (columns[st]?.items || []).find((it) => String(it.id) === sid);
      if (rec) return rec;
    }
    return null;
  };

  const moveLocal = (id, from, to) => {
    if (from === to) return;
    setColumns((prev) => {
      const src = prev[from] || makeEmptyColumn();
      const dst = prev[to] || makeEmptyColumn();
      const item = src.items.find((it) => String(it.id) === String(id));
      if (!item) return prev;
      const newSrc = { ...src, items: src.items.filter((it) => String(it.id) !== String(id)) };
      const newDst = { ...dst, items: [{ ...item, status: to }, ...dst.items] };
      return { ...prev, [from]: newSrc, [to]: newDst };
    });
  };

  const onDragStart = (event) => {
    const id = event.active?.id;
    if (!id) return;
    const rec = getRecord(id);
    setActiveCard(rec || null);
  };

  const onDragEnd = async (event) => {
    setActiveCard(null);
    const id = event.active?.id;
    const over = event.over?.id; // destination droppable id = status
    if (!id || !over) return;
    const from = findStatusOf(id);
    const to = over;
    if (!from || !to || from === to) return;

    const record = getRecord(id);
    moveLocal(id, from, to); // optimistic

    try {
      const nextStatus = String(to).toUpperCase();
      await dataProvider.update('students', { id, data: { status: nextStatus }, previousData: record });
      // Light refresh of the two impacted columns to ensure server state is reflected
      fetchColumn(from);
      fetchColumn(nextStatus);
    } catch (e) {
      // revert on error
      moveLocal(id, to, from);
      notify(e?.message || 'Update failed', { type: 'warning' });
    }
  };

  const titles = {
    PENDING: t('common.students.board.column.pending', 'Pending'),
    ACTIVE: t('common.students.board.column.active', 'Active'),
    GRADUATED: t('common.students.board.column.graduated', 'Graduated'),
    INACTIVE: t('common.students.board.column.inactive', 'Inactive'),
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{t('common.students.board.title', 'Students Board')}</h2>
      <div style={{ margin: '8px 0 16px' }}>
        <input
          type="search"
          placeholder={t('common.students.board.search.placeholder', 'Search by name or email…')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 420, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {STATUSES.map((st) => (
            <KanbanColumn
              key={st}
              title={titles[st]}
              statusId={st}
              items={filteredItems(st)}
              loading={columns[st]?.loading}
              count={filteredItems(st).length}
              hasMore={(columns[st]?.items || []).length < (columns[st]?.total || 0)}
              onLoadMore={() => onLoadMore(st)}
            />
          ))}
        </div>

        <DragOverlay>{activeCard ? <KanbanCard student={activeCard} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
