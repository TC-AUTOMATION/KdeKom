import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn/alert-dialog';
import { cn } from '@/lib/utils';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info'
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[variant];

  const variantStyles = {
    success: {
      bg: 'bg-status-success/20',
      text: 'text-status-success',
      button: 'bg-status-success hover:bg-status-success/80'
    },
    error: {
      bg: 'bg-destructive/20',
      text: 'text-destructive',
      button: 'bg-destructive hover:bg-destructive/90'
    },
    warning: {
      bg: 'bg-status-warning/20',
      text: 'text-status-warning',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    info: {
      bg: 'bg-primary/20',
      text: 'text-primary',
      button: 'bg-primary hover:bg-primary/90'
    }
  };

  const styles = variantStyles[variant];

  return (
    <ShadcnAlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-lg', styles.bg)}>
              <Icon className={cn('h-6 w-6', styles.text)} />
            </div>
            <div className="flex-1">
              {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
              <AlertDialogDescription className="whitespace-pre-line">
                {message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className={styles.button}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadcnAlertDialog>
  );
};

export default AlertDialog;
