import { Link } from 'react-router-dom';
import { ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
            KDEKOM Financial Suite
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Plateforme unifiée pour la gestion financière et le suivi des partenaires.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Admin Portal Card */}
          <Card className="hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Espace Administration</CardTitle>
              <CardDescription>
                Gestion complète des missions, finances et utilisateurs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2 mb-6 text-left mx-auto max-w-[200px]">
                <li className="flex items-center">✓ Dashboard Financier</li>
                <li className="flex items-center">✓ Gestion des Missions</li>
                <li className="flex items-center">✓ Récapitulatifs Mensuels</li>
              </ul>
              <Link to="/admin">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Accéder au Backoffice <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Partner Portal Card */}
          <Card className="hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Espace Partenaire</CardTitle>
              <CardDescription>
                Suivi de vos performances et commissions en temps réel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2 mb-6 text-left mx-auto max-w-[200px]">
                <li className="flex items-center">✓ Mes Commissions</li>
                <li className="flex items-center">✓ Suivi des Paiements</li>
                <li className="flex items-center">✓ Statistiques Personnelles</li>
              </ul>
              <Link to="/partner">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Accéder au Portail <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm text-slate-400 mt-12">
          © 2025 KDEKOM. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}