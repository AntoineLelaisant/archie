---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Concevoir Archie v2 - système de gestion documentaire personnel intelligent : stockage, classification et recherche'
session_goals: 'Explorer les meilleures approches pour le stockage, la classification automatique et la recherche performante de documents personnels. Poser les bases d une vision produit solide pour repartir avec BMAD.'
selected_approach: 'ai-recommended'
techniques_used: ['Question Storming', 'First Principles Thinking', 'Morphological Analysis']
ideas_generated: [94, 16, 14]
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitateur:** Antoine
**Date:** 2026-02-10

## Session Overview

**Sujet :** Concevoir Archie v2 - système de gestion documentaire personnel intelligent : stockage, classification et recherche

**Objectifs :** Explorer les meilleures approches pour le stockage, la classification automatique et la recherche performante de documents personnels. Poser les bases d'une vision produit solide pour repartir avec BMAD.

### Contexte

Archie v1 était un assistant documentaire intelligent avec détection d'anomalies et d'économies. Pour la v2, le scope est volontairement réduit aux trois piliers fondamentaux : stockage, classification automatique et recherche performante. L'objectif est de construire une base solide avant d'ajouter des fonctionnalités avancées.

### Périmètre

- Stockage de documents (PDF, images, Word...)
- Classification automatique des documents
- Recherche performante dans la base documentaire
- **Hors scope MVP :** détection d'anomalies contractuelles, opportunités d'économies, chat conversationnel, édition de documents, notes, B2B

## Technique Selection

**Approche :** Techniques recommandées par l'IA
**Contexte d'analyse :** Archie v2 - gestion documentaire personnelle avec focus sur stockage, classification et recherche

**Techniques recommandées :**

- **Question Storming (deep) :** Cadrage - poser les bonnes questions avant de chercher des solutions, éviter de reproduire les biais de la v1
- **First Principles Thinking (creative) :** Déconstruction - repartir des vérités fondamentales sur les documents, la classification et la recherche
- **Morphological Analysis (deep) :** Construction systématique - explorer toutes les combinaisons de paramètres pour les 3 piliers

**Logique IA :** Flow Cadrer → Déconstruire → Reconstruire systématiquement, adapté à un redémarrage de projet existant

## Technique 1 : Question Storming

**94 questions générées** couvrant : stockage, classification, recherche, confiance/sécurité, canaux d'entrée, concurrence, parcours utilisateur, onboarding, B2B (hors scope pour v2)

### Insights clés

1. **La confiance est le produit** - pas juste une feature
2. **Coffre-fort + classement intelligent** - la double promesse
3. **B2C d'abord** - éprouver le concept avant le B2B
4. **L'onboarding massif est le moment de conversion** - le "avant/après" qui démontre la valeur instantanément
5. **Classer ≠ organiser manuellement** - le système doit fonctionner malgré l'absence de discipline de l'utilisateur

## Technique 2 : First Principles Thinking

### Les 16 vérités fondamentales d'Archie

| # | Vérité | Catégorie |
|---|--------|-----------|
| 1 | L'utilisateur veut conserver une information et pouvoir la retrouver/prouver | Valeur |
| 2 | Le cerveau retrouve par associations multiples, pas par arborescence | Cognition |
| 3 | Le document original EST la valeur (pas l'extraction) | Valeur |
| 4 | Un document a : corps, contexte, intention, durabilité | Modèle |
| 5 | L'arborescence sert la confiance, pas la recherche | Architecture |
| 6 | Plus Archie connaît l'utilisateur, mieux il classe | Intelligence |
| 7 | Séparation stockage vs navigation | Architecture |
| 8 | AI-first, Human-override | Philosophie |
| 9 | Le modèle c'est Entités + Typologies | Modèle |
| 10 | Smart Folder = filtre + règle d'ingestion + vue stable | Architecture |
| 11 | Deux couches d'IA : générique (partagée) + personnalisée (isolée) | Intelligence |
| 12 | La file "À trier" = KPI de qualité de l'IA | Qualité |
| 13 | Stabilité de navigation = confiance | UX |
| 14 | Zéro donnée utilisateur pour l'IA collective | Privacy |
| 15 | L'IA humble > l'IA magique | Philosophie |
| 16 | Le mode dégradé est un citoyen de première classe | Résilience |

### Contexte additionnel : Session Smart Folders précédente intégrée

Concepts validés issus du brainstorming du 2026-01-25 :
- Modèle Entités/Typologies comme fondation
- Configuration tri-modale (Prompt + Exemple + Templates)
- Pattern AI-first, Human-override
- Personas : Sophie (parent, cible #1), Thomas (freelance), Marie (technophobe)
- Privacy by design : apprentissage isolé par utilisateur

## Technique 3 : Morphological Analysis

### Pilier 1 - Stockage

| Dimension | Choix MVP |
|-----------|-----------|
| **A - Canaux d'entrée** | Upload manuel (drag & drop) + scan mobile + forward email sécurisé (adresse unique/aléatoire par utilisateur). Extensions navigateur, watch folder local, API sources externes à terme. |
| **B - Infrastructure** | Cloud souverain français (Scaleway), IA française (Mistral). Européen au pire. |
| **C - Sécurité** | Chiffrement at-rest post-analyse. Document lisible uniquement pendant le pipeline de traitement (éphémère, isolé). HTTPS in-transit. |
| **D - Versions** | D1 - Pas de versioning. Documents définitifs uniquement. Pas de notes pour le MVP. |
| **E - Capacité** | Freemium par paliers : 2 Go gratuit, payant au-delà. |
| **Édition** | Hors scope MVP. Archie complète Google Drive, ne le concurrence pas. Vision long terme : couche d'intelligence par-dessus le stockage existant (Google Workspace, Microsoft 365). |

### Pilier 2 - Classification

| Dimension | Choix |
|-----------|-------|
| **F - Modèle de données** | F2 - Entités typées : émetteur, type de document, date, personne, montant, durabilité |
| **G - Mécanisme** | G2 - AI-first, Human-override. L'IA classe automatiquement, l'utilisateur corrige si besoin. |
| **H - Navigation** | H2+H3 - Arborescence générée par l'IA (stable une fois créée) + Smart Folders configurables par l'utilisateur |
| **I - Incertitude** | I1 - File "À trier" unique. L'IA humble préfère demander que mal classer. |
| **J - Apprentissage** | J3 (config explicite Smart Folders) + J5 (similarité documentaire) + corrections implicites (déplacement = signal d'apprentissage) |

### Pilier 3 - Recherche

| Dimension | Choix |
|-----------|-------|
| **K - Modes** | K2 (sémantique par embeddings) + K4 (langage naturel) + K5 (speech-to-text, post-MVP) |
| **L - Interface** | L1 - Barre unique à la Google. Zéro syntaxe à apprendre. |
| **M - Résultats** | M3 - Preview inline du document dans les résultats |
| **N - Indexation** | N3 - Triple indexation : full-text (OCR) + embeddings vectoriels + métadonnées/entités |

## Organisation et Priorisation

### Thèmes identifiés (6)

**Thème 1 : Philosophie produit et positionnement**
- Coffre-fort + cerveau : espace de confiance avec intelligence intégrée
- "Paperless-ngx pour les humains normaux, avec un vrai cerveau IA"
- B2C first, B2B à terme
- Complémentaire de Google Drive / Microsoft 365, pas concurrent
- Cible #1 : Sophie (parent multi-casquettes)
- Promesse : "Ne perds plus jamais un document"

**Thème 2 : Architecture de confiance**
- Infra 100% française (Scaleway) + IA française (Mistral)
- Chiffrement post-analyse, pipeline éphémère
- Zéro cross-learning : aucune donnée utilisateur n'alimente l'IA collective
- Arborescence stable : la navigation ne change pas entre deux visites
- Mode dégradé citoyen de première classe

**Thème 3 : Intelligence de classification**
- Modèle Entités/Typologies (émetteur, type, date, personne, montant, durabilité)
- AI-first, Human-override
- IA humble : mieux vaut avouer un doute que classer mal
- Triple source d'apprentissage : config Smart Folders + similarité documentaire + corrections implicites
- Cercle vertueux : plus de documents → meilleure similarité → moins de "À trier"

**Thème 4 : Expérience de recherche**
- Barre unique à la Google, zéro syntaxe
- Langage naturel + sémantique + vocal (post-MVP)
- Triple indexation : full-text + embeddings vectoriels + métadonnées/entités
- Preview inline dans les résultats

**Thème 5 : Onboarding et conversion**
- L'onboarding massif EST le moment de conversion (200 docs d'un coup)
- La similarité s'améliore pendant l'onboarding lui-même
- Freemium 2 Go : suffisant pour l'onboarding sans friction
- Multi-canal : upload, scan mobile, forward email sécurisé

**Thème 6 : Smart Folders et navigation**
- Arborescence IA stable + Smart Folders configurables
- Smart Folder = filtre + règle d'ingestion + vue stable
- L'utilisateur peut reprendre la main et guider l'IA
- File "À trier" comme inbox intelligente (KPI qualité IA)

### Priorisation

**Top 3 MVP :**
1. **Coffre-fort + cerveau** - Stocker de manière sécurisée + IA qui comprend les documents
2. **AI-first, Human-override** - Classification intelligente avec reprise de contrôle utilisateur
3. **Barre unique à la Google** - Recherche en langage naturel, zéro friction

**Quick wins :**
- Onboarding sans configuration (zéro setup technique)
- Preview inline des documents
- Feedback explicite de classement ("Classé dans Factures > EDF > 2025")
- Scan mobile

**Innovation différenciante :**
- Le "balance et oublie" : zéro effort cognitif, l'utilisateur dépose, Archie fait tout
- Paperless-ngx pour le grand public avec un vrai cerveau IA
- Infra souveraine française comme argument de confiance

### Plans d'action

**Priorité 1 : Coffre-fort + cerveau**
1. Définir le schéma de données : document + entités typées (émetteur, type, date, personne, montant, durabilité)
2. Pipeline d'ingestion : upload → OCR → extraction entités (Mistral) → embedding → chiffrement → stockage (Scaleway)
3. API de base : upload, récupération, listing
4. Chiffrement at-rest post-analyse

**Priorité 2 : AI-first, Human-override**
1. Moteur de classification : extraction d'entités + similarité documentaire
2. Arborescence générée par l'IA, stable une fois créée
3. File "À trier" pour les documents à faible confiance
4. Interface de correction : déplacer un document = signal d'apprentissage
5. Smart Folders configurables (itération suivante)

**Priorité 3 : Barre de recherche unique**
1. Triple indexation : full-text (OCR) + embeddings vectoriels + métadonnées/entités
2. Parser langage naturel → décomposition en requête structurée
3. Interface : barre unique + résultats avec preview inline
4. Speech-to-text (itération suivante)

### Roadmap suggérée

```
Phase 1 - Fondations
├── Schéma de données (entités/typologies)
├── Pipeline d'ingestion (OCR + Mistral + embedding + chiffrement)
├── Stockage Scaleway + API de base
└── Upload manuel (drag & drop)

Phase 2 - Classification
├── Moteur de classification (entités + similarité)
├── Arborescence IA stable
├── File "À trier"
├── Feedback explicite de classement
└── Interface de correction/override

Phase 3 - Recherche
├── Triple indexation
├── Barre unique langage naturel
├── Preview inline des résultats
└── Scan mobile

Phase 4 - Optimisation
├── Smart Folders configurables
├── Forward email sécurisé
├── Speech-to-text
└── Onboarding massif optimisé (200 docs)
```

## Résumé de session

### Accomplissements créatifs
- **94 questions** générées en Question Storming
- **16 vérités fondamentales** identifiées en First Principles
- **14 dimensions explorées** en Morphological Analysis (5 stockage + 5 classification + 4 recherche)
- **6 thèmes** organisés avec priorisation
- **Roadmap en 4 phases** établie

### Insights clés de la session
- **Positionnement :** Paperless-ngx pour le grand public, avec un vrai cerveau IA
- **Philosophie :** L'IA humble > l'IA magique. Le doute est une feature de confiance.
- **Architecture :** Séparation stockage vs navigation. L'arborescence sert la confiance, la recherche sert le retrouvage.
- **Différenciation :** Le "balance et oublie" - zéro effort cognitif pour l'utilisateur
- **Souveraineté :** Infra 100% française (Scaleway + Mistral), zéro cross-learning

### Moments de breakthrough
- La découverte que l'arborescence sert la **confiance** (audit visuel) et non la recherche
- Le cercle vertueux de la similarité qui s'améliore **pendant** l'onboarding massif
- La formulation "Paperless pour les humains normaux" comme résumé du positionnement
- La tension privacy vs intelligence résolue par le chiffrement post-analyse

### Décisions stratégiques prises
- B2C uniquement pour le MVP
- Pas d'édition de documents (complémentaire de Drive, pas concurrent)
- Pas de versioning ni de notes pour le MVP
- Documents définitifs/reçus uniquement
- Freemium 2 Go gratuit

### Prochaines étapes BMAD
1. Transformer ce brainstorming en **Product Vision** formalisée
2. Définir les **User Personas** détaillés (Sophie, Thomas, Marie)
3. Rédiger les **User Stories** pour la Phase 1
4. Établir l'**architecture technique** détaillée
5. Planifier le **MVP** avec critères d'acceptation
