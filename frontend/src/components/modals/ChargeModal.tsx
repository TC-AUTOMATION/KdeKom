import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/shadcn/dialog';
import { Input } from '../ui/shadcn/input';
import { Label } from '../ui/shadcn/label';
import { Button } from '../ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/shadcn/select';
import { Textarea } from '../ui/shadcn/textarea';
import { Checkbox } from '../ui/shadcn/checkbox';
import { DatePicker } from '../ui/DatePicker';
import { Charge, ChargeCreateInput, ChargeCategory, PaymentMethod } from '../../types/charge';
import { ChargeService } from '../../services/charge.service';
import { CategoryService } from '../../services/category.service';
import { useCompany } from '../../contexts/CompanyContext';
import { Company, CompanyService } from '../../services/company.service';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  charge?: Charge;
  viewMode?: boolean;
}

const ChargeModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, onSuccess, charge, viewMode = false }) => {
  const { selectedCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    category: '' as ChargeCategory,
    description: '',
    amount: '',
    tvaRate: '20',
    isSubjectToTva: true,
    paymentMethod: 'cb' as PaymentMethod,
    supplier: '',
    notes: '',
    company_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'especes', label: 'Espèces' },
    { value: 'cb', label: 'Carte bancaire' },
    { value: 'virement', label: 'Virement' },
    { value: 'prelevement', label: 'Prélèvement' },
    { value: 'cheque', label: 'Chèque' }
  ];

  useEffect(() => {
    // Load categories and companies
    const loadCategories = async () => {
      const cats = await CategoryService.getCategories();
      setCategories(cats);
    };
    const loadCompanies = async () => {
      const allCompanies = await CompanyService.getAllCompanies();
      setCompanies(allCompanies);
    };
    loadCategories();
    loadCompanies();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const defaultCategory = categories.length > 0 ? categories[categories.length - 1] : '';
      if (charge) {
        console.log('ChargeModal - Received charge:', charge);
        setFormData({
          date: charge.date,
          category: charge.category,
          description: charge.description,
          amount: charge.amount.toString(),
          tvaRate: charge.tvaRate.toString(),
          isSubjectToTva: charge.isSubjectToTva,
          paymentMethod: charge.paymentMethod,
          supplier: charge.supplier || '',
          notes: charge.notes || '',
          company_id: charge.companyId || selectedCompany?.id || ''
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          category: defaultCategory,
          description: '',
          amount: '',
          tvaRate: '20',
          isSubjectToTva: true,
          paymentMethod: 'cb',
          supplier: '',
          notes: '',
          company_id: selectedCompany?.id || ''
        });
      }
      setError(null);
    }
  }, [isOpen, charge, categories, selectedCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.company_id) {
      setError('Veuillez sélectionner une entreprise');
      return;
    }

    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      const tvaRate = parseFloat(formData.tvaRate);
      const isSubjectToTva = formData.isSubjectToTva;

      // Calculer le HT et la TVA si la charge est assujettie à la TVA
      let amountHt = amount;
      let tvaAmount = 0;

      if (isSubjectToTva && tvaRate > 0) {
        // Le montant saisi est TTC, on calcule le HT et la TVA
        amountHt = amount / (1 + tvaRate / 100);
        tvaAmount = amount - amountHt;
      }

      const chargeData: ChargeCreateInput = {
        date: formData.date,
        category: formData.category,
        description: formData.description.trim(),
        amount: amount,
        amountHt: amountHt,
        tvaRate: tvaRate,
        tvaAmount: tvaAmount,
        isSubjectToTva: isSubjectToTva,
        paymentMethod: formData.paymentMethod,
        supplier: formData.supplier.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        companyId: formData.company_id
      };

      if (charge) {
        await ChargeService.updateCharge({ ...chargeData, id: charge.id });
      } else {
        await ChargeService.createCharge(chargeData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethodLabel = paymentMethods.find(p => p.value === formData.paymentMethod)?.label || formData.paymentMethod;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viewMode ? 'Détails de la charge' : charge ? 'Modifier la charge' : 'Nouvelle charge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-status-error/10 border border-status-error/50 p-3 text-status-error text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entreprise */}
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
            </div>

            <div>
              <Label htmlFor="date">
                Date {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                disabled={viewMode}
              />
            </div>

            <div>
              <Label htmlFor="category">
                Catégorie {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              {viewMode ? (
                <Input
                  type="text"
                  value={formData.category}
                  disabled
                />
              ) : (
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as ChargeCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">
                Description {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="description"
                type="text"
                required={!viewMode}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: Achat de produits de nettoyage"
              />
            </div>

            {/* TVA assujettie */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isSubjectToTva"
                  checked={formData.isSubjectToTva}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSubjectToTva: checked as boolean })}
                  disabled={viewMode}
                />
                <Label htmlFor="isSubjectToTva" className="cursor-pointer">
                  Charge assujettie à la TVA (TVA récupérable)
                </Label>
              </div>
              <p className="text-xs text-app-text-muted mt-1 ml-6">
                Cocher si la TVA sur cette charge est déductible (facture avec TVA récupérable)
              </p>
            </div>

            <div>
              <Label htmlFor="amount">
                Montant TTC (€) {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="amount"
                type="number"
                required={!viewMode}
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: 150.00"
              />
            </div>

            <div>
              <Label htmlFor="tvaRate">
                Taux de TVA (%) {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              {viewMode ? (
                <Input
                  type="text"
                  value={`${formData.tvaRate}%`}
                  disabled
                />
              ) : (
                <Select
                  value={formData.tvaRate}
                  onValueChange={(value) => setFormData({ ...formData, tvaRate: value })}
                  disabled={!formData.isSubjectToTva}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20% (taux normal)</SelectItem>
                    <SelectItem value="10">10% (taux intermédiaire)</SelectItem>
                    <SelectItem value="5.5">5.5% (taux réduit)</SelectItem>
                    <SelectItem value="2.1">2.1% (taux super réduit)</SelectItem>
                    <SelectItem value="0">0% (exonéré)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">
                Moyen de paiement {!viewMode && <span className="text-status-error">*</span>}
              </Label>
              {viewMode ? (
                <Input
                  type="text"
                  value={paymentMethodLabel}
                  disabled
                />
              ) : (
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input
                id="supplier"
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                disabled={viewMode}
                placeholder="Ex: Fournisseur ABC"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={viewMode}
                placeholder="Notes additionnelles..."
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
                  {isLoading ? 'Enregistrement...' : charge ? 'Modifier' : 'Créer'}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChargeModal;
