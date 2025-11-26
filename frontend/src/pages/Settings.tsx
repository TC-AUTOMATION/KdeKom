import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Percent, Building2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { SettingsService } from '../services/settings.service';
import { TarificationService } from '../services/prestationTemplate.service';
import { AppSettings } from '../types/settings';
import { TarificationPackage, TarificationPackageInput } from '../types/prestationTemplate';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AlertDialog from '../components/ui/AlertDialog';
import PackageItemsModal from '../components/modals/PackageItemsModal';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Badge } from '@/components/ui/shadcn/badge';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Label } from '@/components/ui/shadcn/label';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { companies } = useCompany();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [invoiceSettings, setInvoiceSettings] = useState<AppSettings | null>(null);
  const [defaultTvaRate, setDefaultTvaRate] = useState<string>('20');
  const [isLoading, setIsLoading] = useState(true);

  // Tarification Packages
  const [packages, setPackages] = useState<TarificationPackage[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TarificationPackage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<TarificationPackage | null>(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedPackageForItems, setSelectedPackageForItems] = useState<TarificationPackage | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: '',
    variant: 'info'
  });
  const [packageFormData, setPackageFormData] = useState<Omit<TarificationPackageInput, 'company_id'>>({
    name: '',
    description: '',
    is_active: true
  });

  // Initialize selected company to first available
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Get active company
  const activeCompany = companies.find(c => c.id === selectedCompanyId);

  // Load invoice settings
  useEffect(() => {
    const loadSettings = async () => {
      // Wait a bit for companies to load
      if (!companies || companies.length === 0) {
        setIsLoading(true);
        return;
      }

      if (selectedCompanyId && activeCompany?.id) {
        setIsLoading(true);
        console.log('Loading settings for company:', activeCompany.id);
        try {
          const settings = await SettingsService.getSettings(activeCompany.id);
          console.log('Settings loaded:', settings);
          if (settings) {
            setInvoiceSettings(settings);
            setDefaultTvaRate(String(settings.default_tva_rate ?? 20));
          } else {
            console.error('Failed to load settings - null returned');
            // Create default settings
            setInvoiceSettings({
              company_id: activeCompany.id,
              invoice_number_format: 'YYYY-MM-NNN',
              last_invoice_number: 0,
              last_invoice_month: undefined,
              last_quote_number: 0,
              last_quote_month: undefined,
              default_tva_rate: 20
            });
            setDefaultTvaRate('20');
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No company available
        console.log('No active company');
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [selectedCompanyId, activeCompany?.id, companies]);

  // Load tarification packages
  useEffect(() => {
    const loadPackages = async () => {
      if (selectedCompanyId && activeCompany?.id) {
        try {
          const data = await TarificationService.getPackages(activeCompany.id);
          setPackages(data);
        } catch (error) {
          console.error('Error loading packages:', error);
        }
      }
    };
    loadPackages();
  }, [selectedCompanyId, activeCompany?.id]);

  const handleSaveTvaRate = async () => {
    if (!activeCompany?.id) return;

    const tvaRateValue = parseFloat(defaultTvaRate);
    if (isNaN(tvaRateValue) || tvaRateValue < 0 || tvaRateValue > 100) {
      setAlertDialog({ isOpen: true, message: 'Le taux de TVA doit être entre 0 et 100', variant: 'error' });
      return;
    }

    const success = await SettingsService.setDefaultTvaRate(
      activeCompany.id,
      tvaRateValue
    );

    if (success) {
      setAlertDialog({ isOpen: true, message: 'Taux de TVA par défaut enregistré avec succès', variant: 'success' });
      // Reload settings
      const settings = await SettingsService.getSettings(activeCompany.id);
      if (settings) {
        setInvoiceSettings(settings);
        setDefaultTvaRate(String(settings.default_tva_rate ?? 20));
      }
    } else {
      setAlertDialog({ isOpen: true, message: 'Erreur lors de l\'enregistrement du taux de TVA', variant: 'error' });
    }
  };


  // Package handlers
  const loadPackages = async () => {
    if (activeCompany?.id) {
      try {
        const data = await TarificationService.getPackages(activeCompany.id);
        setPackages(data);
      } catch (error) {
        console.error('Error loading packages:', error);
      }
    }
  };

  const handleOpenPackageModal = (pkg?: TarificationPackage) => {
    if (pkg) {
      setSelectedPackage(pkg);
      setPackageFormData({
        name: pkg.name,
        description: pkg.description || '',
        is_active: pkg.is_active
      });
    } else {
      setSelectedPackage(null);
      setPackageFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
    setIsPackageModalOpen(true);
  };

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany?.id) return;

    try {
      if (selectedPackage) {
        await TarificationService.updatePackage(selectedPackage.id, packageFormData);
      } else {
        await TarificationService.createPackage({
          ...packageFormData,
          company_id: activeCompany.id
        });
      }
      await loadPackages();
      setIsPackageModalOpen(false);
    } catch (error) {
      console.error('Error saving package:', error);
      setAlertDialog({ isOpen: true, message: 'Erreur lors de l\'enregistrement du plan', variant: 'error' });
    }
  };

  const handleTogglePackageStatus = async (pkg: TarificationPackage) => {
    try {
      await TarificationService.togglePackageStatus(pkg.id, !pkg.is_active);
      await loadPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const handleDeletePackage = (pkg: TarificationPackage) => {
    setPackageToDelete(pkg);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePackage = async () => {
    if (packageToDelete) {
      try {
        await TarificationService.deletePackage(packageToDelete.id);
        await loadPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
        setAlertDialog({ isOpen: true, message: 'Erreur lors de la suppression du plan', variant: 'error' });
      } finally {
        setIsDeleteDialogOpen(false);
        setPackageToDelete(null);
      }
    }
  };

  const handleViewItems = (pkg: TarificationPackage) => {
    setSelectedPackageForItems(pkg);
    setIsItemsModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div
        className="mb-8 transition-all duration-300"
      >
        <h1 className="text-2xl font-bold text-app-text-primary mb-2">Paramètres</h1>
        <p className="text-app-text-muted">
          Configurez votre application selon vos préférences
        </p>
      </div>

      {/* Company Selector */}
      {companies.length > 1 && (
        <div
          className="bg-app-dark border border-app-border rounded-lg p-6 mb-6 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-app-text-secondary" />
            <h2 className="text-lg font-semibold text-app-text-primary">Entreprise</h2>
          </div>
          <div>
            <label htmlFor="companySelect" className="block text-sm font-medium text-app-text-secondary mb-2">
              Sélectionnez l'entreprise à configurer
            </label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger id="companySelect">
                <SelectValue placeholder="Sélectionnez une entreprise" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* TVA Settings */}
        <div
          className="bg-app-dark border border-app-border rounded-lg p-6 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <Percent className="h-5 w-5 text-app-text-secondary" />
            <h2 className="text-lg font-semibold text-app-text-primary">Taux de TVA par défaut</h2>
          </div>

          {isLoading ? (
            <div className="text-app-text-muted text-sm">Chargement...</div>
          ) : !activeCompany ? (
            <div className="text-app-text-muted text-sm">Aucune entreprise sélectionnée. Veuillez créer ou sélectionner une entreprise.</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-app-dark border border-app-border rounded-lg p-4">
                <p className="text-sm text-app-text-secondary mb-1">
                  Ce taux sera appliqué par défaut à toutes les nouvelles prestations ajoutées aux factures
                </p>
                <p className="text-xs text-app-text-muted">
                  Vous pourrez toujours modifier le taux pour chaque prestation individuellement
                </p>
              </div>

              <div>
                <label htmlFor="defaultTvaRate" className="block text-sm font-medium text-app-text-secondary mb-2">
                  Taux de TVA (%)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Percent size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-muted z-10" />
                    <Input
                      id="defaultTvaRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={defaultTvaRate}
                      onChange={(e) => setDefaultTvaRate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSaveTvaRate}>
                    Appliquer
                  </Button>
                </div>
                <p className="text-xs text-app-text-muted mt-2">
                  Taux standard en France : 20% | Taux réduit : 10%, 5,5% ou 2,1%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tariff Plans */}
        <div
          className="bg-app-dark border border-app-border rounded-lg p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-app-text-secondary" />
              <h2 className="text-lg font-semibold text-app-text-primary">Plans Tarifaires</h2>
            </div>
            <Button
              onClick={() => handleOpenPackageModal()}
              size="sm"
            >
              <Plus size={16} />
              Nouveau plan
            </Button>
          </div>

          <p className="text-sm text-app-text-muted mb-4">
            Créez des plans tarifaires complets (B2B, B2C, Premium...) pour définir vos grilles de prix
          </p>

          {packages.length === 0 ? (
            <div className="text-center py-8 text-app-text-muted text-sm">
              Aucun plan tarifaire configuré. Créez des plans (ex: B2B, B2C) avec toutes vos prestations et leurs tarifs.
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-app-dark border border-app-border p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-app-text-primary">{pkg.name}</h3>
                        <Badge
                          onClick={() => handleTogglePackageStatus(pkg)}
                          variant="secondary"
                          className={cn(
                            "cursor-pointer",
                            pkg.is_active
                              ? 'bg-status-success/20 text-status-success'
                              : 'bg-app-border text-app-text-muted'
                          )}
                        >
                          {pkg.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {pkg.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-app-text-muted mt-1">{pkg.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleViewItems(pkg)}
                        size="sm"
                        className="bg-status-info hover:bg-status-info"
                      >
                        Prestations
                      </Button>
                      <Button
                        onClick={() => handleOpenPackageModal(pkg)}
                        variant="ghost"
                        size="sm"
                        className="text-app-text-muted hover:text-app-text-muted"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeletePackage(pkg)}
                        variant="ghost"
                        size="sm"
                        className="text-app-text-muted hover:text-status-error"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package Edit/Create Modal */}
      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        title={selectedPackage ? 'Modifier le plan tarifaire' : 'Nouveau plan tarifaire'}
      >
        <form onSubmit={handleSubmitPackage} className="space-y-4">
          <div>
            <Label htmlFor="package_name" className="block text-sm font-medium text-app-text-secondary mb-1">
              Nom du plan *
            </Label>
            <Input
              id="package_name"
              type="text"
              value={packageFormData.name}
              onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
              required
              placeholder="Ex: B2B, B2C, Premium"
            />
          </div>

          <div>
            <Label htmlFor="package_description" className="block text-sm font-medium text-app-text-secondary mb-1">
              Description
            </Label>
            <Textarea
              id="package_description"
              value={packageFormData.description}
              onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
              rows={2}
              placeholder="Décrivez ce plan tarifaire..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="package_is_active"
              checked={packageFormData.is_active}
              onCheckedChange={(checked) => setPackageFormData({ ...packageFormData, is_active: checked as boolean })}
            />
            <Label htmlFor="package_is_active" className="text-sm text-app-text-secondary cursor-pointer">
              Plan actif
            </Label>
          </div>

          <p className="text-xs text-app-text-muted bg-app-dark p-2 rounded-lg">
            Après création, utilisez le bouton "Prestations" pour ajouter les services inclus dans ce plan.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={() => setIsPackageModalOpen(false)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button type="submit">
              {selectedPackage ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Package Items Modal */}
      {selectedPackageForItems && (
        <PackageItemsModal
          isOpen={isItemsModalOpen}
          onClose={() => {
            setIsItemsModalOpen(false);
            setSelectedPackageForItems(null);
          }}
          packageId={selectedPackageForItems.id}
          packageName={selectedPackageForItems.name}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeletePackage}
        title="Supprimer le plan tarifaire"
        message={`Êtes-vous sûr de vouloir supprimer le plan "${packageToDelete?.name}" ? Toutes les prestations incluses seront également supprimées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </div>
  );
}
