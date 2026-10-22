# CS2 Strategy Tool

Un outil de création de stratégies pour Counter-Strike 2. Créez, visualisez et partagez vos stratégies avec votre équipe.

## Fonctionnalités

- **Placement d'éléments** : Ajoutez des joueurs, fumigènes, flashes, grenades HE, molotovs et leurres sur la carte
- **Sélection d'équipe** : Distinguez les Terroristes (T) et les Contre-Terroristes (CT)
- **Timeline** : Organisez vos actions dans le temps
- **Multiples cartes** : Mirage, Inferno, Dust 2, Nuke, Ancient, Vertigo, Overpass
- **Sauvegarde/Chargement** : Enregistrez vos stratégies localement ou dans des fichiers
- **Export PNG** : Exportez votre stratégie en image
- **Historique** : Annulez ou rétablissez vos actions
- **Raccourcis clavier** :
  - `Suppr` : Supprimer l'élément sélectionné
  - `Ctrl+Z` : Annuler
  - `Ctrl+Y` : Rétablir
  - `Échap` : Désélectionner

## Installation

1. Clonez ou téléchargez ce dépôt
2. Ouvrez le fichier `index.html` dans votre navigateur
3. Commencez à créer vos stratégies !

## Utilisation

### Créer une nouvelle stratégie
1. Sélectionnez une carte dans le menu déroulant
2. Choisissez un outil dans la barre d'outils
3. Cliquez sur la carte pour placer des éléments
4. Utilisez la timeline pour ajouter des actions temporelles
5. Ajoutez des notes dans le panneau de droite

### Outils disponibles
- **🖱️ Sélection** : Sélectionnez et déplacez des éléments existants
- **👤 Joueur** : Ajoutez un joueur (T ou CT selon l'équipe sélectionnée)
- **💨 Fumigène** : Ajoutez un point de fumigène
- **⚡ Flash** : Ajoutez un point de flash
- **💣 HE Grenade** : Ajoutez une grenade explosive
- **🔥 Molotov** : Ajoutez un molotov
- **🎯 Leurres** : Ajoutez un leurre

### Sauvegarder une stratégie
1. Cliquez sur le bouton **💾 Sauvegarder**
2. Donnez un nom à votre stratégie
3. Sélectionnez le type (Attaque, Défense, Retake, Execute)
4. Cliquez sur **Sauvegarder**

Votre stratégie sera enregistrée localement et apparaîtra dans la liste "Mes Stratégies".

### Charger une stratégie
- Cliquez sur une stratégie dans la liste "Mes Stratégies" pour la charger
- Ou cliquez sur **📂 Charger** pour importer un fichier JSON

### Exporter en image
Cliquez sur le bouton **📸 Exporter en PNG** pour télécharger votre stratégie sous forme d'image.

## Structure du projet

```
cs2-strategy-tool/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── app.js              # Logique principale
├── README.md           # Documentation
└── maps/               # Images des cartes (à ajouter)
    ├── de_mirage.jpg
    ├── de_inferno.jpg
    └── ...
```

## Images des cartes

Pour que les cartes s'affichent correctement, ajoutez des images des cartes dans le dossier `maps/` avec les noms suivants :
- `de_mirage.jpg`
- `de_inferno.jpg`
- `de_dust2.jpg`
- `de_nuke.jpg`
- `de_ancient.jpg`
- `de_vertigo.jpg`
- `de_overpass.jpg`

Vous pouvez trouver ces images sur des sites comme [CS2 Map Database](https://cs2mapdb.com/) ou en prenant des captures d'écran du jeu.

## Personnalisation

### Ajouter une nouvelle carte
1. Ajoutez l'image de la carte dans le dossier `maps/`
2. Ajoutez une nouvelle option dans le menu déroulant du HTML
3. Ajoutez la valeur correspondante dans le JavaScript

### Modifier les couleurs
Modifiez les variables CSS dans le fichier `styles.css` :
```css
:root {
    --t-color: #ff4757;    /* Couleur des Terroristes */
    --ct-color: #2ed573;   /* Couleur des Contre-Terroristes */
    --primary-color: #ff4757;
    /* ... */
}
```

## Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request pour :
- Ajouter de nouvelles fonctionnalités
- Corriger des bugs
- Améliorer l'interface
- Ajouter des traductions

## Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

Développé avec ❤️ pour la communauté CS2
