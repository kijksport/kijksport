// Sportfeiten, elk met bron en controledatum. Alleen gecontroleerde feiten; aanvullen kan per sport.
export type Fact={text:string;source:string;label:string;checked:string};
const C='2026-11-08';
const wikiDarts={source:'https://en.wikipedia.org/wiki/Darts',label:'Wikipedia: Darts',checked:C};
const isuLanes={source:'https://isu-skating.com/speed-skating/news/explained-why-speed-skaters-switch-lanes/',label:'ISU',checked:C};
export const sportFacts:Record<string,Fact[]>={
 darts:[
  {text:'Luke Littler werd wereldkampioen 2026 door Gian van Veen in de finale met 7–1 te verslaan.',source:'https://en.wikipedia.org/wiki/2026_in_PDC',label:'Wikipedia: 2026 in PDC',checked:C},
  {text:'Met drie pijlen gooi je maximaal 180: alle drie in de triple 20.',...wikiDarts},
  {text:'De hoogste uitgooi is 170: twee keer triple 20 en de bull. Die heet ook wel de Big Fish.',...wikiDarts},
  {text:'Een leg van 501 in negen pijlen is de perfecte leg: de negendarter.',...wikiDarts},
  {text:'Het midden van de bull hangt 1,73 meter boven de vloer; de werplijn ligt 2,37 meter van het bord.',...wikiDarts},
 ],
 speed:[
  {text:'Een langebaan is 400 meter en heeft twee banen.',...isuLanes},
  {text:'Elke ronde wisselen de rijders van baan, altijd op het overgangsrecht. Zo legt iedereen precies dezelfde afstand af.',...isuLanes},
  {text:'Bij een botsing op het overgangsrecht heeft de rijder die van de buitenbaan naar de binnenbaan gaat voorrang.',...isuLanes},
 ],
 short:[
  {text:'Een shorttrackbaan is een ovaal van 111,12 meter, op een ijsvloer van 60 bij 30 meter.',source:'https://en.wikipedia.org/wiki/Short-track_speed_skating',label:'Wikipedia: Short-track speed skating',checked:C},
  {text:'Er rijden meestal vier tot zes schaatsers tegelijk in een rit.',source:'https://en.wikipedia.org/wiki/Short-track_speed_skating',label:'Wikipedia: Short-track speed skating',checked:C},
  {text:'Op 12 tot en met 14 februari 2027 staat er een World Tour-wedstrijd in Tilburg op de ISU-kalender.',source:'https://isu-skating.com/short-track/news/isu-short-track-event-calendar-202627/',label:'ISU-kalender 2026/27',checked:C},
 ],
};
