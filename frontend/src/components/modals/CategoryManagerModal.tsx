import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/shadcn/dialog';
import { Input } from '../ui/shadcn/input';
import { Button } from '../ui/shadcn/button';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { CategoryService } from '../../services/category.service';
import ConfirmDialog from '../ui/ConfirmDialog';
import { cn } from '@/lib/utils';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated?: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onCategoriesUpdated
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  // Auto-close success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-close error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      setErrorMessage('Erreur lors du chargement des catégories');
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.trim()) {
        setErrorMessage('Le nom de la catégorie ne peut pas être vide');
        return;
      }
      if (categories.includes(newCategory.trim())) {
        setErrorMessage('Cette catégorie existe déjà');
        return;
      }
      await CategoryService.addCategory(newCategory.trim());
      setNewCategory('');
      setIsAdding(false);
      setSuccessMessage('Catégorie ajoutée avec succès');
      await loadCategories();
      onCategoriesUpdated?.();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la catégorie');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la catégorie',
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${category}" ?`,
      onConfirm: async () => {
        try {
          await CategoryService.removeCategory(category);
          setSuccessMessage('Catégorie supprimée avec succès');
          await loadCategories();
          onCategoriesUpdated?.();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la suppression de la catégorie');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleStartEdit = (index: number, category: string) => {
    setEditingIndex(index);
    setEditingValue(category);
  };

  const handleSaveEdit = async (oldCategory: string) => {
    try {
      if (!editingValue.trim()) {
        setErrorMessage('Le nom de la catégorie ne peut pas être vide');
        return;
      }
      if (editingValue.trim() === oldCategory) {
        setEditingIndex(null);
        setEditingValue('');
        return;
      }
      await CategoryService.updateCategory(oldCategory, editingValue.trim());
      setSuccessMessage('Catégorie modifiée avec succès');
      await loadCategories();
      onCategoriesUpdated?.();
      setEditingIndex(null);
      setEditingValue('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la modification de la catégorie');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleResetToDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Réinitialiser les catégories',
      message: 'Êtes-vous sûr de vouloir réinitialiser les catégories par défaut ? Toutes vos catégories personnalisées seront perdues.',
      onConfirm: async () => {
        await CategoryService.resetToDefaults();
        await loadCategories();
        onCategoriesUpdated?.();
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Gérer les catégories</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 bg-status-success/20 border border-status-success/50 p-3 flex items-center gap-2 rounded-md">
                <Check className="h-5 w-5 text-status-success flex-shrink-0" />
                <span className="text-status-success text-sm">{successMessage}</span>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="ml-auto text-status-success hover:text-status-success"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 bg-status-error/20 border border-status-error/50 p-3 flex items-center gap-2 rounded-md">
                <span className="text-status-error text-sm flex-1">{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-status-error hover:text-status-error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Add New Category */}
              <div className="flex items-center gap-2">
                {isAdding ? (
                  <>
                    <Input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCategory();
                        if (e.key === 'Escape') {
                          setIsAdding(false);
                          setNewCategory('');
                        }
                      }}
                      placeholder="Nom de la nouvelle catégorie"
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      onClick={handleAddCategory}
                      size="sm"
                      className="bg-status-success hover:bg-status-success/80"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setNewCategory('');
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle catégorie
                  </Button>
                )}
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-app-dark border border-app-border rounded-md hover:bg-app-dark transition-colors"
                  >
                    {editingIndex === index ? (
                      <>
                        <Input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(category);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          onClick={() => handleSaveEdit(category)}
                          size="sm"
                          variant="ghost"
                          className="text-status-success hover:bg-status-success/20 hover:text-status-success"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-app-text-primary font-medium">{category}</span>
                        <Button
                          onClick={() => handleStartEdit(index, category)}
                          size="sm"
                          variant="ghost"
                          className="text-app-text-muted hover:bg-app-border hover:text-app-text-muted"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveCategory(category)}
                          size="sm"
                          variant="ghost"
                          className="text-status-error hover:bg-status-error/20 hover:text-status-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirmer"
      />
    </>
  );
};

export default CategoryManagerModal;
