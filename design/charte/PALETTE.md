# Charte La Maison de l'IA — référence rapide

Extrait du PDF officiel `charte-mia.pdf` (version 2026). À consommer par tous les workers UI.

## Palette (9 HEX)

| Nom | HEX | Rôle | CSS token |
|---|---|---|---|
| Deep Blue | `#163458` | Institutionnelle — crédibilité, structure | `--mai-blue-deep` |
| Bleu Quantique | `#98A8C6` | Bleu moyen | `--mai-blue-quantum` |
| Bleu Lumen | `#C2D4EF` | Bleu clair | `--mai-blue-lumen` |
| Rouge Lovelace | `#994845` | Fédératrice — ancrage humain, accent | `--mai-red-lovelace` |
| Terra d'IA | `#AE6557` | Terracotta moyen | `--mai-red-terra` |
| Auria | `#F2B2A5` | Rose poudré | `--mai-red-auria` |
| Matière Grise | `#C0C0BE` | Neutre | `--mai-gray-matter` |
| Data Bloom | `#E5EAA8` | Inspirante — mise en lumière texte | `--mai-green-bloom` |
| Neura Verde | `#F1F4D0` | Vert très clair | `--mai-green-neura` |

## Typographies

- **Pogonia** (unique police utilisée) — 9 OTF fournies dans `POGONIA/`. À convertir en WOFF2 et placer dans `frontend/public/fonts/pogonia/`.

Décision utilisateur : on **n'utilise pas** "Like that" ni "Space Odyssey" dans cette version (décoratives seulement dans la charte).

## Règles logo

- Le **"IA" est toujours en Rouge Lovelace `#994845`**. Aucune exception.
- Le "M" + "La Maison de l'IA" peuvent passer en blanc sur fond sombre.
- Interdits : changer la typo, distordre, ajouter un contour, utiliser une couleur hors palette.
- Le logo est consommé tel quel depuis les PNG (`MIA_Logo rond blanc.png`, `MIA_Medaillon bleu gris.png`, etc.). Ne jamais recréer ni recolorer en CSS/SVG maison.

## Pictogrammes (9 thèmes × 3 couleurs)

Disponibles en PNG : Scolaire, Professionnel, Grand public, Sensibiliser, Robotique, Conférence, Atelier, Fédérer, Valoriser, Inspirer.

Déclinaisons : Bleu (`MIA-IconsBleu_*.png`), TerraCotta (`MIA-IconsTerraCotta_*.png`), Blanc (`MIA-IconsBlanc_*.png`).

## Pattern décoratif

Lettres I+A du logo en gris dégradé 100→0%. À utiliser **uniquement** sur fonds Deep Blue ou Rouge Lovelace.

## Formes géométriques

Demi-cercle Bleu Quantique, parallélogramme Rouge Lovelace, chevrons Deep Blue, courbes Data Bloom, ronds ouverts. À utiliser pour "donner du mouvement" aux supports.
