import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getInvoices } from '../../utils/invoiceStorage';
import { motion } from 'framer-motion';

import { Invoice, calculateTotal } from '../../types/invoice';

const RecentInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const allInvoices = await getInvoices();
        // Sort by date descending and take the 4 most recent
        const sorted = allInvoices
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 4);
        setInvoices(sorted);
      } catch (error) {
        console.error('Erreur lors du chargement des factures récentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: <CheckCircle size={16} />, color: 'text-status-success bg-status-success/10', text: 'Payée' };
      case 'sent':
        return { icon: <Clock size={16} />, color: 'text-status-warning bg-yellow-50', text: 'Non payée' };
      case 'overdue':
        return { icon: <AlertCircle size={16} />, color: 'text-status-error bg-red-50', text: 'En retard' };
      case 'draft':
        return { icon: <FileText size={16} />, color: 'text-app-text-muted bg-app-hover', text: 'Brouillon' };
      case 'cancelled':
        return { icon: <AlertCircle size={16} />, color: 'text-app-text-muted bg-app-hover', text: 'Annulée' };
      default:
        return { icon: <FileText size={16} />, color: 'text-app-text-muted bg-app-hover', text: 'Inconnue' };
    }
  };

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="p-3 border rounded-md animate-pulse">
            <div className="h-4 bg-app-hover w-1/2 mb-2"></div>
            <div className="h-3 bg-app-hover w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {invoices.map((invoice) => {
        const statusInfo = getStatusInfo(invoice.status);
        
        return (
          <motion.div
            key={invoice.id}
            variants={itemVariants}
            className="p-3 border border-app-border rounded-md hover:bg-app-hover transition-colors flex items-center justify-between"
          >
            <div>
              <div className="flex items-center">
                <FileText size={16} className="text-app-text-muted mr-2" />
                <p className="font-medium text-sm">{invoice.id}</p>
              </div>
              <div className="mt-1">
                <p className="text-sm text-app-text-secondary">
                  {typeof invoice.client === 'object' && invoice.client !== null
                    ? invoice.client.name
                    : invoice.client}
                </p>
                <p className="text-sm font-medium">
                  {typeof calculateTotal === "function" && Array.isArray(invoice.items)
                    ? calculateTotal(invoice.items).toFixed(2) + " €"
                    : "— €"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`flex items-center px-2 py-1 mr-3 ${statusInfo.color}`}>
                <span className="mr-1">{statusInfo.icon}</span>
                <span className="text-xs">{statusInfo.text}</span>
              </div>
              <button
                className="p-1 text-app-text-muted hover:text-app-text-primary"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        );
      })}
      
      <div className="mt-4 text-center">
        <button className="text-sm text-app-text-muted hover:text-app-text-secondary font-medium">
          Voir toutes les factures
        </button>
      </div>
    </motion.div>
  );
};

export default RecentInvoices;