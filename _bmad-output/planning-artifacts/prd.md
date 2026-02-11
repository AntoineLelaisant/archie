---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-10.md', '_bmad-output/project-context.md']
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 1
workflowType: 'prd'
classification:
  projectType: 'web_app'
  domain: 'personal_productivity_document_management'
  complexity: 'medium-high'
  projectContext: 'greenfield'
date: '2026-02-11'
---

# Product Requirements Document - Archie

**Author:** Antoine
**Date:** 2026-02-11

## Executive Summary

**Archie** est un coffre-fort documentaire personnel intelligent. L'utilisateur dépose ses documents (factures, attestations, courriers administratifs), Archie les classe automatiquement par IA et les rend retrouvables en langage naturel en moins d'une seconde.

**Promesse produit :** "Balance et oublie" — zéro effort cognitif pour l'utilisateur.

**Positionnement :** Paperless-ngx pour les humains normaux, avec un vrai cerveau IA. Complémentaire de Google Drive / Microsoft 365, pas concurrent.

**Cible principale :** Sophie, 38 ans, parent multi-casquettes, submergée de papiers administratifs.

**Différenciateurs clés :**
- Classification 100% automatique sans configuration initiale
- Apprentissage implicite (déplacer un document = signal d'apprentissage)
- IA humble (préfère avouer un doute que mal classer)
- Infrastructure 100% française (Scaleway + Mistral) comme promesse de confiance
- Recherche en langage naturel < 1 seconde

**Ressources :** Développeur solo assisté par IA. Scope MVP serré, itérations rapides.

## Success Criteria

### User Success

- **Le moment "Archie me sauve la mise"** : Sophie retrouve un document en < 5 secondes quand elle en a besoin en urgence
- **Confiance dans l'IA** : taux de classification automatique correct ≥ 80% dès l'onboarding (200 docs)
- **Zéro effort cognitif** : déposer un document ne nécessite aucune action de classement manuelle
- **Engagement récurrent** : les utilisateurs déposent 1 à 5 documents par semaine après l'onboarding
- **Moment "aha!" de l'onboarding** : le "avant/après" visible — 200 documents en vrac transformés en une base classée et cherchable

### Business Success

- **3 mois post-lancement :** 50 utilisateurs actifs qui continuent de déposer des documents
- **Rétention :** les utilisateurs reviennent au moins 1x/semaine (dépôt ou recherche)
- **Bouche-à-oreille :** les utilisateurs recommandent spontanément Archie (mesurable via NPS ≥ 40)
- **Signal d'échec :** utilisateurs qui uploadent à l'onboarding mais ne reviennent plus après 2 semaines

### Technical Success

- **Recherche :** résultats en < 1 seconde
- **Pipeline de traitement :** document uploadé → classé en < 20 secondes
- **Classification :** ≥ 80% de précision sans intervention humaine
- **Disponibilité :** mode dégradé fonctionnel quand Mistral/Tesseract est down (le document est stocké, le classement est différé)
- **Sécurité :** zéro fuite de documents — chiffrement at-rest, pipeline éphémère, zéro cross-learning

### Measurable Outcomes

| Métrique | Objectif MVP | Stretch |
|---|---|---|
| Temps de recherche | < 1s | < 500ms |
| Temps de traitement pipeline | < 20s | < 10s |
| Précision classification | ≥ 80% | ≥ 90% |
| Utilisateurs actifs (3 mois) | 50 | 200 |
| Rétention hebdomadaire | 60% | 80% |

## User Journeys

### Journey 1 : Sophie — L'onboarding massif (Happy Path) — MVP

**Opening Scene :**
Sophie, 38 ans, deux enfants. Un tiroir de la commode déborde de papiers. Des factures EDF, des relevés bancaires, les carnets de santé des enfants, le bail de l'appartement, les attestations d'assurance. Elle a déjà essayé de ranger dans des pochettes, mais ça n'a jamais tenu. Ce soir, les enfants sont couchés. Elle découvre Archie.

**Rising Action :**
Elle crée son compte en 30 secondes. L'interface lui propose : "Déposez vos documents, Archie s'occupe du reste." Elle ouvre le tiroir, commence à scanner avec son téléphone. Les premiers documents partent. Puis elle se souvient du dossier "Administratif" sur son bureau — des PDFs reçus par email. Elle les drag & drop. 47 documents d'un coup.

Pendant qu'elle continue à scanner, Archie travaille en arrière-plan. Les notifications tombent : "Facture EDF — classée dans Énergie > EDF > 2025", "Attestation scolaire — classée dans Enfants > École > Lucas". Elle n'a rien fait. Rien configuré. Rien nommé.

**Climax :**
Au bout de 20 minutes, elle a déposé 83 documents. Elle regarde l'arborescence : tout est rangé. Énergie, Banque, Assurance, Enfants, Logement. 5 documents sont dans "À trier" — l'IA n'était pas sûre. Elle les reclasse en 2 clics. Le "avant/après" est saisissant : un tiroir en vrac → une base organisée.

**Resolution :**
Sophie se dit : "Pourquoi j'ai pas eu ça avant." Elle montre à son conjoint Marc. "Regarde, je cherche 'attestation assurance habitation'..." — résultat en moins d'une seconde. Marc crée son compte le soir même.

**Capabilities révélées :** Onboarding sans configuration, scan mobile, drag & drop batch, pipeline < 20s par document, feedback de classement en temps réel, arborescence auto-générée, file "À trier", reclassement en 2 clics.

---

### Journey 2 : Sophie — "Archie me sauve la mise" (Happy Path) — MVP

**Opening Scene :**
Mardi matin, 8h15. Sophie prépare les sacs des enfants pour l'école. Son téléphone sonne : l'assurance lui demande l'attestation de responsabilité civile pour le dossier de la cantine, il faut l'envoyer avant 9h. Le document est quelque part dans ses papiers. Avant Archie, c'est la panique.

**Rising Action :**
Sophie ouvre Archie sur son téléphone. Elle tape "attestation responsabilité civile".

**Climax :**
0.7 secondes. Le document apparaît avec une preview inline. C'est le bon. Elle le partage directement depuis Archie vers l'email de l'assurance.

**Resolution :**
Terminé. 15 secondes entre l'ouverture d'Archie et l'envoi du document. Les enfants n'ont même pas remarqué. Sophie se dit : "Il faut que je parle d'Archie à Claire."

**Capabilities révélées :** Recherche en langage naturel < 1s, preview inline, partage/export de document, expérience mobile fluide.

---

### Journey 3 : Sophie — L'IA se trompe (Edge Case) — MVP

**Opening Scene :**
Sophie dépose une lettre de la CAF concernant l'allocation de rentrée scolaire. L'IA classe le document dans "Banque > Virements" parce qu'elle détecte un montant et un RIB.

**Rising Action :**
Sophie consulte ses documents récents et voit le classement. Ce n'est pas un virement, c'est un courrier CAF pour les enfants. Elle déplace le document de "Banque > Virements" vers "Enfants > Aides > CAF".

**Climax :**
Archie enregistre la correction. Silencieusement, il apprend : les documents de la CAF avec ces caractéristiques vont maintenant être orientés vers "Enfants > Aides > CAF". Le déplacement EST le signal.

**Resolution :**
Deux semaines plus tard, un nouveau courrier CAF arrive. Archie le classe correctement. Sophie ne remarque même pas que l'IA a appris — c'est juste bien classé.

**Capabilities révélées :** Override utilisateur par déplacement, apprentissage implicite, amélioration progressive de la classification.

---

### Journey 4 : Sophie — La recherche échoue (Edge Case) — MVP

**Opening Scene :**
Sophie cherche "attestation mutuelle Martin" pour un remboursement urgent. Zéro résultat. Le document est dans Archie — elle l'a scanné la semaine dernière — mais l'OCR a mal lu le PDF scanné de mauvaise qualité et le nom "Martin" n'a pas été extrait.

**Rising Action :**
Sophie ne panique pas. Elle navigue dans l'arborescence : Santé > Mutuelle. Elle voit 4 documents. Elle ouvre les previews — le troisième est le bon. Elle retrouve son document en 20 secondes au lieu d'une seconde, mais elle le retrouve.

**Climax :**
Sophie renomme ou reclasse le document pour le retrouver plus facilement la prochaine fois. L'arborescence stable sert de filet de sécurité quand la recherche ne suffit pas.

**Resolution :**
L'arborescence n'est pas juste décorative — c'est un plan B fiable. Sophie garde confiance dans le système même quand l'IA n'est pas parfaite. La promesse "ne perds plus jamais un document" tient, même dans les cas dégradés.

**Capabilities révélées :** Navigation par arborescence comme fallback, preview inline pour identification visuelle, arborescence stable = filet de sécurité, résilience du système face aux limites de l'OCR.

---

### Journey 5 : Sophie — Nettoyage et contrôle (Gestion) — MVP

**Opening Scene :**
Sophie a uploadé un batch de documents scannés. Dans le lot, il y a un doublon (la même facture scannée deux fois) et une photo floue prise par erreur.

**Rising Action :**
Dans ses documents récents, Sophie repère le doublon et la photo. Elle sélectionne les deux et les supprime.

**Resolution :**
Deux clics, c'est nettoyé. Sophie garde le contrôle sur son coffre-fort. C'est SON espace, elle décide ce qui reste et ce qui part.

**Capabilities révélées :** Suppression de documents, gestion des doublons, sentiment de contrôle utilisateur.

---

### Journey 6 : Sophie + Marc — L'espace famille (Post-MVP)

**Opening Scene :**
Ça fait une semaine que Sophie utilise Archie. Elle a déjà 120 documents classés. Marc a créé son compte mais n'a encore rien uploadé. Sophie réalise que le bail, les factures d'énergie et les documents des enfants concernent toute la famille — pas juste elle.

**Rising Action :**
Sophie crée un espace "Documents famille" et invite Marc par email. Marc reçoit un lien, accepte l'invitation — il accède directement à l'espace partagé sans devoir re-faire un onboarding massif.

**Climax :**
Sophie sélectionne les documents qui concernent la famille (bail, énergie, enfants, assurance habitation) et les **déplace** vers l'espace famille. Les documents quittent son espace perso et rejoignent l'espace partagé — un document n'existe qu'à un seul endroit, une seule source de vérité. Marc les voit immédiatement.

**Resolution :**
Marc commence à contribuer : il uploade ses factures auto et les documents de la crèche. Quand Sophie cherche "facture crèche février", elle trouve le document que Marc a déposé. Plus de "Tu sais où est la facture de...?". Chacun garde ses documents personnels (fiches de paie, documents pro) dans son espace privé.

**Capabilities révélées :** Création d'espace partagé, invitation simplifiée (pas de second onboarding), déplacement de documents existants vers l'espace partagé (pas de copie — source de vérité unique), classification intelligente dans l'espace partagé.

---

### Journey 7 : Claire découvre Archie — Le moment viral (Post-MVP)

**Opening Scene :**
Claire, amie de Sophie, galère avec ses papiers. Elles sont au parc avec les enfants. Claire râle : "J'ai encore perdu le justificatif de domicile, la banque me le redemande pour la troisième fois."

**Rising Action :**
Sophie sort son téléphone. "Regarde." Elle ouvre Archie, tape "justificatif domicile".

**Climax :**
0.8 seconde. La quittance de loyer apparaît avec la preview. Claire : "C'est quoi ce truc ?!"

**Resolution :**
Sophie lui envoie un lien d'invitation. Claire crée son compte le soir même et commence à scanner ses papiers. Le bouche-à-oreille en action.

**Capabilities révélées :** Recherche rapide comme "démo" virale, partage/invitation par lien, la vitesse de recherche + preview inline = moment "wow" démontrable.

---

### Journey 8 : Thomas & Marie — Portraits rapides — MVP

**Thomas (freelance) :**
Thomas utilise Archie pour ses factures clients, devis, et documents URSSAF. Son moment clé : la déclaration trimestrielle. Il cherche "factures Q1 2026" et obtient tous les documents en une requête. Avant, il passait 2 heures à rassembler les pièces.

**Marie (technophobe) :**
Marie, 65 ans, a peur de "perdre ses papiers dans l'ordinateur". Sa fille lui installe Archie et fait le premier upload ensemble. Marie découvre qu'elle peut chercher comme elle parle : "le truc de la mutuelle du mois dernier". Ça marche. Elle n'a besoin de rien comprendre à la technologie.

---

### Journey Requirements Summary

| Capability | Journeys | Phase |
|---|---|---|
| Scan mobile + drag & drop batch | J1 | MVP |
| Pipeline de traitement < 20s | J1 | MVP |
| Feedback de classement temps réel | J1 | MVP |
| Arborescence auto-générée | J1, J4 | MVP |
| File "À trier" | J1, J3 | MVP |
| Recherche langage naturel < 1s | J2, J4, J7, J8 | MVP |
| Preview inline des résultats | J2, J4, J7 | MVP |
| Partage/export de document | J2 | MVP |
| Override par déplacement + apprentissage implicite | J3 | MVP |
| Navigation arborescence comme fallback | J4 | MVP |
| Suppression de documents | J5 | MVP |
| Expérience mobile fluide | J1, J2, J7 | MVP |
| Comptes individuels + espace partagé | J6 | Post-MVP |
| Déplacement de documents perso → espace partagé | J6 | Post-MVP |
| Invitation simplifiée (pas de second onboarding) | J6, J7 | Post-MVP |

## Domain-Specific Requirements

### Compliance RGPD

**Données de santé (Article 9)** : les utilisateurs sont susceptibles de déposer des ordonnances, comptes rendus médicaux, attestations mutuelle — données sensibles au sens du RGPD.

- **Consentement large à l'inscription** : à la création du compte, l'utilisateur donne son consentement explicite pour le traitement de tous les types de documents, y compris ceux contenant des données de santé. Formulation claire de la finalité (classification automatique et recherche).
- **Minimisation des données** : seul le contenu texte issu de l'OCR est transmis à Mistral pour l'extraction d'entités et l'embedding. Le document original (PDF, image) n'est jamais envoyé à l'API externe.
- **DPA (Data Processing Agreement)** : contrat de sous-traitance obligatoire avec Mistral (Article 28) encadrant le traitement des données textuelles.
- **AIPD (Analyse d'Impact sur la Protection des Données)** : obligatoire avant mise en production — traitement à grande échelle de données sensibles.
- **Droit à l'effacement** : suppression complète du document, de ses métadonnées, embeddings et texte OCR sur demande.
- **Droit à la portabilité** : export des documents dans un format standard (PDF/images originaux + métadonnées JSON).
- **Zéro cross-learning** : aucune donnée utilisateur n'alimente un modèle partagé. Apprentissage isolé par utilisateur.

### Espaces partagés (Post-MVP)

- **Source de vérité unique** : un document n'existe qu'à un seul endroit. Le déplacement vers un espace partagé retire le document de l'espace personnel (pas de copie).
- **Pas de règles de confidentialité MVP** : tous les membres d'un espace partagé voient tous les documents de cet espace. Gestion fine des permissions en post-MVP.
- **Classification dans l'espace partagé** : l'arborescence de l'espace partagé est indépendante de celle des espaces personnels.

## Innovation & Novel Patterns

### Innovations produit

1. **"Balance et oublie" — Zéro effort cognitif** : repositionnement fondamental de l'effort de classement, de l'utilisateur vers l'IA. Aucun concurrent grand public ne propose un classement 100% automatique sans configuration initiale.

2. **Apprentissage implicite par déplacement** : le drag & drop d'un document pour le reclasser EST le signal d'apprentissage. L'utilisateur ne "corrige" pas l'IA, il "range" — et l'IA apprend silencieusement. Boucle de feedback invisible et naturelle.

3. **L'IA humble — le doute comme feature de confiance** : la file "À trier" n'est pas un échec de l'IA mais une feature produit. Préférer avouer un doute plutôt que mal classer. L'incertitude de l'IA est un avantage UX, pas un défaut.

4. **Cercle vertueux de l'onboarding** : la similarité documentaire s'améliore pendant l'onboarding lui-même. Plus l'utilisateur dépose de documents, mieux les suivants sont classés. Le 83ème document profite des 82 précédents.

5. **Souveraineté comme promesse de confiance** : infra 100% française (Scaleway + Mistral) positionnée comme argument de confiance grand public, pas juste comme choix technique d'hébergement.

### Paysage concurrentiel

| Concurrent | Forces | Faiblesses vs Archie |
|---|---|---|
| Paperless-ngx | Open-source, puissant | Destiné aux utilisateurs techniques. Config requise, tags manuels. |
| Cozy Cloud / Digiposte | Coffres-forts français | Aucune intelligence de classification. Organisation manuelle. |
| Google Drive / Dropbox | Stockage généraliste | Pas de classification automatique de documents administratifs. |

**Positionnement Archie :** "Paperless-ngx pour les humains normaux, avec un vrai cerveau IA" — comble le fossé entre la puissance technique et l'accessibilité grand public.

### Validation de l'innovation

- **Précision classification ≥ 80%** dès l'onboarding (200 docs) comme KPI principal
- **File "À trier"** comme KPI qualité IA : taux décroissant au fil du temps = preuve que l'apprentissage fonctionne
- **Temps de recherche < 1s** comme moment "wow" démontrable (démo virale)
- **Rétention post-onboarding** : les utilisateurs reviennent = la promesse "balance et oublie" tient

## Web App Specific Requirements

### Architecture

Archie est une web app SvelteKit avec SSR, derrière authentification. L'interface est fluide sur desktop et mobile, avec des mises à jour temps réel via SSE pour le pipeline de traitement.

### Browser Matrix

| Navigateur | Support |
|---|---|
| Chrome (2 dernières versions) | Full |
| Firefox (2 dernières versions) | Full |
| Safari (2 dernières versions) | Full (desktop + iOS) |
| Edge (2 dernières versions) | Full |
| Navigateurs anciens / IE | Non supporté |

### Responsive Design

- **Mobile-first** : scan mobile et recherche en déplacement sont des use cases primaires
- **Breakpoints** : mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- **Touch-friendly** : cibles tactiles ≥ 44px, gestes de swipe pour la navigation mobile
- **Scan mobile** : accès caméra via l'API web standard (pas d'app native)

### Real-Time Updates (SSE)

- **Feedback de classification** : l'utilisateur voit en temps réel "Facture EDF — classée dans Énergie > EDF > 2025"
- **Génération de thumbnails** : optimistic render avec placeholder vide, mis à jour via SSE quand le thumbnail est prêt
- **Pattern** : Server-Sent Events (one-way server→client), pas de WebSocket nécessaire
- **Fallback** : polling long si SSE non supporté (edge case navigateurs)

### SEO Strategy

- **Pages marketing uniquement** : landing page, pricing, CGU — rendues côté serveur, optimisées SEO
- **Application** : derrière authentification, pas d'indexation. Meta `noindex` sur toutes les routes app.
- **Routes** : `(marketing)/` pour les pages publiques, `(app)/` pour l'application authentifiée

### Implementation Considerations

- **SvelteKit route groups** : `(marketing)/` (public, SSR, SEO) vs `(app)/` (authentifié, SPA-like) vs `(auth)/` (login, register)
- **Progressive enhancement** : form actions SvelteKit pour les actions critiques (upload, recherche)
- **Service Worker** : cache des assets statiques pour performance mobile, pas de mode offline MVP
- **Upload** : drag & drop (desktop) + file input (mobile) + accès caméra (scan)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche :** MVP de validation du problème — prouver que "balance et oublie" fonctionne et que les gens retrouvent leurs documents.

**Ressources :** Développeur solo assisté par IA. Conséquence directe : scope MVP serré, pas de features "nice-to-have", itérations rapides.

### Phase 1 — MVP

**Journeys supportés :** J1, J2, J3, J4, J5, J8

| Capability | Détail MVP |
|---|---|
| Auth + comptes | Inscription, login, gestion de session |
| Upload documents | Drag & drop web + file input mobile (capture caméra basique) |
| Pipeline IA | OCR (Tesseract) → extraction entités (Mistral) → embedding → chiffrement → stockage |
| Classification auto | AI-first avec file "À trier" pour faible confiance |
| Arborescence IA | Générée automatiquement, stable |
| Feedback temps réel | SSE : "Classé dans Factures > EDF > 2025" + thumbnail placeholder → update |
| Recherche | Barre unique langage naturel, résultats < 1s, preview inline |
| Override utilisateur | Déplacer un document = signal d'apprentissage |
| Suppression | L'utilisateur contrôle son espace |
| Documents récents | L'utilisateur consulte ses dépôts récents |
| Partage/export | Téléchargement de document |
| Mode dégradé | Document stocké, classement différé si service IA indisponible |
| Freemium | 2 Go gratuit |
| RGPD | Consentement large à l'inscription, droit à l'effacement, droit à la portabilité |
| Pages marketing | Landing page, CGU |

**Explicitement hors MVP :**
- Espace partagé famille
- Invitation / parrainage
- Smart Folders configurables
- Forward email
- Notifications
- Speech-to-text
- Onboarding batch optimisé (progress bar, stats)
- Système d'abonnement payant

### Phase 2 — Growth

**Journeys débloqués :** J6, J7

- Espace partagé famille (création, invitation, déplacement de documents)
- Système de parrainage
- Modèle d'abonnement (paliers payants > 2 Go)
- Smart Folders configurables
- Notifications ("Votre facture EDF est arrivée")
- Onboarding massif optimisé (batch 200+ docs avec progress et stats)
- Forward email sécurisé

### Phase 3 — Vision

- Extension navigateur pour capturer des documents depuis le web
- Couche d'intelligence par-dessus Google Drive / Microsoft 365
- Détection d'anomalies contractuelles et économies
- B2B : espaces partagés entreprises
- API ouverte pour intégrations tierces
- Speech-to-text pour recherche vocale

### Risques et mitigations

| Type | Risque | Impact | Mitigation |
|---|---|---|---|
| Technique | Pipeline IA complexe (OCR + Mistral + embedding + chiffrement) | Critique | Modules pluggables, abstractions claires. Spike technique end-to-end en priorité. |
| Technique | Précision classification < 80% | Haut | File "À trier" + arborescence fallback. Seuil de confiance ajustable. |
| Technique | OCR de mauvaise qualité (scans dégradés) | Moyen | Navigation arborescence comme fallback, preview inline pour identification visuelle. |
| Sécurité | Fuite de documents personnels | Critique | Chiffrement at-rest, pipeline éphémère, isolation par utilisateur, infra souveraine. |
| Sécurité | Non-conformité RGPD | Critique | AIPD avant production, DPA Mistral, consentement explicite, droit à l'effacement. |
| Sécurité | Perte de données | Critique | Backups chiffrés, document original persisté avant tout traitement. |
| Disponibilité | Indisponibilité Mistral/Tesseract | Moyen | Mode dégradé : document stocké, classement différé et repris automatiquement. |
| Innovation | L'IA n'apprend pas assez vite | Moyen | Corrections explicites + Smart Folders (post-MVP). |
| Innovation | Trop de documents dans "À trier" | Moyen | Seuil de confiance ajustable, amélioration par similarité. |
| Marché | Pas de confiance des utilisateurs | Haut | Infra souveraine française, transparence sur le traitement, chiffrement visible dans l'UX. |
| Ressource | Dev solo = timeline longue | Moyen | Scope MVP ultra-serré. Pipeline IA + recherche avant UX parfait. |
| Ressource | Coûts Mistral/Scaleway | Moyen | Freemium 2 Go limite l'exposition. Monitoring des coûts par utilisateur. |

## Functional Requirements

### Gestion de compte

- **FR1:** L'utilisateur peut créer un compte avec email et mot de passe
- **FR2:** L'utilisateur peut se connecter et se déconnecter
- **FR3:** L'utilisateur peut consulter et modifier son profil
- **FR4:** L'utilisateur peut supprimer son compte et toutes ses données
- **FR5:** L'utilisateur peut consulter son espace de stockage utilisé (quota 2 Go)

### Dépôt de documents

- **FR6:** L'utilisateur peut déposer un ou plusieurs documents par drag & drop sur desktop
- **FR7:** L'utilisateur peut déposer un document via sélecteur de fichier sur mobile
- **FR8:** L'utilisateur peut prendre une photo de document avec la caméra mobile et la déposer
- **FR9:** L'utilisateur peut déposer plusieurs documents en batch (upload simultané)
- **FR10:** Le système accepte les formats PDF, JPG, PNG et WEBP
- **FR11:** Le système rejette les fichiers qui dépassent le quota de stockage de l'utilisateur

### Traitement IA (pipeline)

- **FR12:** Le système extrait le texte des documents déposés
- **FR13:** Le système extrait les entités typées du texte (émetteur, type de document, date, personne, montant)
- **FR14:** Le système génère une représentation indexable du contenu textuel pour la recherche sémantique
- **FR15:** Le système classifie automatiquement chaque document dans l'arborescence
- **FR16:** Le système oriente les documents à faible confiance de classification vers la file "À trier"
- **FR17:** Le système chiffre le document après traitement
- **FR18:** L'utilisateur reçoit un feedback en temps réel du classement (ex: "Classé dans Factures > EDF > 2025")
- **FR19:** Le système génère un thumbnail de chaque document
- **FR20:** Le système stocke le document et diffère le classement si le service IA est indisponible (mode dégradé)

### Organisation & navigation

- **FR21:** Le système génère automatiquement une arborescence de classement basée sur les documents de l'utilisateur
- **FR22:** L'arborescence ne réorganise pas les dossiers existants entre les visites. L'ajout de nouveaux documents peut créer de nouveaux dossiers mais ne déplace pas les documents déjà classés
- **FR23:** L'utilisateur peut naviguer dans l'arborescence pour parcourir ses documents
- **FR24:** L'utilisateur peut consulter les documents de la file "À trier"

### Recherche

- **FR25:** L'utilisateur peut rechercher ses documents en langage naturel via une barre de recherche unique
- **FR26:** Le système retourne les résultats pertinents en combinant indexation textuelle, recherche sémantique et métadonnées
- **FR27:** L'utilisateur peut visualiser une preview inline de chaque résultat de recherche
- **FR28:** L'utilisateur peut ouvrir le document complet depuis un résultat de recherche

### Gestion documentaire

- **FR29:** L'utilisateur peut déplacer un document d'un dossier à un autre dans l'arborescence
- **FR30:** Le système enregistre chaque déplacement comme signal d'apprentissage pour améliorer la classification future
- **FR31:** L'utilisateur peut supprimer un ou plusieurs documents
- **FR32:** L'utilisateur peut consulter les documents récemment déposés
- **FR33:** L'utilisateur peut partager/exporter un document vers l'extérieur (téléchargement)
- **FR34:** L'utilisateur peut exporter l'ensemble de ses documents et métadonnées (portabilité)

### Confidentialité & conformité

- **FR35:** Le système présente une demande de consentement explicite à l'inscription couvrant le traitement de tous types de documents, y compris les données de santé
- **FR36:** L'utilisateur peut exercer son droit à l'effacement (suppression complète : document, métadonnées, embeddings, texte OCR)
- **FR37:** Le système chiffre les documents stockés at-rest
- **FR38:** Le système ne conserve les documents en clair que pendant la durée du pipeline de traitement
- **FR39:** Le système isole les données de chaque utilisateur (aucun accès croisé)
- **FR40:** Le système journalise les accès aux documents (qui, quand, quelle action)

### Pages publiques

- **FR41:** Un visiteur peut consulter la landing page présentant Archie
- **FR42:** Un visiteur peut consulter les CGU et la politique de confidentialité

## Non-Functional Requirements

### Performance

| Métrique | Exigence | Contexte |
|---|---|---|
| Recherche (résultats affichés) | < 1s | Moment "wow" et démo virale — différenciateur produit |
| Pipeline de traitement complet | < 20s par document | OCR → extraction → embedding → chiffrement → stockage |
| Feedback SSE (classement) | < 2s après fin du pipeline | L'utilisateur voit le résultat quasi immédiatement |
| LCP (Largest Contentful Paint) | < 2.5s | Core Web Vital — pages marketing et app |
| FID (First Input Delay) | < 100ms | Core Web Vital |
| CLS (Cumulative Layout Shift) | < 0.1 | Critique avec les thumbnails en optimistic render |
| Upload batch (20 fichiers) | Début du traitement < 5s | L'utilisateur ne doit pas attendre que tout soit uploadé |

### Sécurité

- **NFR-S1:** Tous les documents stockés sont chiffrés at-rest (AES-256 minimum)
- **NFR-S2:** Les communications sont chiffrées in-transit (HTTPS/TLS 1.3)
- **NFR-S3:** Le document est en clair uniquement pendant le pipeline de traitement (fenêtre éphémère)
- **NFR-S4:** Isolation complète des données entre utilisateurs — aucune requête ne peut accéder aux documents d'un autre utilisateur
- **NFR-S5:** Seul le texte OCR est transmis à l'API Mistral, jamais le document original
- **NFR-S6:** Aucune donnée utilisateur n'alimente un modèle partagé (zéro cross-learning)
- **NFR-S7:** Les sessions expirent après inactivité (durée configurable, défaut 24h)
- **NFR-S8:** Les mots de passe sont hashés avec un algorithme résistant (bcrypt/argon2)
- **NFR-S9:** Journalisation des accès aux documents (audit trail)

### Fiabilité & disponibilité

- **NFR-R1:** Mode dégradé fonctionnel si Mistral est indisponible — le document est stocké, le classement est différé et repris automatiquement
- **NFR-R2:** Mode dégradé fonctionnel si Tesseract est indisponible — même principe de reprise
- **NFR-R3:** Aucun document ne peut être perdu suite à une erreur du pipeline — le fichier original est persisté avant tout traitement
- **NFR-R4:** Les jobs en échec dans la queue sont retentés automatiquement (3 tentatives avec backoff exponentiel)
- **NFR-R5:** Backups chiffrés des données (fréquence à définir)

### Scalabilité

- **NFR-SC1:** Le système supporte 50 utilisateurs actifs simultanés au lancement MVP
- **NFR-SC2:** Le système supporte 200 utilisateurs actifs sans refonte architecturale (stretch goal 3 mois)
- **NFR-SC3:** Le pipeline de traitement supporte le traitement parallèle d'au moins 10 documents simultanément
- **NFR-SC4:** Le stockage supporte 2 Go × nombre d'utilisateurs sans dégradation

### Accessibilité

- **NFR-A1:** Conformité WCAG 2.1 niveau AA
- **NFR-A2:** Navigation clavier complète sur toutes les fonctionnalités
- **NFR-A3:** Contraste de couleurs ≥ 4.5:1 (texte normal) et ≥ 3:1 (grands textes)
- **NFR-A4:** Labels ARIA sur tous les composants interactifs

### Intégrations externes

- **NFR-I1:** L'intégration Mistral doit être abstraite derrière une interface (changement de fournisseur LLM sans impact sur le reste du système)
- **NFR-I2:** L'intégration OCR doit être abstraite derrière une interface (Tesseract remplaçable)
- **NFR-I3:** Timeout configurable sur les appels API externes (défaut 30s)
- **NFR-I4:** Circuit breaker sur les appels Mistral pour éviter les cascades d'échecs

### Infrastructure

- **NFR-INF1:** Hébergement 100% français (Scaleway) — aucune donnée hors UE
- **NFR-INF2:** Déploiement conteneurisé en développement et en production
- **NFR-INF3:** Monitoring des coûts par utilisateur (Mistral API, stockage Scaleway)
