# Architectuur en prototypebeoordeling

v0.1 combineerde presentatie, data en logica in één HTML-document, dupliceerde de dataset, werkte voornamelijk als filterlijst en miste afzonderlijke profielvoorkeuren, bruikbare agendaweergaven en gedifferentieerde controletatussen. Bruikbaar: 89 records met IDs en bronlinks, de elf sportcategorieën en de intentie voor PWA en agenda-export. Pictogrammen zijn hergebruikt; UI en interacties zijn opnieuw gebouwd. Gegevens zijn niet integraal gevalideerd.

## Lagen

1. Bronregister: docs/SOURCES.md; toestemming en status per bron, standaard geen automatische scraper.
2. Adapter/import: scripts/import-wikidata.mjs; expliciete mappings, dagprecisie, preferred rank, fout bij conflict, deterministische upsert met stabiele IDs. Ruwe bronrevisie in data/imports; wijzigingen in data/import-report.json.
3. Centrale dataset: src/data.json. Sporten, opties en evenementen zijn configuratie. Elke record heeft bron, checked (null betekent niet gecontroleerd), status, optionele UTC-start en apart broadcast-object met eigen checked. Nieuwe sporten/competities kunnen via deze configuratie worden toegevoegd; onbekend pictogram valt terug op Flag. De huidige snapshot is ingebouwd in de bundle, geen runtime live feed.
4. Nederlandse uitzendingen: los broadcast-object, alleen expliciet gecontroleerde provider; latere adapter bewaart scope, geografische rechten, begintijd uitzending, verificateur en laatste controle per mogelijkheid. Providerrechten zijn geen bewijs van een specifieke tv-voorbeschouwing.
5. Personalisatie: geversioneerde lokale instellingen, drie profielen, configureerbare sport- en competitiefilters, favorieten, herinneringen; validatie voor back-upimport. De gedeelde kijklijst is een vereniging met expliciete prioriteit bij conflicten.
6. Presentatie: React, semantische knoppen/labels, native modale dialogen met focusbegrenzing en Escape, responsive CSS. Weergaveletter Big Shoulders (OFL 1.1) wordt meegeleverd in src/fonts en lokaal geladen; geen externe fonts, CDN-verzoeken of afbeeldingen. Broodtekst gebruikt het systeemlettertype.
7. Herinneringen: pure exportfunctie in src/core.ts. UTC-tijden, VALUE=DATE en exclusieve einddag voor meerdaagse toernooien. Persoonlijke tijden worden als Europe/Amsterdam geïnterpreteerd. Bij dubbele wintertijd-uren wordt deterministisch de latere UTC-instant gebruikt. Geen stilzwijgende interpretatie van niet-bestaande zomertijduren.

## Toekomstige backend

Tabellen: sports, competitions, events, event_sessions, sources, source_policies, import_runs, event_revisions, broadcast_options, profiles, preferences, favorites, reminders, push_subscriptions. Eén transactionele import per bron; upsert op source_id/external_id. Wijzigingen eerst staging/diff, daarna gecontroleerde promotie. Behoud revision/sequence en cancellation tombstones; nooit verdwijnen vertalen naar annuleren. Broncontract bepaalt toegestane frequentie, caching en herpublicatie. Scheduler controleert eventtijd en broadcast apart, en herplant notificaties bij wijzigingen. Auth en apparaatkoppeling pas toevoegen met expliciet privacyontwerp. Geen betaalde dependency vereist.

## Bewuste grenzen

Geen sportuitslagen, odds, videofragmenten, accounts, achtergrondscheduler, push, automatische synchronisatie of volledige tv-EPG. De app wordt niet voorzien van fictieve zenders om de interface voller te maken. Geen server betekent dat datumwijzigingen pas na een nieuwe import/build/publicatie zichtbaar zijn. De componentlaag is nog geconcentreerd in App; bij uitbreiding afzonderlijke schermmodules en een repository-interface introduceren.
