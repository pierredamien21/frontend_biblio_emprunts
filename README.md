# 📚 BiblioTech - Frontend

Une application moderne de gestion de bibliothèque construite avec Next.js, Tailwind CSS et Shadcn/UI.

## 🚀 Pour Commencer

### 1. Prérequis
Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre machine.

### 2. Installation
Ouvrez un terminal dans ce dossier et lancez la commande suivante pour installer les dépendances :

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

### 3. Lancer le serveur de développement
Pour démarrer l'application en mode local :

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## 🛠️ Stack Technique
- **Framework** : Next.js 14 (App Router)
- **Styles** : Tailwind CSS
- **Composants UI** : Shadcn/UI
- **Icônes** : Lucide React

## 🔑 Comptes de Test
- **Membre** : `membre@test.com` / `password123`
- **Bibliothécaire** : `sly2` / `staff123` (ou `admin` / `admin123`)

## 📦 Structure du Projet
- `/app` : Pages et routing de l'application
- `/components` : Composants réutilisables (UI, Auth, Dashboard...)
- `/lib` : Utilitaires et configuration API
- `/hooks` : React Hooks personnalisés (ex: useAuth)
- `/documentation` : Guides d'utilisation, architecture et rapports de correction

## 📚 Documentation Détaillée
Vous trouverez dans le dossier `/documentation` :
- **Guide_Tests_Utilisateur.md** : Scénarios de test pas-à-pas (Création membre, Prêt, Retour).
- **Architecture_Authentification.md** : Détails techniques sur le système de login.
- **Rapport_Correction_Staff.md** : Historique des correctifs apportés au portail bibliothécaire.
- **Bilan_Couverture_API.md** : Audit final des fonctionnalités implémentées vs backend.

## ☁️ Déploiement sur Vercel

Le moyen le plus simple de déployer cette application Next.js est d'utiliser la [Plateforme Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Étapes rapides :
1. Poussez ce code sur un dépôt Git (GitHub, GitLab, Bitbucket).
2. Connectez votre dépôt à Vercel.
3. Vercel détectera automatiquement que c'est un projet Next.js et configurera le build.
4. Cliquez sur "Deploy" !

Pour plus de détails, consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/deployment).
