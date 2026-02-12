import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, AlertCircle, ListTodo, Plus, TrendingUp, Activity, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({  // ✅ Fixed: Now using setStats
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

  // ✅ Line 34: Moved calculateStats ABOVE fetchTasks
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

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
      calculateStats(response.data);  // ✅ Now works correctly
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);  // ✅ Dependencies fixed

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const statCards = [
    {
      title: t('dashboard.total_tasks'),
      value: stats.total,
      icon: ListTodo,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: t('dashboard.in_progress'),
      value: stats.inProgress,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: t('dashboard.completed'),
      value: stats.completed,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: t('dashboard.overdue'),
      value: stats.overdue,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  const analyticsCards = [
    {
      title: t('dashboard.completion_rate'),
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      trend: stats.completionRate > 70 ? 'Excellent' : stats.completionRate > 50 ? 'Good' : 'Needs Improvement',
      color: stats.completionRate > 70 ? 'from-emerald-500/20' : stats.completionRate > 50 ? 'from-yellow-500/20' : 'from-red-500/20'
    },
    {
      title: t('dashboard.avg_completion'),
      value: `${stats.avgCompletionDays} ${t('dashboard.days')}`,
      icon: Activity,
      trend: stats.avgCompletionDays < 3 ? 'Fast' : stats.avgCompletionDays < 7 ? 'Normal' : 'Slow',
      color: stats.avgCompletionDays < 3 ? 'from-emerald-500/20' : stats.avgCompletionDays < 7 ? 'from-blue-500/20' : 'from-orange-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 sm:mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>{t('dashboard.add_task')}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border ${stat.bgColor} ${stat.textColor} group hover:-translate-y-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 group-hover:bg-white/30 transition-all duration-200" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse hidden lg:block" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-2 opacity-90">{stat.title}</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {analyticsCards.map((card, index) => (
            <div key={index} className={`p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-300 group ${card.color} border-opacity-50 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'bg-white/80'}`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <card.icon className="w-10 h-10 sm:w-12 sm:h-12 p-2.5 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-200" />
                <span className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm font-medium text-white/80">
                  LIVE
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">{card.title}</h3>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1 sm:mb-2">
                {card.value}
              </p>
              <p className="text-base sm:text-lg font-semibold opacity-90">{card.trend}</p>
            </div>
          ))}
        </div>

        {/* Task Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {['all', 'in_progress', 'completed', 'overdue'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm md:text-base transition-all duration-200 whitespace-nowrap ${filter === status
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                }`}
            >
              {status === 'all' ? t('dashboard.all') : t(`dashboard.filter.${status}`)}
              {status !== 'all' && <span className="hidden sm:inline"> ({stats[status === 'overdue' ? 'overdue' : status.replace('in_progress', 'inProgress')] || 0})</span>}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700 shadow-xl sm:shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">
              {t('dashboard.recent_tasks')} ({filteredTasks.length})
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
              Live • Latest data loaded
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 rounded-full animate-spin mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-300">
                {t('dashboard.loading')}
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <ListTodo className="w-16 h-16 sm:w-18 sm:h-18 text-gray-300 mx-auto mb-4 sm:mb-6 opacity-50" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">
                {filter === 'all' ? t('dashboard.no_tasks') : t('dashboard.no_match')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
                {filter === 'all'
                  ? t('dashboard.create_first')
                  : t('dashboard.try_filters')}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                {t('dashboard.create_task')}
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTasks.slice(0, 8).map(task => (
                <div key={task.id} className="group flex items-center justify-between p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/60 to-gray-50/60 dark:from-gray-800/60 dark:to-gray-700/60 hover:shadow-lg sm:hover:shadow-xl hover:-translate-y-1 border border-white/30 dark:border-gray-700 backdrop-blur-sm transition-all duration-300">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all duration-200 ${task.status === 'completed'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                        : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
                        }`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
                      ) : (
                        <Clock size={16} className="sm:w-4 sm:h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
                        <span className={`px-2 sm:px-2.5 py-1 rounded-full font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.due_date && (
                          <span className={`px-2 py-1 rounded-full font-medium ${new Date(task.due_date) < new Date()
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
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
                      onClick={() => handleToggleStatus(task)}
                      className="p-1.5 sm:p-2 hover:bg-indigo-500/20 rounded-lg sm:rounded-xl transition-colors"
                      title="Toggle Status"
                    >
                      <CheckCircle2 size={16} className="sm:w-5 sm:h-5 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg sm:rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {tasks.length > 8 && (
                <div className="text-center py-6 sm:py-8">
                  <button
                    onClick={() => window.location.href = '/tasks'}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
              }`}>
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 sm:p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Task Title</label>
                  <input
                    required
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className={`w-full p-3 sm:p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm sm:text-base font-medium ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="What needs to be done?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className={`w-full p-3 sm:p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm sm:text-base resize-vertical ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Add more details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className={`w-full p-3 sm:p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm sm:text-base font-medium ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600'
                        : 'bg-white border-gray-200 text-gray-900'
                        }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className={`w-full p-3 sm:p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm sm:text-base font-medium ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600'
                        : 'bg-white border-gray-200 text-gray-900'
                        }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 p-3 sm:p-4 border text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-sm sm:text-base ${isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md text-sm sm:text-base"
                  >
                    Create Task
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
