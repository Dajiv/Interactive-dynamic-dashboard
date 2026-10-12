function formatDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function TaskCard({ task, today, onEdit, onDelete, onStatusChange, busy }) {
  const dueDate = formatDate(task.due_date);
  const overdue =
    dueDate &&
    task.status !== "Completed" &&
    String(task.due_date).slice(0, 10) < today;

  return (
    <article className="task-card">
      <div className="task-card-main">
        <span className={`task-check ${task.status === "Completed" ? "checked" : ""}`}>
          {task.status === "Completed" ? "✓" : ""}
        </span>
        <div className="task-copy">
          <h3 className={task.status === "Completed" ? "completed-title" : ""}>
            {task.title}
          </h3>
          {task.description && <p>{task.description}</p>}
        </div>
      </div>
      <div className="task-card-meta">
        <span className={`status-badge status-${task.status.toLowerCase().replace(" ", "-")}`}>
          {task.status}
        </span>
        <span className={`priority priority-${task.priority.toLowerCase()}`}>
          <span />
          {task.priority}
        </span>
        {dueDate && (
          <span className={`due-date ${overdue ? "overdue" : ""}`}>
            <span aria-hidden="true">◷</span> {dueDate}
          </span>
        )}
      </div>
      <div className="task-card-actions">
        <label className="sr-only" htmlFor={`status-${task.id}`}>
          Change status for {task.title}
        </label>
        <select
          aria-label={`Change status for ${task.title}`}
          className="status-select"
          disabled={busy}
          id={`status-${task.id}`}
          onChange={(event) => onStatusChange(task, event.target.value)}
          value={task.status}
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <button
          aria-label={`Edit ${task.title}`}
          className="icon-button"
          disabled={busy}
          onClick={() => onEdit(task)}
          type="button"
        >
          ✎
        </button>
        <button
          aria-label={`Delete ${task.title}`}
          className="icon-button danger-icon"
          disabled={busy}
          onClick={() => onDelete(task)}
          type="button"
        >
          ×
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
