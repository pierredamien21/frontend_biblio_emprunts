"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign, Loader2, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { fetchApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Sanction, SanctionCreate } from "@/lib/types"
import { cn } from "@/lib/utils"

export function SanctionsPanel() {
    const { toast } = useToast()
    const [sanctions, setSanctions] = useState<Sanction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [membres, setMembres] = useState<any[]>([])

    // Form state
    const [idMembre, setIdMembre] = useState("")
    const [montant, setMontant] = useState("")
    const [motif, setMotif] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [sanctionsData, membresData] = await Promise.all([
                fetchApi("/sanctions/"),
                fetchApi("/membres/")
            ])
            setSanctions(sanctionsData)
            setMembres(membresData)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les données",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = () => {
        setIdMembre("")
        setMontant("")
        setMotif("")
        setShowDialog(true)
    }

    const handleSave = async () => {
        if (!idMembre || !montant || !motif.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            const sanitizedMontant = montant.replace(',', '.')
            const payload: SanctionCreate = {
                id_membre: parseInt(idMembre),
                montant: parseFloat(sanitizedMontant),
                motif: motif.trim()
            }

            await fetchApi("/sanctions/", {
                method: "POST",
                body: JSON.stringify(payload)
            })

            toast({ title: "Succès", description: "Sanction créée" })
            setShowDialog(false)
            loadData()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la création",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangeStatus = async (id: number, newStatus: "En cours" | "Payée" | "Annulée") => {
        try {
            await fetchApi(`/sanctions/${id}/statut`, {
                method: "PATCH",
                body: JSON.stringify({ statut: newStatus })
            })
            toast({ title: "Succès", description: "Statut modifié" })
            loadData()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors du changement de statut",
                variant: "destructive"
            })
        }
    }

    const getStatutBadge = (statut: string) => {
        const variants: Record<string, string> = {
            "En cours": "bg-amber-50 text-amber-700 border-amber-200",
            "Payée": "bg-emerald-50 text-emerald-700 border-emerald-200",
            "Annulée": "bg-slate-50 text-slate-700 border-slate-200",
        }
        return (
            <Badge variant="outline" className={cn(variants[statut] || variants["En cours"])}>
                {statut}
            </Badge>
        )
    }

    const totalEnCours = sanctions
        .filter(s => s.statut === "En cours")
        .reduce((acc, s) => acc + s.montant, 0)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestion des Sanctions</h2>
                    <p className="text-sm text-muted-foreground">
                        Amendes et pénalités des membres
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle sanction
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-amber-700" />
                        <span className="text-sm font-medium text-amber-700">En cours</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-900">
                        {totalEnCours.toFixed(2)} €
                    </p>
                </div>
                <div className="p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Total sanctions</span>
                    <p className="text-2xl font-bold">{sanctions.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Payées</span>
                    <p className="text-2xl font-bold text-emerald-600">
                        {sanctions.filter(s => s.statut === "Payée").length}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Membre</TableHead>
                                <TableHead>Motif</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sanctions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Aucune sanction trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sanctions.map((sanction) => (
                                    <TableRow key={sanction.id_sanction}>
                                        <TableCell className="font-medium">
                                            {sanction.membre
                                                ? `${sanction.membre.prenom} ${sanction.membre.nom}`
                                                : `Membre #${sanction.id_membre}`}
                                            {sanction.membre && (
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    {sanction.membre.numero_carte}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm max-w-xs truncate">
                                            {sanction.motif}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {typeof sanction.montant === 'number' ? sanction.montant.toFixed(2) : '0.00'} €
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(sanction.date_sanction).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={sanction.statut}
                                                onValueChange={(val) => handleChangeStatus(sanction.id_sanction, val as any)}
                                            >
                                                <SelectTrigger className="w-[130px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="En cours">En cours</SelectItem>
                                                    <SelectItem value="Payée">Payée</SelectItem>
                                                    <SelectItem value="Annulée">Annulée</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {sanction.statut === "En cours" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-emerald-600"
                                                    onClick={() => handleChangeStatus(sanction.id_sanction, "Payée")}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Marquer payée
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer une sanction</DialogTitle>
                        <DialogDescription>
                            Enregistrez une nouvelle amende ou pénalité
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="membre">Membre *</Label>
                            <Select value={idMembre} onValueChange={setIdMembre}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un membre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {membres.map((m) => (
                                        <SelectItem key={m.id_membre} value={m.id_membre.toString()}>
                                            {m.prenom} {m.nom} ({m.numero_carte})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="montant">Montant (€) *</Label>
                            <Input
                                id="montant"
                                type="number"
                                step="0.01"
                                value={montant}
                                onChange={(e) => setMontant(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="motif">Motif *</Label>
                            <Textarea
                                id="motif"
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                placeholder="Retard de retour, détérioration du livre, etc."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Créer la sanction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
