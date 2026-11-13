# KijkSport

Nederlandstalige sportkijkgids voor eigen gebruik: welke sport is er, wanneer begint die en waar is die in Nederland te zien.

**App:** https://kijksport.github.io/kijksport/ (installeren op iPhone: open in Safari > Deel > Zet op beginscherm).

## Hoe het werkt

- Elke wijziging op `main` wordt automatisch getest, gebouwd en gepubliceerd via GitHub Actions (`.github/workflows/pages.yml`).
- De sportkalender staat in `src/data.json`, met per evenement een bron en controledatum.
- Persoonlijke voorkeuren (sporten, kijkdiensten, kijklijst, herinneringen) staan alleen op het toestel. Deel ze met een tweede telefoon via Sporten > Samen dezelfde selectie (link of QR-code); bewaar een back-up via Exporteer.

Nederlandstalige, lokaal gepersonaliseerde sportagenda voor één gezamenlijke selectie. Gebouwd met React 19, TypeScript en Vite. Geen backend of trackers. De privépreview vraagt mogelijk een ChatGPT-hostingaanmelding; de app zelf heeft geen accountmodel.

## Starten

Node 24+, npm. `npm ci`, `npm run dev`, `npm test`, `npm run build`. Publiceer de inhoud van `dist/` op HTTPS. Voor ontwikkelpreview is terminal.local toegestaan. Geen geheimen of API-sleutels nodig.

## Gebruik

- Vandaag toont gebeurtenissen voor de actuele Amsterdamse kalenderdag en aankomende sportmomenten.
- Agenda: Dag / Week / Maand / Jaar. Pijlen verplaatsen de periode. Klik op een dag voor de chronologische lijst; klik op een maand in Jaar voor detail. Het jaaroverzicht bevat alle opgenomen evenementen (maximaal vijf per maand plus doorklik).
- Sporten: elf categorieën en configureerbare competitieopties. Onderliggende filters voor races, kwalificaties, Grand Slams, titelgevechten en mannen/vrouwen.
- Elk profiel heeft eigen sportfilters, favorieten en herinneringen. Samen toont de vereniging van de drie kijklijsten. Persoonlijke favorieten verwijder je binnen het betreffende profiel. Samen gebruikt eigen sportfilters; die zijn niet de vereniging van persoonlijke sportfilters. Bij verschillende herinneringen gaat Samen voor.
- Evenementdetails: locatie, tijd, status, oorspronkelijke bron, controledatum, kijkmogelijkheid indien gecontroleerd. Geen verzonnen deelnemers of wedstrijdschema's. De dataset bevat voornamelijk overkoepelende toernooien; een volledige sessieagenda is nog niet aanwezig.
- Agenda-export: `.ics` met stabiele UID, UTC-tijd, correcte exclusieve einddatum bij meerdaagse evenementen en VALARM. Keuze uit 60/15 minuten, bij aanvang of een persoonlijk Nederlands tijdstip. Zonder starttijd alleen een persoonlijk tijdstip. Tijdalarm is de start van de sportsessie, niet van de voorbeschouwing. Een tijdgebonden gebeurtenis krijgt geen verzonnen eindtijd. Een geannuleerd evenement wordt niet geëxporteerd.
- Open het ICS-bestand met een agenda-app die import en VALARM ondersteunt. Sommige iOS-browseromgevingen bieden slechts een download/voorvertoning; gebruik dan Bestanden/delen of importeer via macOS Agenda. **Daadwerkelijke iOS-import en aflevering van een alarm zijn niet op een fysieke iPhone getest.** Het is een eenmalige export, geen automatisch bijgewerkt agenda-abonnement. Opnieuw importeren kan afhankelijk van de agenda-app duplicaten opleveren.
- Installeer via Safari > Deel > Zet op beginscherm. De serviceworker cachet na een succesvolle online sessie de app en bezochte assets; geen garantie bij de allereerste offline start of door het OS verwijderde caches. De hostingtoegangslaag kan offlinegebruik beperken.
- Lichte/donkere weergave, standaard systeemvoorkeur. Wissel via het maan/zon-icoon.
- Exporteer onder Sporten een JSON-back-up. Importeer om alle profielen te vervangen. Browseropslag synchroniseert niet en kan door wissen van websitegegevens verdwijnen. Geen v0.1-voorkeurenmigratie; de oude opslagstructuur wordt niet stilzwijgend ingelezen.

## Gegevens en grenzen

89 evenementen uit v0.1 blijven behouden, maar hun eerdere claim 'bevestigd' is vervangen door 'opnieuw controleren'. Oude ongevalideerde UFC-tijden worden niet als bevestigd aangeboden. Drie F1-sessies zijn handmatig nagekeken bij Formula 1 en Viaplay op 25-10-2026. Dit is **geen complete live tv-gids**. Het bruikbare ontwerp en de softwarefuncties zijn verder dan de dekking van de gegevens.

Eén werkende, toegestane automatische import: `node scripts/import-wikidata.mjs`. Haalt de expliciet gemapte editie Los Angeles 2028 op via Wikidata EntityData (CC0). We gebruiken geen logo's/afbeeldingen of tekst uit andere namespaces. De importer valideert entiteit, datumnauwkeurigheid, conflicten, rang en volgorde; bewaart ruwe data en revisie, werkt bestaande IDs bij en schrijft een wijzigingsrapport. Bij netwerk- of normalisatiefout blijft de centrale dataset intact. Verwijdering van een entiteit is **geen** bewijs van annulering en geeft daarom een fout. De importer bevestigt geen omroepen of sessietijden. Draaien gebeurt handmatig; er is geen scheduler op de hosting ingericht. Na import opnieuw testen, bouwen en publiceren. Voeg alleen gecontroleerde mappings toe. Wikidata is een secundaire bron met mogelijke fouten.

Zie `docs/SOURCES.md` voor het bronregister, `docs/ARCHITECTURE.md` voor uitbreidingen en `docs/VALIDATION.md` voor controlebevindingen.

## Kritieke tests

`npm test`: Amsterdamse zomer/wintertijd, de dubbele 02:30, onbestaande lokale tijd, 60/15/0-minuten VALARM, persoonlijk alarm, ICS-escaping en UTF-8-regelvouwing, meerdaagse grenzen, stabiele UIDs, geannuleerde events, ongeldige back-ups, importprecisie/conflicten, idempotentie en datumwijzigingen.

Webpush is onderzocht maar niet geïmplementeerd. Apple ondersteunt webpush vanaf iOS/iPadOS 16.4 voor geïnstalleerde beginschermapps, na een expliciete gebruikershandeling en toestemming. Nodig: Push API-subscripties, serviceworker-pushhandler, server/VAPID, beveiligde opslag en scheduler. Lokale timers bieden geen betrouwbare achtergrondmeldingen. Bron: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers en https://webkit.org/blog/13878/.

## Nieuw in 0.3 — 27 oktober 2026

Vandaag heeft een nieuwe visuele identiteit met een uitgelicht evenement (vandaag, anders een aankomende sessie), sportmotief, grote begintijd, tijdlijn en horizontale evenementkaarten. Geen fictieve evenementen of live-indicatoren toegevoegd.

Mijn kijkdiensten is bereikbaar bovenaan Vandaag, onder Sporten en bij evenementdetails. Selectie per profiel; geen automatische vereniging van kijkdiensten in Samen. Beschikbaarheid vergelijkt uitsluitend de bevestigde provider met de eigen selectie. Het is geen technische controle van abonnementen of pakketrechten. Zonder configuratie wordt niet aangenomen dat een dienst ontbreekt. Zonder bevestigde provider blijft de status onbekend. Filter Mijn kijkdiensten toont alleen matches; Kijkinfo volgt toont onbekende providers. Kijkdiensten zitten ook in de bestaande v2-back-up; oudere back-ups blijven geldig. Geen team-/sportervolgen of spoilerfuncties toegevoegd.

## KijkSport 0.4.0

Via **3 ontwerpen** (of `?ontwerp=keuze`) kun je drie volledige weergaven uitproberen. De gebruikelijke startpagina verandert pas na een keuze. De illustraties zijn schematisch en volgen de sport, geen getrouwe plattegronden van locaties.

Instellingen hebben één huishouden (back-up v3). V2-back-ups en lokale instellingen worden ingelezen: de sport- en competitiekeuzes van Samen blijven gelden, favorieten en kijkdiensten worden samengevoegd, en bij dubbele herinneringen gaat Samen voor.

OpenFootball stelt de [Eredivisiegegevens](https://github.com/openfootball/football.json/blob/master/2026-27/nl.1.json) beschikbaar onder zijn [publiekdomeinverklaring](https://github.com/openfootball/football.json#license). Ververs desgewenst handmatig met `node scripts/import-openfootball.mjs 2026-11-08 2026-12-06`. Dit levert wedstrijden en geplande tijden, geen uitzendrechten. De laatste drie F1-weekenden van 2026 zijn gecontroleerd aan de hand van de officiële racepagina's en de Nederlandse Viaplay-gids. De app haalt die pagina's niet automatisch op. Wikidata CC0 blijft bruikbaar voor aanvullende evenementdatums; Jolpica is vanwege de niet-commerciële gegevenslicentie niet ingebouwd.

## KijkSport 0.4.1

De evenementdetails bevatten een circuitverkenner voor zes F1-locaties. De bewegende markering volgt de geïmporteerde baanvorm; het is geen live telemetrie of rondesimulatie. Het weekeindtabblad toont uitsluitend sessies uit de kalender. De locatieverwijzing voor overige evenementen opent OpenStreetMap als er een plaatsnaam bekend is. De aftelklok gebruikt de geplande starttijd en maakt geen uitspraak over de actuele wedstrijdstatus.

Baanvormen: [Tomislav Bacinger](https://github.com/bacinger/f1-circuits), geprojecteerd naar lokale SVG-coördinaten; MIT-licentie meegeleverd in `public/licenses/f1-circuits.txt`. Circuitlengte en aantal raceronden worden alleen getoond waar gecontroleerd op de officiële racepagina van Formula 1.

## KijkSport 0.5.0

Regiekamer is nu de standaardweergave (`?ontwerp=classic` toont de oude stijl). Nieuw: sportkleur als sfeerlicht en tijdlijnrand op kaarten, een aftelklok met rustige puls, een bewegende markering op de F1-baanvorm (met de tekst dat het geen live positie is), tennisbal- en dartsbordbeweging in het uitgelichte evenement en zachte paginaovergangen. Alle beweging staat uit bij 'verminder beweging'. De gegevens zijn ongewijzigd; er zijn geen evenementen, tijden of zenders toegevoegd.

## KijkSport 0.6.0

Twee nieuwe ontwerpen naast Regiekamer: **Stadionnacht** (`?ontwerp=floodlight`; baan, veld en court in perspectief met zwaaiende lichtbundels) en **Parcours** (`?ontwerp=parcours`; sportkleur als vlak en een bewegende routebalk met de komende momenten, uit de kalender). De oude ontwerpen Sportatlas en Tribunekaart zijn vervangen. Nieuwe installaties tonen standaard alleen Formule 1, tennis, wielrennen en voetbal; de andere sporten blijven onder Sporten aan te zetten. Beweging staat uit bij 'verminder beweging'; de routebalk is dan scrollbaar. De gegevens zijn ongewijzigd.

## KijkSport 0.7.0

Parcours is opnieuw uitgewerkt: tekst op een eigen vlak zodat strepen en sportillustratie er niet doorheen lopen, schuivende snelheidsstrepen, baan of veld dat zichzelf tekent bij het openen, tekst die in beeld glijdt, kaarten die bij het scrollen binnenkomen (waar de browser dat ondersteunt) en een routebalk met stippellijn en pulserende waypoints die pauzeert bij aanwijzen. Alles staat stil bij 'verminder beweging'. Het circuit is nog steeds een illustratie zonder live positie.

## KijkSport 0.8.0

Parcours is nu het enige ontwerp. Regiekamer, Stadionnacht, de oude standaardstijl en de ontwerpkeuze (`?ontwerp=`) zijn verwijderd. Nieuwe installaties starten donker; de lichte weergave blijft beschikbaar.

- **Podium.** Het uitgelichte evenement krijgt een eigen animatievlak boven de tekst, met daaronder de toelichting en een pauzeknop. F1: een komeet over de echte baanvorm (Bacinger, MIT). Voetbal: een abstract passpatroon over een veld. Tennis: een rally over een baan, met ondergrond alleen voor Roland Garros (gravel), Wimbledon (gras), Australian Open, US Open, ATP Finals en ABN AMRO Open (hardcourt). Wielrennen: een weg in perspectief, met kasseien voor Parijs-Roubaix en de Ronde van Vlaanderen. Overige sporten: een tekenende illustratie. Elke scène zegt in het bijschrift dat het een illustratie is.
- **Aftelling** met rollende cijfers tot de geplande start; in het laatste uur verschijnt een rode vlag. Zegt niets over de actuele wedstrijdstatus.
- **Raceweekend** in het podium: de sessies uit de kalender als haltes. 'Geweest' betekent alleen: geplande start voorbij.
- **Route van vandaag.** Het dagprogramma als route met een nu-markering op basis van de klok van het apparaat. De afstand tussen haltes volgt de tijd ertussen. Verstreken starts zijn gedimd en gemarkeerd als 'geplande start voorbij', niet als afgelopen.
- **Verder op de route.** De volgende acht evenementen als startnummers in een horizontale rij.
- **Overgangen.** Paginawissels en het bladeren in de agenda gebruiken View Transitions waar de browser dat ondersteunt; de onderbalk heeft een meeschuivende markering; het detail opent als sheet.
- **Beweging en energie.** Het podium animeert alleen als het in beeld is; animaties gebruiken transform, opacity en stroke-dashoffset. Bij 'verminder beweging' staat alles stil en blijft alle informatie leesbaar.
- **Lettertype.** Big Shoulders Display (OFL 1.1, via Fontsource) zit in `src/fonts`; licentie in `public/licenses/big-shoulders-ofl.txt`. Geen externe verzoeken.
- De gegevens zijn ongewijzigd: geen evenementen, tijden of zenders toegevoegd.

Preview als één bestand bouwen: `PREVIEW=1 npx vite build` zet lettertypen inline.

## KijkSport 0.9.0

- **Vandaag en verder.** De startpagina heet nu zo. Het uitgelichte evenement begint met de informatie; de animatie staat als miniatuur rechts naast de starttijd. Tik erop voor het grote podium.
- **Circuitfeiten.** Voor de zes F1-circuits in de app: baanlengte, raceronden, raceafstand, eerste Grand Prix en ronderecord in de race (tijd, coureur, jaar). Bron: de racepagina's 2026 op formula1.com, gecontroleerd op 8 november 2026. Het ronderecord is de snelste ronde in een race, niet in de kwalificatie.
- **Start/finish, bochtnummers en sectoren.** Datamodel en weergave zijn klaar (`markers` in `src/circuits.json`: `startFinish`, `corners`, `sectors`, `reverse`, met verplichte `source` en `checked`). Ze zijn nog niet ingevuld: de bron van de baanvormen zegt niet waar de coördinaten beginnen of in welke rijrichting ze lopen. Invullen gebeurt na controle tegen de officiële baankaart. Tot die tijd is ook de rijrichting van de animatie niet gecontroleerd.
- **Nieuwe sporten.** Zwemmen, MotoGP en WEC, elk met een eigen illustratie (zwembad, bocht met kerbs, wijzerplaat met de raceduur). Bestaande installaties krijgen ze eenmalig aangezet; uitzetten kan onder Sporten.
  - MotoGP: Portimão en Valencia 2026 (bijgewerkte kalender via crash.net) en de 22 racezondagen van 2027 (motogp.com).
  - WEC: de negen racedagen van 2027 (fiawec.com), met raceduur waar de bron die geeft.
  - Zwemmen: WK 25 m Beijing, 1 tot 6 december 2026, en de zwemonderdelen van de WK Budapest, 10 tot 18 juli 2027 (worldaquatics.com).
- **Wanneer op tv.** Per gekozen sport de eerstvolgende uitzending met zender. Bij MotoGP (Ziggo Sport) en WEC (Eurosport) staat "rechtenhouder": de zender heeft de Nederlandse rechten van de serie, de uitzending per race is niet afzonderlijk gecontroleerd. Voor WEC wordt Nederland in de rechtenaankondiging niet apart genoemd; Ziggo noemt Eurosport en HBO Max voor Le Mans.
- Geen sessietijden voor de nieuwe sporten: die staan als "Begintijd volgt".

## KijkSport 0.10.0

- **Baankaarten.** Interlagos, Las Vegas, Lusail en Yas Marina hebben start/finish, rijrichting, drie sectoren en bochtnummers. Bron: baankaarten uit de F1-app (screenshots, 8 november 2026), automatisch over de baanvorm gelegd (draaiing, schaal, verschuiving; geen spiegeling nodig) en visueel gecontroleerd. De punten van deze vier banen beginnen nu bij start/finish en lopen in rijrichting, zodat de animatie de goede kant op rijdt. Las Vegas: bij bocht 1 tot 3 wijkt de open baanvorm af van de F1-kaart; die bochten staan er bij benadering. Mexico en Austin hebben nog geen markeringen.
- **Noorden boven, met kompas.** De baanvormen zijn noord-boven geprojecteerd. Gecontroleerd met Las Vegas: de Strip loopt noord-zuid en Koval Lane ligt oostelijk ervan, wat overeenkomt met onze weergave. De F1-kaarten staan níet consequent met het noorden boven: na uitlijnen zijn ze 61 tot 99 graden gedraaid (Las Vegas: noorden wijst in de F1-kaart naar links).
- **Witte baanstijl.** Witte baanranden, sectorlijn in het midden, witte bochtbolletjes die elkaar ontwijken, geblokte start/finish en een pijl voor de rijrichting.
- **Meerdere kijkdiensten.** Een evenement kan meerdere diensten hebben (`broadcast.alt`). Bij alle komende F1-evenementen staat F1 TV, door de gebruiker opgegeven; Viaplay blijft waar die in de tv-gids gecontroleerd is. De diensten die je zelf hebt geselecteerd staan vooraan; één eigen dienst is genoeg voor 'Past bij jouw kijkdiensten'.

## KijkSport 0.11.0

- **Baankaart met info ernaast.** Het detailvenster van elke F1-sessie (ook toekomstige races) en het grote podium tonen de nieuwe baankaart, met baanlengte, raceronden, raceafstand, eerste Grand Prix, aantal bochten en ronderecord rechts naast de kaart. Het oude baanvenster blijft alleen voor evenementen zonder eigen illustratie (link naar OpenStreetMap).
- **Ronderecord: wie en wanneer.** Aanwijzen met de muis, toetsenbordfocus, tikken of vasthouden toont coureur en jaar.
- **Darts, langebaan en shorttrack.** Standaard aan, ook eenmalig voor bestaande installaties. Eigen illustraties: dartbord met drie pijlen in de triple 20 en "180", een 400 meterbaan waarop de rijder elke ronde op het overgangsrecht van baan wisselt, en een shorttrackbaan met blokjes in de bochten.
- **Wist je dat.** Gecontroleerde feiten per sport met bron (`src/sportfacts.ts`), roterend in het uitgelichte evenement en volledig in het podium.
- **Kalenders en zenders.** Langebaan en shorttrack 2026/27 gecontroleerd tegen de ISU-kalenders (27 april 2026); NOS als rechtenhouder tot en met 2026/2027. PDC: Grand Slam of Darts (14 tot 22 november) en Players Championship Finals (27 tot 29 november) toegevoegd, WK-datums gecontroleerd; Viaplay als rechtenhouder tot 2032. Viaplay Nederland is in juli 2026 verkocht aan DPG Media (Videoland); abonnementen blijven voorlopig werken.
- De overige PDC-evenementen van 2027 (Premier League en verder) staan nog op 'opnieuw controleren'.
- Geen logo's van organisaties: die zijn beschermd beeldmerk.

## KijkSport 0.12.0

- Draait op GitHub Pages onder `/kijksport/`; alle paden (service worker, manifest, licenties) volgen de basismap (`BASE_PATH`).
- Offline: de service worker bewaart bij installatie de startpagina met scripts en stijlen, zodat de app zonder internet opent.
- Selectie delen via link of QR-code; de ontvanger bevestigt eerst. De link bevat alleen voorkeuren, geen persoonsgegevens.
- Oude back-ups met aparte profielen worden zonder vaste namen ingelezen.

## KijkSport 1.0.0 (proefversie, branch `speelveld`)

- Interface volledig opnieuw geschreven als ontwerp **Speelveld**: elke sport staat op zijn eigen ondergrond, van bovenaf getekend met de gangbare reglementaire belijning (veld, baan, bad, ijsbaan, dartbord, startopstelling).
- Tekst staat nooit over een tekening; het veld staat boven, de gegevens eronder.
- Circuits met baangegevens vullen het beeld, met bochtnummers, sectoren en kompas in het detailscherm. Motorsport zonder baankaart toont een startopstelling.
- Dagweergave is de standaard; avondweergave blijft beschikbaar. Beweging stopt bij 'verminder beweging', buiten beeld en via de knop.
- Gegevenslaag, kalender, kijkdiensten, delen, back-up en agenda-export zijn ongewijzigd. Lettertype: Bricolage Grotesque (OFL).

## KijkSport 1.1.0

- Ontwerp Speelveld is nu de app op GitHub Pages.
- Nieuwe sporten: rugby (Six Nations 2027 met alle vijftien wedstrijden, WK 2027) en hockey (EK 2027). Olympische Spelen gesplitst in Zomerspelen en Winterspelen. Voetbal heeft de keuzes EK, WK en Eredivisie.
- World Cup langebaan in Beijing: uitzendingen op NPO 1 uit de tv-gids toegevoegd (gecontroleerd op 13 november 2026). De ISU-kalender is opnieuw gecontroleerd.
- Rechtenhouders toegevoegd: ESPN voor de Eredivisie, Eurosport en HBO Max voor de Australian Open, Ziggo Sport voor de Six Nations.

## KijkSport 1.1.1

- Twee versies naast elkaar op GitHub Pages: Parcours (branch `parcours`) op `/kijksport/` en Speelveld (main) op `/kijksport/speelveld/`. Beide gebruiken de kalender uit main; elke versie heeft een eigen cache.
- Tekeningen aangevuld: atletiekbaan met lopers, hockeyveld met spelers.
- Wekelijkse controle: `docs/WEKELIJKSE-CONTROLE.md` beschrijft wat er elke maandag wordt nagekeken.
