import { useCallback, useEffect, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import {
  createTask,
  deleteTask,
  getTaskStats,
  getTasks,
  updateTask,
} from "../api";

const filters = ["All tasks", "Pending", "In Progress", "Completed"];

function Dashboard() {
  const [today] = useState(() => new Date());
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayLabel = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(today);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [activeFilter, setActiveFilter] = useState("All tasks");
  const [modalTask, setModalTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const statusFilter = activeFilter === "All tasks" ? "" : activeFilter;

  const loadTasks = useCallback(async () => {
    try {
      const response = await getTasks({
        q: search.trim(),
        status: statusFilter,
        priority,
      });
      setTasks(response.data);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [priority, search, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getTaskStats();
      setStats(response.data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([loadTasks(), loadStats()]);
  }, [loadStats, loadTasks]);

  useEffect(() => {
    queueMicrotask(() => void loadTasks());
  }, [loadTasks]);

  useEffect(() => {
    queueMicrotask(() => void loadStats());
  }, [loadStats]);

  const visibleTotal = tasks.length;

  async function handleSave(form) {
    setBusy(true);
    setError("");
    try {
      if (modalTask) {
        await updateTask(modalTask.id, form);
      } else {
        await createTask(form);
      }
      setIsModalOpen(false);
      setModalTask(null);
      await refreshDashboard();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(task, status) {
    setBusy(true);
    setError("");
    try {
      await updateTask(task.id, { status });
      await refreshDashboard();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await deleteTask(task.id);
      await refreshDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  function openCreateForm() {
    setModalTask(null);
    setIsModalOpen(true);
  }

  function openEditForm(task) {
    setModalTask(task);
    setIsModalOpen(true);
  }

  const cards = [
    { label: "Total tasks", value: stats.total, icon: "▤", tone: "lavender" },
    { label: "In progress", value: stats.inProgress, icon: "◷", tone: "blue" },
    { label: "Completed", value: stats.completed, icon: "✓", tone: "mint" },
    { label: "Overdue", value: stats.overdue, icon: "!", tone: "rose" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a aria-label="Taskflow home" className="brand" href="#dashboard">
          <span className="brand-mark">t.</span>
          <span>taskflow</span>
        </a>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="sidebar-nav">
          <a className="nav-link active" href="#dashboard">
            <span className="nav-icon">▦</span> Overview
          </a>
          <a
            className="nav-link"
            href="#task-list"
            onClick={() => setActiveFilter("All tasks")}
          >
            <span className="nav-icon">☷</span> My tasks
            <span className="nav-count">{stats.total}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-sparkle">✦</span>
            <strong>Make space for focus</strong>
            <p>A little progress each day adds up to big results.</p>
          </div>
          <div className="profile">
            <div className="avatar">U</div>
            <div className="profile-copy">
              <strong>Your workspace</strong>
              <span>Personal plan</span>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">
              {todayLabel}
            </span>
            <div className="top-avatar">U</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
              <h1>Good things take <span>focus.</span></h1>
              <p>Keep your day clear, one task at a time.</p>
            </div>
            <button className="button button-primary add-button" onClick={openCreateForm}>
              <span>＋</span> New task
            </button>
          </section>

          <section aria-label="Task statistics" className="stats-grid">
            {cards.map((card) => (
              <article className="stat-card" key={card.label}>
                <div className={`stat-icon ${card.tone}`}>{card.icon}</div>
                <div>
                  <p>{card.label}</p>
                  <strong>{card.value ?? 0}</strong>
                </div>
              </article>
            ))}
          </section>

          <section aria-label="Today's tasks" className="task-section" id="task-list">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR WORK, AT A GLANCE</span>
                <h2>Tasks <span className="task-total">{visibleTotal}</span></h2>
              </div>
              <button className="button button-outline" onClick={openCreateForm}>
                <span>＋</span> Add task
              </button>
            </div>

            <div className="task-toolbar">
              <div aria-label="Filter tasks by status" className="filter-tabs" role="tablist">
                {filters.map((filter) => (
                  <button
                    aria-selected={activeFilter === filter}
                    className={`filter-tab ${activeFilter === filter ? "selected" : ""}`}
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    role="tab"
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="task-controls">
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <span className="sr-only">Search tasks</span>
                  <input
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks..."
                    type="search"
                    value={search}
                  />
                </label>
                <label className="priority-filter">
                  <span className="sr-only">Filter by priority</span>
                  <select
                    aria-label="Filter by priority"
                    onChange={(event) => setPriority(event.target.value)}
                    value={priority}
                  >
                    <option value="">Priority</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
                <button onClick={refreshDashboard} type="button">Retry</button>
              </div>
            )}

            <div aria-live="polite" className="task-list">
              {loading ? (
                <div className="empty-state">
                  <div className="loading-dot" />
                  <p>Loading your tasks...</p>
                </div>
              ) : tasks.length ? (
                tasks.map((task) => (
                  <TaskCard
                    busy={busy}
                    key={task.id}
                    onDelete={handleDelete}
                    onEdit={openEditForm}
                    onStatusChange={handleStatusChange}
                    today={todayKey}
                    task={task}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✦</div>
                  <h3>{error ? "Tasks are unavailable" : "A clear space to begin"}</h3>
                  <p>
                    {error
                      ? "Make sure the backend and database are running, then try again."
                      : "No tasks match this view. Add a task and make today count."}
                  </p>
                  {!error && (
                    <button className="button button-primary" onClick={openCreateForm}>
                      Create your first task
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {isModalOpen && (
        <TaskForm
          busy={busy}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
          task={modalTask}
        />
      )}
    </div>
  );
}

export default Dashboard;
