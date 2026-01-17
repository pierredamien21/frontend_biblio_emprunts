"use client"

import type React from "react"
import { useState } from "react"
import { Heart, BookmarkPlus, Loader2, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, getImageUrl } from "@/lib/utils"
import { Livre } from "@/lib/types"
import { fetchApi } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { BookDetailModal } from "@/components/shared/book-detail-modal"

interface BookCardProps {
  book: Livre
  onReserve?: () => void
  onFavorite?: () => void
  showActions?: boolean
}

export function BookCard({ book, onReserve, onFavorite, showActions = true }: BookCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    setIsActionLoading(true)
    try {
      if (isFavorited) {
        await fetchApi(`/favoris/${book.id_livre}`, { method: "DELETE" })
        toast({
          title: "Retiré des favoris",
          description: `"${book.titre}" a été retiré de vos favoris`
        })
      } else {
        await fetchApi("/favoris/", {
          method: "POST",
          body: JSON.stringify({ id_livre: book.id_livre })
        })
        toast({
          title: "Ajouté aux favoris",
          description: `"${book.titre}" a été ajouté à vos favoris ❤️`
        })
      }
      setIsFavorited(!isFavorited)
      onFavorite?.()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier les favoris",
        variant: "destructive"
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReserve = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    setIsActionLoading(true)
    try {
      await fetchApi("/reservations/", {
        method: "POST",
        body: JSON.stringify({ id_livre: book.id_livre })
      })
      toast({
        title: "Réservation effectuée",
        description: `"${book.titre}" a été réservé avec succès`
      })
      onReserve?.()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réserver ce livre",
        variant: "destructive"
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCardClick = () => {
    setShowDetailModal(true)
  }

  return (
    <>
      <div
        className={cn(
          "group relative bg-card rounded-lg overflow-hidden border border-border",
          "hover-lift cursor-pointer",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Cover Image */}
        <div className="relative aspect-[2/3] bg-muted overflow-hidden">
          <img
            src={getImageUrl(book.image_url)}
            alt={`Couverture de ${book.titre}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Status Overlay */}
          {(book.nb_disponible === 0 || book.nb_disponible === undefined) && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm font-medium">
                Indisponible
              </Badge>
            </div>
          )}

          {/* Info Button */}
          <div
            className={cn(
              "absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity",
              "bg-white/90 backdrop-blur-sm rounded-full p-1.5"
            )}
          >
            <Info className="w-4 h-4 text-primary" />
          </div>

          {/* Favorite Button */}
          {showActions && user && (
            <button
              onClick={handleFavorite}
              disabled={isActionLoading}
              className={cn(
                "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center",
                "transition-all duration-200 z-10",
                "hover:scale-110 active:scale-95",
                isActionLoading ? "opacity-50" : "",
                isFavorited
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/50 animate-in zoom-in-50"
                  : "bg-white/90 text-muted-foreground hover:bg-white hover:text-red-500",
              )}
            >
              {isActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
              )}
            </button>
          )}
        </div>

        {/* Meta Info */}
        <div className="p-3">
          {book.categorie && (
            <Badge variant="secondary" className="text-[10px] h-4 mb-2">
              {book.categorie.nom_categorie}
            </Badge>
          )}
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1 leading-tight">{book.titre}</h3>
          <p className="text-muted-foreground text-[11px] italic line-clamp-1">{book.editeur || "Auteur inconnu"}</p>

          {/* Availability Badge & Action */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <Badge
              variant={(book.nb_disponible && book.nb_disponible > 0) ? "default" : "secondary"}
              className={cn("text-[10px] px-1.5 py-0", (book.nb_disponible && book.nb_disponible > 0) ? "bg-success text-white" : "bg-muted text-muted-foreground")}
            >
              {(book.nb_disponible && book.nb_disponible > 0) ? "Disponible" : "Réservable"}
            </Badge>

            {showActions && user && (
              <Button
                size="sm"
                variant="default"
                disabled={isActionLoading}
                className="h-7 px-2 text-[11px] font-medium"
                onClick={handleReserve}
              >
                {isActionLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <BookmarkPlus className="w-3 h-3 mr-1" />
                )}
                Réserver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Book Detail Modal with Reviews */}
      <BookDetailModal
        book={book}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  )
}
