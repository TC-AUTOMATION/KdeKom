import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/shadcn/dialog';
import { Input } from '../ui/shadcn/input';
import { Label } from '../ui/shadcn/label';
import { Button } from '../ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/shadcn/select';
import { Textarea } from '../ui/shadcn/textarea';
import { Checkbox } from '../ui/shadcn/checkbox';
import { PrestationService } from '../../services/prestation.service';
import { TarificationService } from '../../services/prestationTemplate.service';
import { CustomerPrestation, CustomerPrestationInput } from '../../types/prestation';
import { TarificationPackage } from '../../types/prestationTemplate';
import { Client } from '../../services/client.service';
import { useCompany } from '../../contexts/CompanyContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import AlertDialog from '../ui/AlertDialog';

interface CustomerPrestationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const CustomerPrestationsModal: React.FC<CustomerPrestationsModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const { selectedCompany, companies } = useCompany();
  const activeCompany = selectedCompany || companies[0];
  const [prestations, setPrestations] = useState<CustomerPrestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrestation, setSelectedPrestation] = useState<CustomerPrestation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [prestationToDelete, setPrestationToDelete] = useState<CustomerPrestation | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<TarificationPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [successDialog, setSuccessDialog] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string; variant: 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: '',
    variant: 'info'
  });

  const [formData, setFormData] = useState<Omit<CustomerPrestationInput, 'clientId'>>({
    name: '',
    description: '',
    unitPrice: 0,
    taxRate: 20,
    isActive: true
  });

  useEffect(() => {
    if (isOpen && client.id) {
      loadPrestations();
    }
  }, [isOpen, client.id]);

  const loadPrestations = async () => {
    setIsLoading(true);
    try {
      const data = await PrestationService.getCustomerPrestations(client.id);
      setPrestations(data);
    } catch (error) {
      console.error('Error loading prestations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (prestation?: CustomerPrestation) => {
    if (prestation) {
      setSelectedPrestation(prestation);
      setFormData({
        name: prestation.name,
        description: prestation.description || '',
        unitPrice: prestation.unitPrice,
        taxRate: prestation.taxRate,
        isActive: prestation.isActive
      });
    } else {
      setSelectedPrestation(null);
      setFormData({
        name: '',
        description: '',
        unitPrice: 0,
        taxRate: 20,
        isActive: true
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPrestation) {
        await PrestationService.updateCustomerPrestation(selectedPrestation.id, formData);
      } else {
        await PrestationService.createCustomerPrestation({
          ...formData,
          clientId: client.id
        });
      }
      await loadPrestations();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving prestation:', error);
    }
  };

  const handleToggleStatus = async (prestation: CustomerPrestation) => {
    try {
      await PrestationService.toggleCustomerPrestationStatus(prestation.id, !prestation.isActive);
      await loadPrestations();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteClick = (prestation: CustomerPrestation) => {
    setPrestationToDelete(prestation);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (prestationToDelete) {
      try {
        await PrestationService.deleteCustomerPrestation(prestationToDelete.id);
        await loadPrestations();
      } catch (error) {
        console.error('Error deleting prestation:', error);
      } finally {
        setIsDeleteDialogOpen(false);
        setPrestationToDelete(null);
      }
    }
  };

  const handleOpenImportModal = async () => {
    if (!activeCompany?.id) {
      setAlertDialog({
        isOpen: true,
        message: 'Aucune entreprise sélectionnée',
        variant: 'warning'
      });
      return;
    }

    try {
      const packages = await TarificationService.getActivePackages(activeCompany.id);
      setAvailablePackages(packages);
      setSelectedPackage('');
      setIsImportModalOpen(true);
    } catch (error) {
      console.error('Error loading packages:', error);
      setAlertDialog({
        isOpen: true,
        message: 'Erreur lors du chargement des plans tarifaires',
        variant: 'error'
      });
    }
  };

  const handleImportPackage = async () => {
    if (!selectedPackage) {
      setAlertDialog({
        isOpen: true,
        message: 'Veuillez sélectionner un plan tarifaire',
        variant: 'warning'
      });
      return;
    }

    setIsImporting(true);
    try {
      await TarificationService.copyPackageToCustomer(selectedPackage, client.id);
      await loadPrestations();
      setIsImportModalOpen(false);
      setSelectedPackage('');
      setSuccessDialog({
        isOpen: true,
        message: 'Plan tarifaire importé avec succès. Toutes les prestations précédentes ont été remplacées.'
      });
    } catch (error) {
      console.error('Error importing package:', error);
      setAlertDialog({
        isOpen: true,
        message: 'Erreur lors de l\'importation du plan tarifaire.',
        variant: 'error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prestations de {client.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-app-text-muted">
                Gérer les prestations et tarifs personnalisés pour ce client
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenImportModal}
                  variant="secondary"
                  size="sm"
                  className="bg-status-info hover:bg-status-info text-app-text-primary"
                >
                  <Download size={16} className="mr-1" />
                  Importer plan
                </Button>
                <Button
                  onClick={() => handleOpenEdit()}
                  size="sm"
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-app-text-muted">Chargement...</div>
            ) : prestations.length === 0 ? (
              <div className="text-center py-8 text-app-text-muted">
                Aucune prestation configurée pour ce client
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-app-border">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-app-text-muted uppercase">Prestation</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">Prix HT</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">TVA</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">Statut</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prestations.map((prestation) => (
                      <tr key={prestation.id} className="border-b border-app-border">
                        <td className="px-4 py-3">
                          <div className="font-medium text-app-text-primary">{prestation.name}</div>
                          {prestation.description && (
                            <div className="text-sm text-app-text-muted mt-0.5">{prestation.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-app-text-primary font-medium">
                          {formatCurrency(prestation.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-center text-app-text-primary">{prestation.taxRate}%</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleStatus(prestation)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                              prestation.isActive
                                ? 'bg-status-success/20 text-status-success'
                                : 'bg-app-border text-app-text-muted'
                            }`}
                          >
                            {prestation.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {prestation.isActive ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(prestation)}
                              className="p-1 text-app-text-muted hover:text-app-text-muted transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(prestation)}
                              className="p-1 text-app-text-muted hover:text-status-error transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPrestation ? 'Modifier la prestation' : 'Nouvelle prestation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitPrice">Prix HT *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="taxRate">TVA (%) *</Label>
                <Select
                  value={formData.taxRate.toString()}
                  onValueChange={(value) => setFormData({ ...formData, taxRate: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5.5">5.5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Prestation active
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                variant="secondary"
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedPrestation ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Package Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importer un plan tarifaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-status-warning/10 border border-status-warning/50 rounded-md p-3">
              <p className="text-sm text-status-warning">
                ⚠️ L'importation d'un nouveau plan tarifaire <strong>supprimera toutes les prestations existantes</strong> de ce client et les remplacera par celles du plan sélectionné.
              </p>
            </div>

            <div>
              <Label>
                Plan tarifaire <span className="text-status-error">*</span>
              </Label>

              {availablePackages.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {availablePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative cursor-pointer border-2 rounded-md p-4 transition-all ${
                        selectedPackage === pkg.id
                          ? 'border-status-info bg-status-info/10'
                          : 'border-app-border bg-app-dark hover:border-app-border hover:bg-app-dark'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text-primary mb-1">{pkg.name}</h4>
                          {pkg.description && (
                            <p className="text-sm text-app-text-muted">{pkg.description}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ml-3 transition-all ${
                          selectedPackage === pkg.id
                            ? 'border-status-info bg-status-info'
                            : 'border-app-border'
                        }`}>
                          {selectedPackage === pkg.id && (
                            <div className="w-2 h-2 bg-app-text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-status-warning/10 border border-status-warning/50 rounded-md p-3 text-status-warning text-sm mt-2">
                  Aucun plan tarifaire actif disponible. Créez-en un dans la section "Prestations".
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImporting}
                variant="secondary"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleImportPackage}
                disabled={!selectedPackage || isImporting}
                className="bg-status-info hover:bg-status-info"
              >
                {isImporting ? 'Import en cours...' : 'Importer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la prestation"
        message={`Êtes-vous sûr de vouloir supprimer "${prestationToDelete?.name}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* Success Dialog */}
      <AlertDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        message={successDialog.message}
        variant="info"
      />

      {/* Error/Warning Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </>
  );
};

export default CustomerPrestationsModal;
