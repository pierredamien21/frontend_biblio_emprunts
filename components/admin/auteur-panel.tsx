"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, BookText } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { fetchApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Auteur, AuteurCreate } from "@/lib/types"

export function AuteurPanel() {
    const { toast } = useToast()
    const [auteurs, setAuteurs] = useState<Auteur[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingAuteur, setEditingAuteur] = useState<Auteur | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [nom, setNom] = useState("")
    const [prenom, setPrenom] = useState("")
    const [biographie, setBiographie] = useState("")

    useEffect(() => {
        loadAuteurs()
    }, [])

    const loadAuteurs = async () => {
        setIsLoading(true)
        try {
            const data = await fetchApi("/auteurs/")
            setAuteurs(data)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les auteurs",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingAuteur(null)
        setNom("")
        setPrenom("")
        setBiographie("")
        setShowDialog(true)
    }

    const handleEdit = (auteur: Auteur) => {
        setEditingAuteur(auteur)
        setNom(auteur.nom)
        setPrenom(auteur.prenom || "")
        setBiographie(auteur.biographie || "")
        setShowDialog(true)
    }

    const handleSave = async () => {
        if (!nom.trim()) {
            toast({
                title: "Erreur",
                description: "Le nom de l'auteur est requis",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            const payload: AuteurCreate = {
                nom: nom.trim(),
                prenom: prenom.trim() || undefined,
                biographie: biographie.trim() || undefined
            }

            if (editingAuteur) {
                await fetchApi(`/auteurs/${editingAuteur.id_auteur}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Auteur modifié" })
            } else {
                await fetchApi("/auteurs/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Auteur ajouté" })
            }

            setShowDialog(false)
            loadAuteurs()
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
        if (!confirm("Voulez-vous vraiment supprimer cet auteur ?")) return

        try {
            await fetchApi(`/auteurs/${id}`, { method: "DELETE" })
            toast({ title: "Succès", description: "Auteur supprimé" })
            loadAuteurs()
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
                        <BookText className="w-6 h-6" />
                        Gestion des Auteurs
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Gérez la base de données des auteurs
                    </p>
                </div>
                <Button onClick={handleAdd} className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2 shadow-lg shadow-[#7C3AED]/20">
                    <Plus className="w-4 h-4" />
                    Ajouter un auteur
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                </div>
            ) : (
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
                                <TableHead className="w-[300px]">Auteur</TableHead>
                                <TableHead>Biographie</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auteurs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <BookText className="w-10 h-10 text-muted-foreground/30" />
                                            <p>Aucun auteur trouvé</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                auteurs.map((auteur) => (
                                    <TableRow key={auteur.id_auteur} className="group hover:bg-[#f8fafc] transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-[#e2e8f0]">
                                                    <AvatarFallback className="bg-[#7C3AED]/5 text-[#7C3AED] font-medium">
                                                        {auteur.prenom ? auteur.prenom[0] : ""}{auteur.nom[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-[#0f172a]">
                                                        {auteur.prenom} {auteur.nom}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ID: {auteur.id_auteur}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {auteur.biographie || <span className="italic opacity-50">Aucune biographie disponible</span>}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#0f172a] hover:bg-[#0f172a]/5"
                                                    onClick={() => handleEdit(auteur)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(auteur.id_auteur)}
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
                            {editingAuteur ? "Modifier l'auteur" : "Ajouter un auteur"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAuteur
                                ? "Modifiez les informations de l'auteur"
                                : "Ajoutez un nouvel auteur à la base de données"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom *</Label>
                            <Input
                                id="nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Nom de famille"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input
                                id="prenom"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                placeholder="Prénom (optionnel)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="biographie">Biographie</Label>
                            <Textarea
                                id="biographie"
                                value={biographie}
                                onChange={(e) => setBiographie(e.target.value)}
                                placeholder="Courte biographie de l'auteur..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingAuteur ? "Modifier" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
