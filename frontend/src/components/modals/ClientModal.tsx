import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/shadcn/dialog';
import { Input } from '../ui/shadcn/input';
import { Label } from '../ui/shadcn/label';
import { Button } from '../ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/shadcn/select';
import { Client, ClientService, CustomerType } from '../../services/client.service';
import { validateSiret, formatSiret, validateClientSiret } from '../../utils/siretValidation';
import { Company, CompanyService } from '../../services/company.service';
import { useCompany } from '../../contexts/CompanyContext';
import { cn } from '@/lib/utils';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client;
  viewMode?: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSuccess, client, viewMode = false }) => {
  const { selectedCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    customer_type: 'b2b' as CustomerType,
    siret: '',
    company_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siretError, setSiretError] = useState<string | null>(null);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      const allCompanies = await CompanyService.getAllCompanies();
      setCompanies(allCompanies);
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          postalCode: client.postalCode,
          city: client.city,
          customer_type: client.customer_type || 'b2b',
          siret: client.siret || '',
          company_id: client.company_id || selectedCompany?.id || ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          postalCode: '',
          city: '',
          customer_type: 'b2b',
          siret: '',
          company_id: selectedCompany?.id || ''
        });
      }
      setError(null);
      setSiretError(null);
    }
  }, [isOpen, client, selectedCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSiretError(null);
    setIsLoading(true);

    try {
      // Validate SIRET for B2B clients
      const siretValidation = validateClientSiret(formData.customer_type, formData.siret);
      if (!siretValidation.valid) {
        setSiretError(siretValidation.error || 'SIRET invalide');
        setIsLoading(false);
        return;
      }

      // Validate company_id
      if (!formData.company_id) {
        setError('Veuillez sélectionner une entreprise');
        setIsLoading(false);
        return;
      }

      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        postalCode: formData.postalCode.trim(),
        city: formData.city.trim(),
        customer_type: formData.customer_type,
        siret: formData.customer_type === 'b2b' && formData.siret ? formData.siret.trim() : undefined,
        company_id: formData.company_id
      };

      if (client) {
        await ClientService.updateClient(client.id, clientData);
      } else {
        await ClientService.createClient(clientData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiretChange = (value: string) => {
    setFormData({ ...formData, siret: value });
    setSiretError(null);

    // Validate in real-time if value is not empty
    if (value.trim() && formData.customer_type === 'b2b') {
      const validation = validateClientSiret('b2b', value);
      if (!validation.valid) {
        setSiretError(validation.error || null);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viewMode ? 'Détails du client' : client ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-status-error/10 border border-status-error/50 p-3 text-status-error text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Nom complet {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="name"
                type="text"
                required={!viewMode}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                required={!viewMode}
                pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: jean.dupont@email.com"
                title="Adresse email valide (ex: jean.dupont@email.com)"
              />
            </div>

            <div>
              <Label htmlFor="phone">
                Téléphone {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="phone"
                type="tel"
                required={!viewMode}
                pattern="^(0|\+33)[1-9]([0-9]{8}|([0-9]{2}[\s\.\-]){3}[0-9]{2})$"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: 06 12 34 56 78"
                title="Numéro de téléphone français valide (ex: 06 12 34 56 78, 0612345678, +33612345678)"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="customer_type">
                Type de client {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              {viewMode ? (
                <Input
                  type="text"
                  value={formData.customer_type === 'b2b' ? 'Professionnel (B2B)' : 'Particulier (B2C)'}
                  disabled
                />
              ) : (
                <Select
                  value={formData.customer_type}
                  onValueChange={(value) => {
                    setFormData({ ...formData, customer_type: value as CustomerType });
                    setSiretError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2b">Professionnel (B2B)</SelectItem>
                    <SelectItem value="b2c">Particulier (B2C)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-app-text-muted mt-1">
                {formData.customer_type === 'b2b'
                  ? 'Les clients professionnels doivent fournir un numéro SIRET'
                  : 'Les clients B2C seront suivis pour les rappels de service réguliers'}
              </p>
            </div>

            {/* Company Selection */}
            <div className="md:col-span-2">
              <Label htmlFor="company">
                Entreprise {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              {viewMode ? (
                <Input
                  type="text"
                  value={companies.find(c => c.id === formData.company_id)?.name || 'Non assigné'}
                  disabled
                />
              ) : (
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-app-text-muted mt-1">
                Le client sera associé à cette entreprise
              </p>
            </div>

            {/* SIRET Field (B2B only) */}
            {formData.customer_type === 'b2b' && (
              <div className="md:col-span-2">
                <Label htmlFor="siret">
                  Numéro SIRET {!viewMode && <span className="text-status-error">*</span>}
                </Label>
                <Input
                  id="siret"
                  type="text"
                  required={!viewMode && formData.customer_type === 'b2b'}
                  value={formData.siret}
                  onChange={(e) => handleSiretChange(e.target.value)}
                  disabled={viewMode}
                  className={cn(siretError && 'border-status-error/50 focus-visible:ring-red-500')}
                  placeholder="Ex: 123 456 789 01234 (14 chiffres)"
                  maxLength={17}
                />
                {siretError && (
                  <p className="text-xs text-status-error mt-1">{siretError}</p>
                )}
                {!siretError && formData.siret && validateSiret(formData.siret) && (
                  <p className="text-xs text-status-success mt-1">✓ SIRET valide</p>
                )}
                <p className="text-xs text-app-text-muted mt-1">
                  Format: 14 chiffres (SIREN + NIC). Vous pouvez saisir avec ou sans espaces.
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <Label htmlFor="address">
                Adresse {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="address"
                type="text"
                required={!viewMode}
                minLength={5}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: 123 Rue de la Paix"
                title="L'adresse doit contenir au moins 5 caractères"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">
                Code postal {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="postalCode"
                type="text"
                required={!viewMode}
                pattern="^[0-9]{5}$"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: 75001"
                title="Le code postal doit contenir exactement 5 chiffres"
              />
            </div>

            <div>
              <Label htmlFor="city">
                Ville {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="city"
                type="text"
                required={!viewMode}
                minLength={2}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: Paris"
                title="La ville doit contenir au moins 2 caractères"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {viewMode ? (
              <Button
                type="button"
                onClick={onClose}
                className="w-full"
                variant="secondary"
              >
                Fermer
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                  variant="secondary"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Enregistrement...' : client ? 'Modifier' : 'Créer'}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
