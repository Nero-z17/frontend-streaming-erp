// src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, subtext }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 dark:text-white mt-2">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
  );
};

export default StatCard;