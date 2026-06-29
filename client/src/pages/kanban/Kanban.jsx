import { useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const columns = ['Wishlist', 'Applied', 'OA', 'Interview', 'HR Round', 'Offer', 'Rejected'];

function KanbanCard({ item, draggable = true }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id, disabled: !draggable });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <article ref={setNodeRef} style={style} {...attributes} {...listeners} className={`rounded-2xl border border-white/10 bg-slate-900/70 p-3 ${isDragging ? 'opacity-50' : ''}`}>
      <div className="font-medium">{item.companyName}</div>
      <div className="text-xs text-white/60">{item.jobTitle}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/60">
        <span className="rounded-full bg-white/10 px-2 py-1">{item.applicationSource}</span>
        <span className="rounded-full bg-white/10 px-2 py-1">{item.location || 'No location'}</span>
      </div>
    </article>
  );
}

function Column({ status, items }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className={`rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur ${isOver ? 'ring-2 ring-blue-400/60' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{status}</h2>
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">{items.length}</span>
      </div>
      <div className="space-y-3">
        <SortableContext items={items.map((item) => item._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => <KanbanCard key={item._id} item={item} />)}
        </SortableContext>
      </div>
    </section>
  );
}

export default function Kanban() {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data } = useQuery({
    queryKey: ['kanban'],
    queryFn: async () => (await api.get('/applications', { params: { limit: 500, includeArchived: 'false', sort: '-updatedAt' } })).data
  });

  const items = data?.items || [];
  const grouped = useMemo(
    () => columns.reduce((acc, status) => {
      acc[status] = items.filter((item) => item.status === status);
      return acc;
    }, {}),
    [items]
  );

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => (await api.put(`/applications/${id}`, { status })).data,
    onSuccess: () => {
      toast.success('Application moved');
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const dragged = items.find((item) => item._id === active.id);
    if (!dragged) return;
    const targetStatus = columns.includes(over.id) ? over.id : items.find((item) => item._id === over.id)?.status;
    if (!targetStatus || dragged.status === targetStatus) return;
    updateMutation.mutate({ id: dragged._id, status: targetStatus });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:grid-cols-7">
        {columns.map((status) => (
          <Column key={status} status={status} items={grouped[status] || []} />
        ))}
      </div>
      <DragOverlay>{null}</DragOverlay>
    </DndContext>
  );
}
