import type{Event}from'./core';
export const services=[{id:'npo',name:'NPO / NOS',note:'Vrij beschikbare uitzendingen',mark:'NPO',color:'#e74c3c'},{id:'viaplay',name:'Viaplay',note:'Selecteer als je toegang hebt',mark:'V',color:'#c83f88'},{id:'ziggo',name:'Ziggo Sport',note:'Afhankelijk van je tv-pakket',mark:'Z',color:'#ee781c'},{id:'espn',name:'ESPN',note:'Afhankelijk van je sportpakket',mark:'E',color:'#df3641'},{id:'hbo',name:'HBO Max / Eurosport',note:'Sporttoegang kan een extra optie zijn',mark:'H',color:'#5868db'},{id:'f1tv',name:'F1 TV',note:'Afhankelijk van je abonnementsvorm',mark:'F1',color:'#d84637'}];
export type Access='available'|'other'|'unknown'|'unset';
export const accessLabels:Record<Access,string>={available:'Past bij jouw kijkdiensten',other:'Andere kijkdienst nodig',unknown:'Kijkmogelijkheid nog onbekend',unset:'Kies je kijkdiensten'};
const names:Record<string,string>={'Viaplay':'viaplay','NOS':'npo','NPO 1':'npo','NPO 2':'npo','NPO 3':'npo','Ziggo Sport':'ziggo','ESPN':'espn','HBO Max':'hbo','Eurosport':'hbo','F1 TV':'f1tv'};
type Option={provider:string;url:string;basis?:string;note?:string};
/** Alle kijkmogelijkheden van een evenement: de hoofdzender plus eventuele alternatieven. */
export function viewingOptions(e:Event):Option[]{return e.broadcast?[e.broadcast,...(e.broadcast.alt||[])]:[]}
/** Leesbare regel, met de diensten die je zelf hebt geselecteerd vooraan. */
export function providerLine(e:Event,selected:string[]=[]):string{
 const o=viewingOptions(e).map(x=>({...x,mine:selected.includes(names[x.provider])}));
 return o.sort((a,b)=>Number(b.mine)-Number(a.mine)).map(x=>x.provider+(x.basis==='rechten'?' (rechtenhouder)':'')).join(' of ');
}
export function viewingAccess(e:Event,selected:string[],configured:boolean):Access{const o=viewingOptions(e);if(!o.length)return'unknown';if(!configured)return'unset';const ids=o.map(x=>names[x.provider]).filter(Boolean);if(!ids.length)return'unknown';return ids.some(id=>selected.includes(id))?'available':'other'}

export type TvRow={sport:string;next:Event|null;tv:Event|null};
/** Per sport: het eerstvolgende evenement en het eerstvolgende evenement met een opgenomen kijkmogelijkheid. */
/** Evenementen met een begintijd tellen niet meer mee zodra de geplande start voorbij is. */
export function tvPerSport(events:Event[],sports:string[],today:string,now=Date.now()):TvRow[]{
 const order=(a:Event,b:Event)=>a.start.localeCompare(b.start)||(a.iso||'').localeCompare(b.iso||'');
 return sports.map(sport=>{
  const up=events.filter(e=>e.sport===sport&&e.end>=today&&e.status!=='cancelled'&&!(e.iso&&Date.parse(e.iso)<=now)).sort(order);
  return {sport,next:up[0]||null,tv:up.find(e=>e.broadcast)||null};
 });
}
