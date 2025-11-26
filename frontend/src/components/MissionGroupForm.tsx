import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Separator } from '@/components/ui/shadcn/separator';
import { Badge } from '@/components/ui/shadcn/badge';
import { fetchClients, fetchApporteurs, fetchCollaborateurs, createMissionsBulk } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Check, X } from 'lucide-react';

const moisList = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function MissionGroupForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [apporteurs, setApporteurs] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  // Mois sélectionnés
  const [selectedMois, setSelectedMois] = useState<string[]>([]);

  // Configuration commune à toutes les missions
  const [formData, setFormData] = useState({
    nom_mission: '',
    annee: currentYear,
    client: '',
    apporteur: '',
    ca_genere: 0, // CA par mois
    pct_sub: 50,
    pct_client: 50,
    reduction_base: 0,
    provision_charges: 0,
    frais_supp_fred: 0,
    frais_gestion: 0,
    frais_ml: 0,
    frais_lt: 0,
    commission_apporteur: 0,
    pct_reliquat: 0,
    // Parts collaborateurs
    fred_pct: 0,
    eric_pct: 0,
    boom_pct: 0,
    damien_pct: 0,
    maitre_pct: 0,
  });

  useEffect(() => {
    Promise.all([fetchClients(), fetchApporteurs(), fetchCollaborateurs()]).then(([c, a, col]) => {
      setClients(c);
      setApporteurs(a);
      setCollaborateurs(col);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMois.length === 0) return;

    setIsSubmitting(true);
    try {
      // Build missions array for each selected month
      const missionsToCreate = selectedMois.map(mois => {
        const parts_collaborateurs = [
          { collaborateur: 'fred', pct: formData.fred_pct, montant: (derivedFields.restantApresApporteur * formData.fred_pct) / 100 },
          { collaborateur: 'eric', pct: formData.eric_pct, montant: (derivedFields.restantApresApporteur * formData.eric_pct) / 100 },
          { collaborateur: 'boom', pct: formData.boom_pct, montant: (derivedFields.restantApresApporteur * formData.boom_pct) / 100 },
          { collaborateur: 'damien', pct: formData.damien_pct, montant: (derivedFields.restantApresApporteur * formData.damien_pct) / 100 },
          { collaborateur: 'maitre', pct: formData.maitre_pct, montant: (derivedFields.restantApresApporteur * formData.maitre_pct) / 100 },
        ];

        return {
          apporteur: formData.apporteur || null,
          client: formData.client,
          nom_mission: formData.nom_mission,
          mois,
          annee: formData.annee,
          ca_genere: formData.ca_genere,
          pct_sub: formData.pct_sub,
          pct_client: formData.pct_client,
          montant_sub: derivedFields.montantSub,
          montant_client: 0, // Starts unpaid
          reduction_base: formData.reduction_base,
          base_distribuable: derivedFields.baseDistribuable,
          provision_charges: formData.provision_charges,
          frais_supp_fred: formData.frais_supp_fred,
          frais_gestion: formData.frais_gestion,
          frais_ml: formData.frais_ml,
          frais_lt: formData.frais_lt,
          restant_apres_frais: derivedFields.restantApresFrais,
          commission_apporteur: formData.commission_apporteur,
          restant_apres_apporteur: derivedFields.restantApresApporteur,
          pct_reliquat: formData.pct_reliquat,
          parts_collaborateurs,
          reliquat_final: derivedFields.reliquatFinal,
        };
      });

      await createMissionsBulk(missionsToCreate);
      onSuccess();
    } catch (error) {
      console.error('Failed to create missions', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleMois = (mois: string) => {
    setSelectedMois(prev =>
      prev.includes(mois)
        ? prev.filter(m => m !== mois)
        : [...prev, mois]
    );
  };

  const selectAllMois = () => {
    setSelectedMois([...moisList]);
  };

  const clearAllMois = () => {
    setSelectedMois([]);
  };

  // Calculations based on KDECOM logic (per month)
  const derivedFields = {
    montantSub: (formData.ca_genere * formData.pct_sub) / 100,
    montantClient: (formData.ca_genere * formData.pct_client) / 100,
    baseDistribuable: ((formData.ca_genere * formData.pct_sub) / 100) - formData.reduction_base,
    get totalFrais() {
      return formData.provision_charges + formData.frais_supp_fred + formData.frais_gestion + formData.frais_ml + formData.frais_lt;
    },
    get restantApresFrais() {
      return this.baseDistribuable - this.totalFrais;
    },
    get restantApresApporteur() {
      return this.restantApresFrais - formData.commission_apporteur;
    },
    get totalPctCollabs() {
      return formData.fred_pct + formData.eric_pct + formData.boom_pct + formData.damien_pct + formData.maitre_pct;
    },
    get reliquatFinal() {
      const totalDistribue = (this.restantApresApporteur * this.totalPctCollabs) / 100;
      return this.restantApresApporteur - totalDistribue;
    }
  };

  const totalPctCollabs = formData.fred_pct + formData.eric_pct + formData.boom_pct + formData.damien_pct + formData.maitre_pct;

  // Totaux pour toutes les missions
  const totalMissions = selectedMois.length;
  const totalCA = formData.ca_genere * totalMissions;
  const totalReliquat = derivedFields.reliquatFinal * totalMissions;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header avec résumé */}
      <div className="bg-app-dark/50 border border-app-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-app-text-primary">Création groupée de missions</h3>
              <p className="text-sm text-app-text-muted">Configurez une mission type puis sélectionnez les mois</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-app-text-muted">Missions à créer</p>
              <p className="text-xl font-bold text-blue-400">{totalMissions}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-app-text-muted">CA Total</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(totalCA)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection des mois */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Sélection des mois ({formData.annee})</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllMois}>
                <Check className="h-3 w-3 mr-1" />
                Tous
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearAllMois}>
                <X className="h-3 w-3 mr-1" />
                Aucun
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {moisList.map((mois, index) => {
              const isSelected = selectedMois.includes(mois);
              return (
                <button
                  key={mois}
                  type="button"
                  onClick={() => toggleMois(mois)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all border ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-app-dark/30 border-app-border text-app-text-muted hover:border-app-text-muted'
                  }`}
                >
                  {mois.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Label className="text-sm">Année:</Label>
            <Input
              type="number"
              className="w-24"
              value={formData.annee}
              onChange={(e) => handleChange('annee', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apporteur">Apporteur</Label>
              <Select
                value={formData.apporteur || 'none'}
                onValueChange={(val) => handleChange('apporteur', val === 'none' ? '' : val)}
              >
                <SelectTrigger id="apporteur">
                  <SelectValue placeholder="Sélectionner Apporteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {apporteurs.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.client}
                onValueChange={(val) => handleChange('client', val)}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Sélectionner Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom_mission">Nom de la Mission *</Label>
              <Input
                id="nom_mission"
                placeholder="Ex: Accompagnement RH"
                value={formData.nom_mission}
                onChange={(e) => handleChange('nom_mission', e.target.value)}
                required
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="ca_genere">CA Généré par mois (€)</Label>
              <Input
                id="ca_genere"
                type="number"
                step="0.01"
                value={formData.ca_genere}
                onChange={(e) => handleChange('ca_genere', Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pct_sub">% SUB (OPCO)</Label>
                <Input
                  id="pct_sub"
                  type="number"
                  value={formData.pct_sub}
                  onChange={(e) => handleChange('pct_sub', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pct_client">% Client</Label>
                <Input
                  id="pct_client"
                  type="number"
                  value={formData.pct_client}
                  onChange={(e) => handleChange('pct_client', Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frais & Déductions (par mois)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reduction_base">Réduction Base (€)</Label>
              <Input
                id="reduction_base"
                type="number"
                step="0.01"
                value={formData.reduction_base}
                onChange={(e) => handleChange('reduction_base', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provision_charges">Provision Charges (€)</Label>
              <Input
                id="provision_charges"
                type="number"
                step="0.01"
                value={formData.provision_charges}
                onChange={(e) => handleChange('provision_charges', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frais_supp_fred">Frais Supp. Fred (€)</Label>
              <Input
                id="frais_supp_fred"
                type="number"
                step="0.01"
                value={formData.frais_supp_fred}
                onChange={(e) => handleChange('frais_supp_fred', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frais_gestion">Frais Gestion (€)</Label>
              <Input
                id="frais_gestion"
                type="number"
                step="0.01"
                value={formData.frais_gestion}
                onChange={(e) => handleChange('frais_gestion', Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frais_ml">Frais ML (€)</Label>
                <Input
                  id="frais_ml"
                  type="number"
                  step="0.01"
                  value={formData.frais_ml}
                  onChange={(e) => handleChange('frais_ml', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frais_lt">Frais LT (€)</Label>
                <Input
                  id="frais_lt"
                  type="number"
                  step="0.01"
                  value={formData.frais_lt}
                  onChange={(e) => handleChange('frais_lt', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_apporteur">Commission Apporteur (€)</Label>
              <Input
                id="commission_apporteur"
                type="number"
                step="0.01"
                value={formData.commission_apporteur}
                onChange={(e) => handleChange('commission_apporteur', Number(e.target.value))}
              />
            </div>

            <Separator />

            <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant SUB /mois</span>
                <span className="font-semibold">{formatCurrency(derivedFields.montantSub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Distribuable /mois</span>
                <span className="font-semibold">{formatCurrency(derivedFields.baseDistribuable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restant après frais /mois</span>
                <span className="font-semibold">{formatCurrency(derivedFields.restantApresFrais)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restant après apporteur /mois</span>
                <span className="font-semibold text-status-success">{formatCurrency(derivedFields.restantApresApporteur)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition Collaborateurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {collaborateurs.map(collab => {
                const fieldName = `${collab.id}_pct` as keyof typeof formData;
                const pct = (formData as any)[fieldName] || 0;
                const montant = (derivedFields.restantApresApporteur * pct) / 100;
                return (
                  <div key={collab.id} className="flex items-center gap-3">
                    <Label className="w-20 text-sm">{collab.nom}</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      className="w-20"
                      value={pct}
                      onChange={(e) => handleChange(fieldName, Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <span className="text-sm font-mono ml-auto">{formatCurrency(montant)}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-sm">
              <span className={totalPctCollabs <= 100 ? 'text-status-success' : 'text-status-error'}>
                Total: {totalPctCollabs}%
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="pct_reliquat">% Reliquat</Label>
              <Input
                id="pct_reliquat"
                type="number"
                value={formData.pct_reliquat}
                onChange={(e) => handleChange('pct_reliquat', Number(e.target.value))}
              />
            </div>

            <div className="bg-status-success/10 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reliquat /mois</span>
                <span className="font-bold text-status-success">{formatCurrency(derivedFields.reliquatFinal)}</span>
              </div>
              {totalMissions > 1 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-status-success/20">
                  <span className="text-muted-foreground">Reliquat Total ({totalMissions} mois)</span>
                  <span className="font-bold text-status-success">{formatCurrency(totalReliquat)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-app-border">
        <div className="text-sm text-app-text-muted">
          {selectedMois.length > 0 && (
            <span>
              {selectedMois.length} mission{selectedMois.length > 1 ? 's' : ''} pour: {selectedMois.join(', ')}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!formData.client || !formData.nom_mission || selectedMois.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Création...' : `Créer ${selectedMois.length} mission${selectedMois.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </form>
  );
}
