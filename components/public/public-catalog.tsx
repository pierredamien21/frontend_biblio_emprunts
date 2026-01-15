"use client"

import { useState } from "react"
import { Search, BookOpen, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/shared/book-card"
import { BookCardSkeleton } from "@/components/shared/book-card-skeleton"
import { Livre, Categorie } from "@/lib/types"

interface PublicCatalogProps {
  onNavigateToLogin: () => void
}

import { useEffect } from "react"
import { fetchApi } from "@/lib/api-client"

export function PublicCatalog({ onNavigateToLogin }: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [categoriesList, setCategoriesList] = useState<Categorie[]>([])
  const [books, setBooks] = useState<Livre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true)
      try {
        const [booksData, catsData] = await Promise.all([
          fetchApi("/livres/"),
          fetchApi("/categories/")
        ])
        setBooks(booksData)
        setCategoriesList(catsData)
      } catch (error) {
        console.error("Failed to load catalog:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialData()
  }, [])

  const filteredBooks = books.filter((book: Livre) => {
    const matchesSearch =
      book.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.descriptions && book.descriptions.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "Tous" ||
      (categoriesList.find((c: Categorie) => c.nom_categorie === selectedCategory)?.id_categorie === book.id_categorie)

    return matchesSearch && matchesCategory
  })

  const displayCategories = ["Tous", ...categoriesList.map((c: Categorie) => c.nom_categorie)]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BiblioTech</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un livre, un auteur..."
                  className="pl-10 h-11 bg-secondary border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="hidden sm:flex bg-transparent" onClick={onNavigateToLogin}>
                Se connecter
              </Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onNavigateToLogin}>
                S'inscrire
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10 h-11 bg-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Découvrez notre collection
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Plus de 10 000 ouvrages disponibles à l'emprunt. Trouvez votre prochaine lecture.
          </p>
        </section>

        {/* Category Filters */}
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {displayCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={`flex-shrink-0 ${selectedCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                  }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredBooks.length}</span> livres trouvés
          </p>
          <Button variant="ghost" size="sm" className="gap-1">
            Trier par <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Book Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
            : filteredBooks.map((book: Livre) => (
              <BookCard
                key={book.id_livre}
                book={book}
                onReserve={() => onNavigateToLogin()}
                onFavorite={() => onNavigateToLogin()}
              />
            ))}
        </section>

        {/* Empty State */}
        {!isLoading && filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun livre trouvé</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
