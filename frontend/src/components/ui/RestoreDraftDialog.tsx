import React from 'react';
import { createPortal } from 'react-dom';
import { FileText, X } from 'lucide-react';

interface RestoreDraftDialogProps {
  isOpen: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  timestamp: Date | null;
  type: 'invoice' | 'quote';
}

const RestoreDraftDialog: React.FC<RestoreDraftDialogProps> = ({
  isOpen,
  onRestore,
  onDiscard,
  timestamp,
  type
}) => {
  const formatTimestamp = (date: Date | null) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'il y a quelques secondes';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const typeLabel = type === 'invoice' ? 'facture' : 'devis';

  return createPortal(
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-sm z-[10000] transition-all duration-300"
          />

          {/* Dialog */}
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300"
          >
            <div className="bg-app-dark shadow-2xl border border-app-border rounded-lg max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-app-border rounded">
                    <FileText className="w-6 h-6 text-app-text-muted" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-app-text-primary">
                      Brouillon trouvé
                    </h3>
                    <p className="text-sm text-app-text-muted">
                      {formatTimestamp(timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-app-text-secondary mb-3">
                  Un brouillon de {typeLabel} a été sauvegardé automatiquement. Voulez-vous le restaurer ?
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 p- rounded-md">
                  <p className="text-amber-400 text-xs">
                    ⚠️ En choisissant "Nouveau {typeLabel}", le brouillon sera définitivement supprimé.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onDiscard}
                  className="flex-1 px-4 py-2.5 bg-app-dark text-app-text-primary font-medium hover:bg-app-border transition-colors"
                >
                  Nouveau {typeLabel}
                </button>
                <button
                  onClick={onRestore}
                  className="flex-1 px-4 py-2.5 bg-app-border text-app-text-primary font-medium hover:bg-app-dark transition-colors"
                >
                  Restaurer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
};

export default RestoreDraftDialog;
