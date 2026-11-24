# Département de la sécurité — Site-07

Portail communautaire en français, avec une interface inspirée d'un terminal informatique institutionnel.

## Fonctionnalités
- Écran de démarrage animé et interface responsive.
- Création de compte et connexion/déconnexion.
- Session conservée après actualisation sur le même navigateur.
- Profils locaux avec nom affiché et service sélectionné.
- Tableau de bord, annuaire, protocoles et archives.

## Comptes et confidentialité
Les comptes sont enregistrés dans le stockage local du navigateur. Les mots de passe sont hachés côté navigateur avec un sel aléatoire, mais cette solution n'est pas une authentification serveur : les comptes ne sont pas partagés entre appareils, navigateurs ou utilisateurs. Les données locales peuvent être effacées par le navigateur. Pour une authentification réellement sécurisée et centralisée, connecter un fournisseur d'authentification et une base de données côté serveur. Ne réutilisez pas de mot de passe personnel.

## Démarrage local
```bash
python -m http.server 8000
```
Puis ouvrir http://localhost:8000.

## Protocoles Marshal
La rubrique contient le Code officiel des protocoles et règlements de l'Unité Marshal, version 1.2, avec 165 articles, un index et une recherche intégrée. Le contenu est présenté dans le cadre du jeu de rôle et ne constitue pas un règlement réel.

## Publication
Dans GitHub : Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

Projet communautaire non officiel. Les rôles affichés ne confèrent aucune autorité réelle.


## Applications SEC-OS
Le bureau comprend notamment les applications suivantes : bloc-notes avec sauvegarde locale, calculatrice, calendrier et échéances, gestionnaire de tâches, formulaire de rapports RP, inventaire fictif, messagerie locale de démonstration et paramètres de confort. Ces modules stockent leurs données dans le navigateur utilisé. La messagerie ne transmet aucun message à d'autres comptes et l'inventaire est un exemple fictif.


## 20 applications supplémentaires
SEC-OS comprend aussi : convertisseur d'unités, chronomètre, minuteur, calcul de dates, contacts locaux, planning d'équipes RP, suivi de maintenance, check-lists, quiz de formation, glossaire SCP, plan schématique fictif, demandes internes, réunions, journal de service, modèles de documents, compteur de texte, panneau d'annonces local, favoris textuels, mode concentration et statistiques locales.

Ces outils sont des fonctions de confort pour le jeu de rôle. Les données créées sont conservées dans le stockage local du navigateur et ne sont pas synchronisées entre les appareils. Les cartes, équipes, contacts et procédures présentés ne constituent pas des informations réelles du site ni des consignes opérationnelles.


## Bureau interactif
Le bureau propose désormais une interaction de type système d'exploitation : clic simple pour sélectionner un raccourci, double-clic pour ouvrir une application, clic droit sur un raccourci pour ouvrir/renommer/voir ses propriétés, clic droit sur le fond pour actualiser/trier/masquer les icônes, menus contextuels sur les fenêtres et applications de la barre des tâches, agrandissement/restauration par le bouton carré ou double-clic sur la barre de titre, et raccourci Alt+F4 pour fermer la fenêtre active. Les noms personnalisés des raccourcis sont conservés dans le navigateur.

Ces fonctions sont locales au navigateur. L'interface est inspirée d'un bureau informatique, sans prétendre remplacer un véritable système d'exploitation.
