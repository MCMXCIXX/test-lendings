# Verdalys Solaire — Test White Page (FR)

Lendinger test white-page complet pour l'equipe : lead-gen solaire, geo **France**, langue **francaise**, offre "eligibilite solaire sans apport" avec le meme funnel de quiz que le reference [go.brightmyfuture.com/solarforall](https://go.brightmyfuture.com/solarforall) (proprietaire/locataire -> facture -> code postal -> contact), adapte RGPD/CNIL.

## Live

https://mcmxcixx.github.io/test-lendings/

## Stack

HTML + CSS + Vanilla JS, sans backend ni base de donnees. Toute la credibilite du formulaire (multi-etapes, validation, chargement, succes) est geree cote client, avec un point d'integration CRM/webhook deja balise dans le code.

## Structure

| Fichier | Role |
|---|---|
| `index.html` | Landing principal : hero, trust-bar, contexte, etapes, avantages, temoignages, formulaire quiz, FAQ, footer |
| `merci.html` | Page de remerciement apres soumission du formulaire |
| `politique-confidentialite.html` | Politique de confidentialite RGPD complete (droits CNIL, transferts hors UE, partage avec partenaires) |
| `politique-cookies.html` | Politique de cookies avec tableau des categories |
| `conditions-generales.html` | Conditions Generales d'Utilisation |
| `mentions-legales.html` | Mentions legales (transparence sur l'editeur, obligatoire en France) |
| `assets/css/style.css` | Charte visuelle (vert pin + terracotta, typographie Fraunces/Manrope) |
| `assets/js/main.js` | Navigation, annee du footer, consentement cookies opt-in (localStorage) |
| `assets/js/form.js` | Logique du formulaire multi-etapes (validation FR : code postal, telephone francais) |

## Points cles adaptation FR/RGPD

- Bandeau cookies avec **opt-in explicite** (Tout accepter / Tout refuser / Personnaliser a poids visuel egal), aucune case pre-cochee pour les cookies non essentiels.
- Politique de confidentialite avec liste explicite des droits RGPD et mention de reclamation aupres de la CNIL.
- Mentions Legales dediees (SIREN, siege social, hebergeur) — transparence attendue sur le marche francais.
- Formulaire et validations en francais (code postal 5 chiffres, telephone francais a 10 chiffres).
- Disclaimers specifiques solaire adaptes en francais ("non affilie a un organisme gouvernemental", economies "illustratives").

## Deploiement

Site statique servi via GitHub Pages depuis la racine de la branche `main` (voir `.nojekyll`). Pour un apercu local, ouvrez `index.html` dans un navigateur ou servez ce dossier avec n'importe quel serveur statique.

**Marque, domaine et SIREN sont fictifs, crees specifiquement pour ce test.**
