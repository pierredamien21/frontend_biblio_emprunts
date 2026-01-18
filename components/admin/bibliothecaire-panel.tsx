"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, Shield, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { BibliothecaireOut, BibliothecaireCreate, BibliothecaireUpdate } from "@/lib/types"

export function BibliothecairePanel() {
    const { toast } = useToast()
    const [bibliothecaires, setBibliothecaires] = useState<BibliothecaireOut[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingBib, setEditingBib] = useState<BibliothecaireOut | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [bibToDelete, setBibToDelete] = useState<number | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Form state
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [nom, setNom] = useState("")
    const [prenom, setPrenom] = useState("")
    const [role, setRole] = useState<"Bibliothécaire" | "Administrateur">("Bibliothécaire")

    useEffect(() => {
        loadBibliothecaires()
    }, [])

    const loadBibliothecaires = async () => {
        setIsLoading(true)
        try {
            const data = await fetchApi("/bibliothecaires/")
            setBibliothecaires(data)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les bibliothécaires",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingBib(null)
        setLogin("")
        setPassword("")
        setEmail("")
        setNom("")
        setPrenom("")
        setRole("Bibliothécaire")
        setShowDialog(true)
    }

    const handleEdit = (bib: BibliothecaireOut) => {
        setEditingBib(bib)
        setLogin(bib.login)
        setPassword("") // Ne pas pré-remplir le mot de passe
        setEmail(bib.email)
        setNom(bib.nom)
        setPrenom(bib.prenom)
        setRole(bib.role)
        setShowDialog(true)
    }

    const handleSave = async () => {
        // Validation
        if (!login.trim() || !email.trim() || !nom.trim() || !prenom.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires",
                variant: "destructive"
            })
            return
        }

        if (!editingBib && !password.trim()) {
            toast({
                title: "Erreur",
                description: "Le mot de passe est requis pour la création",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            if (editingBib) {
                // Update
                const payload: BibliothecaireUpdate = {
                    login: login.trim(),
                    email: email.trim(),
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                }
                if (password.trim()) {
                    payload.password = password.trim()
                }

                console.log("Updating librarian:", payload)
                await fetchApi(`/bibliothecaires/${editingBib.id_bibliotecaire}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Bibliothécaire modifié" })
            } else {
                // Create
                // Create
                const payload = {
                    login: login.trim(),
                    password: password.trim(),
                    email: email.trim(),
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                    role: role
                }
                console.log("Creating librarian:", payload)
                await fetchApi("/bibliothecaires/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                })
                toast({ title: "Succès", description: "Bibliothécaire ajouté" })
            }

            setShowDialog(false)
            loadBibliothecaires()
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

    const handleChangeRole = async (id: number, newRole: "Bibliothécaire" | "Administrateur") => {
        try {
            await fetchApi(`/bibliothecaires/${id}/role`, {
                method: "PATCH",
                body: JSON.stringify({ role: newRole })
            })
            toast({ title: "Succès", description: "Rôle modifié" })
            loadBibliothecaires()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors du changement de rôle",
                variant: "destructive"
            })
        }
    }

    const confirmDelete = (id: number) => {
        setBibToDelete(id)
        setShowDeleteDialog(true)
    }

    const handleDelete = async () => {
        if (!bibToDelete) return

        try {
            await fetchApi(`/bibliothecaires/${bibToDelete}`, { method: "DELETE" })
            toast({ title: "Succès", description: "Bibliothécaire supprimé" })
            loadBibliothecaires()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la suppression",
                variant: "destructive"
            })
        } finally {
            setShowDeleteDialog(false)
            setBibToDelete(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestion des Bibliothécaires</h2>
                    <p className="text-sm text-muted-foreground">
                        Gérez les comptes du personnel de la bibliothèque
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter un bibliothécaire
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
                                <TableHead>Email</TableHead>
                                <TableHead>Login</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bibliothecaires.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Aucun bibliothécaire trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bibliothecaires.map((bib) => (
                                    <TableRow key={bib.id_bibliotecaire}>
                                        <TableCell className="font-medium">
                                            {bib.prenom} {bib.nom}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{bib.email}</TableCell>
                                        <TableCell className="text-sm">{bib.login}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={bib.role}
                                                onValueChange={(val) => handleChangeRole(bib.id_bibliotecaire, val as any)}
                                            >
                                                <SelectTrigger className="w-[160px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Bibliothécaire">
                                                        <div className="flex items-center gap-2">
                                                            <Key className="w-3 h-3" />
                                                            Bibliothécaire
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="Administrateur">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-3 h-3" />
                                                            Administrateur
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(bib)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => confirmDelete(bib.id_bibliotecaire)}
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

            {/* Form Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingBib ? "Modifier le bibliothécaire" : "Ajouter un bibliothécaire"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBib
                                ? "Modifiez les informations du compte"
                                : "Créez un nouveau compte pour le personnel"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom *</Label>
                                <Input
                                    id="prenom"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    placeholder="Prénom"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom *</Label>
                                <Input
                                    id="nom"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    placeholder="Nom"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@exemple.fr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="login">Login *</Label>
                            <Input
                                id="login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="nom_utilisateur"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Mot de passe {editingBib ? "(laisser vide pour ne pas changer)" : "*"}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={editingBib ? "•••••••" : "Mot de passe"}
                            />
                        </div>

                        {!editingBib && (
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle</Label>
                                <Select value={role} onValueChange={(val) => setRole(val as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bibliothécaire">Bibliothécaire</SelectItem>
                                        <SelectItem value="Administrateur">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingBib ? "Modifier" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le compte du bibliothécaire sera définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
