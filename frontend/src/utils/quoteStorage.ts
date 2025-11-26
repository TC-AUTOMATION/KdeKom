/**
 * Compatibility layer for quoteStorage -> quote.service migration
 * This file exports the same functions as quoteStorage but uses the new API backend
 */

import { Quote } from '../types/quote';
import { Invoice } from '../types/invoice';
import { QuoteService } from '../services/quote.service';
import { InvoiceService } from '../services/invoice.service';

// Re-export all functions with the same signatures
export const getQuotes = () => QuoteService.getAllQuotes();
export const getQuoteById = (id: string) => QuoteService.getQuoteById(id);
export const createQuote = (quote: Quote) => QuoteService.createQuote(quote);
export const updateQuote = (quote: Quote) => QuoteService.updateQuote(quote);
export const deleteQuote = (id: string) => QuoteService.deleteQuote(id);

/**
 * Convert a quote to an invoice
 * @param quoteId - The ID of the quote to convert
 * @returns The invoice number of the created invoice
 */
export const convertQuoteToInvoice = async (quoteId: string): Promise<string> => {
  try {
    // 1. Get the quote
    const quote = await QuoteService.getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} not found`);
    }

    // 2. Calculate due date (30 days from now)
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // 3. Create invoice from quote data (backend will generate invoice_number automatically)
    const invoice: Invoice = {
      date: today.toISOString(),
      dueDate: dueDate.toISOString(),
      paymentMethod: 'Virement',
      status: 'draft',
      client: quote.client,
      items: quote.items,
      notes: quote.notes,
      company: quote.company
    };

    // 4. Save the invoice (backend returns the created invoice with generated invoice_number)
    const createdInvoice = await InvoiceService.createInvoice(invoice);
    const invoiceNumber = createdInvoice.invoiceNumber || createdInvoice.id;

    // 5. Update the quote status to 'converted' and link to invoice
    const updatedQuote: Quote = {
      ...quote,
      status: 'converted',
      convertedToInvoiceId: invoiceNumber
    };
    await QuoteService.updateQuote(updatedQuote);

    // 6. Return the invoice number
    return invoiceNumber;
  } catch (error) {
    console.error('Error converting quote to invoice:', error);
    throw error;
  }
};
