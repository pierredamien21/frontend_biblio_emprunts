export type Role = 'guest' | 'Membre' | 'Agent' | 'Admin' | 'membre' | 'staff' | 'admin';

export interface User {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    role: Role;
    login?: string;
    numero_carte?: string;
}

export interface Categorie {
    id_categorie: number;
    nom_categorie: string;
    description?: string;
}

export interface Livre {
    id_livre: number;
    titre: string;
    isbn?: string;
    editeur?: string;
    langue?: string;
    annee_publication?: number;
    image_url?: string;
    descriptions?: string;
    id_categorie: number;
    categorie?: Categorie;
    date_ajout_catalogue?: string;
    nb_disponible?: number;
}

export interface Exemplaire {
    id_exemplaire: number;
    code_barre: string;
    etat: string; // 'Disponible', 'Emprunte', 'Reserve', 'Abime'
    statut_logique: string; // 'Actif', 'Supprime'
    date_acquisition: string;
    localisation?: string;
    id_livre: number;
    livre?: Livre;
}

export interface Emprunt {
    id_emprunt: number;
    id_exemplaire: number;
    id_membre: number;
    id_bibliotecaire: number;
    date_emprunt: string;
    date_retour_prevue: string;
    date_retour_effective?: string;
    statut: string; // 'En cours', 'Termine', 'Retard'
    renouvellement_count: number;
    commentaire?: string;
}

export interface Reservation {
    id_reservation: number;
    id_livre: number;
    id_membre: number;
    date_reservation: string;
    statut: string;
    priorite: number;
}

export interface Stats {
    global: {
        total_livres: number;
        total_membres: number;
        total_exemplaires: number;
        emprunts_actifs: number;
        retards: number;
    };
    top_livres: Array<{ titre: string; total: number }>;
    par_categorie: Array<{ categorie: string; nombre: number }>;
}

export interface Favori {
    id_membre: number;
    id_livre: number;
    livre?: Livre;
}

// ============= NOUVELLES INTERFACES =============

export interface Avis {
    id_avis: number;
    id_membre: number;
    id_livre: number;
    note: number; // 1-5
    commentaire?: string;
    date_avis: string;
    membre?: {
        nom: string;
        prenom: string;
    };
}

export interface AvisCreate {
    id_livre: number;
    note: number;
    commentaire?: string;
}

export interface Auteur {
    id_auteur: number;
    nom: string;
    prenom?: string;
    biographie?: string;
}

export interface AuteurCreate {
    nom: string;
    prenom?: string;
    biographie?: string;
}

export interface BibliothecaireOut {
    id_bibliotecaire: number;
    login: string;
    email: string;
    nom: string;
    prenom: string;
    role: "Bibliothécaire" | "Administrateur";
    date_embauche?: string;
}

export interface BibliothecaireCreate {
    login: string;
    password: string;
    email: string;
    nom: string;
    prenom: string;
    role: "Bibliothécaire" | "Administrateur";
}

export interface BibliothecaireUpdate {
    login?: string;
    password?: string;
    email?: string;
    nom?: string;
    prenom?: string;
}

export interface Sanction {
    id_sanction: number;
    id_membre: number;
    montant: number;
    motif: string;
    statut: "En cours" | "Payée" | "Annulée";
    date_sanction: string;
    membre?: {
        nom: string;
        prenom: string;
        numero_carte: string;
    };
}

export interface SanctionCreate {
    id_membre: number;
    montant: number;
    motif: string;
}

// Notification Schema from backend
export interface Notification {
    id_notification: number;
    id_membre: number;
    titre: string;
    message: string;
    type: string;
    lu: boolean; // Changed from statut to boolean 'lu' based on backend model usually or router logic
    date_notif: string; // Backend uses date_notif
}

// Msg schemas
export interface Message {
    id_message: number;
    id_membre: number;
    id_bibliotecaire?: number;
    contenu: string; // Backend uses 'contenu', no subject in model usually, need to check Schema
    statut: "Envoye" | "Lu" | "Repondu";
    reponse?: string;
    date_envoi: string; // Backend uses date_envoi
    date_reponse?: string;
    membre?: {
        nom: string;
        prenom: string;
    };
    bibliothecaire?: {
        nom: string;
        prenom: string;
    }
}

export interface MessageCreate {
    contenu: string;
}

export interface ExemplaireCreate {
    id_livre: number;
    code_barre: string;
    etat?: "Disponible" | "Emprunté" | "Perdu" | "En réparation";
    statut_logique?: "Actif" | "Archivé";
    localisation?: string;
}

export interface ExemplaireUpdate {
    code_barre?: string;
    etat?: "Disponible" | "Emprunté" | "Perdu" | "En réparation";
    statut_logique?: "Actif" | "Archivé";
    localisation?: string;
}

export interface LivreUpdate {
    titre?: string;
    isbn?: string;
    editeur?: string;
    id_categorie?: number;
    langue?: string;
    annee_publication?: number;
    descriptions?: string;
}

export interface CategorieCreate {
    nom_categorie: string;
    description?: string;
}

export interface CategorieUpdate {
    nom_categorie?: string;
    description?: string;
}
