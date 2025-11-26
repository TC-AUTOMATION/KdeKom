import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/shadcn/dialog';
import { Input } from '../ui/shadcn/input';
import { Label } from '../ui/shadcn/label';
import { Button } from '../ui/shadcn/button';
import { Textarea } from '../ui/shadcn/textarea';
import { TarificationService } from '../../services/prestationTemplate.service';
import { PackageItem, PackageItemInput } from '../../types/prestationTemplate';
import ConfirmDialog from '../ui/ConfirmDialog';
import AlertDialog from '../ui/AlertDialog';

interface PackageItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
}

const PackageItemsModal: React.FC<PackageItemsModalProps> = ({
  isOpen,
  onClose,
  packageId,
  packageName
}) => {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PackageItem | null>(null);
  const [formData, setFormData] = useState<Omit<PackageItemInput, 'package_id'>>({
    name: '',
    description: '',
    defaultPrice: 0,
    taxRate: 20,
    sortOrder: 0
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string; variant: 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: '',
    variant: 'info'
  });

  useEffect(() => {
    if (isOpen && packageId) {
      loadItems();
    }
  }, [isOpen, packageId]);

  const loadItems = async () => {
    try {
      const data = await TarificationService.getPackageItems(packageId);
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleOpenItemModal = (item?: PackageItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        defaultPrice: item.defaultPrice,
        taxRate: item.taxRate,
        sortOrder: item.sortOrder
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        description: '',
        defaultPrice: 0,
        taxRate: 20,
        sortOrder: items.length
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await TarificationService.updatePackageItem(packageId, selectedItem.id, formData);
      } else {
        await TarificationService.createPackageItem(packageId, {
          ...formData
        });
      }
      await loadItems();
      setIsItemModalOpen(false);
    } catch (error) {
      console.error('Error saving item:', error);
      setAlertDialog({
        isOpen: true,
        message: 'Erreur lors de l\'enregistrement',
        variant: 'error'
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await TarificationService.deletePackageItem(packageId, itemToDelete);
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlertDialog({
        isOpen: true,
        message: 'Erreur lors de la suppression',
        variant: 'error'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prestations du plan "{packageName}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-app-text-muted">
                Gérer les prestations incluses dans ce plan tarifaire
              </p>
              <Button
                onClick={() => handleOpenItemModal()}
                size="sm"
              >
                <Plus size={16} className="mr-1" />
                Ajouter prestation
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-app-text-muted">
                Aucune prestation dans ce plan tarifaire
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-app-border">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-app-text-muted uppercase">Prestation</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">Prix</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">TVA</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-app-text-muted uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-app-border">
                        <td className="px-4 py-3">
                          <div className="font-medium text-app-text-primary">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-app-text-muted mt-0.5">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-app-text-primary font-medium">
                          {formatCurrency(item.defaultPrice)}
                        </td>
                        <td className="px-4 py-3 text-center text-app-text-primary">{item.taxRate}%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenItemModal(item)}
                              className="p-1 text-app-text-muted hover:text-app-text-muted transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
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

      {/* Item Edit/Create Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Modifier la prestation' : 'Nouvelle prestation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitItem} className="space-y-4">
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
                <Label htmlFor="defaultPrice">Prix (€) *</Label>
                <Input
                  id="defaultPrice"
                  type="number"
                  step="0.01"
                  value={formData.defaultPrice}
                  onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="taxRate">TVA (%) *</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                variant="secondary"
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedItem ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteItem}
        title="Supprimer la prestation"
        message="Êtes-vous sûr de vouloir supprimer cette prestation ?"
        confirmText="Supprimer"
      />

      {/* Error Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </>
  );
};

export default PackageItemsModal;
