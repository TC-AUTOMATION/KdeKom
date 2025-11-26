import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const RevenueChart: React.FC = () => {
  // Données de démonstration pour le graphique
  const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Fév', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Avr', revenue: 2780 },
    { name: 'Mai', revenue: 1890 },
    { name: 'Juin', revenue: 2390 },
    { name: 'Juil', revenue: 3490 },
    { name: 'Août', revenue: 2800 },
    { name: 'Sept', revenue: 3200 },
    { name: 'Oct', revenue: 2500 },
    { name: 'Nov', revenue: 2800 },
    { name: 'Déc', revenue: 3800 }
  ];

  const formatEuro = (value: number) => `${value} €`;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            fontSize={12}
            tickMargin={10}
            className="fill-muted-foreground"
          />
          <YAxis
            tickFormatter={formatEuro}
            fontSize={12}
            className="fill-muted-foreground"
          />
          <Tooltip
            formatter={(value: number) => [`${value} €`, 'Revenu']}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
          <Bar
            dataKey="revenue"
            name="Revenu"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;