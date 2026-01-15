"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, FolderTree } from "lucide-react"
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
import { fetchApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Categorie, CategorieCreate, CategorieUpdate } from "@/lib/types"

export function CategoriePanel() {
    const { toast } = useToast()
    const [categories, setCategories] = useState<Categorie[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [nom, setNom] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setIsLoading(true)
        try {
            const data = await fetchApi("/categories/")
            setCategories(data)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les catégories",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingCategorie(null)
        setNom("")
        setDescription("")
        setShowDialog(true)
    }

    const handleEdit = (categorie: Categorie) => {
        setEditingCategorie(categorie)
        setNom(categorie.nom_categorie)
        setDescription(categorie.description || "")
        setShowDialog(true)
    }

    const handleSave = async () => {
        if (!nom.trim()) {
            toast({
                title: "Erreur",
                description: "Le nom de la catégorie est requis",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            if (editingCategorie) {
                const payload: CategorieUpdate = {
                    nom_categorie: nom.trim(),
                    description: description.trim() || undefined
                }
                await fetchApi(`/categories/${editingCategorie.id_categorie}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Catégorie modifiée" })
            } else {
                const payload: CategorieCreate = {
                    nom_categorie: nom.trim(),
                    description: description.trim() || undefined
                }
                await fetchApi("/categories/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Catégorie ajoutée" })
            }

            setShowDialog(false)
            loadCategories()
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

    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cette catégorie ? Cette action supprimera également tous les livres associés.")) return

        try {
            await fetchApi(`/categories/${id}`, { method: "DELETE" })
            toast({ title: "Succès", description: "Catégorie supprimée" })
            loadCategories()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la suppression",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FolderTree className="w-6 h-6" />
                        Gestion des Catégories
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Organisez votre catalogue par genres et thématiques
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle catégorie
                </Button>
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
                                <TableHead>Nom</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                        Aucune catégorie trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((cat) => (
                                    <TableRow key={cat.id_categorie}>
                                        <TableCell className="font-medium">{cat.nom_categorie}</TableCell>
                                        <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                                            {cat.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(cat)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(cat.id_categorie)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategorie ? "Modifier la catégorie" : "Ajouter une catégorie"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategorie
                                ? "Modifiez les informations de la catégorie"
                                : "Créez une nouvelle catégorie pour organiser vos livres"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom *</Label>
                            <Input
                                id="nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Ex: Science-Fiction, Histoire, Philosophie..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Courte description de la catégorie..."
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
                            {editingCategorie ? "Modifier" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
