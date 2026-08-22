# Origine et licence de `fr.txt`

Cette liste **n'est pas l'ODS** (Officiel du Scrabble), qui est une œuvre
protégée de la Fédération Française de Scrabble / Larousse et n'est pas
librement redistribuable. `fr.txt` est une approximation construite à
partir d'un dictionnaire à licence ouverte, fournie à titre indicatif — le
vérificateur de mots de l'application l'indique explicitement.

## Source

- Projet : **Dicollecte** (dictionnaires orthographiques français), par
  Olivier R. — https://www.dicollecte.org/
- Fichiers utilisés : `fr_FR.dic` / `fr_FR.aff` (format Hunspell), tels que
  distribués par le miroir ONLYOFFICE/dictionaries (mêmes fichiers que ceux
  publiés par Dicollecte) :
  https://github.com/ONLYOFFICE/dictionaries/tree/master/fr_FR
- Licence : **Mozilla Public License 2.0** (MPL-2.0) —
  https://www.mozilla.org/MPL/2.0/

## Comment `fr.txt` a été produit

1. Expansion des règles d'affixes Hunspell (`fr_FR.aff`) sur les entrées de
   `fr_FR.dic`, sur un seul niveau (préfixe + suffixe), pour obtenir les
   formes fléchies (pluriels, féminins, conjugaisons). Les entrées portant
   le drapeau `FORBIDDENWORD` sont exclues, ainsi que les racines marquées
   `NEEDAFFIX` (qui ne sont pas des mots valides seules).
2. Filtrage :
   - suppression des entrées commençant par une majuscule dans le
     dictionnaire source (heuristique : noms propres) ;
   - suppression des tokens contenant autre chose que des lettres (chiffres,
     sigles, apostrophes de formes élidées comme « D'abraxas ») ;
   - suppression des mots d'une seule lettre (jamais jouables au Scrabble).
3. Normalisation : accents retirés et mise en MAJUSCULES (une tuile de
   Scrabble ne distingue pas E/É/È/Ê), ligatures « œ »/« æ » décomposées en
   « oe »/« ae ». Les doublons issus de cette normalisation sont fusionnés.

Le script utilisé (`expand.py` + `normalize.py`) n'est pas versionné ici
(outil ponctuel de génération) ; le detail de la méthode ci-dessus permet de
le reproduire à l'identique si `fr_FR.dic`/`fr_FR.aff` sont mis à jour.

## Limites connues

- Une seule passe d'affixation : certaines formes composées (préfixe *et*
  suffixe cumulés au-delà d'un niveau) peuvent manquer.
- Aucune donnée de fréquence/grammaire n'est conservée : la liste ne sert
  qu'à répondre « ce mot existe / n'existe pas », pas à juger de sa validité
  en tournoi officiel.
- Ce n'est donc **ni l'ODS ni le Larousse officiel du Scrabble** : en cas de
  litige à une table de jeu, seule la référence officielle fait foi.
