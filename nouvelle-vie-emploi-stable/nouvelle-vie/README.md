# Nouvelle Vie – Un emploi stable

Application web pour l'accompagnement vers l'emploi stable.

## Mettre ce code en ligne (étapes détaillées)

### 1. Envoyer le code sur GitHub

1. Allez sur [github.com/new](https://github.com/new), créez un nouveau dépôt (repository) nommé par exemple `nouvelle-vie-emploi-stable`. Laissez-le vide (ne cochez aucune case).
2. Sur votre ordinateur, ouvrez un terminal dans le dossier de ce projet et tapez, une ligne à la fois :

```
git init
git add .
git commit -m "Première version"
git branch -M main
git remote add origin URL_DE_VOTRE_DEPOT_GITHUB
git push -u origin main
```

(Remplacez `URL_DE_VOTRE_DEPOT_GITHUB` par l'adresse donnée par GitHub après la création du dépôt.)

### 2. Déployer sur Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new) et connectez-vous avec votre compte GitHub.
2. Choisissez le dépôt `nouvelle-vie-emploi-stable`.
3. Avant de cliquer sur "Deploy", ouvrez la section "Environment Variables" et ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` → l'URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → la clé publique ("anon key")

   Ces deux valeurs se trouvent dans Supabase : **Project Settings > API**.
4. Cliquez sur "Deploy". Au bout d'une minute, votre site est en ligne !

### 3. Tester

Ouvrez le lien fourni par Vercel, cliquez sur "Créer mon compte", et vérifiez que vous arrivez bien sur le tableau de bord.
