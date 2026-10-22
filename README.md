# EVA Strategy Tool

Un outil de création de **séquences tactiques animées** pour **EVA - After H**. Créez, visualisez et partagez vos stratégies d'équipe avec un système de séquences et d'animations.

## ✨ **Nouveautés par rapport à CS2 Strategy Tool**

- **4 joueurs par équipe** (Alpha et Bravo)
- **Boucliers** (🛡️) comme équipement spécial
- **Système de séquences** avec animation entre les étapes
- **Timeline visuelle** avec chemins de déplacement
- **Lecture animée** des séquences (raccourci: **P**)
- **Export des séquences** en JSON
- **Gestion complète de l'équipement** par joueur

## 🎮 **Fonctionnalités**

### 🎯 **Placement d'éléments**
- **Joueurs** : 4 par équipe (Alpha en bleu, Bravo en orange)
- **Boucliers** : Équipement spécial pour chaque joueur
- **Grenades** : Fumigènes, Flash, Grenades HE, Feu (Molotov)

### 📹 **Système de Séquences**
- **Création de séquences** avec durée personnalisable
- **Ajout de cadres** (frames) à chaque étape (raccourci: **Espace**)
- **Chemins de déplacement** visibles entre les cadres
- **Lecture animée** avec indication de progression
- **Gestion multiple** de séquences par stratégie

### 🎨 **Interface Intuitive**
- **Sélection d'équipe** (Alpha/Bravo)
- **Gestion de l'équipement** par joueur
- **Compteur de joueurs** (4/4 max par équipe)
- **Propriétés détaillées** pour chaque élément

### 💾 **Sauvegarde et Partage**
- **Sauvegarde locale** dans le navigateur
- **Import/Export** de stratégies en JSON
- **Export de séquences** pour partage

### ⌨️ **Raccourcis Clavier**
| Touche | Action |
|--------|--------|
| `Suppr` | Supprimer l'élément sélectionné |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Rétablir |
| `Échap` | Désélectionner |
| `Espace` | Ajouter un cadre à la séquence |
| `P` | Lecture/Pause de la séquence |

## 🚀 **Installation et Utilisation**

### 1️⃣ **Téléchargement**
```bash
# Clone le dépôt
git clone https://github.com/ZN-dev-ZN/cs2.git
cd cs2
# L'outil EVA est dans le dossier eva-strategy-tool
```

Ou simplement :
- Télécharge le ZIP depuis GitHub
- Extrait le dossier `eva-strategy-tool`

### 2️⃣ **Lancement**
Ouvre simplement le fichier `index.html` dans ton navigateur préféré (Chrome, Firefox, Edge).

### 3️⃣ **Ajout des cartes**
Pour que les cartes s'affichent correctement, ajoute les images dans le dossier `maps/` :
- `eva_arena.png` - Carte Arène
- `eva_forest.png` - Carte Forêt  
- `eva_urban.png` - Carte Zone Urbaine

Tu peux trouver des captures d'écran des cartes EVA ou créer les tiennes.

## 🎯 **Guide d'utilisation**

### Créer une nouvelle stratégie

1. **Sélectionne une carte** dans le menu déroulant en haut
2. **Choisis une équipe** (Alpha ou Bravo)
3. **Active/désactive l'équipement** selon ce que tes joueurs ont
4. **Place tes joueurs** sur la carte (max 4 par équipe)
5. **Ajoute des éléments** (boucliers, grenades, etc.)

### Créer une séquence animée

1. Clique sur **"+ Ajouter"** dans le panneau Séquences
2. Donne un **nom** à ta séquence et définis sa **durée**
3. Place tes éléments comme tu veux pour le **premier cadre**
4. Appuie sur **Espace** pour ajouter un nouveau cadre
5. Déplace tes éléments pour créer le mouvement
6. Répète l'opération pour ajouter plus de cadres
7. Clique sur **▶ Lecture** pour voir l'animation

### Conseils pour EVA

- **Boucliers** : Utilise-les pour protéger tes joueurs pendant les déplacements
- **Fumigènes** : Parfaits pour couvrir les avancées ou bloquer la vue
- **Flash** : Idéal pour aveugler l'ennemi avant une attaque
- **Feu** : Utilise-le pour contrôler des zones ou forcer l'ennemi à se déplacer

### Exemple de stratégie

1. **Séquence 1 : Préparation** (5 secondes)
   - Place 4 joueurs Alpha avec boucliers en position défensive
   - Ajoute 2 fumigènes pour couvrir les approches

2. **Séquence 2 : Attaque** (8 secondes)
   - Déplace 2 joueurs vers la gauche avec boucliers levés
   - Lance un flash vers la position ennemie
   - Avance avec les 2 autres joueurs

3. **Séquence 3 : Nettoyage** (5 secondes)
   - Place un feu pour bloquer la retraite ennemie
   - Finalise avec une grenade

## 📁 **Structure du projet**

```
eva-strategy-tool/
├── index.html          # Page principale avec interface complète
├── styles.css          # Styles CSS modernes et adaptés à EVA
├── app.js              # Logique JavaScript avec gestion des séquences
├── README.md           # Documentation (ce fichier)
└── maps/               # Images des cartes EVA
    ├── eva_arena.png
    ├── eva_forest.png
    └── eva_urban.png
```

## 🔧 **Personnalisation**

### Ajouter une nouvelle carte
1. Ajoute l'image de la carte dans `maps/`
2. Ajoute une nouvelle option dans le menu déroulant du HTML
3. Ajoute la valeur correspondante dans le JavaScript

### Modifier les couleurs d'équipe
Modifie les variables CSS dans `styles.css` :
```css
:root {
    --alpha-color: #00d4ff;    /* Bleu pour Alpha */
    --bravo-color: #ff6b35;    /* Orange pour Bravo */
    /* ... */
}
```

### Ajuster les limites
- **Nombre de joueurs** : Modifie la constante `4` dans le code JavaScript
- **Durée maximale des séquences** : Ajuste dans le modal de création

## 🐛 **Dépannage**

### Les cartes ne s'affichent pas
- Vérifie que les images sont dans le bon dossier (`maps/`)
- Vérifie que les noms des fichiers correspondent exactement
- Les images doivent être au format PNG ou JPG

### L'animation ne fonctionne pas
- Assure-toi d'avoir sélectionné une séquence
- Vérifie que la séquence a au moins 2 cadres
- Appuie sur **P** ou clique sur ▶ Lecture

### Les joueurs ne s'affichent pas
- Vérifie que tu as bien sélectionné une équipe
- Assure-toi de ne pas dépasser 4 joueurs par équipe

## 🤝 **Contribution**

Les contributions sont les bienvenues ! Tu peux :
- **Signaler des bugs** via les Issues GitHub
- **Proposer des améliorations**
- **Ajouter de nouvelles fonctionnalités** via Pull Request
- **Améliorer la documentation**

## 📜 **Licence**

Ce projet est sous licence **MIT**. Tu es libre de :
- L'utiliser pour tes besoins personnels ou professionnels
- Le modifier et l'adapter
- Le redistribuer

## 🎮 **À propos d'EVA - After H**

EVA est un mode de jeu tactique où deux équipes de 4 joueurs s'affrontent. Chaque joueur peut être équipé de :
- **Arme principale**
- **Arme secondaire**
- **Bouclier** (équipement spécial)
- **Grenades** (fumigènes, flash, HE, feu)

L'objectif est de coordonner tes mouvements d'équipe pour vaincre l'adversaire !

---

**Développé avec ❤️ pour la communauté EVA - After H**

*Inspiré par les outils de stratégie CS2, adapté pour EVA*
