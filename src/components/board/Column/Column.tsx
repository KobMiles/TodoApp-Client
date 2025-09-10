import { COLUMN_TITLES } from '../../../constants/board';
import type { ColumnId } from '../../../constants/board';
import type { TodoTaskDto } from '../../../types/todoTask';
import { TaskCard } from '../TaskCard/TaskCard';

interface Props {
  id: ColumnId;
  tasks: TodoTaskDto[];
  loading?: boolean;
  onDetails?: (t: TodoTaskDto) => void;
  onEdit?: (t: TodoTaskDto) => void;
}

const SUBTITLES: Record<ColumnId, string> = {
  todo: "This item hasn't been started",
  inProgress: "This is actively being worked on",
  done: "This has been completed",
};

export function Column({ id, tasks, loading, onDetails, onEdit }: Props) {
  return (
    <section className="column">
      <header className="column__header">
        <span className={`dot dot--${id}`} />
        <div className="column__stack">
          <div className="column__head">
            <span>{COLUMN_TITLES[id]}</span>
          </div>
          <div className="column__subtitle">{SUBTITLES[id]}</div>
        </div>
        <span className="column__count">{tasks.length}</span>
      </header>
      <div className="column__list">
        {loading ? (
          <>
            <div className="skel" />
            <div className="skel" />
            <div className="skel" />
          </>
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} onDetails={onDetails} onEdit={onEdit} />
          ))
        )}
      </div>
    </section>
  );
}
