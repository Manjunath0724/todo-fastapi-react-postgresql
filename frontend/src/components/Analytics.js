import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  CheckCircle2,
  Target
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalCompleted: 0,
    completionRate: 0,
    avgCompletionTime: 0
  });

  const calculateStats = useCallback((taskData) => {
    const totalCreated = taskData.length;
    const totalCompleted = taskData.filter(t => t.status === 'completed').length;
    const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;

    setStats({
      totalCreated,
      totalCompleted,
      completionRate,
      avgCompletionTime: 0
    });
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      const taskData = response.data;
      setTasks(taskData);
      calculateStats(taskData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Force re-render when theme changes
      setTasks(prev => [...prev]);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const chartTextColor = isDarkMode ? '#e2e8f0' : '#475569';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const activityData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: 'Created',
        data: [4, 7, 5, 9, 6, 8, 10],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Done',
        data: [3, 5, 4, 7, 5, 6, 8],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor }
      }
    },
    scales: {
      y: { grid: { color: gridColor }, ticks: { color: chartTextColor } },
      x: { grid: { color: gridColor }, ticks: { color: chartTextColor } }
    }
  };

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          tasks.filter(t => t.priority === 'high').length,
          tasks.filter(t => t.priority === 'medium').length,
          tasks.filter(t => t.priority === 'low').length,
        ],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgb(239, 68, 68)', 'rgb(234, 179, 8)', 'rgb(34, 197, 94)'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('common.analytics')}</h1>
        <p className="text-[var(--text-muted)] text-sm sm:base">Track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Created', value: stats.totalCreated, icon: Target, color: 'text-blue-500' },
          { title: 'Done', value: stats.totalCompleted, icon: CheckCircle2, color: 'text-green-500' },
          { title: 'Completion Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <h3 className="text-sm text-[var(--text-muted)] font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl h-80">
          <h3 className="font-bold mb-4">Activity Overview</h3>
          <div className="h-60"><Line data={activityData} options={activityOptions} /></div>
        </div>
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl h-80">
          <h3 className="font-bold mb-4">Priority Distribution</h3>
          <div className="h-60 flex items-center justify-center"><Doughnut data={priorityData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
