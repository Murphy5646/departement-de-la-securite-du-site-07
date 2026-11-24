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
