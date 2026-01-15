# 🧪 Guide de Test : Scénario Complet Bibliothécaire

L'automate de test rencontrant des limitations techniques momentanées, voici le guide pas-à-pas pour vérifier vous-même le bon fonctionnement de tout le système. C'est le "tour d'honneur" ! 🏅

## 📝 Prérequis
- Connectez-vous avec : **sly2** / **staff123**

---

## 🟢 Étape 1 : Créer un Membre
1. Allez dans l'onglet **Membres**.
2. Cliquez sur **"+ Nouveau Membre"**.
3. Remplissez :
   - **Prénom** : Jean
   - **Nom** : Testeur
   - **Email** : jean.testeur@example.com
   - **Carte** : `CARD-9999`
   - **Type** : Standard
   - **Mot de passe** : `password123`
4. Cliquez sur **Ajouter**.
   - ✅ *Vérification :* Le membre apparaît dans la liste ou un message de succès s'affiche.

---

## 🟡 Étape 2 : Préparer un Livre
1. Allez dans l'onglet **Inventaire**.
2. Repérez un livre (ex: "Ethical hacking").
3. Cliquez sur les **3 petits points** à droite > **Gérer exemplaires**.
4. Notez le **Code-barres** d'un exemplaire "Disponible".
   - *Exemple :* `2024-TEST-001` (ou copiez-en un depuis la liste).

---

## 🔵 Étape 3 : Faire un Emprunt
1. Cliquez sur **"Ouvrir le comptoir"** (Dashboard) ou onglet **Comptoir**.
2. Restez en mode **"Nouvel emprunt"**.
3. Dans **"1. Rechercher le membre"** :
   - Tapez `CARD-9999` (ou l'email).
   - Validez avec Entrée ou le bouton Loupe.
   - ✅ *Vérification :* La carte du membre "Jean Testeur" apparaît (Statut Actif).
4. Dans **"2. Rechercher l'exemplaire"** :
   - Tapez le code-barres noté à l'étape 2.
   - Validez.
   - ✅ *Vérification :* La carte du livre apparaît (État Disponible).
5. Cliquez sur le grand bouton vert **"Valider le prêt"**.
   - ✅ *Succès :* Une notification confirme le prêt.

---

## 🟣 Étape 4 : Vérifier le Dashboard
1. Retournez au **Tableau de bord**.
2. Regardez la section **"Activité récente"** (à droite).
   - ✅ *Vérification :* Vous devriez voir : *"Jean Testeur a emprunté [Titre du Livre]"*.
3. Regardez la carte **"Prêts actifs"**.
   - ✅ *Vérification :* Le compteur a augmenté de 1.

---

## 🔴 Étape 5 : Faire un Retour
1. Retournez au **Comptoir**.
2. Cliquez sur le bouton **"Retour"** (en haut).
3. Scannez/Tapez le même code-barres.
4. Cliquez sur **"Valider"**.
5. Une fenêtre de confirmation s'ouvre. Cliquez sur **"Valider le retour"**.
   - ✅ *Succès :* Notification de retour validé.

---

## 🎉 Conclusion
Si tout cela fonctionne, votre application est **100% opérationnelle** ! Félicitations ! 🚀
