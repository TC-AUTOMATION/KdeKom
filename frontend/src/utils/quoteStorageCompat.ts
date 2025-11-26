/**
 * Compatibility layer for quoteStorage -> quote.service migration
 * This file exports the same functions as quoteStorage but uses the new API backend
 */

import { Quote } from '../types/quote';
import { QuoteService } from '../services/quote.service';

// Re-export all functions with the same signatures
export const getQuotes = () => QuoteService.getAllQuotes();
export const getQuoteById = (id: string) => QuoteService.getQuoteById(id);
export const createQuote = (quote: Quote) => QuoteService.createQuote(quote);
export const updateQuote = (quote: Quote) => QuoteService.updateQuote(quote);
export const deleteQuote = (id: string) => QuoteService.deleteQuote(id);
