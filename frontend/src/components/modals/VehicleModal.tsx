import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/shadcn/dialog';
import { Input } from '../ui/shadcn/input';
import { Label } from '../ui/shadcn/label';
import { Button } from '../ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/shadcn/select';
import { Textarea } from '../ui/shadcn/textarea';
import { Vehicle, VehicleService } from '../../services/vehicle.service';
import { Client, ClientService } from '../../services/client.service';
import { useCompany } from '../../contexts/CompanyContext';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: Vehicle;
  clientId?: string;
  viewMode?: boolean;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, onSuccess, vehicle, clientId, viewMode = false }) => {
  const { selectedCompany } = useCompany();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    registration: '',
    client_id: clientId || '',
    company_id: selectedCompany?.id || '',
    notes: ''
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClients();
      if (vehicle) {
        setFormData({
          brand: vehicle.brand,
          model: vehicle.model,
          registration: vehicle.registration,
          client_id: vehicle.client_id,
          company_id: vehicle.company_id,
          notes: vehicle.notes || ''
        });
      } else {
        setFormData({
          brand: '',
          model: '',
          registration: '',
          client_id: clientId || '',
          company_id: selectedCompany?.id || '',
          notes: ''
        });
      }
      setError(null);
      setIsEditMode(false); // Reset edit mode when modal opens
    }
  }, [isOpen, vehicle, clientId, selectedCompany]);

  const loadClients = async () => {
    const allClients = await ClientService.getAllClients();
    setClients(allClients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const vehicleData = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        registration: formData.registration.trim().toUpperCase(),
        client_id: formData.client_id,
        company_id: formData.company_id,
        notes: formData.notes.trim() || undefined
      };

      if (vehicle) {
        await VehicleService.updateVehicle(vehicle.id, vehicleData);
      } else {
        await VehicleService.createVehicle(vehicleData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const clientName = clients.find(c => c.id === formData.client_id)?.name || 'Aucun client';
  const isReadOnly = viewMode && !isEditMode;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? 'Détails du véhicule' : vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-status-error/10 border border-status-error/50 p-3 text-status-error text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">
                Marque {!isReadOnly && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="brand"
                type="text"
                required={!isReadOnly}
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                disabled={isReadOnly}
                placeholder="Ex: Renault"
              />
            </div>

            <div>
              <Label htmlFor="model">
                Modèle {!isReadOnly && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="model"
                type="text"
                required={!isReadOnly}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                disabled={isReadOnly}
                placeholder="Ex: Clio V"
              />
            </div>

            <div>
              <Label htmlFor="registration">
                Immatriculation {!isReadOnly && <span className="text-status-error">*</span>}
              </Label>
              <Input
                id="registration"
                type="text"
                required={!isReadOnly}
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                disabled={isReadOnly}
                placeholder="Ex: AB-123-CD"
              />
            </div>

            <div>
              <Label htmlFor="client">
                Client {!isReadOnly && <span className="text-status-error">*</span>}
              </Label>
              {isReadOnly ? (
                <Input
                  type="text"
                  value={clientName}
                  disabled
                />
              ) : (
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isReadOnly}
                placeholder="Notes sur le véhicule..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {isReadOnly ? (
              <>
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1"
                  variant="secondary"
                >
                  Fermer
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="flex-1"
                >
                  Modifier
                </Button>
              </>
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
                  {isLoading ? 'Enregistrement...' : vehicle ? 'Enregistrer' : 'Créer'}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleModal;
