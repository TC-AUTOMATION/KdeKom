import React from 'react';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  isLoading?: boolean;
  striped?: boolean;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'Aucune donnée disponible',
  emptyIcon,
  isLoading = false,
  striped = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin h-16 w-16 border-4 border-border border-t-primary rounded-full mb-4 mx-auto"></div>
        <p className="text-lg font-medium text-foreground">Chargement...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        {emptyIcon && <div className="mb-4 flex justify-center">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <ShadcnTable>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                getAlignment(column.align),
                column.className
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={item.id || index}
            onClick={() => onRowClick?.(item)}
            className={cn(
              onRowClick && 'cursor-pointer',
              striped && index % 2 === 1 && 'bg-muted/50'
            )}
          >
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  getAlignment(column.align),
                  column.className
                )}
              >
                {column.render
                  ? column.render(item)
                  : (item as any)[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </ShadcnTable>
  );
}

export default Table;
