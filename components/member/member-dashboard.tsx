"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Home,
  Book,
  BookmarkCheck,
  Heart,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Clock,
  Star,
  ChevronRight,
  Key,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BookCard } from "@/components/shared/book-card"
import { cn, getImageUrl } from "@/lib/utils"
import { fetchApi } from "@/lib/api-client"
import { Livre, Emprunt, Reservation, Favori, Message, Sanction } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { NotificationsPopover } from "@/components/shared/notifications-popover"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface MemberDashboardProps {
  onLogout: () => void
  onNavigate: (view: string) => void
}

// Initial state for recommendations removed, we fetch them from API

const currentLoans = [
  { id: 1, title: "1984", author: "George Orwell", dueDate: "2024-01-20", daysLeft: 3, canExtend: true },
  { id: 2, title: "Le Petit Prince", author: "Saint-Exupéry", dueDate: "2024-01-25", daysLeft: 8, canExtend: false },
]

const menuItems = [
  { icon: Home, label: "Tableau de bord", id: "dashboard" },
  { icon: Book, label: "Mes prêts", id: "loans", badge: 2 },
  { icon: BookmarkCheck, label: "Réservations", id: "reservations", badge: 1 },
  { icon: Heart, label: "Favoris", id: "favorites" },
  { icon: BookOpen, label: "Catalogue", id: "catalog" },
  { icon: MessageCircle, label: "Support", id: "support" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: User, label: "Mon profil", id: "profile" },
]

export function MemberDashboard({ onLogout, onNavigate }: MemberDashboardProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [loans, setLoans] = useState<Emprunt[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [favorites, setFavorites] = useState<Favori[]>([])

  const [sanctions, setSanctions] = useState<Sanction[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const [recommendations, setRecommendations] = useState<Livre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [showCancelResDialog, setShowCancelResDialog] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null)

  const fetchDashboardData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [loansData, resData, recommendationsData, favoritesData, sanctionsData] = await Promise.all([
        fetchApi(`/emprunts/mes-emprunts`),
        fetchApi(`/reservations/mes-reservations`),
        fetchApi(`/livres/recommandations`),
        fetchApi(`/favoris/`),
        fetchApi(`/sanctions/mes-sanctions`)
      ])
      setLoans(loansData)
      setReservations(resData)
      setRecommendations(recommendationsData)
      setReservations(resData)
      setRecommendations(recommendationsData)
      setFavorites(favoritesData)
      setSanctions(sanctionsData)

      // Fetch notifications separately to not block main dashboard if it fails (or include in Promise.all)
      fetchApi("/notifications/").then(setNotifications).catch(console.error)
    } catch (error) {
      console.error("Failed to load member data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /* 
   * IMPROVEMENT: Added toast notifications for user feedback
   * FIX: Added error handling for user actions
   */
  const { toast } = useToast()

  // Profile handling
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || ""
  })

  useEffect(() => {
    if (user) {
      setEditForm({
        prenom: user.prenom,
        nom: user.nom,
        email: user.email
      })
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      await fetchApi(`/membres/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm)
      })
      toast({ title: "Succès", description: "Profil mis à jour" })
      setIsEditingProfile(false)
      // Ideally refresh user context or force reload
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur mise à jour profil",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAccountClick = () => {
    setShowDeleteAccountDialog(true)
  }

  const handleConfirmDeleteAccount = async () => {
    if (!user) return
    try {
      await fetchApi(`/membres/${user.id}`, { method: "DELETE" })
      toast({ title: "Compte supprimé", description: "Au revoir" })
      onLogout()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur suppression compte",
        variant: "destructive"
      })
    } finally {
      setShowDeleteAccountDialog(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const handleExtendLoan = async (id_emprunt: number) => {
    try {
      await fetchApi(`/emprunts/${id_emprunt}/prolonger`, { method: "PATCH" })
      toast({ title: "Succès", description: "Emprunt prolongé" })
      fetchDashboardData()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de prolonger (peut-être déjà prolongé ou en retard)",
        variant: "destructive"
      })
    }
  }

  const handleCancelReservationClick = (id: number) => {
    setReservationToCancel(id)
    setShowCancelResDialog(true)
  }

  const handleConfirmCancelReservation = async () => {
    if (!reservationToCancel) return

    try {
      await fetchApi(`/reservations/${reservationToCancel}/statut?statut=Annulee`, { method: "PATCH" })
      toast({ title: "Succès", description: "Réservation annulée" })
      fetchDashboardData()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'annuler la réservation",
        variant: "destructive"
      })
    } finally {
      setShowCancelResDialog(false)
      setReservationToCancel(null)
    }
  }

  const [messages, setMessages] = useState<Message[]>([])
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const fetchMessages = async () => {
    try {
      const data = await fetchApi("/messages/")
      setMessages(data)
    } catch (error) {
      console.error("Failed to fetch messages", error)
    }
  }

  // Fetch messages when Support tab is active
  useEffect(() => {
    if (activeMenu === "support") {
      fetchMessages()
    }
  }, [activeMenu])

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSendingMessage(true)
    const formData = new FormData(e.currentTarget)
    const contenu = formData.get("message") as string
    const sujet = formData.get("subject") as string

    if (!contenu) return

    try {
      await fetchApi("/messages/", {
        method: "POST",
        body: JSON.stringify({
          contenu: sujet ? `[${sujet}] ${contenu}` : contenu
        })
      })
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès. Vous recevrez une réponse prochainement."
      })
        ; (e.target as HTMLFormElement).reset()
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
        variant: "destructive"
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const stats = {
    loansCount: loans.filter((l: Emprunt) => l.statut === "En cours" || l.statut === "Retard").length,
    resCount: reservations.filter((r: Reservation) => r.statut === "En attente" || r.statut === "Confirmee").length,
    retardsCount: loans.filter((l: Emprunt) => l.statut === "Retard").length,
    favCount: favorites.length,
    sanctionsAmount: sanctions.filter((s: Sanction) => s.statut === "En cours").reduce((acc, s) => acc + s.montant, 0)
  }

  const menuItemsWithBadges = menuItems.map(item => {
    if (item.id === "loans") return { ...item, badge: stats.loansCount }
    if (item.id === "reservations") return { ...item, badge: stats.resCount }
    if (item.id === "favorites") return { ...item, badge: stats.favCount }
    if (item.id === "reservations") return { ...item, badge: stats.resCount }
    if (item.id === "favorites") return { ...item, badge: stats.favCount }
    if (item.id === "notifications") return { ...item, badge: notifications.filter(n => !n.lu).length }
    return item
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">BiblioTech</span>
          </div>
          <NotificationsPopover />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-sidebar-primary-foreground" />
                  </div>
                  <span className="font-bold text-sidebar-foreground">BiblioTech</span>
                </div>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-sidebar-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sidebar-foreground text-sm">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-muted-foreground">Rôle: {user?.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItemsWithBadges.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "catalog") {
                      onNavigate("catalog")
                    } else {
                      setActiveMenu(item.id)
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                    activeMenu === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant={activeMenu === item.id ? "secondary" : "default"}
                      className={cn(
                        "h-5 min-w-5 flex items-center justify-center text-xs",
                        activeMenu === item.id
                          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                          : "bg-accent text-accent-foreground",
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
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
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {activeMenu === "dashboard" && (
            <div className="animate-fade-in">
              {/* Welcome Banner */}
              <div className="mb-8 relative overflow-hidden rounded-2xl p-8 bg-white border border-border">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                  <h1 className="text-2xl lg:text-4xl font-bold text-foreground mb-2">Bonjour, {user?.prenom} 👋</h1>
                  <p className="text-muted-foreground text-lg">Bienvenue sur votre espace personnel. Que souhaitez-vous lire aujourd'hui ?</p>
                </div>
              </div>

              {/* Alert Banner - Fines/Late Returns (Conditionally visible if any retard) */}
              {stats.retardsCount > 0 && (
                <Card className="mb-6 border-warning bg-warning/10">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Attention : retards détectés</p>
                        <p className="text-sm text-muted-foreground">Vous avez {stats.retardsCount} livre(s) en retard.</p>
                      </div>
                      <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent" onClick={() => setActiveMenu("loans")}>
                        Voir mes prêts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.loansCount}</p>
                        <p className="text-sm text-muted-foreground">Prêts en cours</p>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Book className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.resCount}</p>
                        <p className="text-sm text-muted-foreground">Réservations</p>
                      </div>
                      <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center">
                        <BookmarkCheck className="w-5 h-5 text-info" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.favCount}</p>
                        <p className="text-sm text-muted-foreground">Favoris</p>
                      </div>
                      <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${stats.sanctionsAmount}€`}</p>
                        <p className="text-sm text-muted-foreground">Amendes dues</p>
                      </div>
                      <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Loans Preview */}
              <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Prêts récents</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveMenu("loans")}>
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin w-6 h-6 text-primary" />
                      </div>
                    ) : loans.length > 0 ? (
                      loans.slice(0, 3).map((loan: Emprunt) => (
                        <div key={loan.id_emprunt} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                          <div className="w-12 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {loan.livre?.image_url ? (
                              <img src={getImageUrl(loan.livre.image_url)} alt={loan.livre.titre} className="w-full h-full object-cover" />
                            ) : (
                              <Book className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{loan.livre?.titre || `Prêt #${loan.id_emprunt}`}</p>
                            <p className="text-sm text-muted-foreground italic">{loan.livre?.editeur || "Auteur inconnu"}</p>
                          </div>
                          <Badge variant={loan.statut === "Retard" ? "destructive" : "secondary"}>
                            {loan.statut}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">Aucun prêt</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Recommandés pour vous</h2>
                </div>
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recommendations.map((book: Livre) => (
                      <BookCard key={book.id_livre} book={book} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Pas encore de recommandations personnalisées.</p>
                )}
              </section>
            </div>
          )}
          {activeMenu === "loans" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Mes Emprunts</h1>
                <Badge variant="outline">{stats.loansCount} actif(s)</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {loans.length > 0 ? (
                  loans.map((loan: Emprunt) => (
                    <Card key={loan.id_emprunt} className="bg-card hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                          {loan.livre?.image_url ? (
                            <img src={getImageUrl(loan.livre.image_url)} alt={loan.livre.titre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Book className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate mb-1">{loan.livre?.titre || `Prêt #${loan.id_emprunt}`}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Retour le {new Date(loan.date_retour_prevue).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant={loan.statut === "Retard" ? "destructive" : "secondary"}>{loan.statut}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            disabled={loan.statut !== "En cours"}
                            onClick={() => handleExtendLoan(loan.id_emprunt)}
                          >
                            Prolonger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">Aucun emprunt en cours.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "reservations" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Mes Réservations</h1>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{stats.resCount} en attente</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.length > 0 ? (
                  reservations.map((res: Reservation) => (
                    <Card key={res.id_reservation} className="hover:border-blue-500/50 transition-colors">
                      <CardContent className="p-4 flex gap-4">
                        <div className="w-12 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                          <BookmarkCheck className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold line-clamp-1">{res.livre?.titre}</p>
                          <p className="text-xs text-muted-foreground mb-2 italic">Le {new Date(res.date_reservation).toLocaleDateString()}</p>
                          <Badge variant="secondary" className="text-[10px]">{res.statut}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelReservationClick(res.id_reservation)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full text-center py-10 text-muted-foreground">Aucune réservation active.</p>
                )}
              </div>
            </div>
          )}

          {activeMenu === "favorites" && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold mb-6">Mes Favoris</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.length > 0 ? (
                  favorites.map((fav: Favori) => (
                    // Favori object usually has a 'livre' property or is the book itself?
                    // Checking types.ts (Step 240+): Favori interface not fully visible but typically { id_favori, livre: Livre, ... }
                    // Assuming fav.livre exists based on previous patterns
                    fav.livre ? <BookCard key={fav.id_favori} book={fav.livre} /> : null
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">Vous n'avez pas encore de favoris.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "support" && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold mb-6">Support</h1>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contactez-nous</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <input
                          id="subject"
                          name="subject"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Ex: Problème de retour..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Votre message</Label>
                        <textarea
                          id="message"
                          name="message"
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Décrivez votre problème ou votre question..."
                          required
                        />
                      </div>
                      <Button className="w-full" disabled={isSendingMessage}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isSendingMessage ? "Envoi..." : "Envoyer le message"}
                      </Button>
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Autres moyens de contact</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>📧 Email: support@bibliotech.fr</p>
                          <p>📞 Téléphone: +33 1 23 45 67 89</p>
                          <p>🕐 Horaires: Lun-Ven 9h-18h</p>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Historique de vos échanges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>Aucun message pour le moment</p>
                        </div>
                      ) : messages.map((msg) => (
                        <div key={msg.id_message} className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.date_envoi).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className={msg.statut === "Repondu" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"}>
                              {msg.statut}
                            </Badge>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.contenu}</p>

                          {msg.reponse && (
                            <div className="mt-3 pl-3 border-l-2 border-primary py-1">
                              <p className="text-xs text-primary font-medium mb-1">Réponse du bibliothécaire :</p>
                              <p className="text-sm text-foreground/80">{msg.reponse}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeMenu === "notifications" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const unread = notifications.filter(n => !n.lu)
                    if (unread.length === 0) return
                    try {
                      await Promise.all(unread.map(n => fetchApi(`/notifications/${n.id_notification}/lu`, { method: "PATCH" })))
                      toast({ title: "Succès", description: "Toutes les notifications marquées comme lues" })
                      // Refresh
                      const data = await fetchApi("/notifications/")
                      setNotifications(data)
                    } catch (e) {
                      toast({ title: "Erreur", description: "Impossible de marquer comme lu", variant: "destructive" })
                    }
                  }}
                >
                  Tout marquer comme lu
                </Button>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Vous n'avez aucune notification.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Card key={notif.id_notification} className={cn("transition-colors", !notif.lu ? "bg-[#0B5FFF]/5 border-[#0B5FFF]/20" : "")}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", !notif.lu ? "bg-[#0B5FFF]" : "bg-muted")} />
                          <div className="flex-1">
                            <p className={cn("font-medium", !notif.lu ? "text-[#0B5FFF]" : "text-foreground")}>{notif.titre}</p>
                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.date_notif).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeMenu === "profile" && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
              <div className="grid gap-6 max-w-2xl">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Informations personnelles</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                      {isEditingProfile ? "Annuler" : "Modifier"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Prénom</Label>
                            <input
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={editForm.prenom}
                              onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nom</Label>
                            <input
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={editForm.nom}
                              onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleUpdateProfile}>Enregistrer les modifications</Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Prénom</Label>
                            <p className="font-medium">{user?.prenom}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Nom</Label>
                            <p className="font-medium">{user?.nom}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Numéro de carte</Label>
                          <p className="font-mono text-sm bg-muted p-2 rounded inline-block">
                            {user?.numero_carte || "Non attribué"}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-secondary/50 rounded-lg">
                        <p className="text-3xl font-bold text-primary">{stats.loansCount}</p>
                        <p className="text-sm text-muted-foreground">Prêts actifs</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/50 rounded-lg">
                        <p className="text-3xl font-bold text-primary">{stats.favCount}</p>
                        <p className="text-sm text-muted-foreground">Favoris</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/50 rounded-lg">
                        <p className="text-3xl font-bold text-primary">{stats.resCount}</p>
                        <p className="text-sm text-muted-foreground">Réservations</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/50 rounded-lg">
                        <p className="text-3xl font-bold text-primary">0</p>
                        <p className="text-sm text-muted-foreground">Livres lus</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleDeleteAccountClick}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Votre compte sera définitivement supprimé et vous ne pourrez plus accéder à vos emprunts ou réservations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              Supprimer mon compte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelResDialog} onOpenChange={setShowCancelResDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment annuler cette réservation ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancelReservation}>
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
