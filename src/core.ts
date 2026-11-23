/** Waarop een kijkmogelijkheid berust: tv-gids per uitzending, uitzendrechten van de serie, of door de gebruiker opgegeven. */
export type Basis='gids'|'rechten'|'opgegeven';
export type Event = {id:string;sport:string;title:string;start:string;end:string;iso:string|null;source:string;desc:string;venue:string;highlight:boolean;tags:string[];status:'review'|'announced'|'date'|'time'|'changed'|'cancelled';checked:string|null;broadcast:{provider:string;url:string;checked:string;basis?:Basis;note?:string;alt?:{provider:string;url:string;basis?:Basis;note?:string}[]}|null;duration?:number|null;pool?:number;
 /** Nederlandse deelname, alleen ingevuld met bron en controledatum. */
 nl?:{text:string;source:string;label:string;checked:string};venueSource?:{url:string;label:string;checked:string};
 /** Datum van de laatste controle waarin tijd, zender of gegevens van dit evenement zijn gewijzigd of toegevoegd. */
 updated?:string;previous?:string};
export type Sport={id:string;name:string;icon:string;color:string;options:{id:string;name:string}[]};
export const zone='Europe/Amsterdam';
export const day=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export const addDays=(s:string,n:number)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
export const time=(iso:string)=>new Intl.DateTimeFormat('nl-NL',{timeZone:zone,hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
export const label=(s:string,opts:Intl.DateTimeFormatOptions={day:'numeric',month:'long'})=>new Intl.DateTimeFormat('nl-NL',{timeZone:zone,...opts}).format(new Date(s+'T12:00:00Z'));
export const occurs=(e:Event,s:string)=>e.start<=s&&e.end>=s;
export const sortEvents=(es:Event[])=>[...es].sort((a,b)=>a.start.localeCompare(b.start)||(a.iso||'z').localeCompare(b.iso||'z')||a.title.localeCompare(b.title));
export function amsterdamUTC(local:string){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(local))throw Error('Kies een geldig tijdstip.');
 local=local.slice(0,16);
 const target=Date.parse(local+'Z');let guess=target;
 const parts=(n:number)=>{const p=new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(n));return p.replace(' ','T')};
 for(let i=0;i<4;i++){const delta=target-Date.parse(parts(guess)+'Z');if(!delta)return new Date(guess).toISOString();guess+=delta}
 throw Error('Dit tijdstip bestaat niet door de overgang naar zomertijd.');
}
const esc=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=(s:string)=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
function fold(s:string){let result='',line='',bytes=0;for(const c of s){const size=new TextEncoder().encode(c).length;if(bytes+size>75){result+=line+'\r\n';line=' ';bytes=1}line+=c;bytes+=size}return result+line}
export type Reminder={mode:'none'|'60'|'15'|'0'|'custom';at?:string};
/** Duur van een sessie in uren voor de agenda. Uit de kalender als die er is, anders een ruwe schatting per soort sessie. */
export function duur(e:Pick<Event,'sport'|'tags'|'duration'>):{uren:number;geschat:boolean}{
 if(e.duration&&e.duration>0)return {uren:e.duration,geschat:false};
 const t=e.tags,s=e.sport;
 const uren=s==='f1'?(t.includes('race')?2:1):s==='motogp'?1:s==='football'||s==='rugby'||s==='hockey'?2:s==='darts'||s==='speed'||s==='short'?3:2;
 return {uren,geschat:true};
}
export function calendar(events:Event[],reminders:Record<string,Reminder>={},now=new Date()){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KijkSport//Sportagenda NL//NL','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 for(const e of events){if(e.status==='cancelled')continue;const r=reminders[e.id]||{mode:'none'};lines.push('BEGIN:VEVENT',`UID:${e.id}@sportkijk.local`,`DTSTAMP:${stamp(now.toISOString())}`,`SUMMARY:${esc(e.title)}`,`DESCRIPTION:${esc((e.broadcast?'Kijken via '+[e.broadcast.provider,...(e.broadcast.alt||[]).map(a=>a.provider)].join(' of ')+'. ':'Nederlandse uitzending nog niet bevestigd. ')+e.desc+(e.iso&&duur(e).geschat?'\nEindtijd in de agenda is geschat (ongeveer '+duur(e).uren+' uur).':'')+'\nBron: '+e.source+'\nControle: '+(e.checked||'opnieuw controleren'))}`,`URL:${e.source}`,`LOCATION:${esc(e.venue)}`);
 // Wedstrijd met begintijd: blok van begin tot (geschat) einde, zodat de agenda de tijd vrijhoudt.
 // Meerdaags of zonder tijd: een hele-dag-item over alle dagen, als 'vrij', zodat het geen dagen blokkeert.
 if(e.iso){const u=duur(e);lines.push('DTSTART:'+stamp(e.iso),'DTEND:'+stamp(new Date(Date.parse(e.iso)+u.uren*36e5).toISOString()),'TRANSP:OPAQUE')}
 else{lines.push('DTSTART;VALUE=DATE:'+e.start.replace(/-/g,''),'DTEND;VALUE=DATE:'+addDays(e.end,1).replace(/-/g,''),'TRANSP:TRANSPARENT')}
 if(r.mode!=='none'){if(r.mode==='custom'&&r.at){lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(e.title),'TRIGGER;VALUE=DATE-TIME:'+stamp(amsterdamUTC(r.at)),'END:VALARM')}else if(e.iso&&r.mode!=='custom'){lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(e.title),'TRIGGER:-PT'+r.mode+'M','END:VALARM')}}
 lines.push('END:VEVENT')}
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
export type Profile={services?:string[];servicesConfigured?:boolean;sports:string[];excluded:string[];favorites:string[];reminders:Record<string,Reminder>};
export type Settings={version:3;theme:'light'|'dark'|'system';preferences:Profile};
const serviceIds=['npo','viaplay','ziggo','espn','hbo','f1tv'];
export const defaultSports=['f1','tennis','cycling','football','swimming','motogp','wec','darts','speed','short','rugby','hockey'];
export function defaults(sports:Sport[]):Settings{return {version:3,theme:'dark',preferences:{sports:sports.filter(s=>defaultSports.includes(s.id)).map(s=>s.id),excluded:[],favorites:[],reminders:{}}}}
function validateProfile(p:Profile,sports:Sport[]):Profile {
 if(!p||!Array.isArray(p.sports)||p.sports.some(id=>!sports.some(t=>t.id===id))||!Array.isArray(p.excluded)||!p.excluded.every(i=>typeof i==='string')||!Array.isArray(p.favorites)||!p.favorites.every(i=>typeof i==='string')||!p.reminders||typeof p.reminders!=='object'||Array.isArray(p.reminders))throw Error('Ongeldige voorkeuren.');
 if(p.services!==undefined&&(!Array.isArray(p.services)||!p.services.every(i=>serviceIds.includes(i))))throw Error('Ongeldige kijkdiensten.');
 if(p.servicesConfigured!==undefined&&typeof p.servicesConfigured!=='boolean')throw Error('Ongeldige kijkdienstinstelling.');
 for(const r of Object.values(p.reminders)){if(!r||!['none','60','15','0','custom'].includes(r.mode))throw Error('Ongeldige herinnering.');if(r.mode==='custom')amsterdamUTC(r.at||'')}
 return p;
}
/** Leest een opgeslagen profiel per onderdeel. Wat onbekend of beschadigd is valt weg; de rest blijft staan. */
export function repairProfile(x:unknown,sports:Sport[]):{profile:Profile;dropped:string[]}{
 const p=x as Partial<Profile>|null,dropped:string[]=[];
 if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Dit is geen geldige KijkSport-back-up.');
 const strings=(v:unknown,naam:string)=>{if(v===undefined)return [];if(!Array.isArray(v)){dropped.push(naam);return []}const ok=v.filter((i):i is string=>typeof i==='string');if(ok.length<v.length)dropped.push(naam);return [...new Set(ok)]};
 const bekend=strings(p.sports,'sporten'),sportsOk=bekend.filter(id=>sports.some(t=>t.id===id));
 if(sportsOk.length<bekend.length)dropped.push('onbekende sport: '+bekend.filter(id=>!sportsOk.includes(id)).join(', '));
 const profile:Profile={sports:sportsOk,excluded:strings(p.excluded,'uitgesloten onderdelen'),favorites:strings(p.favorites,'kijklijst'),reminders:{}};
 if(p.services!==undefined){const sv=strings(p.services,'kijkdiensten');profile.services=sv.filter(i=>serviceIds.includes(i));if(profile.services.length<sv.length)dropped.push('onbekende kijkdienst')}
 if(typeof p.servicesConfigured==='boolean')profile.servicesConfigured=p.servicesConfigured;
 const r=p.reminders;
 if(r&&typeof r==='object'&&!Array.isArray(r)){for(const [id,v] of Object.entries(r)){const m=v as Reminder;try{if(!m||!['none','60','15','0','custom'].includes(m.mode))throw Error();if(m.mode==='custom')amsterdamUTC(m.at||'');profile.reminders[id]=m.mode==='custom'?{mode:'custom',at:m.at}:{mode:m.mode}}catch{dropped.push('herinnering bij '+id)}}}
 else if(r!==undefined)dropped.push('herinneringen');
 return {profile,dropped};
}
/** Zoals validateSettings, maar herstelt per onderdeel in plaats van alles te weigeren. Gooit alleen als er niets bruikbaars in staat. */
export function repairSettings(x:unknown,sports:Sport[]):{settings:Settings;dropped:string[]}{
 const s=x as {version?:number;theme?:string;preferences?:unknown;profiles?:Record<string,unknown>}|null;
 if(!s||typeof s!=='object')throw Error('Dit is geen geldige KijkSport-back-up.');
 const theme=(['light','dark','system'].includes(s.theme as string)?s.theme:'light') as Settings['theme'];
 if(s.version===2&&s.profiles&&typeof s.profiles==='object'){try{return {settings:validateSettings({...s,theme},sports),dropped:[]}}catch{const r=repairProfile(s.profiles.Samen,sports);return {settings:{version:3,theme,preferences:r.profile},dropped:r.dropped}}}
 const {profile,dropped}=repairProfile(s.preferences,sports);
 return {settings:{version:3,theme,preferences:profile},dropped};
}
export function validateSettings(x:unknown,sports:Sport[]):Settings{
 const s=x as {version:number;theme:Settings['theme'];preferences:Profile;profiles?:Record<string,Profile>};
 if(!s||!['light','dark','system'].includes(s.theme))throw Error('Dit is geen geldige KijkSport-back-up.');
 if(s.version===3)return {version:3,theme:s.theme,preferences:validateProfile(s.preferences,sports)};
 if(s.version!==2||!s.profiles)throw Error('Dit is geen geldige KijkSport-back-up.');
 // Oude back-ups hadden een profiel 'Samen' plus persoonlijke profielen. Het eerst genoemde persoonlijke profiel gaat voor
 // bij dubbele herinneringen, 'Samen' gaat altijd voor.
 const samen=validateProfile(s.profiles.Samen,sports);
 const persons=Object.keys(s.profiles).filter(n=>n!=='Samen').reverse().map(n=>validateProfile(s.profiles![n],sports));
 const profiles=[...persons,samen];
 return {version:3,theme:s.theme,preferences:{...samen,favorites:[...new Set(profiles.flatMap(p=>p.favorites))],reminders:Object.assign({},...profiles.map(p=>p.reminders)),services:[...new Set(profiles.flatMap(p=>p.services||[]))],servicesConfigured:profiles.some(p=>p.servicesConfigured)}};
}
