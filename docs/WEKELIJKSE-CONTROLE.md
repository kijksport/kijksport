# Wekelijkse controle van de kalender

Elke maandagochtend worden de evenementen van de komende veertien dagen nagekeken. Het doel: begintijden en Nederlandse zenders kloppen, en meerdaagse toernooien hebben per dag een uitzendmoment als de tv-gids dat geeft.

## Regels

- Nooit iets invullen dat niet in een bron staat. Geen bron betekent: laten staan zoals het is en melden.
- Elke wijziging krijgt de bron (`source` of `broadcast.url`) en de controledatum (`checked`).
- `basis: "gids"` alleen als de uitzending met datum, tijd en zender in een tv-gids of op de site van de zender staat. Anders `"rechten"`.
- Een tijd die het begin van een tv-uitzending is en niet de start van de wedstrijd, staat zo in `desc`.
- Bij tegenstrijdige bronnen gaat de organisator of bond voor; de afwijking wordt gemeld.
- Tijden in `iso` zijn UTC; de app toont Nederlandse tijd.
- Nederlandse deelname staat in het veld `nl` (`text`, `source`, `label`, `checked`). Alleen invullen als een bron de deelnemers noemt, bijvoorbeeld een loting, startlijst of selectie. Geen bron: het veld weglaten.
- Viaplay Nederland is sinds 30 oktober 2026 van DPG Media. Formule 1 en darts blijven voorlopig in de Viaplay-app; de overstap naar Videoland is aangekondigd voor later. Controleer bij elke ronde of dat is veranderd.

## Werkwijze

1. Lees `src/data.json` in `main` en selecteer de evenementen waarvan `end` binnen veertien dagen valt, plus alles met status `review` in die periode.
2. Controleer per sport de kalender bij de bond of organisator en de uitzending in een tv-gids (tvgids.nl, de site van de zender).
3. Werk `src/data.json` bij. Voeg bij meerdaagse toernooien een evenement per uitzenddag toe als de gids dat geeft.
4. Draai `npm test` en `npx tsc --noEmit`. Zoek in de wijziging naar persoonsnamen; die horen niet in deze openbare repository.
5. Commit op `main` en push. De workflow publiceert beide versies van de app.
6. Meld kort: wat is gewijzigd, wat kon niet worden bevestigd, welke bronnen spraken elkaar tegen.
