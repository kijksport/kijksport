// Opslag van voorkeuren en kijklijst op dit toestel, met automatische reservekopieën.
// Regels: een beschadigd of onbekend onderdeel valt weg, de rest blijft staan; wat niet te lezen is wordt nooit overschreven
// zonder eerst een kopie te bewaren; en er staan altijd een paar eerdere standen klaar om terug te zetten.
// Parcours en Speelveld draaien op hetzelfde adres en delen deze opslag.
import {type Settings,type Sport,repairSettings} from './core.ts';

export const KEY='sportkijk-v2',RESERVE='kijksport-reserve',ONLEESBAAR='kijksport-onleesbaar';
/** Andere instellingen per toestel die met een reservekopie mee terugkomen. */
export const EXTRA=['kijksport-weergave','kijksport-vakken'];
const MAX=6;
export type Opslag=Pick<Storage,'getItem'|'setItem'>;
export type Reserve={datum:string;versie:string;settings:Settings;extra?:Record<string,string>};
export type Geladen={settings:Settings;status:'nieuw'|'ok'|'hersteld'|'teruggezet'|'onleesbaar';dropped:string[];reserve?:Reserve};

export function leesReserve(o:Opslag):Reserve[]{
 try{const l=JSON.parse(o.getItem(RESERVE)||'[]');return Array.isArray(l)?l.filter(r=>r&&typeof r.datum==='string'&&r.settings&&typeof r.settings==='object'):[]}catch{return []}
}
/** Bewaart wat er nu staat apart, zodat het na een mislukte lezing niet verloren gaat. */
function bewaarOrigineel(o:Opslag,raw:string){try{if(!o.getItem(ONLEESBAAR))o.setItem(ONLEESBAAR,raw)}catch{/* geen ruimte: de oorspronkelijke tekst blijft dan in elk geval onder KEY staan tot de eerste wijziging */}}
function zetExtraTerug(o:Opslag,r:Reserve,alleenLeeg:boolean){for(const [k,v] of Object.entries(r.extra||{}))if(EXTRA.includes(k)&&typeof v==='string'&&(!alleenLeeg||o.getItem(k)===null))try{o.setItem(k,v)}catch{/* overslaan */}}

/** Leest de voorkeuren. Valt pas terug op de standaard als er niets bruikbaars is, ook niet in een reservekopie. */
export function laad(o:Opslag,sports:Sport[],standaard:Settings):Geladen{
 let raw:string|null=null;try{raw=o.getItem(KEY)}catch{/* geen toegang tot opslag */}
 const vanReserve=(status:Geladen['status']):Geladen|null=>{for(const r of leesReserve(o)){try{const x=repairSettings(r.settings,sports);zetExtraTerug(o,r,true);return {settings:x.settings,status,dropped:x.dropped,reserve:r}}catch{/* volgende kopie */}}return null};
 if(raw===null)return vanReserve('teruggezet')||{settings:standaard,status:'nieuw',dropped:[]};
 try{const x=repairSettings(JSON.parse(raw),sports);if(x.dropped.length)bewaarOrigineel(o,raw);return {settings:x.settings,status:x.dropped.length?'hersteld':'ok',dropped:x.dropped}}
 catch{bewaarOrigineel(o,raw);return vanReserve('teruggezet')||{settings:standaard,status:'onleesbaar',dropped:[]}}
}

/** Schrijft de voorkeuren weg en houdt per dag en per appversie een reservekopie bij. Gooit als opslaan niet lukt. */
export function bewaar(o:Opslag,settings:Settings,versie:string,datum:string,nieuweKopie=false){
 o.setItem(KEY,JSON.stringify(settings));
 try{
  const lijst=leesReserve(o),laatste=lijst[0],extra:Record<string,string>={};
  for(const k of EXTRA){const v=o.getItem(k);if(v!==null)extra[k]=v}
  const nieuw:Reserve={datum,versie,settings,extra};
  if(laatste&&JSON.stringify(laatste.settings)===JSON.stringify(settings)&&JSON.stringify(laatste.extra||{})===JSON.stringify(extra))return;
  // Een lege kijklijst vervangt nooit een kopie waarin nog iets stond: die blijft als eerdere stand bewaard.
  const leeg=!!laatste&&(laatste.settings.preferences?.favorites?.length||0)>0&&settings.preferences.favorites.length===0;
  if(laatste&&laatste.datum===datum&&laatste.versie===versie&&!leeg&&!nieuweKopie)lijst[0]=nieuw;else lijst.unshift(nieuw);
  o.setItem(RESERVE,JSON.stringify(lijst.slice(0,MAX)));
 }catch{/* de voorkeuren zelf zijn opgeslagen; een reservekopie is een extraatje */}
}

/** Zet een reservekopie terug. De huidige stand komt bij het volgende opslaan zelf weer als kopie in de lijst. */
export function terugzetten(o:Opslag,r:Reserve,sports:Sport[]):Settings{
 const x=repairSettings(r.settings,sports);zetExtraTerug(o,r,false);return x.settings;
}
