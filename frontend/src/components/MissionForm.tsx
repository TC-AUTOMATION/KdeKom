import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Separator } from '@/components/ui/shadcn/separator';
import { fetchClients, fetchApporteurs, fetchCollaborateurs, createMission } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const moisList = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function MissionForm({ onSuccess }: { onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [apporteurs, setApporteurs] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);

  const currentYear = new Date().getFullYear();
  const currentMonth = moisList[new Date().getMonth()];

  const [formData, setFormData] = useState({
    nom_mission: '',
    mois: currentMonth,
    annee: currentYear,
    client: '',
    apporteur: '',
    ca_genere: 0,
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
    try {
      // Build parts_collaborateurs array
      const parts_collaborateurs = [
        { collaborateur: 'fred', pct: formData.fred_pct, montant: (derivedFields.restantApresApporteur * formData.fred_pct) / 100 },
        { collaborateur: 'eric', pct: formData.eric_pct, montant: (derivedFields.restantApresApporteur * formData.eric_pct) / 100 },
        { collaborateur: 'boom', pct: formData.boom_pct, montant: (derivedFields.restantApresApporteur * formData.boom_pct) / 100 },
        { collaborateur: 'damien', pct: formData.damien_pct, montant: (derivedFields.restantApresApporteur * formData.damien_pct) / 100 },
        { collaborateur: 'maitre', pct: formData.maitre_pct, montant: (derivedFields.restantApresApporteur * formData.maitre_pct) / 100 },
      ];

      await createMission({
        apporteur: formData.apporteur || null,
        client: formData.client,
        nom_mission: formData.nom_mission,
        mois: formData.mois,
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
      });
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

  // Calculations based on KDECOM logic
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
              <Label htmlFor="client">Client</Label>
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
              <Label htmlFor="nom_mission">Nom de la Mission</Label>
              <Input
                id="nom_mission"
                placeholder="Ex: Accompagnement RH"
                value={formData.nom_mission}
                onChange={(e) => handleChange('nom_mission', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mois">Mois</Label>
                <Select value={formData.mois} onValueChange={(val) => handleChange('mois', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moisList.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="annee">Année</Label>
                <Input
                  id="annee"
                  type="number"
                  value={formData.annee}
                  onChange={(e) => handleChange('annee', Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca_genere">CA Généré (€)</Label>
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
            <CardTitle className="text-base">Frais & Déductions</CardTitle>
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
                <span className="text-muted-foreground">Montant SUB</span>
                <span className="font-semibold">{formatCurrency(derivedFields.montantSub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Distribuable</span>
                <span className="font-semibold">{formatCurrency(derivedFields.baseDistribuable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restant après frais</span>
                <span className="font-semibold">{formatCurrency(derivedFields.restantApresFrais)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restant après apporteur</span>
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
                <span className="text-muted-foreground">Reliquat Final</span>
                <span className="font-bold text-status-success">{formatCurrency(derivedFields.reliquatFinal)}</span>
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
        <Button type="submit" disabled={!formData.client || !formData.nom_mission}>
          Enregistrer la Mission
        </Button>
      </div>
    </form>
  );
}
