// Purpose: Overview page showing stats, recent tasks, and quick task creation
// Why: Gives users a fast snapshot of progress and shortcuts to common actions
// How: Fetches tasks via API, computes metrics, updates with optimistic refresh
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, AlertCircle, ListTodo, Plus, TrendingUp, Activity, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Re-render UI when theme class toggles to keep colors in sync
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Force re-render when theme changes
      setTasks(prev => [...prev]);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const [tasks, setTasks] = useState([]);
  // Aggregate dashboard KPIs derived from the current task list
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    avgCompletionDays: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [filter, setFilter] = useState('all');

  // Compute totals, overdue count, average completion days, and completion rate
  const calculateStats = useCallback((taskList) => {
    const total = taskList.length;
    const inProgress = taskList.filter(task => task.status === 'in_progress').length;
    const completed = taskList.filter(task => task.status === 'completed').length;
    const overdue = taskList.filter(task =>
      task.status !== 'completed' &&
      new Date(task.due_date) < new Date()
    ).length;

    const avgCompletionDays = completed > 0 ?
      taskList
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (new Date(task.updated_at || task.created_at) - new Date(task.created_at)) / (1000 * 60 * 60 * 24), 0) / completed
      : 0;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats({
      total,
      inProgress,
      completed,
      overdue,
      avgCompletionDays: Math.round(avgCompletionDays),
      completionRate
    });
  }, []);

  // Centralized fetch to populate tasks and refresh KPIs after mutations
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task from modal and refresh dashboard data
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, status: 'in_progress' });
      setShowAddModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to create task');
    }
  };

  // Delete task with user confirmation and refresh
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  // Toggle between in_progress and completed and refresh KPIs
  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  // Apply current status filter to the task list
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const statCards = [
    {
      title: t('dashboard.total_tasks'),
      value: stats.total,
      icon: ListTodo,
      color: 'from-[var(--accent-secondary)] to-[var(--bg-card)]',
      bgColor: 'bg-[var(--bg-card)]',
      textColor: 'text-[var(--text-main)]'
    },
    {
      title: t('dashboard.in_progress'),
      value: stats.inProgress,
      icon: Clock,
      color: 'from-amber-500/20 to-amber-600/20',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: t('dashboard.completed'),
      value: stats.completed,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/20',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: t('dashboard.overdue'),
      value: stats.overdue,
      icon: AlertCircle,
      color: 'from-red-500/20 to-red-600/20',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  const analyticsCards = [
    {
      title: t('dashboard.completion_rate'),
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      trend: stats.completionRate > 70 ? 'Excellent' : stats.completionRate > 50 ? 'Good' : 'Needs Improvement',
      color: stats.completionRate > 70 ? 'from-emerald-500/10' : stats.completionRate > 50 ? 'from-amber-500/10' : 'from-red-500/10'
    },
    {
      title: t('dashboard.avg_completion'),
      value: `${stats.avgCompletionDays} ${t('dashboard.days')}`,
      icon: Activity,
      trend: stats.avgCompletionDays < 3 ? 'Fast' : stats.avgCompletionDays < 7 ? 'Normal' : 'Slow',
      color: stats.avgCompletionDays < 3 ? 'from-emerald-500/10' : stats.avgCompletionDays < 7 ? 'from-[var(--accent-primary)]/10' : 'from-amber-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-1 sm:mb-2 italic">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)]">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-[var(--accent-primary)] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>{t('dashboard.add_task')}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border ${stat.bgColor} ${stat.textColor} group hover:-translate-y-1 border-[var(--border-color)] bg-[var(--bg-card)]`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)]/20 transition-all duration-200 text-[var(--accent-primary)]" />
                <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse hidden lg:block" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-2 text-[var(--text-muted)]">{stat.title}</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {analyticsCards.map((card, index) => (
            <div key={index} className={`p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 group ${card.color} border-[var(--border-color)] bg-[var(--bg-card)]`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <card.icon className="w-10 h-10 sm:w-12 sm:h-12 p-2.5 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)]/20 transition-all duration-200 text-[var(--accent-primary)]" />
                <span className="px-2 sm:px-3 py-1 bg-[var(--accent-primary)]/10 rounded-full text-xs sm:text-sm font-medium text-[var(--accent-primary)]">
                  LIVE
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-[var(--text-main)]">{card.title}</h3>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--accent-primary)] mb-1 sm:mb-2">
                {card.value}
              </p>
              <p className="text-base sm:text-lg font-semibold text-[var(--text-muted)]">{card.trend}</p>
            </div>
          ))}
        </div>

        {/* Task Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {['all', 'in_progress', 'completed', 'overdue'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm md:text-base transition-all duration-200 whitespace-nowrap border ${filter === status
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md shadow-[var(--accent-primary)]/20'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--accent-secondary)] border-[var(--border-color)]'
                }`}
            >
              {status === 'all' ? t('dashboard.all') : t(`dashboard.filter.${status}`)}
              {status !== 'all' && <span className="opacity-70"> ({stats[status === 'overdue' ? 'overdue' : status.replace('in_progress', 'inProgress')] || 0})</span>}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
              {t('dashboard.recent_tasks')} ({filteredTasks.length})
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
              Live • Latest data loaded
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-semibold text-[var(--text-muted)]">
                {t('dashboard.loading')}
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <ListTodo className="w-16 h-16 sm:w-18 sm:h-18 text-[var(--text-muted)] mx-auto mb-4 sm:mb-6 opacity-30" />
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                {filter === 'all' ? t('dashboard.no_tasks') : t('dashboard.no_match')}
              </h3>
              <p className="text-[var(--text-muted)] mb-6 sm:mb-8 text-sm sm:text-base">
                {filter === 'all'
                  ? t('dashboard.create_first')
                  : t('dashboard.try_filters')}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[var(--accent-primary)] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm sm:text-base shadow-sm"
              >
                {t('dashboard.create_task')}
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTasks.slice(0, 8).map(task => (
                <div key={task.id} className="group flex items-center justify-between p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] hover:shadow-md hover:-translate-y-0.5 border border-[var(--border-color)] transition-all duration-300">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all duration-200 ${task.status === 'completed'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10'
                        }`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
                      ) : (
                        <Clock size={16} className="sm:w-4 sm:h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm sm:text-base lg:text-lg truncate ${task.status === 'completed' ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}`}>{task.title}</h4>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-1 mt-1 font-medium">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm font-bold tracking-tight">
                        <span className={`px-2 sm:px-2.5 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.due_date && (
                          <span className={`px-2 py-1 rounded-full ${new Date(task.due_date) < new Date() && task.status !== 'completed'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                            }`}>
                            {new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-3 sm:ml-4">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg sm:rounded-xl transition-colors text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {tasks.length > 8 && (
                <div className="text-center py-6 sm:py-8">
                  <button
                    onClick={() => window.location.href = '/tasks'}
                    className="text-[var(--accent-primary)] hover:underline font-bold text-sm sm:text-base"
                  >
                    View All {tasks.length} Tasks →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-6 sm:mb-8 font-black uppercase tracking-tighter italic">
                <h2 className="text-lg sm:text-xl text-[var(--text-main)]">Create New Task</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 sm:p-2.5 hover:bg-[var(--bg-main)] rounded-xl transition-colors text-[var(--text-muted)]"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase mb-2 text-[var(--text-muted)]">Task Title</label>
                  <input
                    required
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-3 sm:p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-sm sm:text-base font-bold text-[var(--text-main)] placeholder-[var(--text-muted)]"
                    placeholder="What needs to be done?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-2 text-[var(--text-muted)]">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full p-3 sm:p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-sm sm:text-base font-medium text-[var(--text-main)] placeholder-[var(--text-muted)] resize-none"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 text-[var(--text-muted)]">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full p-3 sm:p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-sm sm:text-base font-bold text-[var(--text-main)]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 text-[var(--text-muted)]">Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="w-full p-3 sm:p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all text-sm sm:text-base font-bold text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 p-3 sm:p-4 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-main)] transition-colors font-bold text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--accent-primary)] text-white p-3 sm:p-4 rounded-xl font-black uppercase tracking-widest hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shadow-sm text-sm sm:text-base italic"
                  >
                    Create
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
