"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Package,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  BookCheck,
  UserCheck,
  BarChart3,
  Loader2,
  Trash2,
  Edit,
  ShieldAlert,
  Shield,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationsPopover } from "@/components/shared/notifications-popover"
import { cn } from "@/lib/utils"
import { fetchApi } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StaffDashboardProps {
  onLogout: () => void
  onNavigate: (view: string) => void
}

interface MemberType {
  id_type_membre: number
  nom_type: string
}

interface Member {
  id_membre: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  numero_carte: string
  statut_compte: string
  login?: string
  id_type_membre: number
  type_membre?: {
    nom_type: string
  }
}

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", id: "dashboard" },
  { icon: BookOpen, label: "Catalogue", id: "catalog" },
  { icon: ArrowLeftRight, label: "Comptoir", id: "circulation", badge: 5 },
  { icon: Users, label: "Membres", id: "members" },
  { icon: Package, label: "Inventaire", id: "inventory" },
  { icon: Bell, label: "Alertes", id: "alerts", badge: 3 },
  { icon: Settings, label: "Paramètres", id: "settings" },
]

const recentActivity = [
  { type: "loan", user: "Marie Dupont", book: "1984", time: "Il y a 5 min" },
  { type: "return", user: "Jean Martin", book: "Le Petit Prince", time: "Il y a 12 min" },
  { type: "reservation", user: "Sophie Bernard", book: "Dune", time: "Il y a 25 min" },
  { type: "loan", user: "Pierre Duval", book: "L'Étranger", time: "Il y a 1h" },
]

const dueToday = [
  { id: 1, user: "Alice Moreau", book: "Les Misérables", phone: "06 12 34 56 78" },
  { id: 2, user: "Lucas Simon", book: "Germinal", phone: "06 98 76 54 32" },
  { id: 3, user: "Emma Petit", book: "Madame Bovary", phone: "06 11 22 33 44" },
]


export function StaffDashboard({ onLogout, onNavigate }: StaffDashboardProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([])
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [recentLoans, setRecentLoans] = useState<any[]>([])
  const [todayLoans, setTodayLoans] = useState<any[]>([])
  const [lateLoans, setLateLoans] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (currentMember) {
      setSelectedType(currentMember.id_type_membre.toString())
    } else {
      setSelectedType("")
    }
  }, [currentMember])

  const fetchData = async (view: string) => {
    setIsLoading(true)
    try {
      if (view === "dashboard") {
        const [statsData, loansData, membersData, livresData, exemplairesData] = await Promise.all([
          fetchApi("/stats/"),
          fetchApi("/emprunts/"),
          fetchApi("/membres/"),
          fetchApi("/livres/"),
          fetchApi("/exemplaires/")
        ])
        setStats(statsData)

        const enrichLoan = (loan: any) => {
          const m = membersData.find((mem: any) => mem.id_membre === loan.id_membre)
          const ex = exemplairesData.find((e: any) => e.id_exemplaire === loan.id_exemplaire)
          const b = livresData.find((bk: any) => bk.id_livre === ex?.id_livre)
          return {
            ...loan,
            memberName: m ? `${m.prenom} ${m.nom}` : `Membre #${loan.id_membre}`,
            bookTitle: b ? b.titre : `Livre #${ex?.id_livre}`,
            phone: m?.telephone
          }
        }

        const enrichedLoans = loansData.map(enrichLoan)

        // Sort by date to get recent activity
        const sorted = [...enrichedLoans].sort((a, b) => new Date(b.date_emprunt).getTime() - new Date(a.date_emprunt).getTime())
        setRecentLoans(sorted.slice(0, 5))

        // Get due today
        const todayStr = new Date().toISOString().split('T')[0]
        const due = enrichedLoans.filter((l: any) => l.date_retour_prevue === todayStr && l.statut === "En cours")
        setTodayLoans(due)

      } else if (view === "members") {
        const [membersData, typesData] = await Promise.all([
          fetchApi("/membres/"),
          fetchApi("/types-membre/")
        ])
        setMembers(membersData)
        setMemberTypes(typesData)
      } else if (view === "alerts") {
        const [loansData, membersData, livresData, exemplairesData] = await Promise.all([
          fetchApi("/emprunts/"),
          fetchApi("/membres/"),
          fetchApi("/livres/"),
          fetchApi("/exemplaires/")
        ])

        const enrichLoan = (loan: any) => {
          const m = membersData.find((mem: any) => mem.id_membre === loan.id_membre)
          const ex = exemplairesData.find((e: any) => e.id_exemplaire === loan.id_exemplaire)
          const b = livresData.find((bk: any) => bk.id_livre === ex?.id_livre)
          return {
            ...loan,
            memberName: m ? `${m.prenom} ${m.nom}` : `Membre #${loan.id_membre}`,
            bookTitle: b ? b.titre : `Livre #${ex?.id_livre}`,
            email: m?.email,
            phone: m?.telephone
          }
        }

        const enriched = loansData.map(enrichLoan)
        const todayStr = new Date().toISOString().split('T')[0]
        const late = enriched.filter((l: any) =>
          l.statut === "En cours" &&
          new Date(l.date_retour_prevue) < new Date() &&
          l.date_retour_prevue !== todayStr
        )
        setLateLoans(late)
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${view}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(activeMenu)
  }, [activeMenu])

  const handleMenuClick = (id: string) => {
    setActiveMenu(id)
    setSidebarOpen(false)
    if (id === "circulation") {
      onNavigate("circulation")
    } else if (id === "inventory") {
      onNavigate("inventory")
    } else if (id === "catalog") {
      onNavigate("catalog") // Use SPA navigation instead of hard redirect
    } else if (id === "catalog") {
      onNavigate("catalog") // Use SPA navigation instead of hard redirect
    } else if (id === "settings") {
      toast({
        title: "Bientôt disponible",
        description: "Cette fonctionnalité sera disponible dans une prochaine mise à jour.",
      })
      // Keep on dashboard or previous view to avoid blank screen if view not implemented
      setActiveMenu("dashboard")
    }
  }

  const handleSaveMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries()) as any

    try {
      if (!data.id_type_membre) {
        throw new Error("Veuillez sélectionner un type de membre.")
      }

      const payload: any = {
        ...data,
        id_type_membre: parseInt(data.id_type_membre),
        statut_compte: currentMember?.statut_compte || "Actif"
      }

      if (currentMember?.id_membre) {
        if (!data.password) delete payload.password

        await fetchApi(`/membres/${currentMember.id_membre}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
        toast({ title: "Succès", description: "Membre mis à jour." })
      } else {
        if (!data.password) throw new Error("Le mot de passe est requis.")

        await fetchApi("/membres/", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast({ title: "Succès", description: "Membre créé avec succès." })
      }
      setIsMemberDialogOpen(false)
      fetchData("members")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!currentMember) return
    setIsSaving(true)
    try {
      await fetchApi(`/membres/${currentMember.id_membre}`, {
        method: "DELETE"
      })
      toast({ title: "Succès", description: "Membre supprimé." })
      setIsDeleteDialogOpen(false)
      fetchData("members")
    } catch (error: any) {
      // Check for foreign key constraint or generic server error that implies usage
      const msg = error.message || ""
      if (msg.includes("foreign key") || msg.includes("constraint") || msg.includes("500") || msg.toLowerCase().includes("suppression impossible")) {
        toast({
          title: "Suppression impossible",
          description: "Ce membre possède des emprunts ou des sanctions en cours.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Erreur",
          description: msg,
          variant: "destructive"
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const toggleMemberStatus = async (member: Member) => {
    const newStatus = member.statut_compte === "Actif" ? "Suspendu" : "Actif"
    try {
      await fetchApi(`/membres/${member.id_membre}/statut?statut=${newStatus}`, {
        method: "PATCH"
      })
      toast({ title: "Statut mis à jour", description: `Le membre est maintenant ${newStatus}.` })
      fetchData("members")
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] theme-staff">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0B5FFF] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">BiblioTech Staff</span>
          </div>
          <NotificationsPopover />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#0B5FFF] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">BiblioTech</span>
                    <span className="text-xs text-muted-foreground">Portail Staff</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                    activeMenu === item.id ? "bg-[#0B5FFF] text-white" : "text-foreground hover:bg-[#E7EDF7]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      className={cn(
                        "h-5 min-w-5 flex items-center justify-center text-xs",
                        activeMenu === item.id ? "bg-white/20 text-white" : "bg-orange-500 text-white",
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#E7EDF7] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[#0B5FFF]">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrateur' : 'Bibliothécaire'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onLogout}
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>

              {(user?.role === 'admin' || user?.role === 'Admin') && (
                <div className="pt-4 mt-4 border-t border-border">
                  <Button
                    onClick={() => onNavigate("admin")}
                    className="w-full justify-start gap-3 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white"
                  >
                    <Shield className="w-5 h-5" />
                    Retour Admin
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {activeMenu === "dashboard" && (
            <div className="animate-fade-in font-inter">
              {/* Header */}
              <div className="mb-8 relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-white border border-border shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0B5FFF]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#0B1220]">Tableau de bord</h1>
                    <p className="text-muted-foreground mt-1">
                      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Bibliothèque Centrale
                    </p>
                  </div>
                  <Button
                    className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white w-full lg:w-auto shadow-lg shadow-[#0B5FFF]/20"
                    onClick={() => onNavigate("circulation")}
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Ouvrir le comptoir
                  </Button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-foreground">
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : (stats?.global?.emprunts_actifs ?? 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Prêts actifs</p>
                      </div>
                      <div className="w-12 h-12 bg-[#0B5FFF]/10 rounded-full flex items-center justify-center">
                        <BookCheck className="w-6 h-6 text-[#0B5FFF]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-warning">
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : (stats?.global?.retards ?? 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Retards</p>
                      </div>
                      <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-warning" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-foreground">
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : (stats?.global?.total_membres ?? 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Membres total</p>
                      </div>
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-foreground">
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : (stats?.global?.total_exemplaires ?? 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Exemplaires</p>
                      </div>
                      <div className="w-12 h-12 bg-[#06B6D4]/10 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#06B6D4]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Due Today */}
                  <Card className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-warning" />
                        Retours prévus aujourd'hui
                      </CardTitle>
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        {todayLoans.length}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {todayLoans.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Aucun retour prévu aujourd'hui</p>
                        ) : todayLoans.map((item) => (
                          <div key={item.id_emprunt} className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                            <div>
                              <p className="font-medium text-foreground text-sm">{item.memberName}</p>
                              <p className="text-xs text-muted-foreground">{item.bookTitle}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                              onClick={() => onNavigate("circulation")}
                            >
                              Retour rapide
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Livres par catégorie */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Livres par catégorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(!stats?.par_categorie || stats.par_categorie.length === 0) ? (
                          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                        ) : stats.par_categorie.map((item: any) => (
                          <div key={item.categorie}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-foreground">{item.categorie}</span>
                              <span className="text-muted-foreground">{item.nombre} livres</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0B5FFF] rounded-full"
                                style={{ width: `${(item.nombre / (stats?.global?.total_livres || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Recent Activity */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Activité récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {recentLoans.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>
                        ) : recentLoans.map((loan, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-lg">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                loan.statut === "En cours" ? "bg-success/10" : "bg-[#0B5FFF]/10",
                              )}
                            >
                              {loan.statut === "En cours" ? (
                                <BookCheck className="w-4 h-4 text-success" />
                              ) : (
                                <ArrowLeftRight className="w-4 h-4 text-[#0B5FFF]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">
                                <span className="font-medium">{loan.memberName}</span>
                                {loan.statut === "En cours" ? " a emprunté " : " a retourné "}
                                <span className="font-medium">{loan.bookTitle}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(loan.date_emprunt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "members" && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Gestion des Membres</h1>
                  <p className="text-muted-foreground">Consultez et gérez les adhérents de la bibliothèque</p>
                </div>
                <Button
                  className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white gap-2"
                  onClick={() => {
                    setCurrentMember(null)
                    setIsMemberDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Membre
                </Button>
              </div>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Rechercher un membre (nom, email, carte)..."
                      className="w-full pl-10 pr-4 py-2 bg-[#F4F6F8] border-none rounded-lg text-sm focus:ring-1 focus:ring-[#0B5FFF] outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Membre</th>
                          <th className="pb-3 font-medium">Carte #</th>
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Statut</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-[#0B5FFF] mx-auto" />
                              <p className="mt-2 text-sm text-muted-foreground">Chargement des membres...</p>
                            </td>
                          </tr>
                        ) : members.filter(m =>
                          (m.nom?.toLowerCase() + " " + m.prenom?.toLowerCase()).includes(searchQuery.toLowerCase()) ||
                          m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.numero_carte?.includes(searchQuery)
                        ).length > 0 ? (
                          members.filter(m =>
                            (m.nom?.toLowerCase() + " " + m.prenom?.toLowerCase()).includes(searchQuery.toLowerCase()) ||
                            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.numero_carte?.includes(searchQuery)
                          ).map((member) => (
                            <tr key={member.id_membre} className="text-sm group hover:bg-[#F4F6F8] transition-colors">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#0B5FFF]/10 flex items-center justify-center text-[#0B5FFF] font-medium text-xs">
                                    {member.prenom?.[0]}{member.nom?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{member.prenom} {member.nom}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 font-mono text-xs">{member.numero_carte}</td>
                              <td className="py-4">
                                <Badge variant="outline" className="text-xs bg-white">{member.type_membre?.nom_type || "Standard"}</Badge>
                              </td>
                              <td className="py-4">
                                <Badge className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  member.statut_compte === "Actif" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                                )}>
                                  {member.statut_compte}
                                </Badge>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-[#0B5FFF] hover:bg-[#0B5FFF]/10"
                                    onClick={() => {
                                      setCurrentMember(member)
                                      setIsMemberDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-warning hover:bg-warning/10"
                                    onClick={() => toggleMemberStatus(member)}
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      setCurrentMember(member)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-muted-foreground italic">
                              Aucun membre trouvé.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          )}

          {activeMenu === "alerts" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-destructive flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    Retards et Alertes
                  </h1>
                  <p className="text-muted-foreground">Gestion des emprunts en retard</p>
                </div>
                <Badge variant="destructive" className="px-3 py-1 text-sm">
                  {lateLoans.length} Retard{lateLoans.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <Card className="bg-white border-destructive/20 shadow-sm">
                <CardHeader>
                  <CardTitle>Liste des retards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-destructive" />
                      </div>
                    ) : lateLoans.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                        <p>Aucun retard à signaler. Tout est en ordre !</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {lateLoans.map((loan) => (
                          <div key={loan.id_emprunt} className="flex items-center justify-between p-4 border border-destructive/10 bg-destructive/5 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-destructive font-bold border border-destructive/20">
                                !
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{loan.memberName}</p>
                                <p className="text-sm text-foreground/80">Livre: <span className="font-medium">{loan.bookTitle}</span></p>
                                <div className="flex gap-2 mt-1 text-xs">
                                  <Badge variant="outline" className="text-destructive border-destructive/30 bg-white">
                                    Prévu le: {new Date(loan.date_retour_prevue).toLocaleDateString()}
                                  </Badge>
                                  {loan.phone && (
                                    <Badge variant="secondary">Tel: {loan.phone}</Badge>
                                  )}
                                  {loan.email && (
                                    <Badge variant="secondary">Email: {loan.email}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => onNavigate("circulation")}>
                              Gérer
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for unimplemented views */}
          {!["dashboard", "members", "alerts"].includes(activeMenu) && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in bg-white rounded-xl border border-dashed border-border p-12">
              <div className="w-20 h-20 bg-[#E7EDF7] rounded-full flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 text-[#0B5FFF] animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Module en cours de développement</h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                La vue pour <span className="font-semibold text-[#0B5FFF]">"{menuItems.find(i => i.id === activeMenu)?.label || activeMenu}"</span> est en cours de finalisation et sera disponible très prochainement.
              </p>
              <div className="flex gap-3 mt-8 mx-auto">
                <Button
                  className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white"
                  onClick={() => setActiveMenu("dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Tableau de bord
                </Button>
                <Button variant="outline" onClick={() => setActiveMenu("members")}>
                  <Users className="w-4 h-4 mr-2" />
                  Membres
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Member Form Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentMember ? "Modifier le membre" : "Ajouter un nouveau membre"}</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour {currentMember ? "mettre à jour" : "créer"} le compte membre.
            </DialogDescription>
          </DialogHeader>
          <form
            key={currentMember ? `edit-${currentMember.id_membre}` : 'new-member'}
            onSubmit={handleSaveMember}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" name="prenom" defaultValue={currentMember?.prenom} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" defaultValue={currentMember?.nom} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={currentMember?.email} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_carte">Numéro de carte</Label>
                <Input id="numero_carte" name="numero_carte" defaultValue={currentMember?.numero_carte} placeholder="2024-XXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_type_membre">Type de membre</Label>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {memberTypes.map((type) => (
                      <SelectItem key={type.id_type_membre} value={type.id_type_membre.toString()}>
                        {type.nom_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Hidden input to ensure value is captured in FormData */}
                <input type="hidden" name="id_type_membre" value={selectedType} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe {currentMember && "(laisser vide pour ne pas changer)"}</Label>
              <Input id="password" name="password" type="password" required={!currentMember} minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login">Nom d'utilisateur (Optionnel)</Label>
              <Input id="login" name="login" defaultValue={currentMember?.login} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {currentMember ? "Enregistrer les modifications" : "Créer le membre"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le membre <span className="font-semibold">{currentMember?.prenom} {currentMember?.nom}</span> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteMember} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
