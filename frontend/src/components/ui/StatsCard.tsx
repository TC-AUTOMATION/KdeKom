import React from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  valuePrefix = '',
  valueSuffix = ''
}) => {
  // Format number with commas for thousands, handle undefined/null gracefully
  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return "—";
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <div className="transition-all duration-300">
      <Card>
        <CardContent className="p-6 flex items-start">
          <div className={`${color} p-3 rounded-lg text-app-text-primary mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-bold mt-1">
              {valuePrefix}{formatNumber(value)}{valueSuffix}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;