"use client"

import { useState, useEffect } from "react"
import { Star, X, Loader2, MessageSquare } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { fetchApi } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Livre, Avis, AvisCreate } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BookDetailModalProps {
    book: Livre | null
    isOpen: boolean
    onClose: () => void
}

export function BookDetailModal({ book, isOpen, onClose }: BookDetailModalProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [avis, setAvis] = useState<Avis[]>([])
    const [isLoadingAvis, setIsLoadingAvis] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (book && isOpen) {
            loadAvis()
        }
    }, [book, isOpen])

    const loadAvis = async () => {
        if (!book) return
        setIsLoadingAvis(true)
        try {
            const data = await fetchApi(`/avis/livre/${book.id_livre}`)
            setAvis(data)
        } catch (error) {
            console.error("Erreur chargement avis:", error)
        } finally {
            setIsLoadingAvis(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!book || !user || rating === 0) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner une note",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)
        try {
            const payload: AvisCreate = {
                id_livre: book.id_livre,
                note: rating,
                commentaire: comment.trim() || undefined
            }

            await fetchApi("/avis/", {
                method: "POST",
                body: JSON.stringify(payload)
            })

            toast({
                title: "Succès",
                description: "Votre avis a été publié"
            })

            setRating(0)
            setComment("")
            setShowReviewForm(false)
            loadAvis()
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de publier l'avis",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const averageRating = avis.length > 0
        ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
        : "0.0"

    if (!book) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{book.titre}</DialogTitle>
                    <DialogDescription>
                        {book.editeur && `${book.editeur} • `}
                        {book.annee_publication && `${book.annee_publication} • `}
                        {book.categorie?.nom_categorie}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Book Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">ISBN</p>
                            <p className="font-mono text-sm">{book.isbn || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Langue</p>
                            <p>{book.langue || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Disponibilité</p>
                            <Badge variant={book.nb_disponible && book.nb_disponible > 0 ? "default" : "secondary"}>
                                {book.nb_disponible || 0} exemplaire(s)
                            </Badge>
                        </div>
                    </div>

                    {book.descriptions && (
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground">{book.descriptions}</p>
                        </div>
                    )}

                    <Separator />

                    {/* Reviews Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">Avis des lecteurs</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "w-5 h-5",
                                                    parseFloat(averageRating) >= star
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-bold">{averageRating}</span>
                                    <span className="text-sm text-muted-foreground">({avis.length} avis)</span>
                                </div>
                            </div>

                            {user && user.role === "Membre" && !showReviewForm && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReviewForm(true)}
                                    className="gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Laisser un avis
                                </Button>
                            )}
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <div className="p-4 bg-secondary/50 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-medium">Votre avis</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setShowReviewForm(false)
                                            setRating(0)
                                            setComment("")
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm mb-2">Note</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-8 h-8 transition-colors cursor-pointer",
                                                        (hoverRating || rating) >= star
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm mb-2">Commentaire (optionnel)</p>
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Partagez votre expérience avec ce livre..."
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={rating === 0 || isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Publier l'avis
                                </Button>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4">
                            {isLoadingAvis ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : avis.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Aucun avis pour le moment. Soyez le premier à donner votre avis !
                                </p>
                            ) : (
                                avis.map((review) => (
                                    <div key={review.id_avis} className="p-4 border rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium">
                                                    {review.membre
                                                        ? `${review.membre.prenom} ${review.membre.nom}`
                                                        : "Membre"}
                                                </p>
                                                <div className="flex gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={cn(
                                                                "w-4 h-4",
                                                                review.note >= star
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(review.date_avis).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                        {review.commentaire && (
                                            <p className="text-sm text-muted-foreground mt-2">{review.commentaire}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
