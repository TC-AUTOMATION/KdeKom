import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Car,
  CreditCard,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Invoice, InvoiceItem, Client } from '../../types/invoice';
import { PrestationService } from '../../services/prestation.service';
import { CustomerPrestation } from '../../types/prestation';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import AlertDialog from '../ui/AlertDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Input } from '@/components/ui/shadcn/input';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { DatePicker } from '@/components/ui/DatePicker';

interface InvoiceFormProps {
  invoice: Invoice;
  onClientChange: (client: Client) => void;
  onItemChange: (index: number, item: InvoiceItem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  suggestedClients: Client[];
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  onSave?: () => void;
  isSaving?: boolean;
  isQuote?: boolean;
  companies?: Array<{ id: string; name: string; companyName?: string; owner: string; address: string; postalCode: string; city: string; phone: string; email: string; siret: string; isSubjectToVat?: boolean }>;
  onCompanyChange?: (companyId: string) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onClientChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  suggestedClients,
  setInvoice,
  onSave,
  isSaving = false,
  isQuote = false,
  companies = [],
  onCompanyChange
}) => {
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [highlightedClientIndex, setHighlightedClientIndex] = useState<number>(-1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prestations, setPrestations] = useState<CustomerPrestation[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: '',
    variant: 'info'
  });

  const clientSuggestionsRef = useRef<HTMLDivElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Check if company is subject to VAT
  const isSubjectToVat = invoice.company?.isSubjectToVat !== false;

  // Get client ID when client changes
  useEffect(() => {
    if (invoice.client.name && suggestedClients.length > 0) {
      const selectedClient = suggestedClients.find(c => c.name === invoice.client.name);
      console.log('[InvoiceForm] Looking for client:', invoice.client.name);
      console.log('[InvoiceForm] Found client:', selectedClient);
      console.log('[InvoiceForm] Current invoice.client:', invoice.client);
      console.log('[InvoiceForm] Suggested clients:', suggestedClients);
      if (selectedClient && selectedClient.id) {
        setClientId(selectedClient.id);
      } else {
        setClientId(null);
      }
    } else {
      setClientId(null);
    }
  }, [invoice.client.name, suggestedClients]);

  // Load prestations and vehicles when client ID changes
  useEffect(() => {
    const loadClientData = async () => {
      console.log('[InvoiceForm] Loading data for clientId:', clientId, 'companyId:', invoice.company?.id);
      console.log('[InvoiceForm] Full company object:', invoice.company);
      if (clientId && invoice.company?.id) {
        try {
          const [prestationsData, vehiclesData] = await Promise.all([
            PrestationService.getActiveCustomerPrestations(clientId),
            VehicleService.getVehiclesByClientAndCompany(clientId, invoice.company.id)
          ]);
          console.log('[InvoiceForm] Loaded prestations:', prestationsData);
          console.log('[InvoiceForm] Loaded vehicles:', vehiclesData);
          setPrestations(prestationsData);
          setClientVehicles(vehiclesData);
        } catch (error) {
          console.error('Error loading client data:', error);
          setPrestations([]);
          setClientVehicles([]);
        }
      } else {
        console.log('[InvoiceForm] No clientId or companyId, clearing data');
        setPrestations([]);
        setClientVehicles([]);
      }
    };
    loadClientData();
  }, [clientId, invoice.company?.id]);

  // Scroll to tabs when section changes
  useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [activeSection]);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Handle click outside client suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientSuggestionsRef.current && 
        !clientSuggestionsRef.current.contains(event.target as Node) &&
        clientInputRef.current && 
        !clientInputRef.current.contains(event.target as Node)
      ) {
        setShowClientSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Client suggestions keyboard navigation
  const handleClientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showClientSuggestions) return;
    
    const filteredClients = suggestedClients.filter(client => 
      client.name.toLowerCase().includes(invoice.client.name.toLowerCase())
    );
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedClientIndex(prev => 
          prev < filteredClients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedClientIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedClientIndex >= 0 && highlightedClientIndex < filteredClients.length) {
          onClientChange(filteredClients[highlightedClientIndex]);
          setShowClientSuggestions(false);
          setHighlightedClientIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowClientSuggestions(false);
        setHighlightedClientIndex(-1);
        break;
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!invoice.id) newErrors.id = 'Le numéro de facture est requis';
    if (!invoice.date) newErrors.date = 'La date est requise';
    if (!invoice.client.name) newErrors.clientName = 'Le nom du client est requis';

    invoice.items.forEach((item, index) => {
      if (!item.description) newErrors[`item-${index}-description`] = 'La description est requise';
      if (item.quantity <= 0) newErrors[`item-${index}-quantity`] = 'La quantité doit être positive';
      if (item.unitPrice < 0) newErrors[`item-${index}-price`] = 'Le prix doit être positif ou nul';

      // Vehicle information is now optional - no validation required
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    // Allow saving without validation - status will be set to draft if incomplete
    if (onSave) {
      onSave();
    }
  };

  // Format license plate - supports both old (1234-AB-12) and new (AB-123-CD) French formats
  const formatLicensePlate = (value: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (cleaned.length === 0) return '';

    // Detect format based on first character
    const startsWithDigit = /^\d/.test(cleaned);

    if (startsWithDigit) {
      // Old format: 1234-AB-12 (4 digits - 2 letters - 2 digits)
      let formatted = '';
      for (let i = 0; i < cleaned.length && i < 8; i++) {
        if (i === 4 || i === 6) {
          formatted += '-';
        }
        formatted += cleaned[i];
      }
      return formatted;
    } else {
      // New format: AB-123-CD (2 letters - 3 digits - 2 letters)
      let formatted = '';
      for (let i = 0; i < cleaned.length && i < 7; i++) {
        if (i === 2 || i === 5) {
          formatted += '-';
        }
        formatted += cleaned[i];
      }
      return formatted;
    }
  };

  // Calculate total price with and without tax
  const calculateTotals = () => {
    let totalHT = 0;
    let totalTTC = 0;

    invoice.items.forEach(item => {
      // Handle null/undefined values with default 0
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const taxRate = Number(item.taxRate) || 0;

      const itemTotal = quantity * unitPrice * (1 - discount / 100);
      totalHT += itemTotal;
      totalTTC += itemTotal * (1 + taxRate / 100);
    });

    return { totalHT: totalHT.toFixed(2), totalTTC: totalTTC.toFixed(2) };
  };

  const { totalHT, totalTTC } = calculateTotals();

  return (
    <div className="p-6 bg-app-dark/50 shadow-md border border-app-border rounded-lg">
      {/* Progress indicator and navigation tabs */}
      <div ref={tabsRef} className="mb-8">
        <div className="flex border-b border-app-border mb-6">
          <button
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeSection === 'general' 
                ? 'border-b-2 border-app-border text-app-text-muted' 
                : 'text-app-text-muted hover:text-app-text-primary'
            }`}
            onClick={() => setActiveSection('general')}
            aria-selected={activeSection === 'general'}
            role="tab"
          >
            <FileText size={16} className="inline mr-2" />
            Informations générales
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeSection === 'client' 
                ? 'border-b-2 border-app-border text-app-text-muted' 
                : 'text-app-text-muted hover:text-app-text-primary'
            }`}
            onClick={() => setActiveSection('client')}
            aria-selected={activeSection === 'client'}
            role="tab"
          >
            <User size={16} className="inline mr-2" />
            Client
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeSection === 'items' 
                ? 'border-b-2 border-app-border text-app-text-muted' 
                : 'text-app-text-muted hover:text-app-text-primary'
            }`}
            onClick={() => setActiveSection('items')}
            aria-selected={activeSection === 'items'}
            role="tab"
          >
            <CreditCard size={16} className="inline mr-2" />
            Prestations
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeSection === 'notes' 
                ? 'border-b-2 border-app-border text-app-text-muted' 
                : 'text-app-text-muted hover:text-app-text-primary'
            }`}
            onClick={() => setActiveSection('notes')}
            aria-selected={activeSection === 'notes'}
            role="tab"
          >
            <FileText size={16} className="inline mr-2" />
            Notes
          </button>
        </div>
      </div>

      {/* Form content */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          {activeSection === 'general' && (
            <motion.div
              key="general"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-app-dark p-6 rounded-lg shadow-sm border border-app-border"
            >
              <h2 className="text-xl font-semibold mb-6 text-app-text-primary">Informations générales</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.length > 0 && (
                  <div className="md:col-span-2">
                    <label htmlFor="companySelect" className="block text-sm font-medium text-app-text-secondary mb-1">
                      Entreprise émettrice <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-muted z-10 pointer-events-none" />
                      <Select value={invoice.company?.id || ''} onValueChange={(value) => onCompanyChange?.(value)}>
                        <SelectTrigger id="companySelect" className="pl-10 w-full h-11 border-app-border bg-app-dark text-app-text-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {invoice.company?.isSubjectToVat === false && (
                      <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
                        <p className="text-amber-400 text-sm">
                          ⚠️ Cette entreprise n'est pas assujettie à la TVA.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label htmlFor="invoiceId" className="block text-sm font-medium text-app-text-secondary mb-1">
                    {isQuote ? 'N° de devis' : 'N° de facture'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-muted z-10 pointer-events-none" />
                    <Input
                      id="invoiceId"
                      type="text"
                      className={`pl-10 h-11 ${errors.id ? 'border-rose-500 ring-1 ring-rose-500' : 'border-app-border'} bg-app-dark text-app-text-primary`}
                      value={invoice.id}
                      onChange={(e) => setInvoice({ ...invoice, id: e.target.value })}
                      aria-invalid={errors.id ? 'true' : 'false'}
                      aria-describedby={errors.id ? 'error-invoiceId' : undefined}
                    />
                  </div>
                  {errors.id && (
                    <p id="error-invoiceId" className="mt-1 text-sm text-rose-600">{errors.id}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="invoiceDate" className="block text-sm font-medium text-app-text-secondary mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <DatePicker
                    id="invoiceDate"
                    value={invoice.date}
                    onChange={(date) => setInvoice({ ...invoice, date })}
                    className={errors.date ? 'border-rose-500 ring-1 ring-rose-500' : ''}
                  />
                  {errors.date && (
                    <p id="error-invoiceDate" className="mt-1 text-sm text-rose-600">{errors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-app-text-secondary mb-1">
                    {isQuote ? 'Valable jusqu\'au' : 'Date d\'échéance'}
                  </label>
                  <DatePicker
                    id="dueDate"
                    value={invoice.dueDate}
                    onChange={(date) => setInvoice({ ...invoice, dueDate: date })}
                  />
                </div>

                {!isQuote && (
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-app-text-secondary mb-1">
                      Méthode de paiement
                    </label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-muted z-10 pointer-events-none" />
                      <Select value={invoice.paymentMethod} onValueChange={(value) => setInvoice({ ...invoice, paymentMethod: value })}>
                        <SelectTrigger id="paymentMethod" className="pl-10 w-full h-11 border-app-border bg-app-dark text-app-text-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Virement">Virement</SelectItem>
                          <SelectItem value="Carte Bancaire">Carte Bancaire</SelectItem>
                          <SelectItem value="Espèces">Espèces</SelectItem>
                          <SelectItem value="Chèque">Chèque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 bg-app-border text-app-text-primary rounded-md shadow-sm hover:bg-app-dark focus:outline-none focus:ring-2 focus:ring-app-border transition-colors duration-150"
                  onClick={() => setActiveSection('client')}
                >
                  Continuer vers Client
                  <ChevronRight size={16} className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}
          
          {activeSection === 'client' && (
            <motion.div
              key="client"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-app-dark p-6 rounded-lg shadow-sm border border-app-border"
            >
              <h2 className="text-xl font-semibold mb-6 text-app-text-primary">Informations client</h2>
              
              <div className="mb-6">
                <label htmlFor="clientName" className="block text-sm font-medium text-app-text-secondary mb-1">
                  Sélectionner un client <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-muted z-10 pointer-events-none" />
                  <Input
                    id="clientName"
                    ref={clientInputRef}
                    type="text"
                    placeholder="Rechercher un client existant..."
                    className={`pl-10 h-11 ${errors.clientName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-app-border'} bg-app-dark text-app-text-primary`}
                    value={invoice.client.name}
                    onChange={(e) => {
                      onClientChange({ ...invoice.client, name: e.target.value });
                      setShowClientSuggestions(true);
                      setHighlightedClientIndex(-1);
                    }}
                    onFocus={() => setShowClientSuggestions(true)}
                    onKeyDown={handleClientKeyDown}
                    autoComplete="off"
                    aria-invalid={errors.clientName ? 'true' : 'false'}
                    aria-describedby={errors.clientName ? 'error-clientName' : undefined}
                    aria-autocomplete="list"
                    aria-controls={showClientSuggestions ? "client-suggestions" : undefined}
                    aria-expanded={showClientSuggestions}
                  />
                </div>
                <p className="mt-1 text-xs text-app-text-muted">Veuillez sélectionner un client existant dans la liste</p>
                {errors.clientName && (
                  <p id="error-clientName" className="mt-1 text-sm text-rose-600">{errors.clientName}</p>
                )}

                {showClientSuggestions && (
                  <div
                    ref={clientSuggestionsRef}
                    id="client-suggestions"
                    className="absolute z-10 mt-1 w-full max-w-md bg-app-dark border border-app-border rounded-md shadow-lg max-h-60 overflow-auto"
                    role="listbox"
                  >
                    {suggestedClients
                      .filter(client =>
                        client.name.toLowerCase().includes(invoice.client.name.toLowerCase())
                      )
                      .map((client, index) => {
                        const isHighlighted = index === highlightedClientIndex;
                        return (
                          <div
                            key={index}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-app-border' : 'hover:bg-app-dark'
                            }`}
                            onClick={() => {
                              onClientChange(client);
                              setShowClientSuggestions(false);
                            }}
                            onMouseEnter={() => setHighlightedClientIndex(index)}
                            role="option"
                            aria-selected={isHighlighted}
                          >
                            <p className="font-medium text-app-text-primary">{client.name}</p>
                            <p className="text-sm text-app-text-muted">{client.address}, {client.postalCode} {client.city}</p>
                            {client.email && <p className="text-sm text-app-text-muted">{client.email}</p>}
                          </div>
                        );
                      })
                    }
                    {suggestedClients.filter(client =>
                      client.name.toLowerCase().includes(invoice.client.name.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-app-text-muted">
                        Aucun client trouvé. Créez d'abord un client dans la page Clients.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Read-only client information display */}
              {invoice.client.name && (
                <div className="bg-app-dark border border-app-border rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-app-text-secondary mb-3">Informations du client</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {invoice.client.type && (
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-app-text-muted mt-0.5 flex-shrink-0" />
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          invoice.client.type === 'b2b'
                            ? 'bg-status-info/20 text-status-info'
                            : 'bg-status-success/20 text-status-success'
                        }`}>
                          {invoice.client.type === 'b2b' ? 'Professionnel (B2B)' : 'Particulier (B2C)'}
                        </span>
                      </div>
                    )}
                    {invoice.client.type === 'b2b' && invoice.client.siret && (
                      <div className="flex items-start gap-2">
                        <FileText size={16} className="text-app-text-muted mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-app-text-muted text-xs">SIRET: </span>
                          <span className="text-app-text-secondary font-mono">{invoice.client.siret}</span>
                        </div>
                      </div>
                    )}
                    {invoice.client.address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-app-text-muted mt-0.5 flex-shrink-0" />
                        <span className="text-app-text-secondary">{invoice.client.address}</span>
                      </div>
                    )}
                    {(invoice.client.postalCode || invoice.client.city) && (
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-app-text-muted mt-0.5 flex-shrink-0" />
                        <span className="text-app-text-secondary">
                          {invoice.client.postalCode} {invoice.client.city}
                        </span>
                      </div>
                    )}
                    {invoice.client.email && (
                      <div className="flex items-start gap-2">
                        <Mail size={16} className="text-app-text-muted mt-0.5 flex-shrink-0" />
                        <span className="text-app-text-secondary">{invoice.client.email}</span>
                      </div>
                    )}
                    {invoice.client.phone && (
                      <div className="flex items-start gap-2">
                        <Phone size={16} className="text-app-text-muted mt-0.5 flex-shrink-0" />
                        <span className="text-app-text-secondary">{invoice.client.phone}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-app-text-muted italic">
                    Pour modifier ces informations, rendez-vous sur la page Clients
                  </p>
                </div>
              )}
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 border border-app-border text-app-text-secondary rounded-md shadow-sm hover:bg-app-dark focus:outline-none focus:ring-2 focus:ring-app-border transition-colors duration-150"
                  onClick={() => setActiveSection('general')}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Retour
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 bg-app-border text-app-text-primary rounded-md shadow-sm hover:bg-app-dark focus:outline-none focus:ring-2 focus:ring-app-border transition-colors duration-150"
                  onClick={() => setActiveSection('items')}
                >
                  Continuer vers Prestations
                  <ChevronRight size={16} className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}
          
          {activeSection === 'items' && (
            <motion.div
              key="items"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-app-dark p-6 rounded-lg shadow-sm border border-app-border"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold text-app-text-primary">Prestations</h2>
                <div className="mt-2 sm:mt-0 text-right">
                  <p className="text-sm text-app-text-muted mb-1">Total HT: <span className="font-medium">{totalHT} €</span></p>
                  {isSubjectToVat && (
                    <p className="text-lg font-semibold text-app-text-primary">Total TTC: <span>{totalTTC} €</span></p>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {invoice.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="border border-app-border p-5 rounded-md bg-app-dark"
                      layout
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium flex items-center text-app-text-primary">
                          <span className="bg-app-border text-app-text-muted text-xs font-semibold px-2.5 py-1 mr-2">
                            #{index + 1}
                          </span>
                          Prestation
                        </h3>
                        
                        <button
                          type="button"
                          onClick={() => onRemoveItem(index)}
                          className={`text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 transition-colors ${
                            invoice.items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={invoice.items.length === 1}
                          aria-label="Supprimer la prestation"
                          title="Supprimer la prestation"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`item-${index}-description`} className="block text-sm font-medium text-app-text-secondary mb-1">
                            Description <span className="text-rose-500">*</span>
                          </label>
                          <Select
                            value={item.description}
                            onValueChange={(value) => {
                              const selectedPrestation = prestations.find(p => p.name === value);
                              if (selectedPrestation) {
                                // Use 0 if company is not subject to VAT, otherwise use prestation's tax rate
                                const taxRate = isSubjectToVat ? selectedPrestation.taxRate : 0;
                                onItemChange(index, {
                                  ...item,
                                  description: value,
                                  unitPrice: selectedPrestation.unitPrice,
                                  taxRate: taxRate
                                });
                              } else {
                                onItemChange(index, { ...item, description: value });
                              }
                            }}
                            disabled={!clientId || prestations.length === 0}
                          >
                            <SelectTrigger id={`item-${index}-description`} className="w-full bg-app-dark text-app-text-primary border-app-border">
                              <SelectValue placeholder={
                                !clientId
                                  ? "Veuillez d'abord sélectionner un client"
                                  : prestations.length === 0
                                  ? "Aucune prestation active pour ce client"
                                  : "Sélectionnez une prestation..."
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {prestations.map((prestation) => (
                                <SelectItem key={prestation.id} value={prestation.name}>
                                  {prestation.name} - {prestation.unitPrice.toFixed(2)}€ HT
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`item-${index}-description`] && (
                            <p id={`error-item-${index}-description`} className="mt-1 text-sm text-rose-600">
                              {errors[`item-${index}-description`]}
                            </p>
                          )}
                        </div>
                        
                        {/* Vehicle Section */}
                        <div className="border border-app-border p-4 rounded-md bg-app-dark">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Car size={18} className="text-app-text-muted" />
                              <h4 className="text-sm font-semibold text-zinc-200">Informations Véhicule</h4>
                            </div>
                            {clientId && item.vehicle?.registration && item.vehicle?.brand && item.vehicle?.model && (
                              (() => {
                                // Find the vehicle in database by registration
                                const dbVehicle = clientVehicles.find(
                                  v => v.registration.replace(/-/g, '').toUpperCase() === item.vehicle!.registration.replace(/-/g, '').toUpperCase()
                                );

                                // Check if vehicle exists and if data has been modified
                                if (dbVehicle) {
                                  const hasChanges =
                                    dbVehicle.brand.toLowerCase().trim() !== item.vehicle!.brand.toLowerCase().trim() ||
                                    dbVehicle.model.toLowerCase().trim() !== item.vehicle!.model.toLowerCase().trim();

                                  if (hasChanges) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            // Update the vehicle
                                            const updatedVehicle = await VehicleService.updateVehicle(dbVehicle.id, {
                                              brand: item.vehicle?.brand || '',
                                              model: item.vehicle?.model || '',
                                            });

                                            if (updatedVehicle) {
                                              // Update local list
                                              setClientVehicles(prev =>
                                                prev.map(v => v.id === dbVehicle.id ? updatedVehicle : v)
                                              );
                                            } else {
                                              setAlertDialog({
                                                isOpen: true,
                                                message: 'Erreur lors de la mise à jour du véhicule',
                                                variant: 'error'
                                              });
                                            }
                                          } catch (error) {
                                            console.error('Error updating vehicle:', error);
                                            setAlertDialog({
                                              isOpen: true,
                                              message: 'Erreur lors de la mise à jour du véhicule',
                                              variant: 'error'
                                            });
                                          }
                                        }}
                                        className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-app-text-primary transition-colors flex items-center gap-1"
                                      >
                                        <RefreshCw size={14} />
                                        Mettre à jour en base
                                      </button>
                                    );
                                  }

                                  return (
                                    <span className="px-3 py-1 text-xs bg-app-border text-app-text-muted flex items-center gap-1">
                                      <CheckCircle size={14} />
                                      En base de données
                                    </span>
                                  );
                                }

                                return (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        if (!clientId) {
                                          setAlertDialog({
                                            isOpen: true,
                                            message: 'Le client doit d\'abord être enregistré en base de données avant d\'ajouter un véhicule',
                                            variant: 'warning'
                                          });
                                          return;
                                        }

                                        const companyId = invoice.company.id;
                                        if (!companyId) {
                                          setAlertDialog({
                                            isOpen: true,
                                            message: 'Aucune entreprise sélectionnée',
                                            variant: 'error'
                                          });
                                          return;
                                        }

                                        // Create the vehicle
                                        const newVehicle = await VehicleService.createVehicle({
                                          brand: item.vehicle?.brand || '',
                                          model: item.vehicle?.model || '',
                                          registration: item.vehicle?.registration || '',
                                          client_id: clientId,
                                          company_id: companyId,
                                        });

                                        if (newVehicle) {
                                          // Add to local list immediately
                                          setClientVehicles(prev => [newVehicle, ...prev]);
                                          // Clear errors for this item
                                          setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors[`item-${index}-vehicle`];
                                            return newErrors;
                                          });
                                        } else {
                                          setAlertDialog({
                                            isOpen: true,
                                            message: 'Erreur lors de l\'ajout du véhicule',
                                            variant: 'error'
                                          });
                                        }
                                      } catch (error) {
                                        console.error('Error adding vehicle:', error);
                                        setAlertDialog({
                                          isOpen: true,
                                          message: 'Erreur lors de l\'ajout du véhicule',
                                          variant: 'error'
                                        });
                                      }
                                    }}
                                    className="px-3 py-1 text-xs bg-status-success hover:bg-status-success/80 text-app-text-primary transition-colors flex items-center gap-1 animate-pulse"
                                  >
                                    <Plus size={14} />
                                    Ajouter à la base
                                  </button>
                                );
                              })()
                            )}
                          </div>
                          {errors[`item-${index}-vehicle`] && (
                            <div className="mb-3 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-md">
                              <p className="text-sm text-rose-400 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                {errors[`item-${index}-vehicle`]}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                              <label className="text-xs font-medium text-app-text-muted mb-1 block">
                                Immatriculation
                              </label>
                              <Input
                                type="text"
                                placeholder="AA-123-BB"
                                list={`vehicles-${index}`}
                                className="h-9 border-app-border bg-app-dark text-app-text-primary text-sm uppercase"
                                value={item.vehicle?.registration || ''}
                                onChange={(e) => {
                                  const formattedPlate = formatLicensePlate(e.target.value);
                                  const cleanedPlate = formattedPlate.replace(/-/g, '');

                                  // Only check database if we have a complete plate (at least 6 characters without dashes)
                                  // Old format: 1234AB12 (8 chars) or New format: AB123CD (7 chars)
                                  if (cleanedPlate.length >= 6) {
                                    const existingVehicle = clientVehicles.find(
                                      v => v.registration.replace(/-/g, '').toUpperCase() === cleanedPlate
                                    );

                                    if (existingVehicle) {
                                      // Auto-populate from database
                                      onItemChange(index, {
                                        ...item,
                                        vehicle: {
                                          registration: existingVehicle.registration,
                                          brand: existingVehicle.brand,
                                          model: existingVehicle.model
                                        }
                                      });
                                      return; // Don't continue with manual entry
                                    }
                                  }

                                  // Manual entry with formatted plate
                                  onItemChange(index, {
                                    ...item,
                                    vehicle: {
                                      ...(item.vehicle || { registration: '', brand: '', model: '' }),
                                      registration: formattedPlate
                                    }
                                  });
                                }}
                              />
                              {clientVehicles.length > 0 && (
                                <datalist id={`vehicles-${index}`}>
                                  {clientVehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.registration}>
                                      {vehicle.brand} {vehicle.model}
                                    </option>
                                  ))}
                                </datalist>
                              )}
                              {clientVehicles.length > 0 && (
                                <p className="text-xs text-app-text-muted mt-1">
                                  Tapez pour auto-compléter depuis la DB
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="text-xs font-medium text-app-text-muted mb-1 block">
                                Marque
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Renault"
                                className="h-9 border-app-border bg-app-dark text-app-text-primary text-sm"
                                value={item.vehicle?.brand || ''}
                                onChange={(e) =>
                                  onItemChange(index, {
                                    ...item,
                                    vehicle: {
                                      ...(item.vehicle || { registration: '', brand: '', model: '' }),
                                      brand: e.target.value
                                    }
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-app-text-muted mb-1 block">
                                Modèle
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Clio"
                                className="h-9 border-app-border bg-app-dark text-app-text-primary text-sm"
                                value={item.vehicle?.model || ''}
                                onChange={(e) =>
                                  onItemChange(index, {
                                    ...item,
                                    vehicle: {
                                      ...(item.vehicle || { registration: '', brand: '', model: '' }),
                                      model: e.target.value
                                    }
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label htmlFor={`item-${index}-quantity`} className="block text-sm font-medium text-app-text-secondary mb-1">
                              Quantité <span className="text-rose-500">*</span>
                            </label>
                            <Input
                              id={`item-${index}-quantity`}
                              type="number"
                              min="1"
                              className={`h-11 ${
                                errors[`item-${index}-quantity`] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-app-border'
                              } bg-app-dark text-app-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                              value={item.quantity || ''}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              onChange={(e) =>
                                onItemChange(index, { ...item, quantity: Number(e.target.value) || 0 })
                              }
                              aria-invalid={errors[`item-${index}-quantity`] ? 'true' : 'false'}
                              aria-describedby={errors[`item-${index}-quantity`] ? `error-item-${index}-quantity` : undefined}
                            />
                            {errors[`item-${index}-quantity`] && (
                              <p id={`error-item-${index}-quantity`} className="mt-1 text-sm text-rose-600">
                                {errors[`item-${index}-quantity`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label htmlFor={`item-${index}-price`} className="block text-sm font-medium text-app-text-secondary mb-1">
                              Prix unitaire HT <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <Input
                                id={`item-${index}-price`}
                                type="number"
                                step="0.01"
                                min="0"
                                className={`h-11 pr-8 ${
                                  errors[`item-${index}-price`] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-app-border'
                                } bg-app-dark text-app-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                value={item.unitPrice || ''}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                onChange={(e) =>
                                  onItemChange(index, { ...item, unitPrice: Number(e.target.value) || 0 })
                                }
                                aria-invalid={errors[`item-${index}-price`] ? 'true' : 'false'}
                                aria-describedby={errors[`item-${index}-price`] ? `error-item-${index}-price` : undefined}
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-text-muted z-10 pointer-events-none">€</span>
                            </div>
                            {errors[`item-${index}-price`] && (
                              <p id={`error-item-${index}-price`} className="mt-1 text-sm text-rose-600">
                                {errors[`item-${index}-price`]}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor={`item-${index}-discount`} className="block text-sm font-medium text-app-text-secondary mb-1">
                              Remise (%)
                            </label>
                            <Input
                              id={`item-${index}-discount`}
                              type="number"
                              min="0"
                              max="100"
                              className="h-11 border-app-border bg-app-dark text-app-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={item.discount || ''}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              onChange={(e) =>
                                onItemChange(index, { ...item, discount: Number(e.target.value) || 0 })
                              }
                            />
                          </div>
                        </div>
                        
                        <div className="mt-2 text-right">
                          <p className="text-sm text-app-text-secondary font-medium">
                            Sous-total: {
                              isSubjectToVat
                                ? `${(((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discount) || 0) / 100)) * (1 + (Number(item.taxRate) || 0) / 100)).toFixed(2)} € TTC`
                                : `${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discount) || 0) / 100)).toFixed(2)} € HT`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button
                  type="button"
                  onClick={onAddItem}
                  className="w-full py-3 border-2 border-dashed border-app-border rounded-md text-app-text-muted hover:text-app-text-primary hover:border-app-border hover:bg-app-border flex items-center justify-center transition-colors duration-150"
                >
                  <Plus size={16} className="mr-2" />
                  <span>Ajouter une prestation</span>
                </button>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 border border-app-border text-app-text-secondary rounded-md shadow-sm hover:bg-app-dark focus:outline-none focus:ring-2 focus:ring-app-border transition-colors duration-150"
                  onClick={() => setActiveSection('client')}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Retour
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 bg-app-border text-app-text-primary rounded-md shadow-sm hover:bg-app-dark focus:outline-none focus:ring-2 focus:ring-app-border transition-colors duration-150"
                  onClick={() => setActiveSection('notes')}
                >
                  Continuer vers Notes
                  <ChevronRight size={16} className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}
          
          {activeSection === 'notes' && (
            <motion.div
              key="notes"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-app-dark p-6 rounded-lg shadow-sm border border-app-border"
            >
              <h2 className="text-xl font-semibold mb-6 text-app-text-primary">Notes / Conditions</h2>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-app-text-secondary mb-2">
                  Notes / Conditions de paiement
                </label>
                <Textarea
                  id="notes"
                  rows={6}
                  className="border-app-border bg-app-dark text-app-text-primary"
                  placeholder="Conditions de paiement, garanties, etc."
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                />
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 border border-app-border text-app-text-secondary rounded-md shadow-sm hover:bg-app-dark focus:outline-none focus:ring-2 focus:ring-app-border transition-colors duration-150"
                  onClick={() => setActiveSection('items')}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Retour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom action bar - Always visible */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-app-dark text-app-text-primary p-4 rounded-lg shadow-sm">
        <div className="text-sm mb-4 sm:mb-0">
          <span className="font-medium text-app-text-primary">Total:</span>{' '}
          {isSubjectToVat ? (
            <>
              <span className="text-app-text-secondary">{totalTTC} € TTC</span> <span className="text-app-text-muted">({totalHT} € HT)</span>
            </>
          ) : (
            <span className="text-app-text-secondary">{totalHT} € HT</span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 text-app-text-primary rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </div>
  );
};

export default InvoiceForm;