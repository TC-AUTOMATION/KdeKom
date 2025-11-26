/**
 * Compatibility layer for invoiceStorage -> invoice.service migration
 * This file exports the same functions as invoiceStorage but uses the new API backend
 */

import { Invoice } from '../types/invoice';
import { InvoiceService } from '../services/invoice.service';

// Re-export all functions with the same signatures
export const getInvoices = () => InvoiceService.getAllInvoices();
export const getInvoiceById = (id: string) => InvoiceService.getInvoiceById(id);
export const createInvoice = (invoice: Invoice) => InvoiceService.createInvoice(invoice);
export const updateInvoice = (invoice: Invoice) => InvoiceService.updateInvoice(invoice);
export const deleteInvoice = (id: string) => InvoiceService.deleteInvoice(id);
