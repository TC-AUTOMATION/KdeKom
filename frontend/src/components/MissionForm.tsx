import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fetchClients, fetchPersons, createMission } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export function MissionForm({ onSuccess }: { onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month: new Date().toISOString().slice(0, 7),
    client_id: '',
    apporteur_id: '',
    amount_billed: 0,
    initial_fees: 1500,
    agency_fees: 2350,
    fixed_fees: 0,
    management_fees: 1200,
    ml_amount: 800,
    lt_amount: 400,
    apporteur_commission: 0,
    fred_percentage: 30,
    eric_percentage: 40,
    boom_percentage: 20,
    other_percentage: 10,
    distributions: [] as { person_id: string; percentage: number }[]
  });

  useEffect(() => {
    fetchClients().then(setClients);
    fetchPersons().then(setPersons);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMission(formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create mission', error);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculations
  const remainder = formData.amount_billed - formData.initial_fees - formData.agency_fees;
  const subtotalConsultantFees = formData.ml_amount + formData.lt_amount;
  const baseForDistribution = remainder - subtotalConsultantFees;

  const totalAllocated = formData.fred_percentage + formData.eric_percentage +
                         formData.boom_percentage + formData.other_percentage;

  const derivedFields = {
    revenu: formData.amount_billed - formData.initial_fees,
    avantCommission: baseForDistribution,
    baseRepartition: baseForDistribution,
    fredPart: (baseForDistribution * formData.fred_percentage) / 100,
    ericPart: (baseForDistribution * formData.eric_percentage) / 100,
    boomPart: (baseForDistribution * formData.boom_percentage) / 100,
    otherPart: (baseForDistribution * formData.other_percentage) / 100,
  };

  const apporteurs = persons.filter(p => p.role === 'apporteur');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apporteur_id">Apporteur</Label>
              <Select
                value={formData.apporteur_id || 'none'}
                onValueChange={(val) => handleChange('apporteur_id', val === 'none' ? '' : val)}
              >
                <SelectTrigger id="apporteur_id">
                  <SelectValue placeholder="Sélectionner Apporteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {apporteurs.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(val) => handleChange('client_id', val)}
              >
                <SelectTrigger id="client_id">
                  <SelectValue placeholder="Sélectionner Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description de la Mission</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] p-2 border rounded-md bg-background resize-none"
                placeholder="Implémenter un nouveau système CRM pour l'équipe de vente."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Mois</Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => handleChange('month', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_billed">Montant Facturé (€)</Label>
              <Input
                id="amount_billed"
                type="number"
                step="0.01"
                value={formData.amount_billed}
                onChange={(e) => handleChange('amount_billed', Number(e.target.value))}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Financials & Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financiers & Frais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initial_fees">Frais Initiaux (€)</Label>
              <Input
                id="initial_fees"
                type="number"
                step="0.01"
                value={formData.initial_fees}
                onChange={(e) => handleChange('initial_fees', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency_fees">Frais agence (€)</Label>
              <Input
                id="agency_fees"
                type="number"
                step="0.01"
                value={formData.agency_fees}
                onChange={(e) => handleChange('agency_fees', Number(e.target.value))}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Frais Sous-Consultants</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ml_amount" className="text-xs">M (€)</Label>
                  <Input
                    id="ml_amount"
                    type="number"
                    step="0.01"
                    value={formData.ml_amount}
                    onChange={(e) => handleChange('ml_amount', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lt_amount" className="text-xs">LT (€)</Label>
                  <Input
                    id="lt_amount"
                    type="number"
                    step="0.01"
                    value={formData.lt_amount}
                    onChange={(e) => handleChange('lt_amount', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenu (€)</span>
                <span className="font-semibold">{formatCurrency(derivedFields.revenu)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avant commission (€)</span>
                <span className="font-semibold">{formatCurrency(derivedFields.avantCommission)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation & Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allocation & Calculs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pourcentages d'Allocation</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fred_percentage" className="text-xs">Fred (%)</Label>
                  <Input
                    id="fred_percentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.fred_percentage}
                    onChange={(e) => handleChange('fred_percentage', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eric_percentage" className="text-xs">Eric (%)</Label>
                  <Input
                    id="eric_percentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.eric_percentage}
                    onChange={(e) => handleChange('eric_percentage', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boom_percentage" className="text-xs">Boom (%)</Label>
                  <Input
                    id="boom_percentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.boom_percentage}
                    onChange={(e) => handleChange('boom_percentage', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other_percentage" className="text-xs">Autre (%)</Label>
                  <Input
                    id="other_percentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.other_percentage}
                    onChange={(e) => handleChange('other_percentage', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="text-xs text-center">
                <span className={totalAllocated === 100 ? 'text-emerald-600' : 'text-destructive'}>
                  {totalAllocated === 100 ? '✓ Total Allocation: 100% (Valid)' : `⚠ Total: ${totalAllocated}%`}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Champs Dérivés (Auto-Calculés)</Label>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 px-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">Revenu (€)</span>
                  <span className="font-mono">{formatCurrency(derivedFields.revenu)}</span>
                </div>

                <div className="flex justify-between py-2 px-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">Avant commission (€)</span>
                  <span className="font-mono">{formatCurrency(derivedFields.avantCommission)}</span>
                </div>

                <div className="flex justify-between py-2 px-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-md">
                  <span className="text-muted-foreground">Base Repartition (€)</span>
                  <span className="font-mono font-semibold">{formatCurrency(derivedFields.baseRepartition)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Répartition Finale</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 px-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <span>Fred Part (€)</span>
                  <span className="font-mono">{formatCurrency(derivedFields.fredPart)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <span>Eric Part (€)</span>
                  <span className="font-mono">{formatCurrency(derivedFields.ericPart)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <span>Boom Part (€)</span>
                  <span className="font-mono">{formatCurrency(derivedFields.boomPart)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <span>Autre Part (€)</span>
                  <span className="font-mono">{formatCurrency(derivedFields.otherPart)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" disabled={totalAllocated !== 100}>
          Enregistrer la Mission
        </Button>
      </div>
    </form>
  );
}
