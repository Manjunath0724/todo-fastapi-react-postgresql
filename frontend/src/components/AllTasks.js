import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

const AllTasks = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: 'in_progress'
  });

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

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

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

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('common.all_tasks')}</h1>
        <p className="text-[var(--text-muted)] text-sm sm:base">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 mb-6 border border-[var(--border-color)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] outline-none"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-white p-2 rounded-lg font-bold"
          >
            <Plus className="w-5 h-5" />
            {t('common.add_task') || 'Add'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : filteredTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:shadow-md transition-all">
            <button
              onClick={() => handleToggleStatus(task)}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--border-color)]'}`}
            >
              {task.status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>{task.title}</h4>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-[var(--bg-main)] rounded-full uppercase font-bold">{task.priority}</span>
                {task.due_date && <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Calendar size={12}/> {task.due_date}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(task)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"><Edit2 size={18}/></button>
              <button onClick={() => handleDelete(task.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 max-w-md w-full border border-[var(--border-color)]">
            <h3 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] outline-none"
                placeholder="Title"
              />
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] outline-none"
                placeholder="Description"
                rows="3"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)]"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 p-3 border border-[var(--border-color)] rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-[var(--accent-primary)] text-white p-3 rounded-lg font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasks;
