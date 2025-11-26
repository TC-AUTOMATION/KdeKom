import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMissions, toggleMissionPaid } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  User,
  Users,
  Euro,
  Building,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  TrendingDown,
  Wallet,
  PiggyBank,
} from 'lucide-react';

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMission();
  }, [id]);

  async function loadMission() {
    try {
      const missions = await fetchMissions();
      const found = missions.find((m: any) => m.id === id);
      setMission(found || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePaid() {
    if (!mission) return;
    try {
      await toggleMissionPaid(mission.id);
      setMission({ ...mission, is_paid: !mission.is_paid });
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-app-border border-t-app-text-muted rounded-full mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-app-text-secondary">Chargement de la mission...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/missions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux missions
        </Button>
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-app-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-app-text-primary mb-2">Mission introuvable</h2>
          <p className="text-app-text-muted">La mission demandée n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  // Calculs
  const totalCollaborateurs = mission.parts_collaborateurs?.reduce((sum: number, c: any) => sum + (c.montant || 0), 0) || 0;
  const totalFrais = (mission.frais_gestion || 0) + (mission.frais_ml || 0) + (mission.frais_lt || 0) + (mission.frais_supp_fred || 0);
  const totalDecaissements = totalCollaborateurs + (mission.commission_apporteur || 0) + totalFrais + (mission.provision_charges || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/missions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-app-text-primary">{mission.nom_mission}</h1>
            <p className="text-app-text-muted">{mission.mois} {mission.annee} • {mission.client_nom}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTogglePaid}>
            {mission.is_paid ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Marquer impayé
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marquer payé
              </>
            )}
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" className="text-status-error hover:text-status-error">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        {mission.is_paid ? (
          <Badge className="bg-status-success/20 text-status-success text-sm px-3 py-1">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Payé
          </Badge>
        ) : (
          <Badge className="bg-status-warning/20 text-status-warning text-sm px-3 py-1">
            <Clock className="h-4 w-4 mr-2" />
            En attente de paiement
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Euro className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-app-text-muted uppercase">CA Généré</p>
              <p className="text-xl font-bold text-app-text-primary">{formatCurrency(mission.ca_genere || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Wallet className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-app-text-muted uppercase">Total Encaissé</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(mission.total_encaisse || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PiggyBank className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-app-text-muted uppercase">Base Distribuable</p>
              <p className="text-xl font-bold text-purple-400">{formatCurrency(mission.base_distribuable || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-app-text-muted uppercase">Reliquat Final</p>
              <p className="text-xl font-bold text-orange-400">{formatCurrency(mission.reliquat_final || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations générales + Répartition - Grid côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-app-border">
            <h3 className="text-base font-semibold text-app-text-primary">Informations générales</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-app-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-app-text-muted uppercase">Client</p>
                  <p className="font-medium text-app-text-primary">{mission.client_nom}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-app-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-app-text-muted uppercase">Apporteur</p>
                  <p className="font-medium text-app-text-primary">{mission.apporteur_nom || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-app-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-app-text-muted uppercase">Période</p>
                  <p className="font-medium text-app-text-primary">{mission.mois} {mission.annee}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-app-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-app-text-muted uppercase">Mission</p>
                  <p className="font-medium text-app-text-primary">{mission.nom_mission}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition Collaborateurs */}
        {(() => {
          const collabsAvecPct = mission.parts_collaborateurs?.filter((c: any) => (c.pct || 0) > 0 || (c.montant || 0) > 0) || [];
          return collabsAvecPct.length > 0 ? (
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-app-text-primary flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Répartition
                </h3>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {formatCurrency(totalCollaborateurs)}
                </Badge>
              </div>
              <div className="p-6 space-y-3">
                {collabsAvecPct.map((collab: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-app-text-secondary text-sm">{collab.collaborateur_nom || collab.collaborateur}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-app-text-primary font-medium">{formatCurrency(collab.montant || 0)}</span>
                      {(collab.pct || 0) > 0 && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                          {collab.pct}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {(mission.pct_reliquat || 0) > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-app-border">
                    <span className="text-app-text-muted text-sm">Reliquat</span>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-medium">{formatCurrency(mission.reliquat_final || 0)}</span>
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                        {mission.pct_reliquat}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border">
                <h3 className="text-base font-semibold text-app-text-primary flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Répartition
                </h3>
              </div>
              <div className="p-6">
                <p className="text-app-text-muted text-sm">Aucun collaborateur assigné</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Résumé financier complet - Full width */}
      <div className="bg-app-dark/50 backdrop-blur-sm border border-app-border rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border">
          <h3 className="text-base font-semibold text-app-text-primary">Résumé financier</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Entrées */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-app-text-muted uppercase tracking-wide">Entrées</h4>
              <div className="flex justify-between items-center py-1">
                <span className="text-app-text-secondary">CA Généré</span>
                <span className="font-bold text-app-text-primary">{formatCurrency(mission.ca_genere || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={`${(mission.montant_sub || 0) > 0 ? 'text-blue-400' : 'text-app-text-muted'}`}>+ Subvention ({mission.pct_sub || 0}%)</span>
                <span className={`${(mission.montant_sub || 0) > 0 ? 'text-blue-400' : 'text-app-text-muted'}`}>{formatCurrency(mission.montant_sub || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={`${mission.is_paid ? 'text-status-success' : 'text-status-warning'}`}>
                  + Part Client ({mission.pct_client || 0}%)
                </span>
                <span className={mission.is_paid ? 'text-status-success' : 'text-status-warning'}>
                  {formatCurrency(mission.montant_client || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-green-500/10 rounded-lg px-3 mt-2">
                <span className="text-green-400 font-medium">Total Encaissé</span>
                <span className="font-bold text-green-400">{formatCurrency(mission.total_encaisse || 0)}</span>
              </div>
            </div>

            {/* Base distribuable */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-app-text-muted uppercase tracking-wide">Base de distribution</h4>
              <div className="flex justify-between items-center py-1">
                <span className="text-app-text-secondary">Part Client</span>
                <span className="text-app-text-primary">{formatCurrency(mission.montant_client || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.reduction_base || 0) > 0 ? 'text-red-400' : 'text-app-text-muted'}>- Réduction de base</span>
                <span className={(mission.reduction_base || 0) > 0 ? 'text-red-400' : 'text-app-text-muted'}>{formatCurrency(mission.reduction_base || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-purple-500/10 rounded-lg px-3 mt-2">
                <span className="text-purple-400 font-medium">Base distribuable</span>
                <span className="font-bold text-purple-400">{formatCurrency(mission.base_distribuable || 0)}</span>
              </div>
            </div>

            {/* Déductions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-app-text-muted uppercase tracking-wide">Déductions</h4>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.provision_charges || 0) > 0 ? 'text-orange-400' : 'text-app-text-muted'}>- Provision charges</span>
                <span className={(mission.provision_charges || 0) > 0 ? 'text-orange-400' : 'text-app-text-muted'}>{formatCurrency(mission.provision_charges || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.frais_supp_fred || 0) > 0 ? 'text-app-text-secondary' : 'text-app-text-muted'}>- Frais supp. Fred</span>
                <span className={(mission.frais_supp_fred || 0) > 0 ? 'text-app-text-primary' : 'text-app-text-muted'}>{formatCurrency(mission.frais_supp_fred || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.frais_gestion || 0) > 0 ? 'text-app-text-secondary' : 'text-app-text-muted'}>- Frais gestion</span>
                <span className={(mission.frais_gestion || 0) > 0 ? 'text-app-text-primary' : 'text-app-text-muted'}>{formatCurrency(mission.frais_gestion || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.frais_ml || 0) > 0 ? 'text-app-text-secondary' : 'text-app-text-muted'}>- Commission ML</span>
                <span className={(mission.frais_ml || 0) > 0 ? 'text-app-text-primary' : 'text-app-text-muted'}>{formatCurrency(mission.frais_ml || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.frais_lt || 0) > 0 ? 'text-app-text-secondary' : 'text-app-text-muted'}>- Commission LT</span>
                <span className={(mission.frais_lt || 0) > 0 ? 'text-app-text-primary' : 'text-app-text-muted'}>{formatCurrency(mission.frais_lt || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={totalCollaborateurs > 0 ? 'text-blue-400' : 'text-app-text-muted'}>- Collaborateurs</span>
                <span className={totalCollaborateurs > 0 ? 'text-blue-400' : 'text-app-text-muted'}>{formatCurrency(totalCollaborateurs)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={(mission.commission_apporteur || 0) > 0 ? 'text-pink-400' : 'text-app-text-muted'}>- Commission apporteur</span>
                <span className={(mission.commission_apporteur || 0) > 0 ? 'text-pink-400' : 'text-app-text-muted'}>{formatCurrency(mission.commission_apporteur || 0)}</span>
              </div>
            </div>

            {/* Résultat */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-app-text-muted uppercase tracking-wide">Résultat</h4>
              <div className="flex justify-between items-center py-1">
                <span className="text-app-text-secondary">Restant après frais</span>
                <span className="text-app-text-primary">{formatCurrency(mission.restant_apres_frais || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-app-text-secondary">Restant après apporteur</span>
                <span className="text-app-text-primary">{formatCurrency(mission.restant_apres_apporteur || 0)}</span>
              </div>
              <div className={`flex justify-between items-center py-3 rounded-lg px-3 mt-2 ${(mission.reliquat_final || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <span className={`font-semibold ${(mission.reliquat_final || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Reliquat final
                </span>
                <div className="text-right">
                  <span className={`text-xl font-bold ${(mission.reliquat_final || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(mission.reliquat_final || 0)}
                  </span>
                  {(mission.pct_reliquat || 0) > 0 && (
                    <p className="text-xs text-app-text-muted">{mission.pct_reliquat}% de la base</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
