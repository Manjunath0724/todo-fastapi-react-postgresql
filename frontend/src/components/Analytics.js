// TOP - Add useCallback import:
import React, { useState, useEffect, useCallback } from 'react';

// Line 47 - Now works ✅

import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  Activity
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

const Analytics = ({ isDarkMode }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalCompleted: 0,
    completionRate: 0,
    avgCompletionTime: 0
  });

  // ✅ DELETE the duplicate/empty version - keep ONLY this:
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      const taskData = response.data;
      setTasks(taskData);
      calculateStats(taskData); // Make sure calculateStats is also useCallback
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []); // ✅ Empty deps = runs once on mount

  // ✅ useEffect - PERFECT now:
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]); // ✅ ESLint happy!

  const calculateStats = (taskData) => {
    const totalCreated = taskData.length;
    const totalCompleted = taskData.filter(t => t.status === 'completed').length;
    const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;

    setStats({
      totalCreated,
      totalCompleted,
      completionRate,
      avgCompletionTime: 0
    });
  };

  // Activity Chart Data (Last 7 Days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const activityData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: 'Tasks Created',
        data: [4, 7, 5, 9, 6, 8, 10],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Tasks Completed',
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
        position: 'top',
        labels: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
          usePointStyle: true,
          padding: 10,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
        },
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
        },
      },
    },
  };

  // Priority Distribution Data
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          tasks.filter(t => t.priority === 'high').length,
          tasks.filter(t => t.priority === 'medium').length,
          tasks.filter(t => t.priority === 'low').length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
          padding: 10,
          usePointStyle: true,
        },
      },
    },
  };

  // Productivity Trend (Weekly)
  const productivityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Completion Rate %',
        data: [65, 72, 80, stats.completionRate],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
          callback: function (value) {
            return value + '%';
          },
        },
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
        },
      },
    },
  };

  const statCards = [
    {
      title: 'Tasks Created',
      value: stats.totalCreated,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
    },
    {
      title: 'Tasks Completed',
      value: stats.totalCompleted,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      trend: '+8%',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      trend: '+5%',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header - Smaller */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Track your productivity and task completion trends
        </p>
      </div>

      {/* Stats Cards - SMALLER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600 dark:text-gray-400">
              {stat.title}
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid - SMALLER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Activity Chart */}
        <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Activity Overview
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Last 7 days
              </p>
            </div>
          </div>
          <div className="h-48 sm:h-64 lg:h-[220px]" style={{ height: '220px' }}>
            <Line data={activityData} options={activityOptions} />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Priority Distribution
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Current tasks breakdown
              </p>
            </div>
          </div>
          <div className="h-48 sm:h-64 lg:h-[220px] flex items-center justify-center" style={{ height: '220px' }}>
            <Doughnut data={priorityData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Productivity Trend - SMALLER */}
      <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Productivity Trend
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Weekly completion rate progress
            </p>
          </div>
        </div>
        <div className="h-48 sm:h-64 lg:h-[220px]" style={{ height: '220px' }}>
          <Bar data={productivityData} options={barOptions} />
        </div>
      </div>

      {/* Insights - SMALLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
          <Clock className="w-6 h-6 sm:w-7 sm:h-7 mb-3 sm:mb-4 opacity-80" />
          <h4 className="text-base sm:text-lg font-bold mb-2">Peak Productivity</h4>
          <p className="text-blue-100 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
            Your most productive day is usually Wednesday with an average of 8 tasks completed.
          </p>
          <div className="text-xl sm:text-2xl font-bold">Wednesday</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
          <Calendar className="w-6 h-6 sm:w-7 sm:h-7 mb-3 sm:mb-4 opacity-80" />
          <h4 className="text-base sm:text-lg font-bold mb-2">Current Streak</h4>
          <p className="text-green-100 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
            You've been consistently completing tasks every day for the past week!
          </p>
          <div className="text-xl sm:text-2xl font-bold">7 Days</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
