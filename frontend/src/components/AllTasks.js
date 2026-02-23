// Purpose: Task management page with search, filter, CRUD, and status toggling
// Why: Enables users to create, view, update, and delete tasks beyond dashboard
// How: Fetches via API client; local search/filter; modal form for create/edit
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  ListTodo,
  Clock,
} from 'lucide-react';
import api from '../services/api';

const AllTasks = () => {
  const { t } = useTranslation();
  // Raw tasks from API and derived filtered list
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  // UI state: loading indicator, search/filter controls, modal/selection
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  // Form state for create/edit operations
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: 'in_progress'
  });

  // Load tasks for current user from backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Compute visible tasks based on search/filters
  const filterTasks = useCallback(() => {
    let filtered = [...tasks];
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Re-run filtering when dependencies change
  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  // Submit create or update, then refresh list and close modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskForm);
      } else {
        await api.post('/tasks', taskForm);
      }
      closeModal();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Initialize form for editing an existing task
  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      status: task.status
    });
    setShowAddModal(true);
  };

  // Delete a task after confirmation and refresh list
  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Toggle between in_progress and completed statuses
  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Reset modal and form state
  const closeModal = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      status: 'in_progress'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
            {t('common.all_tasks')}
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base">
            Manage and organize your productivity
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#00ADC5] hover:bg-[#009fb5] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,173,197,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('common.add_task')}
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 mb-8 border border-[var(--border-color)] shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-[var(--text-muted)] text-sm font-medium">
            <ListTodo className="w-4 h-4" />
            {filteredTasks.length} Tasks
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border-color)]">
            <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold">No tasks found</p>
            <p className="text-[var(--text-muted)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:shadow-xl hover:border-cyan-500/30 transition-all duration-300 ${task.status === 'completed' ? 'opacity-75' : ''
                }`}
            >
              <button
                onClick={() => handleToggleStatus(task)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'border-[var(--border-color)] bg-[var(--bg-main)] text-transparent hover:border-emerald-500/50'
                  }`}
              >
                <CheckCircle2 className="w-6 h-6" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-lg font-bold truncate ${task.status === 'completed' ? 'line-through text-[var(--text-muted)]' : ''}`}>
                    {task.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-[var(--text-muted)] line-clamp-1 mb-2">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[var(--text-muted)]">
                  {task.due_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {task.status === 'completed' ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-3 text-cyan-500 hover:bg-cyan-500/10 rounded-xl transition-colors"
                  title="Edit task"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[var(--border-color)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-500 rounded-2xl">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'New Task'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">Task Title</label>
                <input
                  required
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description (Optional)</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                  placeholder="Add more details..."
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] outline-none cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 p-4 border border-[var(--border-color)] rounded-2xl font-bold hover:bg-[var(--bg-main)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00ADC5] hover:bg-[#009fb5] text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,173,197,0.3)] hover:scale-[1.02] active:scale-98 transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasks;
