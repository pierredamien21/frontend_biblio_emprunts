"use client"

import { useState, useEffect } from "react"
import {
    X,
    Plus,
    Edit,
    Trash2,
    Loader2,
    Package,
    AlertCircle,
    CheckCircle,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Exemplaire, ExemplaireCreate, ExemplaireUpdate } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ExemplaireManagerProps {
    id_livre: number
    titreLivre: string
    isOpen: boolean
    onClose: () => void
    onUpdate?: () => void
}

export function ExemplaireManager({
    id_livre,
    titreLivre,
    isOpen,
    onClose,
    onUpdate
}: ExemplaireManagerProps) {
    const { toast } = useToast()
    const [exemplaires, setExemplaires] = useState<Exemplaire[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingExemplaire, setEditingEmp] = useState<Exemplaire | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Delete state
    const [exemplaireToDelete, setExemplaireToDelete] = useState<number | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Form state
    const [codeBarre, setCodeBarre] = useState("")
    const [etat, setEtat] = useState<string>("Disponible")
    const [localisation, setLocalisation] = useState("")

    useEffect(() => {
        if (isOpen) {
            loadExemplaires()
        }
    }, [isOpen, id_livre])

    const loadExemplaires = async () => {
        setIsLoading(true)
        try {
            const data = await fetchApi("/exemplaires/")
            const filtered = data.filter((ex: Exemplaire) => ex.id_livre === id_livre)
            setExemplaires(filtered)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les exemplaires",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddNew = () => {
        setEditingEmp(null)
        setCodeBarre("")
        setEtat("Disponible")
        setLocalisation("")
        setShowForm(true)
    }

    const handleEdit = (ex: Exemplaire) => {
        setEditingEmp(ex)
        setCodeBarre(ex.code_barre)
        setEtat(ex.etat)
        setLocalisation(ex.localisation || "")
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!codeBarre.trim()) {
            toast({
                title: "Erreur",
                description: "Le code-barres est requis",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            if (editingExemplaire) {
                // Update
                const payload: ExemplaireUpdate = {
                    code_barre: codeBarre,
                    etat: etat as any,
                    statut_logique: "Actif", // Default to Actif for updates
                    localisation: localisation.trim() || undefined
                }
                await fetchApi(`/exemplaires/${editingExemplaire.id_exemplaire}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Exemplaire modifié" })
            } else {
                // Create
                const payload: ExemplaireCreate = {
                    id_livre,
                    code_barre: codeBarre,
                    etat: etat as any,
                    statut_logique: "Actif", // Default to Actif for creation
                    localisation: localisation.trim() || undefined
                }
                await fetchApi("/exemplaires/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Exemplaire ajouté" })
            }

            setShowForm(false)
            loadExemplaires()
            onUpdate?.()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la sauvegarde",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteClick = (id: number) => {
        setExemplaireToDelete(id)
        setShowDeleteDialog(true)
    }

    const handleConfirmDelete = async () => {
        if (!exemplaireToDelete) return

        setIsDeleting(true)
        try {
            await fetchApi(`/exemplaires/${exemplaireToDelete}`, { method: "DELETE" })
            toast({ title: "Succès", description: "Exemplaire supprimé" })
            loadExemplaires()
            onUpdate?.()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la suppression",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
            setExemplaireToDelete(null)
        }
    }

    const handleChangeStatus = async (id: number, newEtat: string) => {
        try {
            await fetchApi(`/exemplaires/${id}/etat`, {
                method: "PATCH",
                body: JSON.stringify({ etat: newEtat })
            })
            toast({ title: "Succès", description: "État modifié" })
            loadExemplaires()
            onUpdate?.()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors du changement d'état",
                variant: "destructive"
            })
        }
    }

    const getEtatBadge = (etat: string) => {
        const variants: Record<string, { color: string; icon: any }> = {
            "Disponible": { color: "bg-emerald-500/10 text-emerald-700 border-emerald-200", icon: CheckCircle },
            "Emprunté": { color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Package },
            "Perdu": { color: "bg-rose-500/10 text-rose-700 border-rose-200", icon: AlertCircle },
            "En réparation": { color: "bg-amber-500/10 text-amber-700 border-amber-200", icon: AlertCircle },
        }

        const variant = variants[etat] || variants["Disponible"]
        const Icon = variant.icon

        return (
            <Badge variant="outline" className={cn("gap-1", variant.color)}>
                <Icon className="w-3 h-3" />
                {etat}
            </Badge>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Gestion des Exemplaires
                    </DialogTitle>
                    <DialogDescription>
                        {titreLivre} • {exemplaires.length} exemplaire(s)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!showForm && (
                        <Button onClick={handleAddNew} className="w-full" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter un exemplaire
                        </Button>
                    )}

                    {/* Form */}
                    {showForm && (
                        <div className="p-4 border rounded-lg bg-secondary/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">
                                    {editingExemplaire ? "Modifier l'exemplaire" : "Nouvel exemplaire"}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowForm(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="code_barre">Code-barres *</Label>
                                    <Input
                                        id="code_barre"
                                        value={codeBarre}
                                        onChange={(e) => setCodeBarre(e.target.value)}
                                        placeholder="Ex: EX001234"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="etat">État</Label>
                                    <Select value={etat} onValueChange={setEtat}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Disponible">Disponible</SelectItem>
                                            <SelectItem value="Emprunté">Emprunté</SelectItem>
                                            <SelectItem value="Perdu">Perdu</SelectItem>
                                            <SelectItem value="En réparation">En réparation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="localisation">Localisation (optionnel)</Label>
                                    <Input
                                        id="localisation"
                                        value={localisation}
                                        onChange={(e) => setLocalisation(e.target.value)}
                                        placeholder="Ex: Rayon A, Étagère 3"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1"
                                    >
                                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {editingExemplaire ? "Modifier" : "Ajouter"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        disabled={isSaving}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* List */}
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : exemplaires.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Aucun exemplaire pour ce livre
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code-barres</TableHead>
                                    <TableHead>État</TableHead>
                                    <TableHead>Localisation</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exemplaires.map((ex) => (
                                    <TableRow key={ex.id_exemplaire}>
                                        <TableCell className="font-mono text-sm">{ex.code_barre}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={ex.etat}
                                                onValueChange={(val) => handleChangeStatus(ex.id_exemplaire, val)}
                                            >
                                                <SelectTrigger className="w-[160px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Disponible">Disponible</SelectItem>
                                                    <SelectItem value="Emprunté">Emprunté</SelectItem>
                                                    <SelectItem value="Perdu">Perdu</SelectItem>
                                                    <SelectItem value="En réparation">En réparation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {ex.localisation || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(ex)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteClick(ex.id_exemplaire)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="z-[150]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet exemplaire ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. L'exemplaire sera définitivement retiré de l'inventaire.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog >
    )
}
