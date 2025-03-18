import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && (
        <p className="text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default DashboardHeader; 