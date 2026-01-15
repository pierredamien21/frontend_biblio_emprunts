"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Filter,
  MoreHorizontal,
  Package,
  Loader2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { fetchApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Livre, Categorie, Exemplaire } from "@/lib/types"
import { ExemplaireManager } from "@/components/staff/exemplaire-manager"

interface InventoryPageProps {
  onBack: () => void
  onLogout: () => void
}

export function InventoryPage({ onBack, onLogout }: InventoryPageProps) {
  const { toast } = useToast()
  const [books, setBooks] = useState<Livre[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [exemplaires, setExemplaires] = useState<Exemplaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | "Tous">("Tous")
  const [isSaving, setIsSaving] = useState(false)
  const [showExemplaireManager, setShowExemplaireManager] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Livre | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [booksData, catsData, exempData] = await Promise.all([
        fetchApi("/livres/"),
        fetchApi("/categories/"),
        fetchApi("/exemplaires/")
      ])
      setBooks(booksData)
      setCategories(catsData)
      setExemplaires(exempData)
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBook = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce livre ? Cette action supprimera également tous ses exemplaires.")) return
    try {
      await fetchApi(`/livres/${id}`, { method: "DELETE" })
      toast({ title: "Succès", description: "Livre supprimé." })
      fetchData()
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    }
  }

  const handleSaveBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const payload = {
        titre: data.titre,
        isbn: data.isbn,
        editeur: data.editeur,
        id_categorie: parseInt(data.id_categorie as string),
        langue: data.langue || "Français",
        annee_publication: parseInt(data.annee_publication as string) || new Date().getFullYear(),
        descriptions: data.descriptions || ""
      }

      let bookId: number;

      // Create new book
      const newBook = await fetchApi("/livres/", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      bookId = newBook.id_livre

      // Upload image if selected
      if (selectedImage && bookId) {
        const imageFormData = new FormData()
        imageFormData.append('file', selectedImage)

        await fetchApi(`/upload/livre/${bookId}`, {
          method: 'POST',
          body: imageFormData
        })
      }

      toast({ title: "Succès", description: "Livre ajouté au catalogue." })
      setShowAddModal(false)
      setSelectedImage(null)
      fetchData()
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleManageExemplaires = (book: Livre) => {
    setSelectedBook(book)
    setShowExemplaireManager(true)
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.includes(searchQuery)
    const matchesCategory = selectedCategory === "Tous" || book.id_categorie === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getBookStats = (id_livre: number) => {
    const bookEx = exemplaires.filter(e => e.id_livre === id_livre)
    return {
      total: bookEx.length,
      available: bookEx.filter(e => e.etat === "Disponible").length
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0B5FFF] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm">Inventaire</span>
                <span className="text-xs text-muted-foreground">Gestion des livres</span>
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
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white"
              />
            </div>
            <Select value={selectedCategory.toString()} onValueChange={(val) => setSelectedCategory(val === "Tous" ? "Tous" : parseInt(val))}>
              <SelectTrigger className="w-[180px] h-11 bg-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id_categorie} value={cat.id_categorie.toString()}>
                    {cat.nom_categorie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="h-11 gap-2 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              Ajouter un livre
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B5FFF]" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F6F8]">
                  <TableHead className="font-semibold">Titre</TableHead>
                  <TableHead className="font-semibold text-center">Exemplaires</TableHead>
                  <TableHead className="font-semibold text-center">Disponibles</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => {
                  const stats = getBookStats(book.id_livre)
                  return (
                    <TableRow key={book.id_livre} className="hover:bg-[#F4F6F8]/50">
                      <TableCell>
                        <p className="font-medium">{book.titre}</p>
                        <p className="text-xs text-muted-foreground font-mono">{book.isbn}</p>
                      </TableCell>
                      <TableCell className="text-center">{stats.total}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            stats.available > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200",
                          )}
                        >
                          {stats.available} dispos
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManageExemplaires(book)}>
                              <Package className="w-4 h-4 mr-2" />
                              Gérer exemplaires
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteBook(book.id_livre)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSaveBook}>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau livre</DialogTitle>
                <DialogDescription>Remplissez les informations du livre à ajouter au catalogue.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre</Label>
                  <Input id="titre" name="titre" required placeholder="Titre du livre" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input id="isbn" name="isbn" placeholder="978-..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_categorie">Catégorie</Label>
                    <Select name="id_categorie" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id_categorie} value={cat.id_categorie.toString()}>
                            {cat.nom_categorie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editeur">Éditeur</Label>
                  <Input id="editeur" name="editeur" placeholder="Nom de l'éditeur" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptions">Description</Label>
                  <Textarea id="descriptions" name="descriptions" placeholder="Résumé du livre..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover">Image de couverture</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedImage(e.target.files[0])
                        }
                      }}
                    />
                    {selectedImage && (
                      <div className="text-xs text-muted-foreground">
                        {selectedImage.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ajouter le livre
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Exemplaire Manager Modal */}
        {selectedBook && (
          <ExemplaireManager
            id_livre={selectedBook.id_livre}
            titreLivre={selectedBook.titre}
            isOpen={showExemplaireManager}
            onClose={() => {
              setShowExemplaireManager(false)
              setSelectedBook(null)
            }}
            onUpdate={fetchData}
          />
        )}
      </div>
    </div>
  )
}

