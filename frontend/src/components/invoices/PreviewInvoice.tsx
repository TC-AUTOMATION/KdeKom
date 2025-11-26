import React, { useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Invoice } from '../../types/invoice';

interface PreviewInvoiceProps {
  invoice: Invoice;
  isQuote?: boolean;
}

export interface PreviewInvoiceRef {
  refresh: () => void;
}

const PreviewInvoice = forwardRef<PreviewInvoiceRef, PreviewInvoiceProps>(({ invoice, isQuote = false }, ref) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // Fonction pour charger le PDF du preview depuis le backend
  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Debug log - voir ce qui est envoyé au backend
      console.log('🔍 [FRONTEND] Sending to backend:', {
        postalCode: invoice.client?.postalCode,
        postalCodeType: typeof invoice.client?.postalCode,
        phone: invoice.client?.phone,
        phoneType: typeof invoice.client?.phone
      });

      const apiEndpoint = isQuote ? '/api/quotes/pdf' : '/api/invoices/pdf';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du preview');
      }

      // Nettoyer l'ancienne URL si elle existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Créer un Blob à partir de la réponse PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setHasGenerated(true);
    } catch (err) {
      console.error('Error fetching preview:', err);
      setError('Impossible de charger le preview');
    } finally {
      setLoading(false);
    }
  }, [invoice, isQuote, pdfUrl]);

  // Exposer la méthode refresh au composant parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchPreview
  }), [fetchPreview]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin h-12 w-12 border-b-2 border-app-border rounded-full"></div>
        <p className="text-app-text-muted text-sm">Génération du PDF en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-status-error">{error}</div>
      </div>
    );
  }

  if (!hasGenerated && !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-16 h-16 text-app-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="text-center">
          <p className="text-app-text-secondary font-medium mb-1">Aperçu non généré</p>
          <p className="text-app-text-muted text-sm">Cliquez sur "Générer l'aperçu" pour visualiser le document</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col items-center"
      style={{
        backgroundColor: '#525659', // Match template background
        padding: '0',
        overflow: 'hidden'
      }}
    >
      {pdfUrl && (
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="border-0"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '600px'
          }}
          title={isQuote ? "Quote Preview" : "Invoice Preview"}
        />
      )}
    </motion.div>
  );
});

PreviewInvoice.displayName = 'PreviewInvoice';

export default PreviewInvoice;