import { fetchApi } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  LogOut,
  Book,
  CheckCircle,
  User,
  Search,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface CirculationDeskProps {
  onBack: () => void
  onLogout: () => void
}

interface Member {
  id_membre: number
  prenom: string
  nom: string
  numero_carte: string
  email: string
  statut_compte: string
  // Added fields to show limits
  activeLoansCount?: number
  nb_max_emprunt?: number
}

interface BookExemplaire {
  id_exemplaire: number
  code_barre: string
  etat: "Disponible" | "Emprunte" | "Reserve" | "Abime"
  id_livre: number
  livre?: {
    titre: string
    isbn: string
    editeur: string
  }
}

export function CirculationDesk({ onBack, onLogout }: CirculationDeskProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState<"loan" | "return">("loan")
  const [memberSearch, setMemberSearch] = useState("")
  const [bookSearch, setBookSearch] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedExemplaire, setSelectedExemplaire] = useState<BookExemplaire | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [currentEmprunt, setCurrentEmprunt] = useState<any>(null)
  const [retardMessage, setRetardMessage] = useState("")

  // Search member by card number
  const handleSearchMember = async () => {
    if (!memberSearch) return
    setIsSearching(true)
    try {
      const members = await fetchApi("/membres/")
      const found = members.find(
        (m: any) =>
          m.numero_carte?.toLowerCase() === memberSearch.toLowerCase() ||
          m.email?.toLowerCase() === memberSearch.toLowerCase()
      )

      if (found) {
        // Fetch his type to know limits
        const type = await fetchApi(`/types-membre/${found.id_type_membre}`)
        // Fetch active loans
        const loans = await fetchApi(`/emprunts/membre/${found.id_membre}`)
        const activeCount = loans.filter((l: any) => l.statut === "En cours").length

        setSelectedMember({
          ...found,
          activeLoansCount: activeCount,
          nb_max_emprunt: type.nb_max_emprunt
        })
      } else {
        toast({ title: "Non trouvé", description: "Aucun membre correspondant.", variant: "destructive" })
        setSelectedMember(null)
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  // Search exemplar by barcode
  const handleSearchBook = async () => {
    if (!bookSearch) return
    setIsSearching(true)
    try {
      if (mode === "loan") {
        const exemplaires = await fetchApi("/exemplaires/")
        const found = exemplaires.find((e: any) => e.code_barre === bookSearch)

        if (found) {
          if (found.etat !== "Disponible") {
            toast({ title: "Indisponible", description: `Cet exemplaire est : ${found.etat}`, variant: "destructive" })
            return
          }
          // Fetch book details
          const book = await fetchApi(`/livres/${found.id_livre}`)
          setSelectedExemplaire({ ...found, livre: book })
        } else {
          toast({ title: "Non trouvé", description: "Exemplaire inconnu.", variant: "destructive" })
          setSelectedExemplaire(null)
        }
      } else {
        // Return mode: Find the active loan for this barcode
        const allEmprunts = await fetchApi("/emprunts/")
        const exemplaires = await fetchApi("/exemplaires/")
        const ex = exemplaires.find((e: any) => e.code_barre === bookSearch)

        if (!ex) {
          toast({ title: "Erreur", description: "Exemplaire inconnu", variant: "destructive" })
          return
        }

        const activeLoan = allEmprunts.find(
          (l: any) => l.id_exemplaire === ex.id_exemplaire && l.statut === "En cours"
        )

        if (activeLoan) {
          const book = await fetchApi(`/livres/${ex.id_livre}`)
          setSelectedExemplaire({ ...ex, livre: book })
          setCurrentEmprunt(activeLoan)
          setShowReturnModal(true)
        } else {
          toast({ title: "Info", description: "Aucun prêt actif trouvé pour cet exemplaire." })
        }
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle loan validation
  const handleValidateLoan = async () => {
    if (!selectedMember || !selectedExemplaire || !user) return
    setIsSearching(true)
    try {
      await fetchApi("/emprunts/", {
        method: "POST",
        body: JSON.stringify({
          id_membre: selectedMember.id_membre,
          id_exemplaire: selectedExemplaire.id_exemplaire,
          id_bibliotecaire: user.id,
          statut: "En cours"
        })
      })

      toast({
        title: "Succès",
        description: `Prêt de "${selectedExemplaire.livre?.titre}" enregistré.`
      })

      // Reset
      setSelectedMember(null)
      setSelectedExemplaire(null)
      setMemberSearch("")
      setBookSearch("")
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle return validation
  const handleValidateReturn = async () => {
    if (!currentEmprunt) return
    setIsSearching(true)
    try {
      const result = await fetchApi(`/emprunts/${currentEmprunt.id_emprunt}/retour`, {
        method: "PUT"
      })

      toast({ title: "Retour validé", description: result.message })
      setShowReturnModal(false)
      setSelectedExemplaire(null)
      setBookSearch("")
      setCurrentEmprunt(null)
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0B5FFF] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm">Comptoir</span>
                <span className="text-xs text-muted-foreground">Emprunt / Retour</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 lg:p-8">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={mode === "loan" ? "default" : "outline"}
            className={cn("flex-1 h-14 text-lg", mode === "loan" && "bg-[#0B5FFF] hover:bg-[#0B5FFF]/90")}
            onClick={() => {
              setMode("loan")
              setSelectedMember(null)
              setSelectedExemplaire(null)
            }}
          >
            <Book className="w-5 h-5 mr-2" />
            Nouvel emprunt
          </Button>
          <Button
            variant={mode === "return" ? "default" : "outline"}
            className={cn("flex-1 h-14 text-lg", mode === "return" && "bg-[#0B5FFF] hover:bg-[#0B5FFF]/90")}
            onClick={() => {
              setMode("return")
              setSelectedMember(null)
              setSelectedExemplaire(null)
            }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>

        {mode === "loan" ? (
          /* LOAN MODE */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Step 1: Member Search */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0B5FFF] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  Rechercher le membre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Email ou n° de carte..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pl-10 h-12"
                      onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
                    />
                  </div>
                  <Button
                    className="h-12 px-6 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90"
                    onClick={handleSearchMember}
                    disabled={isSearching}
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                {selectedMember && (
                  <div className="p-4 bg-[#F4F6F8] rounded-lg border-2 border-[#0B5FFF]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{selectedMember.prenom} {selectedMember.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                          {selectedMember.numero_carte}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                      </div>
                      <Badge
                        className={cn(
                          selectedMember.statut_compte === "Actif" ? "bg-success text-white" : "bg-destructive text-white",
                        )}
                      >
                        {selectedMember.statut_compte === "Actif" ? "Actif" : "Suspendu"}
                      </Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Prêts en cours : </span>
                        <span className="font-medium">{selectedMember.activeLoansCount}/{selectedMember.nb_max_emprunt}</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Book Search */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      selectedMember ? "bg-[#0B5FFF] text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    2
                  </div>
                  Rechercher l'exemplaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Code-barres de l'exemplaire..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="pl-10 h-12"
                      disabled={!selectedMember}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchBook()}
                    />
                  </div>
                  <Button
                    className="h-12 px-6 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90"
                    onClick={handleSearchBook}
                    disabled={!selectedMember || isSearching}
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                {selectedExemplaire && (
                  <div className="p-4 bg-[#F4F6F8] rounded-lg border-2 border-[#0B5FFF]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{selectedExemplaire.livre?.titre}</p>
                        <p className="text-sm text-muted-foreground italic">{selectedExemplaire.livre?.editeur}</p>
                        <p className="text-xs text-muted-foreground mt-1">ISBN: {selectedExemplaire.livre?.isbn}</p>
                      </div>
                      <Badge
                        className={cn(
                          selectedExemplaire.etat === "Disponible" ? "bg-success text-white" : "bg-warning text-white",
                        )}
                      >
                        {selectedExemplaire.etat || "Inconnu"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* RETURN MODE */
          <Card className="bg-white max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-[#0B5FFF]" />
                Scanner l'exemplaire à retourner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Code-barres de l'exemplaire..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="pl-10 h-14 text-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleSearchBook()}
                    autoFocus
                  />
                </div>
                <Button
                  className="h-14 px-8 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90"
                  onClick={handleSearchBook}
                  disabled={isSearching}
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Valider"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">Scannez ou entrez le code de l'exemplaire</p>
            </CardContent>
          </Card>
        )}

        {/* Validate Button for Loan */}
        {mode === "loan" && selectedMember && selectedExemplaire && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              className="h-16 px-12 text-lg bg-success hover:bg-success/90 text-white"
              onClick={handleValidateLoan}
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              Valider le prêt
            </Button>
          </div>
        )}

        {/* Return Modal */}
        <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer le retour</DialogTitle>
              <DialogDescription>Vérifiez les informations avant de valider le retour.</DialogDescription>
            </DialogHeader>

            {selectedExemplaire && (
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-semibold">{selectedExemplaire.livre?.titre}</p>
                  <p className="text-sm text-muted-foreground italic">{selectedExemplaire.livre?.editeur}</p>
                </div>

                {retardMessage && (
                  <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Attention</span>
                    </div>
                    <p className="text-sm text-foreground">{retardMessage}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowReturnModal(false)}>
                Annuler
              </Button>
              <Button className="bg-success hover:bg-success/90 text-white" onClick={handleValidateReturn} disabled={isSearching}>
                {isSearching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Valider le retour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
