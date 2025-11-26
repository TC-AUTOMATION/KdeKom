import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  borderColor?: string;
  bgGradient?: string;
  valueColor?: string;
  delay?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  iconBgColor = 'bg-muted',
  borderColor,
  bgGradient,
  valueColor = 'text-foreground',
  delay = 0
}) => {
  return (
    <div
      className="transition-all duration-300"
    >
      <Card className={cn(bgGradient, borderColor)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('p-1.5 rounded-lg', iconBgColor)}>
              <Icon className={cn('h-4 w-4', iconColor)} />
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{title}</div>
          </div>
          <p className={cn('text-2xl font-semibold mb-1', valueColor)}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICard;
