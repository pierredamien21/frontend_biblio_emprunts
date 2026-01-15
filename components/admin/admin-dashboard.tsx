"use client"

import { useState } from "react"
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Download,
  UserPlus,
  Key,
  Lock,
  DollarSign,
  Clock,
  AlertTriangle,
  BookText,
  FolderTree,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { BibliothecairePanel } from "@/components/admin/bibliothecaire-panel"
import { SanctionsPanel } from "@/components/admin/sanctions-panel"
import { AuteurPanel } from "@/components/admin/auteur-panel"
import { CategoriePanel } from "@/components/admin/categorie-panel"

interface AdminDashboardProps {
  onLogout: () => void
  onNavigate: (view: string) => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", id: "overview" },
  { icon: Users, label: "Bibliothécaires", id: "staff" },
  { icon: DollarSign, label: "Sanctions", id: "sanctions" },
  { icon: BookText, label: "Auteurs", id: "auteurs" },
  { icon: FolderTree, label: "Catégories", id: "categories" },
  { icon: Settings, label: "Paramètres", id: "settings" },
]

const staffMembers = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@biblio.fr",
    role: "Bibliothécaire",
    status: "active",
    lastLogin: "14/01/2024",
  },
  {
    id: 2,
    name: "Marie Martin",
    email: "marie.martin@biblio.fr",
    role: "Bibliothécaire",
    status: "active",
    lastLogin: "14/01/2024",
  },
  {
    id: 3,
    name: "Pierre Bernard",
    email: "pierre.bernard@biblio.fr",
    role: "Bibliothécaire",
    status: "inactive",
    lastLogin: "10/01/2024",
  },
]

export function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("overview")

  // Settings state
  const [loanDuration, setLoanDuration] = useState("21")
  const [fineAmount, setFineAmount] = useState("0.20")
  const [maxExtensions, setMaxExtensions] = useState("2")

  return (
    <div className="min-h-screen bg-[#0F1724] theme-admin text-white">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#1A2332] border-b border-[#2A3340] px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Admin</span>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1220] border-r border-[#2A3340] transform transition-transform duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-[#2A3340]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">BiblioTech</span>
                    <span className="text-xs text-[#94A3B8]">Administration</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    activeMenu === item.id
                      ? "bg-[#7C3AED] text-white"
                      : "text-[#94A3B8] hover:bg-[#1A2332] hover:text-white",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}

              {/* Access Staff Mode */}
              <div className="pt-4 mt-2 border-t border-[#2A3340]">
                <button
                  onClick={() => onNavigate("staff")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[#94A3B8] hover:bg-[#1A2332] hover:text-white group"
                >
                  <div className="w-5 h-5 rounded bg-[#0B5FFF]/20 flex items-center justify-center group-hover:bg-[#0B5FFF]">
                    <BookOpen className="w-3 h-3 text-[#0B5FFF] group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium">Mode Bibliothécaire</span>
                </button>
              </div>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-[#2A3340]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7C3AED]/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[#7C3AED]">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-[#94A3B8]">Administrateur</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-[#2A3340]">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-400 hover:text-red-400 hover:bg-red-400/10"
                onClick={onLogout}
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {activeMenu === "overview" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Vue d'ensemble</h1>
                <p className="text-[#94A3B8]">Pilotage global de la bibliothèque</p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">1,247</p>
                        <p className="text-sm text-[#94A3B8]">Membres total</p>
                      </div>
                      <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#7C3AED]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">+8%</span>
                      <span className="text-xs text-[#94A3B8]">ce mois</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">8,432</p>
                        <p className="text-sm text-[#94A3B8]">Prêts ce mois</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">€247</p>
                        <p className="text-sm text-[#94A3B8]">Amendes perçues</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-orange-400">42</p>
                        <p className="text-sm text-[#94A3B8]">Retards actifs</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts placeholder */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Fréquentation hebdomadaire</CardTitle>
                    <Button variant="ghost" size="sm" className="text-[#94A3B8] gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center border border-dashed border-[#2A3340] rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-[#94A3B8] mx-auto mb-2" />
                        <p className="text-[#94A3B8] text-sm">Graphique de fréquentation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardHeader>
                    <CardTitle className="text-white">Top livres empruntés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["Le Petit Prince", "1984", "L'Étranger", "Dune", "Les Misérables"].map((title, i) => (
                        <div key={title} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-[#7C3AED]/20 rounded text-center text-xs text-[#7C3AED] leading-6 font-bold">
                              {i + 1}
                            </span>
                            <span className="text-white text-sm">{title}</span>
                          </div>
                          <span className="text-[#94A3B8] text-sm">{120 - i * 15} prêts</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeMenu === "staff" && (
            <div className="bg-white text-foreground p-6 rounded-lg">
              <BibliothecairePanel />
            </div>
          )}

          {activeMenu === "sanctions" && (
            <div className="bg-white text-foreground p-6 rounded-lg">
              <SanctionsPanel />
            </div>
          )}

          {activeMenu === "auteurs" && (
            <div className="bg-white text-foreground p-6 rounded-lg">
              <AuteurPanel />
            </div>
          )}

          {activeMenu === "categories" && (
            <div className="bg-white text-foreground p-6 rounded-lg">
              <CategoriePanel />
            </div>
          )}

          {activeMenu === "settings" && (
            <>
              <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Gestion du Staff</h1>
                  <p className="text-[#94A3B8]">Gérez les comptes des bibliothécaires</p>
                </div>
                <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2">
                  <UserPlus className="w-4 h-4" />
                  Ajouter un bibliothécaire
                </Button>
              </div>

              <Card className="bg-[#1A2332] border-[#2A3340]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A3340] hover:bg-transparent">
                      <TableHead className="text-[#94A3B8]">Nom</TableHead>
                      <TableHead className="text-[#94A3B8]">Email</TableHead>
                      <TableHead className="text-[#94A3B8]">Rôle</TableHead>
                      <TableHead className="text-[#94A3B8]">Statut</TableHead>
                      <TableHead className="text-[#94A3B8]">Dernière connexion</TableHead>
                      <TableHead className="text-[#94A3B8] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((member) => (
                      <TableRow key={member.id} className="border-[#2A3340] hover:bg-[#0B1220]">
                        <TableCell className="text-white font-medium">{member.name}</TableCell>
                        <TableCell className="text-[#94A3B8]">{member.email}</TableCell>
                        <TableCell className="text-[#94A3B8]">{member.role}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              member.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-[#2A3340] text-[#94A3B8]",
                            )}
                          >
                            {member.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#94A3B8]">{member.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-white">
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-white">
                              <Lock className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}

          {activeMenu === "settings" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Paramètres</h1>
                <p className="text-[#94A3B8]">Configuration des règles de la bibliothèque</p>
              </div>

              <Card className="bg-[#1A2332] border-[#2A3340] max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Règles de prêt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">Durée de prêt (jours)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={loanDuration}
                          onChange={(e) => setLoanDuration(e.target.value)}
                          className="bg-[#0B1220] border-[#2A3340] text-white"
                        />
                        <Clock className="w-5 h-5 text-[#94A3B8]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">Max prolongations</Label>
                      <Input
                        type="number"
                        value={maxExtensions}
                        onChange={(e) => setMaxExtensions(e.target.value)}
                        className="bg-[#0B1220] border-[#2A3340] text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Montant amende par jour (€)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        className="bg-[#0B1220] border-[#2A3340] text-white max-w-[200px]"
                      />
                      <DollarSign className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                  </div>
                  <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white">
                    Enregistrer les modifications
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeMenu === "analytics" && (
            <>
              <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Analytics</h1>
                  <p className="text-[#94A3B8]">Statistiques et rapports détaillés</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#2A3340] text-white hover:bg-[#1A2332] gap-2 bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="bg-[#1A2332] border-[#2A3340] lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Heatmap de fréquentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border border-dashed border-[#2A3340] rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-[#94A3B8] mx-auto mb-2" />
                        <p className="text-[#94A3B8]">Heatmap placeholder</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2332] border-[#2A3340]">
                  <CardHeader>
                    <CardTitle className="text-white">Répartition par catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Roman", value: 35, color: "bg-[#7C3AED]" },
                        { name: "Science-Fiction", value: 25, color: "bg-blue-500" },
                        { name: "Jeunesse", value: 20, color: "bg-green-500" },
                        { name: "BD", value: 12, color: "bg-yellow-500" },
                        { name: "Autres", value: 8, color: "bg-[#94A3B8]" },
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{item.name}</span>
                            <span className="text-[#94A3B8]">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-[#0B1220] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", item.color)}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
