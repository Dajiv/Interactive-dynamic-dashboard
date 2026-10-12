import { useState } from "react";

function taskToForm(task) {
  return {
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "Pending",
    priority: task?.priority || "Medium",
    due_date: task?.due_date ? String(task.due_date).slice(0, 10) : "",
  };
}

function TaskForm({ task, onSubmit, onClose, busy }) {
  const [form, setForm] = useState(() => taskToForm(task));

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="task-form-title"
        aria-modal="true"
        className="task-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">TASK DETAILS</span>
            <h2 id="task-form-title">{task ? "Edit task" : "Create a task"}</h2>
          </div>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            Task title <span className="required-mark">*</span>
            <input
              autoFocus
              maxLength={255}
              name="title"
              onChange={updateField}
              placeholder="e.g. Prepare project proposal"
              required
              value={form.title}
            />
          </label>
          <label>
            Description
            <textarea
              maxLength={5000}
              name="description"
              onChange={updateField}
              placeholder="Add a few details about this task..."
              rows={3}
              value={form.description}
            />
          </label>
          <div className="form-row">
            <label>
              Status
              <select name="status" onChange={updateField} value={form.status}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
            <label>
              Priority
              <select
                name="priority"
                onChange={updateField}
                value={form.priority}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>
          <label>
            Due date
            <input
              name="due_date"
              onChange={updateField}
              type="date"
              value={form.due_date}
            />
          </label>
          <div className="form-actions">
            <button className="button button-quiet" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button-primary" disabled={busy} type="submit">
              {busy ? "Saving..." : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskForm;
