import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';

export default function PartnerProfile() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mon Profil</h2>
        <p className="text-slate-500">Gérez vos informations personnelles et préférences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
            <p className="text-sm text-emerald-600 font-medium mb-4">Partenaire Gold</p>
            
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">ID Partenaire</span>
                <span className="font-mono font-medium">#8832</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Membre depuis</span>
                <span className="font-medium">Oct 2023</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Mettez à jour vos coordonnées de contact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="firstName" defaultValue="John" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="lastName" defaultValue="Doe" className="pl-9" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" defaultValue="john.doe@example.com" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" className="pl-9" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="address" defaultValue="123 Avenue des Champs-Élysées, 75008 Paris" className="pl-9" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Enregistrer les modifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="md:col-span-3 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Sécurité & Connexion</CardTitle>
            <CardDescription>Gérez votre mot de passe et vos accès.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-full">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Mot de passe</p>
                  <p className="text-sm text-slate-500">Dernière modification il y a 3 mois</p>
                </div>
              </div>
              <Button variant="outline">Modifier</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}