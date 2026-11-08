# Validatie 25 oktober 2026

- TypeScript strict typecheck en Vite-productiebuild geslaagd.
- Negen Node-tests slagen: tijdzones, ICS, herinneringen, meerdaagse datums, validatie en import (zie tests/).
- Echte Wikidata-ophaling geslaagd: Q1451505, revisie 2553257301, 14–30 juli 2028. Geen datumwijziging tegenover de bestaande record. Rapport en ruwe response meegeleverd.
- Desktopbrowser: Vandaag visueel bekeken op circa 1360px. Uitgelicht evenement, Nederlandse tijd 21:00, Viaplay, filters en kaarten renderen. Native detaildialoog geopend; 15-minutenkeuze ingesteld en favoriet succesvol bewaard.
- De cloudbrowser liep vast bij wachten op de echte agenda-download; daaropvolgende browseraanroep gaf een protocoltimeout. De downloadactie en de gegenereerde kalenderinhoud zijn daarom niet end-to-end via die browser bevestigd. De pure ICS-generatie is wel geautomatiseerd getest.
- Mobiele CSS voor 390px, tablet en desktop is geïmplementeerd; daadwerkelijke mobiele schermcontrole en fysieke Safari/iPhone-agenda-import zijn niet voltooid wegens de browserblokkade. Geen screenshotbestand beschikbaar voor levering. qa.html bevat een lokale 390 × 844 iframe-controlepagina; deze zit niet in de productiebuild.
- Niet getest: echte iOS-alarmlevering, volledige offline-installatie achter de private hostingtoegang, schermlezer-audit. Push en synchronisatie zijn niet geïmplementeerd.

Dit is een bruikbare softwareversie met beperkte datadekking, geen volledig gevalideerde sportuitzendgids.

## Update 0.3 — 27 oktober 2026

13 geautomatiseerde tests slagen, inclusief vier nieuwe tests voor kijkdienstmatching, onbekende aanbieders, expliciete configuratie en oudere back-ups. Mobiele browsercontrole op 390 × 844 via lokale iframe: nieuwe Vandaag-weergave, dienstkeuze, Viaplay-match, filter Mijn kijkdiensten en behoud na herladen gecontroleerd. Screenshot in docs/mobile-v03.jpg. Dit is responsive Chromium, geen fysieke iPhone of native iOS-app. Het laag-niveau screenshotcommando met crop gaf een timeout; de normale screenshotroute werkte wel.
Desktopweergave aanvullend visueel gecontroleerd op circa 1360px; screenshot in docs/desktop-v03.jpg. Contrast van de beschikbaarheidsbadge in de uitgelichte kaart verbeterd na mobiele controle.
