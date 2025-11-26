import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

interface ConvertToInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const ConvertToInvoiceDialog: React.FC<ConvertToInvoiceDialogProps> = ({
  isOpen,
  onClose,
  onConvert,
  onSkip,
  isLoading = false
}) => {
  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-sm z-[10000] transition-all duration-300"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
              className="w-full max-w-md bg-app-dark shadow-2xl border border-app-border rounded-lg transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-status-success/20">
                    <CheckCircle className="h-6 w-6 text-status-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-app-text-primary mb-2">
                      Devis accepté avec succès
                    </h3>
                    <p className="text-app-text-muted text-sm mb-4">
                      Le devis a été marqué comme accepté. Souhaitez-vous créer une facture à partir de ce devis ?
                    </p>
                    <div className="bg-app-dark p- border border-app-border rounded-md">
                      <p className="text-xs text-app-text-secondary">
                        <strong>Note :</strong> Une facture en brouillon sera créée avec les mêmes informations que le devis. Vous pourrez la modifier avant de l'envoyer au client.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    onClick={onConvert}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-app-border hover:bg-app-dark text-app-text-primary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Créer la facture
                      </>
                    )}
                  </button>
                  <button
                    onClick={onSkip}
                    disabled={isLoading}
                    className="px-4 py-2 bg-app-dark text-app-text-secondary font-medium hover:bg-app-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ConvertToInvoiceDialog;
