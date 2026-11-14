import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Bell,Bookmark,CalendarDays,Check,ChevronDown,ChevronLeft,Copy,ChevronRight,Download,ExternalLink,Info,Moon,Pause,Play,Search,Settings2,ShieldCheck,SlidersHorizontal,Sun,Tv,Upload,X} from 'lucide-react';
import QRCode from 'qrcode';
import '@fontsource-variable/bricolage-grotesque/wdth.css';
import raw from './data.json';
import packageInfo from '../package.json';
import {type Event,type Sport,type Settings,type Profile,type Reminder,day,addDays,time,label,occurs,sortEvents,calendar,defaults,validateSettings,amsterdamUTC} from './core';
import {services,viewingAccess,accessLabels,tvPerSport,providerLine,viewingOptions} from './viewing';
import {encodeSelection,decodeSelection,shareKey} from './share';
import {sportFacts} from './sportfacts';
import {km} from './circuit';
import {Veld,Hallijnen,vloer,plaat,circuitKey,circuits} from './velden';
import './app.css';

const sports=raw.sports as Sport[],events=raw.events as Event[];
const sportOf=(id:string)=>sports.find(s=>s.id===id)!;
const statuses={review:'Opnieuw controleren',announced:'Aangekondigd',date:'Datum bevestigd',time:'Begintijd bevestigd',changed:'Gewijzigd',cancelled:'Geannuleerd'};
const pages=[['Vandaag',Tv],['Agenda',CalendarDays],['Sporten',SlidersHorizontal],['Kijklijst',Bookmark]] as const;
type Page=typeof pages[number][0];
/** Weergave per toestel: bij welke sporten de baan of het veld in beeld komt, en of sportfeiten getoond worden. */
type Weergave={veld:Record<string,boolean>;feiten:boolean};
const motorsport=['f1','motogp','wec'];
const dagenTussen=(a:string,b:string)=>Math.round((Date.parse(b+'T12:00Z')-Date.parse(a+'T12:00Z'))/864e5);
const soorten=[{id:'motor',naam:'Motorsport',ids:['f1','motogp','wec']},{id:'bal',naam:'Balsport',ids:['football','tennis','rugby','hockey']},{id:'ijs',naam:'IJs en water',ids:['speed','short','swimming','winter']},{id:'overig',naam:'Overig',ids:['darts','cycling','olympics','athletics','gym','mma']}];
const cap=(t:string)=>t.charAt(0).toUpperCase()+t.slice(1);
const shareUrl=(p:Profile)=>location.origin+location.pathname+'#'+shareKey+'='+encodeSelection(p);
const kleur=(sport:string)=>({'--vloer':vloer(sport).vloer,'--inkt':vloer(sport).inkt,'--accent':vloer(sport).accent}) as React.CSSProperties;
const kort=(t:string)=>t.replace(/^(MotoGP|WEC) • /,'');
function download(name:string,body:string,type:string){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
/** Wisselt van scherm met een korte overgang waar de browser dat kan en de kijker beweging toestaat. */
function go(fn:()=>void){const d=document as Document&{startViewTransition?:(f:()=>void)=>unknown};if(!d.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches)fn();else d.startViewTransition(()=>flushSync(fn))}
function useNow(ms:number){const[now,setNow]=useState(Date.now);useEffect(()=>{const t=window.setInterval(()=>setNow(Date.now()),ms);return()=>clearInterval(t)},[ms]);return now}
function useRustig(){const q='(prefers-reduced-motion: reduce)';const[v,setV]=useState(()=>matchMedia(q).matches);useEffect(()=>{const m=matchMedia(q),f=()=>setV(m.matches);m.addEventListener('change',f);return()=>m.removeEventListener('change',f)},[]);return v}

/** Dagen en tijd van een evenement in gewone woorden. */
function wanneer(e:Event,today:string){
 if(e.start!==e.end)return (e.start<=today&&e.end>=today?'Deze dagen, t/m ':label(e.start,e.start.slice(0,7)===e.end.slice(0,7)?{day:'numeric'}:{day:'numeric',month:'short'})+' t/m ')+label(e.end,{day:'numeric',month:'short'});
 return e.start===today?'Vandaag':e.start===addDays(today,1)?'Morgen':cap(label(e.start,{weekday:'short',day:'numeric',month:'short'}));
}
function Aftellen({iso}:{iso:string}){
 const now=useNow(1000),left=Math.floor((Date.parse(iso)-now)/1000);
 if(left<=0)return <p className="aftellen voorbij">Geplande starttijd is voorbij</p>;
 const d=Math.floor(left/86400),h=Math.floor(left%86400/3600),m=Math.floor(left%3600/60),s=left%60,p=(n:number)=>String(n).padStart(2,'0');
 return <p className="aftellen" role="timer" aria-label={(d?d+(d===1?' dag, ':' dagen, '):'')+h+' uur en '+m+' minuten tot de geplande start'}><span aria-hidden="true">Start over </span><b aria-hidden="true">{d?d+' d ':''}{p(h)}:{p(m)}:{p(s)}</b></p>;
}
/** Inklapbaar blok op de pagina Vandaag. De stand (open of dicht) blijft per toestel bewaard. */
function Vak({id,titel,sub,dicht,children}:{id:string;titel:string;sub?:string;dicht?:boolean;children:React.ReactNode}){
 const key='kijksport-vakken',lees=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}') as Record<string,boolean>}catch{return {}}};
 const[open,setOpen]=useState(()=>{const v=lees()[id];return typeof v==='boolean'?v:!dicht});
 return <details className="vak" open={open} onToggle={e=>{const o=e.currentTarget.open;if(o===open)return;setOpen(o);try{localStorage.setItem(key,JSON.stringify({...lees(),[id]:o}))}catch{/* zonder opslag blijft de stand tot het sluiten van de app */}}}>
  <summary><h2>{titel}</h2>{sub&&<span>{sub}</span>}<ChevronDown size={20} aria-hidden="true"/></summary><div className="vak-inhoud">{children}</div></details>;
}
function Weetje({sport}:{sport:string}){
 const f=sportFacts[sport],[i,setI]=useState(0);if(!f?.length)return null;const x=f[i%f.length];
 return <div className="weetje"><p>{x.text}</p><div><a href={x.source} target="_blank" rel="noreferrer">Bron: {x.label}, gecontroleerd {label(x.checked,{day:'numeric',month:'short',year:'numeric'})}</a>{f.length>1&&<button onClick={()=>setI(i+1)}>Volgend feit</button>}</div></div>;
}
/** Baangegevens van een circuit, elk met bron en controledatum. */
function Baanfeiten({event}:{event:Event}){
 const key=circuitKey(event),c=key?circuits[key]:null;if(!c||!c.length)return null;
 return <div className="baan"><dl>
  <div><dt>Baanlengte</dt><dd>{km(c.length)}</dd></div>
  {c.laps&&<div><dt>Ronden</dt><dd>{c.laps}</dd></div>}
  {c.distance&&<div><dt>Raceafstand</dt><dd>{km(c.distance)}</dd></div>}
  {c.firstGp&&<div><dt>Eerste Grand Prix</dt><dd>{c.firstGp}</dd></div>}
  {c.record&&<div className="breed"><dt>Ronderecord</dt><dd>{c.record.time} <small>{c.record.driver}, {c.record.year}</small></dd></div>}
 </dl><p className="klein"><a href={c.statsSource} target="_blank" rel="noreferrer">Bron: formula1.com</a>{c.statsChecked&&', gecontroleerd '+label(c.statsChecked,{day:'numeric',month:'short',year:'numeric'})}. {c.markers?'Bochtnummers en sectoren: '+c.markers.source+(c.markers.note?' '+c.markers.note:''):'Voor deze baan zijn nog geen bochtnummers en sectoren opgenomen.'}</p></div>;
}
const sessieNaam=(t:string)=>{const m=t.match(/vrije training\s*(\d)/i);return m?'Training '+m[1]:/sprint/i.test(t)?'Sprint':/kwalificatie/i.test(t)?'Kwalificatie':'Race'};
const sessieCode=(t:string)=>{const m=t.match(/vrije training\s*(\d)/i);return m?'VT'+m[1]:/sprint/i.test(t)?'SPR':/kwalificatie/i.test(t)?'KWA':'RACE'};
function Weekend({event,list,now,onSelect}:{event:Event;list:Event[];now:number;onSelect:(e:Event)=>void}){
 const key=circuitKey(event);if(!key)return null;const ses=sortEvents(list.filter(e=>circuitKey(e)===key));if(ses.length<2)return null;
 return <div className="weekend"><h3>Raceweekend volgens de kalender</h3><ol>{ses.map(s=>{const past=!!s.iso&&Date.parse(s.iso)<now;return <li key={s.id}><button className={(past?'voorbij ':'')+(s.id===event.id?'deze':'')} onClick={()=>onSelect(s)} aria-label={s.title+', '+label(s.start,{weekday:'long'})+(s.iso?' '+time(s.iso):'')+(past?', geplande start voorbij':'')}><b>{sessieNaam(s.title)}</b><span>{label(s.start,{weekday:'short'})} {s.iso?time(s.iso):''}</span></button></li>})}</ol></div>;
}

function App(){
 const[settings,setSettings]=useState<Settings>(()=>{try{const x=localStorage.getItem('sportkijk-v2');return x?validateSettings(JSON.parse(x),sports):{...defaults(sports),theme:'light'}}catch{return {...defaults(sports),theme:'light'}}});
 const[page,setPage]=useState<Page>('Vandaag'),[date,setDate]=useState(day()),[view,setView]=useState('Week'),[search,setSearch]=useState(''),[sportFilter,setSportFilter]=useState('all'),[accessFilter,setAccessFilter]=useState('all');
 const[selected,setSelected]=useState<Event|null>(null),[info,setInfo]=useState(false),[serviceOpen,setServiceOpen]=useState(false),[incoming,setIncoming]=useState<Profile|null>(null);
 const[toast,setToast]=useState(''),[storageError,setStorageError]=useState(''),[qr,setQr]=useState(''),[kopie,setKopie]=useState(''),[infoOpen,setInfoOpen]=useState<string|null>(null),[weergave,setWeergave]=useState<Weergave>(()=>{try{const w=JSON.parse(localStorage.getItem('kijksport-weergave')||'{}');return {veld:w.veld&&typeof w.veld==='object'?w.veld:{},feiten:w.feiten!==false}}catch{return {veld:{},feiten:true}}}),[tvSoort,setTvSoort]=useState('all'),[tvPeriode,setTvPeriode]=useState('all'),[tvSort,setTvSort]=useState('datum'),[beweeg,setBeweeg]=useState(true);
 const dialog=useRef<HTMLDialogElement>(null),infoDialog=useRef<HTMLDialogElement>(null),serviceDialog=useRef<HTMLDialogElement>(null),importDialog=useRef<HTMLDialogElement>(null),upload=useRef<HTMLInputElement>(null);
 const rustig=useRustig(),now=useNow(30000);
 const p=settings.preferences,favorites=p.favorites,notify=setToast,play=beweeg&&!rustig;
 useEffect(()=>{try{localStorage.setItem('sportkijk-v2',JSON.stringify(settings));setStorageError('')}catch{setStorageError('Opslaan is niet gelukt. Exporteer je voorkeuren om ze te bewaren.')}},[settings]);
 useEffect(()=>{document.documentElement.dataset.theme=settings.theme;document.querySelector('meta[name=theme-color]')?.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())},[settings.theme]);
 // Eenmalig per toestel: nieuwe sporten aanzetten, en het nieuwe ontwerp bij daglicht tonen.
 useEffect(()=>{const once=(key:string,f:()=>void)=>{try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1')}catch{return}f()};const add=(ids:string[])=>setSettings(s=>({...s,preferences:{...s.preferences,sports:[...new Set([...s.preferences.sports,...ids])].filter(id=>sports.some(x=>x.id===id))}}));once('kijksport-sporten-0.9',()=>add(['swimming','motogp','wec']));once('kijksport-sporten-0.11',()=>add(['darts','speed','short']));once('kijksport-sporten-1.1',()=>add(['rugby','hockey','olympics','winter']));once('kijksport-speelveld',()=>setSettings(s=>({...s,theme:'light'})))},[]);
 // Gedeelde selectie uit een link: eerst vragen, dan pas overnemen.
 useEffect(()=>{const read=()=>{const m=location.hash.match(new RegExp('^#'+shareKey+'=([A-Za-z0-9_-]+)$'));if(!m)return;history.replaceState(null,'',location.pathname+location.search);ontvang(m[1],'Deze deellink bevat geen geldige selectie.')};read();window.addEventListener('hashchange',read);return()=>window.removeEventListener('hashchange',read)},[]);
 useEffect(()=>{const sync=(d:HTMLDialogElement|null,open:boolean)=>{if(!d)return;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close()};sync(dialog.current,!!selected);sync(infoDialog.current,info);sync(serviceDialog.current,serviceOpen);sync(importDialog.current,!!incoming)},[selected,info,serviceOpen,incoming]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t)}},[toast]);
 function ontvang(code:string,fout:string){const raw=code?decodeSelection(code):null;try{if(!raw)throw Error();setIncoming(validateSettings({version:3,theme:'dark',preferences:raw},sports).preferences);return true}catch{notify(fout);return false}}
 useEffect(()=>{try{localStorage.setItem('kijksport-weergave',JSON.stringify(weergave))}catch{/* zonder opslag geldt de keuze tot het sluiten van de app */}},[weergave]);
 const veldAan=(sport:string)=>weergave.veld[sport]??motorsport.includes(sport);
 const update=(f:(q:Profile)=>Profile)=>setSettings(s=>({...s,preferences:f(s.preferences)}));
 const favorite=(e:Event)=>update(q=>({...q,favorites:q.favorites.includes(e.id)?q.favorites.filter(i=>i!==e.id):[...q.favorites,e.id]}));
 const access=(e:Event)=>viewingAccess(e,p.services||[],!!p.servicesConfigured);
 const watch=(e:Event)=>providerLine(e,p.servicesConfigured?p.services||[]:[]);
 const badge=(e:Event,knop=false)=>knop&&access(e)==='unset'?<button className="toegang unset" onClick={()=>setServiceOpen(true)}>{accessLabels.unset}</button>:<span className={'toegang '+access(e)}>{accessLabels[access(e)]}</span>;
 const mine=sports.filter(s=>p.sports.includes(s.id));
 const filtered=sortEvents(events.filter(e=>(page!=='Vandaag'||accessFilter==='all'||access(e)===accessFilter)&&p.sports.includes(e.sport)&&(sportFilter==='all'||e.sport===sportFilter)&&!e.tags.some(t=>p.excluded.includes(e.sport+':'+t))&&(e.title+' '+e.venue+' '+sportOf(e.sport)?.name).toLowerCase().includes(search.toLowerCase())));
 const today=day(),todayEvents=filtered.filter(e=>occurs(e,today)).sort((a,b)=>(a.iso||'').localeCompare(b.iso||''));
 const soon=filtered.filter(e=>e.start>today).slice(0,10),onToday=todayEvents.filter(e=>e.status!=='cancelled');
 const hero=onToday.find(e=>e.highlight&&e.iso)||onToday.find(e=>e.iso&&Date.parse(e.iso)>now)||onToday.find(e=>e.iso&&e.broadcast)||onToday.find(e=>e.iso)||onToday[0]||filtered.find(e=>e.start>today&&e.iso&&e.broadcast&&e.status!=='cancelled')||soon[0];
 const upcomingToday=todayEvents.filter(e=>e.iso&&Date.parse(e.iso)>now&&e.status!=='cancelled');
 const summary=todayEvents.length?(todayEvents.length===1?'Eén sportmoment':todayEvents.length+' sportmomenten')+' vandaag.'+(upcomingToday[0]?' De volgende geplande start is om '+time(upcomingToday[0].iso!)+'.':todayEvents.some(e=>e.iso)?' Alle geplande starttijden van vandaag zijn voorbij.':''):'Vandaag staat er niets in jullie selectie.';
 const tvRows=tvPerSport(events.filter(e=>!e.tags.some(t=>p.excluded.includes(e.sport+':'+t))),mine.map(s=>s.id),today,now);
 const tvMoment=(e?:Event|null)=>e?(e.start<today?today:e.start)+'T'+(e.iso&&e.start>=today?new Date(e.iso).toISOString().slice(11,16):'00:00'):'9999';
 const tvSoorten=soorten.filter(g=>g.ids.some(id=>p.sports.includes(id)));
 const tvLijst=tvRows.map(r=>({...r,e:r.tv||r.next})).filter(r=>(tvSoort==='all'||soorten.find(g=>g.id===tvSoort)?.ids.includes(r.sport))&&(tvPeriode==='all'||(!!r.e&&r.e.start<=addDays(today,Number(tvPeriode))))).sort((x,y)=>tvSort==='sport'?sportOf(x.sport).name.localeCompare(sportOf(y.sport).name,'nl'):tvMoment(x.e).localeCompare(tvMoment(y.e)));
 const nav=(n:Page)=>go(()=>{setPage(n);setSearch('');setSportFilter('all');setAccessFilter('all');window.scrollTo(0,0)});
 function exportEvents(es:Event[]){if(!es.length){notify('Bewaar eerst een evenement in je kijklijst.');return}try{download('KijkSport.ics',calendar(es,p.reminders),'text/calendar;charset=utf-8');notify('Agenda gedownload. Open het bestand en voeg het toe aan je agenda.')}catch(e){notify((e as Error).message)}}
 const bewaar=(e:Event)=><button className={'bewaar'+(favorites.includes(e.id)?' aan':'')} aria-pressed={favorites.includes(e.id)} aria-label={(favorites.includes(e.id)?'Verwijder uit':'Bewaar in')+' kijklijst: '+e.title} onClick={()=>favorite(e)}><Bookmark size={20} fill={favorites.includes(e.id)?'currentColor':'none'}/></button>;
 // Zender als plaatje; bij alleen een rechtenhouder staat dat erbij.
 const zender=(e:Event)=>{if(e.status==='cancelled')return <span className="zender geen">Geannuleerd</span>;if(!e.broadcast)return <span className="zender geen">Kijkinfo volgt</span>;const w=watch(e);return <span className="zender"><b>{w.replace(' (rechtenhouder)','')}</b></span>};
 const opRechten=(e:Event)=>e.status!=='cancelled'&&!!e.broadcast&&watch(e).includes('(rechtenhouder)');
 const kinderen=(m:Event)=>m.start===m.end||m.iso?[]:sortEvents(events.filter(c=>c.id!==m.id&&c.sport===m.sport&&!!c.iso&&c.start>=m.start&&c.start<=m.end&&c.title.startsWith(m.title)));
 const dagNaam=(d:string)=>d===today?'vandaag':d===addDays(today,1)?'morgen':d<today?'geweest':label(d,{day:'numeric',month:'short'});
 // Wat we over een evenement weten, met bron. Wat niet is nagekeken staat er als zodanig.
 const infoBlok=(e:Event)=><dl className="g-info">
  <div><dt>Plaats</dt><dd>{e.venue||'Nog niet bekend'}</dd></div>
  <div><dt>Wanneer</dt><dd>{cap(label(e.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}{e.end!==e.start?' tot en met '+label(e.end,{weekday:'long',day:'numeric',month:'long'}):''}{e.iso?', '+time(e.iso)+' uur Nederlandse tijd':''}</dd></div>
  <div><dt>Nederlanders</dt><dd>{e.nl?<>{e.nl.text} <a href={e.nl.source} target="_blank" rel="noreferrer">Bron: {e.nl.label}</a>, gecontroleerd {label(e.nl.checked,{day:'numeric',month:'short'})}.</>:'Nog niet nagekeken voor dit evenement.'}</dd></div>
  {e.desc&&<div><dt>Goed om te weten</dt><dd>{e.desc}</dd></div>}
  <div><dt>Gegevens</dt><dd>{statuses[e.status]}. {e.checked?'Gecontroleerd op '+label(e.checked,{day:'numeric',month:'short',year:'numeric'})+'.':'Nog niet opnieuw gecontroleerd.'}</dd></div>
 </dl>;
 /** Eén evenement als tv-graphic: scorebalk bij een duel, bord bij een toernooi, tijdenbord bij uitzenddagen, aftelbalk bij een dag zonder tijd. */
 const rij=(e:Event,voorbij=false)=>{
  const t=kort(e.title),deel=t.split(' • '),duel=deel[deel.length-1].split(' – '),isDuel=duel.length===2&&!!e.iso,meerdaags=e.start!==e.end,kids=kinderen(e),over=dagenTussen(today,e.start);
  const body=isDuel?<><span className="bug"><b>{duel[0]}</b><em>{time(e.iso!)}</em><b>{duel[1]}</b></span><small>{wanneer(e,today)}{deel.length>1?', '+deel.slice(0,-1).join(' • '):''}</small></>
   :meerdaags?<><strong className="g-titel">{t}</strong>{(()=>{const n=dagenTussen(e.start,e.end)+1,nu=dagenTussen(e.start,today);return <span className="dagen" role="img" aria-label={over>0?'Begint over '+over+(over===1?' dag':' dagen')+', duurt '+n+' dagen':'Dag '+(nu+1)+' van '+n}>
      {n<=16?<span className="dagen-vakjes">{Array.from({length:n},(_,i)=><i key={i} className={over>0?'':i<nu?'was':i===nu?'nu':''}/>)}</span>:<span className="dagen-lijn"><i style={{width:over>0?'0%':Math.min(100,(nu+1)/n*100)+'%'}}/></span>}
      <span className="dagen-tekst"><span>{label(e.start,e.start.slice(0,7)===e.end.slice(0,7)?{day:'numeric'}:{day:'numeric',month:'short'})} t/m {label(e.end,{day:'numeric',month:'long'})}{e.venue?', '+e.venue:''}</span><em>{over>0?'over '+over+(over===1?' dag':' dagen'):'dag '+(nu+1)+' van '+n}</em></span></span>})()}
     {kids.length>0&&<span className="splits">{kids.slice(0,4).map(c=><span key={c.id} className={c.start<today||(c.start===today&&Date.parse(c.iso!)<now)?'was':c.start===today?'nu':''}><b>{label(c.start,{weekday:'short'})}</b><span>{time(c.iso!)}</span><em>{c.start===today&&Date.parse(c.iso!)<now?'vandaag geweest':dagNaam(c.start)}</em></span>)}</span>}</>
   :e.iso?<span className="tijdplaat"><em>{time(e.iso)}</em><span><strong>{t}</strong><small>{wanneer(e,today)}{e.venue?', '+e.venue:''}</small></span></span>
   :<><strong className="g-titel">{t}</strong><span className="togo"><span style={{right:Math.min(96,Math.max(0,over/180*100))+'%'}}/></span><span className="g-voet2"><b>{over>0?'Nog '+over+(over===1?' dag':' dagen'):'Vandaag, tijd volgt'}</b><small>{cap(label(e.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</small></span></>;
  return <article className={'g'+(voorbij?' voorbij':'')+(e.status==='cancelled'?' vervallen':'')} key={e.id} style={kleur(e.sport)}>
   <div className="g-kop"><span>{sportOf(e.sport).name}</span>{zender(e)}<button className="info-knop" aria-expanded={infoOpen===e.id} aria-label={'Meer over '+e.title} onClick={()=>setInfoOpen(infoOpen===e.id?null:e.id)}><Info size={19}/></button>{bewaar(e)}</div>
   <button className="g-open" onClick={()=>setSelected(e)} aria-label={'Bekijk details van '+e.title}>{body}
    {opRechten(e)&&<small className="g-recht">Zender volgens de uitzendrechten</small>}
    {(access(e)==='available'||access(e)==='other'||(p.reminders[e.id]?.mode&&p.reminders[e.id].mode!=='none'))&&<span className="g-extra">{(access(e)==='available'||access(e)==='other')&&badge(e)}{p.reminders[e.id]?.mode&&p.reminders[e.id].mode!=='none'&&<span className="herinnering"><Bell size={12}/>Herinnering in agenda-export</span>}</span>}</button>
   {infoOpen===e.id&&infoBlok(e)}</article>};
 // In een lijst staat een uitzenddag niet nog eens los als het toernooi zelf er al staat.
 const zonderKinderen=(es:Event[])=>{const weg=new Set(es.flatMap(m=>kinderen(m).map(c=>c.id)));return es.filter(e=>!weg.has(e.id))};
 const leeg=(text='Geen evenementen in deze selectie.')=><div className="leeg"><svg viewBox="0 0 400 300" aria-hidden="true"><Hallijnen/></svg><h3>{text}</h3><p>De kalender is een selectie, geen complete wedstrijdgids.</p><button className="knop" onClick={()=>nav('Sporten')}>Pas je sporten aan</button></div>;
 function shift(n:number){go(()=>{if(view==='Dag')setDate(addDays(date,n));else if(view==='Week')setDate(addDays(date,n*7));else{const d=new Date(date+'T12:00Z');if(view==='Jaar')d.setUTCFullYear(d.getUTCFullYear()+n);else d.setUTCMonth(d.getUTCMonth()+n,1);setDate(d.toISOString().slice(0,10))}})}
 const dateEvents=filtered.filter(e=>occurs(e,date)),weekStart=addDays(date,-((new Date(date+'T12:00Z').getUTCDay()+6)%7));
 const reminder:Reminder=selected?p.reminders[selected.id]||{mode:'none'}:{mode:'none'};
 function setReminder(r:Reminder){if(r.mode==='custom'&&r.at){try{amsterdamUTC(r.at)}catch(err){notify((err as Error).message);return}}if(selected)update(q=>({...q,reminders:{...q.reminders,[selected.id]:r}}))}
 const kop=(title:string,desc:string)=><header className="paginakop"><h1>{title}</h1><p>{desc}</p></header>;
 const tijdlijn=()=>{const heleDag=todayEvents.filter(e=>!e.iso),met=todayEvents.filter(e=>e.iso),i=zonderKinderen([...heleDag,...met]).filter(e=>e.iso).findIndex(e=>Date.parse(e.iso!)>now),nu=<p className="nu" key="nu"><b>Nu</b> {time(new Date(now).toISOString())}</p>;return <div className="lijst">{heleDag.map(e=>rij(e))}{zonderKinderen([...heleDag,...met]).filter(e=>e.iso).flatMap((e,k)=>[...(k===i&&(i>0||heleDag.length)?[nu]:[]),rij(e,i===-1||k<i)])}</div>};

 const tabs=(plek:string)=><nav className={'tabs '+plek} aria-label="Hoofdnavigatie">{pages.map(([n,Icon])=><button key={n} className={page===n?'actief':''} aria-current={page===n?'page':undefined} onClick={()=>nav(n)}><Icon size={21}/><span>{n}</span>{n==='Kijklijst'&&favorites.length>0&&<b>{favorites.length}</b>}</button>)}</nav>;
 return <div className="app">
 <header className="balk"><button className="merk" onClick={()=>nav('Vandaag')}><img src={import.meta.env.BASE_URL+'icon-192.png'} alt=""/>KijkSport</button>
  {tabs('boven')}
  <button className="rond" aria-label={settings.theme==='dark'?'Naar dagweergave':'Naar avondweergave'} onClick={()=>setSettings(s=>({...s,theme:s.theme==='dark'?'light':'dark'}))}>{settings.theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button></header>
 <main key={page}>{storageError&&<div role="alert" className="melding">{storageError}</div>}

 {page==='Vandaag'&&<>
  <header className="paginakop vandaag"><svg className="hallijnen" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><Hallijnen/></svg><h1>Vandaag en verder</h1><p><b>{cap(label(today,{weekday:'long',day:'numeric',month:'long'}))}.</b> {summary}</p></header>
  <Vak id="uit" titel="Uitgelicht" sub={hero?kort(hero.title)+(hero.iso?', '+time(hero.iso):''):undefined}>{hero?(()=>{const groot=veldAan(hero.sport),key=circuitKey(hero),ses=key?sortEvents(filtered.filter(e=>circuitKey(e)===key)):[],plaat=hero.iso?time(hero.iso):label(hero.start,{day:'numeric',month:'short'});
   const pauze=<button className="pauze" aria-pressed={!beweeg} aria-label={beweeg?'Zet beweging stil':'Laat bewegen'} onClick={()=>setBeweeg(!beweeg)}>{beweeg?<Pause size={14}/>:<Play size={14}/>}</button>;
   const onder=<><div className="tv-onder">{hero.iso&&hero.status!=='cancelled'?<Aftellen iso={hero.iso}/>:<p className="aftellen">{wanneer(hero,today)}</p>}<button className="knop vol" onClick={()=>setSelected(hero)}>Details</button>{bewaar(hero)}</div>
    {(hero.desc||access(hero)==='unset'||weergave.feiten||opRechten(hero))&&<div className="tv-meer">{opRechten(hero)&&<p>Zender volgens de uitzendrechten; de uitzending zelf is niet afzonderlijk gecontroleerd.</p>}{access(hero)==='unset'&&badge(hero,true)}{hero.desc&&<p>{hero.desc}</p>}{weergave.feiten&&<Weetje sport={hero.sport}/>}</div>}</>;
   const balk=<div className="tv-balk3"><span className="tv-tijd">{plaat}</span><span className="tv-naam"><b id="uit-titel">{kort(hero.title)}</b><small>{hero.start===hero.end?cap(label(hero.start,{weekday:'long',day:'numeric',month:'long'})):wanneer(hero,today)}{hero.iso?'':hero.start===hero.end?', tijd volgt':''}</small></span></div>;
   return groot&&ses.length>1?<section className="tv tv8" style={kleur(hero.sport)} aria-labelledby="uit-titel">
     <div className="tv8-kop"><span className="tv-bug">{sportOf(hero.sport).name}</span><b id="uit-titel">{circuits[key!].name}</b>{zender(hero)}</div>
     <div className="tv8-rij"><ol className="toren">{ses.map((x,i)=><li key={x.id}><button className={(x.id===hero.id?'deze ':'')+(x.iso&&Date.parse(x.iso)<now?'was':'')} onClick={()=>setSelected(x)} aria-label={x.title+', '+label(x.start,{weekday:'long'})+(x.iso?' '+time(x.iso):'')}><i>{i+1}</i><b>{sessieCode(x.title)}</b><span>{label(x.start,{weekday:'short'})}</span><em>{x.iso?time(x.iso):''}</em></button></li>)}</ol>
      <div className="tv8-veld"><button className="uit-open" onClick={()=>setSelected(hero)} aria-label={'Bekijk het circuit van '+hero.title}><Veld sport={hero.sport} event={hero} play={play} className="kaal"/></button>{pauze}</div></div>{onder}</section>
    :groot?<section className="tv tv7" style={kleur(hero.sport)} aria-labelledby="uit-titel">
     <div className="tv-beeld"><button className="uit-open" onClick={()=>setSelected(hero)} aria-label={'Bekijk details van '+hero.title}><Veld sport={hero.sport} event={hero} play={play}/></button><span className="tv-bug">{sportOf(hero.sport).name}</span>{zender(hero)}{pauze}</div>{balk}{onder}</section>
    :<section className="tv strak" style={kleur(hero.sport)} aria-labelledby="uit-titel"><div className="tv8-kop"><span className="tv-bug">{sportOf(hero.sport).name}</span><b/>{zender(hero)}</div>{balk}{onder}</section>})()
   :<section className="leeg"><svg viewBox="0 0 400 300" aria-hidden="true"><Hallijnen/></svg><h2>Nog geen sport in beeld.</h2><p>Er zijn geen evenementen voor jullie huidige selectie.</p><button className="knop vol" onClick={()=>nav('Sporten')}>Pas de selectie aan</button></section>}</Vak>
  <Vak id="vandaag" titel="Vandaag" sub={todayEvents.length===1?'1 sportmoment':todayEvents.length+' sportmomenten'}>
   <div className="filters"><div className="keuze" role="group" aria-label="Filter op kijkmogelijkheid">{[['all','Alles'],['available','Mijn kijkdiensten'],['unknown','Kijkinfo volgt']].map(([id,name])=><button key={id} aria-pressed={accessFilter===id} onClick={()=>{if(id==='available'&&!p.servicesConfigured)setServiceOpen(true);setAccessFilter(id)}}>{name}</button>)}</div>
   {mine.length>1&&<div className="chips" role="group" aria-label="Filter op sport"><button aria-pressed={sportFilter==='all'} onClick={()=>setSportFilter('all')}>Alle sporten</button>{mine.map(s=><button key={s.id} style={kleur(s.id)} aria-pressed={sportFilter===s.id} onClick={()=>setSportFilter(s.id)}><i/>{s.name}</button>)}</div>}</div>
   {todayEvents.length?tijdlijn():<p className="stil">Vandaag geen sport in deze selectie. Hieronder staat wat er verderop komt.</p>}
   <button className="tekstknop" onClick={()=>go(()=>{setPage('Agenda');setDate(today);setView('Dag');window.scrollTo(0,0)})}>Volledige agenda</button>
  </Vak>
  {soon.length>0&&(()=>{const na=zonderKinderen([...todayEvents,...soon]).filter(e=>e.start>today).slice(0,5);return na.length>0&&<Vak id="daarna" titel="Daarna" sub={'De volgende '+na.length+(na.length===1?' moment':' momenten')}><div className="lijst">{na.map(e=>rij(e))}</div></Vak>})()}
  <Vak id="tv" titel="Wanneer op tv" sub="Per sport het eerstvolgende moment" dicht>
   <div className="filters"><div className="chips" role="group" aria-label="Filter op soort sport"><button aria-pressed={tvSoort==='all'} onClick={()=>setTvSoort('all')}>Alle soorten</button>{tvSoorten.map(g=><button key={g.id} aria-pressed={tvSoort===g.id} onClick={()=>setTvSoort(g.id)}>{g.naam}</button>)}</div>
    <div className="tv-balk"><div className="keuze" role="group" aria-label="Filter op datum">{[['all','Alles'],['7','7 dagen'],['30','30 dagen']].map(([id,naam])=><button key={id} aria-pressed={tvPeriode===id} onClick={()=>setTvPeriode(id)}>{naam}</button>)}</div>
     <label className="sorteer">Volgorde<select value={tvSort} onChange={e=>setTvSort(e.target.value)}><option value="datum">Eerstvolgende eerst</option><option value="sport">Sport, A tot Z</option></select></label></div></div>
   {!tvLijst.length&&<p className="stil">Geen sport binnen dit filter. Kies een andere soort of een langere periode.</p>}
   <div className="tegels">{tvLijst.map(r=>{const e=r.e,s=sportOf(r.sport);return <button className="tegel" key={r.sport} style={kleur(r.sport)} disabled={!e} onClick={()=>e&&setSelected(e)}>{veldAan(r.sport)&&<Veld sport={r.sport} event={e} mini/>}<span className="tegel-tekst"><strong>{s.name}</strong>{e?<><span className="tegel-wanneer">{e.iso&&<b>{time(e.iso)}</b>}{wanneer(e,today)}</span><span>{kort(e.title)}</span><span className="tegel-zender">{r.tv?watch(r.tv):'Kijkinfo volgt'}</span></>:<span>Niets gepland in de kalender</span>}</span></button>})}</div>
   <p className="klein">Een zender met de toevoeging rechtenhouder betekent: deze zender heeft de Nederlandse uitzendrechten van de serie. De uitzending per wedstrijd is niet afzonderlijk gecontroleerd.</p></Vak>
  <button className="diensten" onClick={()=>setServiceOpen(true)}><span className="stapel">{(p.services||[]).slice(0,4).map(id=>{const v=services.find(v=>v.id===id)!;return <i key={id} style={{background:v.color}}>{v.mark}</i>})}{!p.services?.length&&<Settings2 size={22}/>}</span><span><b>{p.servicesConfigured?'Jullie kijkdiensten':'Waar kijken jullie?'}</b><small>{p.servicesConfigured?(p.services||[]).length+' geselecteerd. Wijzig je selectie.':'Kies je diensten, dan zie je wat binnen je abonnementen valt.'}</small></span></button>
  <p className="noot"><Info size={17}/><span>Een bewuste selectie, geen live tv-gids. Tijden zijn de geplande starttijden; ongecontroleerde gegevens zijn gemarkeerd. <button onClick={()=>setInfo(true)}>Over de bronnen</button></span></p>
 </>}

 {page==='Agenda'&&<>{kop('Agenda','Van de volgende wedstrijd tot het volgende olympische jaar.')}
  <div className="agenda-balk"><div className="keuze">{['Dag','Week','Maand','Jaar'].map(v=><button aria-pressed={view===v} key={v} onClick={()=>go(()=>setView(v))}>{v}</button>)}</div><button className="knop" onClick={()=>setDate(today)}>Vandaag</button></div>
  <div className="periode"><button className="rond" aria-label="Vorige periode" onClick={()=>shift(-1)}><ChevronLeft/></button><h2>{view==='Jaar'?date.slice(0,4):view==='Dag'?cap(label(date,{weekday:'long',day:'numeric',month:'long'})):cap(label(date,{month:'long',year:'numeric'}))}</h2><button className="rond" aria-label="Volgende periode" onClick={()=>shift(1)}><ChevronRight/></button></div>
  <div className="zoek"><label><Search size={18}/><input aria-label="Zoek evenementen" placeholder="Zoek een sport, evenement of locatie" value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Filter op sport" value={sportFilter} onChange={e=>setSportFilter(e.target.value)}><option value="all">Alle sporten</option>{sports.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
  {view==='Week'&&<div className="week">{Array.from({length:7},(_,i)=>addDays(weekStart,i)).map(d=>{const ids=[...new Set(filtered.filter(e=>occurs(e,d)).map(e=>e.sport))];return <button key={d} aria-pressed={date===d} className={today===d?'is-vandaag':''} onClick={()=>setDate(d)}><span>{label(d,{weekday:'short'})}</span><b>{Number(d.slice(-2))}</b><span className="stippen">{ids.slice(0,4).map(id=><i key={id} style={{background:vloer(id).accent}}/>)}</span></button>})}</div>}
  {view==='Maand'&&<div className="maand">{['ma','di','wo','do','vr','za','zo'].map(d=><span className="weekdag" key={d}>{d}</span>)}{Array.from({length:(new Date(date.slice(0,7)+'-01T12:00Z').getUTCDay()+6)%7},(_,i)=><span key={'b'+i}/>)}{Array.from({length:new Date(Number(date.slice(0,4)),Number(date.slice(5,7)),0).getDate()},(_,i)=>date.slice(0,7)+'-'+String(i+1).padStart(2,'0')).map(d=>{const es=filtered.filter(e=>occurs(e,d));return <button key={d} aria-pressed={date===d} className={today===d?'is-vandaag':''} aria-label={label(d)+', '+es.length+' evenementen'} onClick={()=>setDate(d)}><b>{Number(d.slice(-2))}</b><span className="stippen">{[...new Set(es.map(e=>e.sport))].slice(0,4).map(id=><i style={{background:vloer(id).accent}} key={id}/>)}</span></button>})}</div>}
  {view==='Jaar'?<div className="jaar">{Array.from({length:12},(_,i)=>date.slice(0,4)+'-'+String(i+1).padStart(2,'0')).map(m=>{const es=filtered.filter(e=>e.start<=m+'-31'&&e.end>=m+'-01');return <section key={m}><button className="jaar-maand" onClick={()=>{setDate(m+'-01');setView('Maand')}}>{cap(label(m+'-01',{month:'long'}))}</button>{es.length?es.slice(0,5).map(e=><button className="jaar-item" key={e.id} style={kleur(e.sport)} onClick={()=>setSelected(e)}><small>{label(e.start,{day:'numeric',month:'short'})}</small><span>{kort(e.title)}</span></button>):<p className="klein">Nog geen evenementen opgenomen</p>}{es.length>5&&<button className="tekstknop" onClick={()=>{setDate(m+'-01');setView('Maand')}}>En nog {es.length-5}</button>}</section>})}</div>
  :<><div className="sectiekop"><h2>{cap(label(date,{weekday:'long',day:'numeric',month:'long'}))}</h2><span>{dateEvents.length===1?'1 evenement':dateEvents.length+' evenementen'}</span></div><div className="lijst">{dateEvents.length?zonderKinderen(dateEvents).map(e=>rij(e)):leeg()}</div></>}
  <p className="noot"><Info size={17}/><span>Alle tijden in Nederland. Toernooien zonder sessietijden staan als meerdaags evenement in de agenda.</span></p></>}

 {page==='Sporten'&&<>{kop('Sporten','Kies je sporten en competities, en hoeveel je per sport wilt zien.')}
  <section className="paneel" aria-labelledby="weergave-titel"><h3 id="weergave-titel">Weergave</h3><p>Per sport kies je hieronder of het circuit, de baan of het veld in beeld komt. Uit geeft een strakke weergave met alleen tijd, titel en zender. Deze keuzes gelden voor dit toestel en gaan niet mee met een gedeelde selectie.</p>
   <label className="sport-veld breed"><span><b>Sportfeiten tonen</b><small>Korte feiten met bron bij Uitgelicht en bij de details.</small></span><button role="switch" aria-checked={weergave.feiten} aria-label="Sportfeiten tonen" className="schakel" onClick={()=>setWeergave(w=>({...w,feiten:!w.feiten}))}><span/></button></label></section>
  <button className="diensten" onClick={()=>setServiceOpen(true)}><span className="stapel"><Settings2 size={22}/></span><span><b>Mijn kijkdiensten</b><small>{p.servicesConfigured?(p.services||[]).length+' geselecteerd':'Geef aan waar je toegang toe hebt'}</small></span></button>
  <div className="sportkeuze">{sports.map(s=>{const aan=p.sports.includes(s.id);return <section className={'sport'+(aan?' aan':'')} key={s.id} style={kleur(s.id)}>{veldAan(s.id)?<Veld sport={s.id} mini/>:<div className="sport-streep"/>}<div className="sport-kop"><h3>{s.name}</h3><button role="switch" aria-checked={aan} aria-label={s.name+' aan of uit'} className="schakel" onClick={()=>update(q=>({...q,sports:aan?q.sports.filter(i=>i!==s.id):[...q.sports,s.id]}))}><span/></button></div><div className="sport-opties">{s.options.map(o=><label key={o.id}><input type="checkbox" disabled={!aan} checked={!p.excluded.includes(s.id+':'+o.id)} onChange={()=>update(q=>({...q,excluded:q.excluded.includes(s.id+':'+o.id)?q.excluded.filter(i=>i!==s.id+':'+o.id):[...q.excluded,s.id+':'+o.id]}))}/>{o.name}</label>)}</div><label className="sport-veld"><span>{motorsport.includes(s.id)?'Circuit en baangegevens tonen':'Veld of baan tonen'}</span><button role="switch" aria-checked={veldAan(s.id)} disabled={!aan} aria-label={s.name+': baan of veld tonen'} className="schakel klein" onClick={()=>setWeergave(w=>({...w,veld:{...w.veld,[s.id]:!veldAan(s.id)}}))}><span/></button></label></section>})}</div>
  <section className="paneel" aria-labelledby="deel-titel"><h3 id="deel-titel">Samen dezelfde selectie</h3><p>Deel jullie sporten, kijkdiensten, kijklijst en herinneringen met een tweede telefoon. Die krijgt eerst de vraag of de selectie mag worden overgenomen. Na latere wijzigingen deel je opnieuw.</p>
   <div className="acties"><button className="knop vol" onClick={async()=>{const url=shareUrl(p);try{if(navigator.share){await navigator.share({url});return}await navigator.clipboard.writeText(url);notify('Deellink gekopieerd.')}catch(err){if((err as Error).name!=='AbortError')notify('Delen lukte niet. Gebruik Kopieer link of de QR-code.')}}}><Upload size={17}/>Deel selectie</button><button className="knop" onClick={async()=>{const url=shareUrl(p);try{await navigator.clipboard.writeText(url);setKopie('');notify('Deellink gekopieerd. Plak hem in een bericht of in de andere app.')}catch{setKopie(url)}}}><Copy size={17}/>Kopieer link</button><button className="knop" onClick={async()=>setQr(qr?'':await QRCode.toString(shareUrl(p),{type:'svg',margin:1,errorCorrectionLevel:'M'}))}>{qr?'Verberg QR-code':'Toon QR-code'}</button></div>
   <form className="plak" onSubmit={e=>{e.preventDefault();const f=e.currentTarget,v=(new FormData(f).get('link')||'').toString().trim();const m=v.match(new RegExp('#'+shareKey+'=([A-Za-z0-9_-]+)'));if(ontvang(m?m[1]:v.replace(/\s+/g,''),'Dit is geen geldige deellink. Kopieer de hele link en probeer het opnieuw.'))f.reset()}}><label htmlFor="deellink">Deellink ontvangen</label><div><input id="deellink" name="link" type="text" inputMode="url" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-describedby="deelhulp"/><button className="knop" type="submit">Overnemen</button></div><small id="deelhulp">Plak de link hier. Staat er tekst omheen, dan haalt de app de link eruit.</small></form>
   {kopie&&<label className="kopie">Kopiëren lukte niet automatisch. Houd de link vast en kies Kopieer.<input readOnly value={kopie} onFocus={e=>e.currentTarget.select()}/></label>}
   {qr&&<figure className="qr"><div dangerouslySetInnerHTML={{__html:qr}}/><figcaption>Scan met de camera van de andere telefoon.</figcaption></figure>}</section>
  <section className="paneel"><h3>Jouw gegevens blijven van jou</h3><p>Voorkeuren staan alleen in deze browser. Bewaar een back-up voor een ander apparaat of na het wissen van websitegegevens.</p><div className="acties"><button className="knop" onClick={()=>download('KijkSport-backup.json',JSON.stringify(settings,null,2),'application/json')}><Download size={17}/>Exporteer</button><button className="knop" onClick={()=>upload.current?.click()}><Upload size={17}/>Importeer</button><input hidden ref={upload} type="file" accept="application/json,.json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1e6)throw Error('Dit bestand is te groot.');setSettings(validateSettings(JSON.parse(await f.text()),sports));notify('Back-up ingelezen; je voorkeuren zijn hersteld.')}catch(err){notify((err as Error).message)}e.target.value=''}}/></div></section></>}

 {page==='Kijklijst'&&<>{kop('Kijklijst','Bewaar je sportmomenten en neem ze mee naar je eigen agenda.')}
  <div className="paneel rijtje"><p><b>{favorites.length===1?'1 bewaard evenement':favorites.length+' bewaarde evenementen'}</b><br/>Jullie gezamenlijke kijklijst</p><button className="knop vol" onClick={()=>exportEvents(sortEvents(events.filter(e=>favorites.includes(e.id))))}><Download size={17}/>Naar agenda</button></div>
  <div className="lijst">{favorites.length?sortEvents(events.filter(e=>favorites.includes(e.id))).map(e=>rij(e)):leeg('Nog niets op jullie kijklijst.')}</div>
  <p className="noot"><Bell size={17}/><span>Herinneringen werken via agenda-export. Stel ze in bij een evenement. Webpush is nog niet beschikbaar; er worden geen achtergrondmeldingen vanuit deze app verstuurd.</span></p></>}

 <footer><span>KijkSport <span aria-label={'Versie '+packageInfo.version}>v{packageInfo.version}</span></span><button className="tekstknop" onClick={()=>setInfo(true)}><ShieldCheck size={15}/>Bronnen en gegevens</button></footer></main>

 <dialog ref={dialog} className="blad" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null)}}>{selected&&<div style={kleur(selected.sport)}>
  {veldAan(selected.sport)?<div className={'blad-veld'+(circuitKey(selected)?' circuit':'')}><Veld sport={selected.sport} event={selected} play={play} detail/><button className="rond sluit" aria-label="Sluit evenement" onClick={()=>setSelected(null)}><X/></button></div>:<div className="blad-zonder"><button className="rond sluit" aria-label="Sluit evenement" onClick={()=>setSelected(null)}><X/></button></div>}
  <div className="blad-kop"><p>{sportOf(selected.sport).name}</p><h2>{kort(selected.title)}</h2><p>{selected.venue||'Locatie nog niet bekend'}</p></div>
  <div className="blad-inhoud">
   {veldAan(selected.sport)&&<p className="klein">Tekening: {plaat(selected.sport,selected)}.</p>}
   <div className="uit-tijd">{selected.iso&&<b>{time(selected.iso)}</b>}<span>{cap(label(selected.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}{selected.end!==selected.start?' tot en met '+label(selected.end):''}<small>{selected.iso?'Nederlandse tijd (Europe/Amsterdam)':'Exacte begintijd nog niet bevestigd'}</small></span></div>
   {selected.iso&&selected.status!=='cancelled'&&<Aftellen iso={selected.iso}/>}
   <Weekend event={selected} list={filtered} now={now} onSelect={setSelected}/>
   {veldAan(selected.sport)&&<Baanfeiten event={selected}/>}
   <section className="kijken"><h3>Kijken in Nederland</h3><p className="uit-kijk"><Tv size={18}/><span>{selected.broadcast?watch(selected):'Uitzending nog niet bevestigd'}</span></p>{badge(selected,true)}
    {selected.broadcast?<ul>{viewingOptions(selected).map(o=><li key={o.provider}><b>{o.provider}</b><span>{o.note||(o.basis==='rechten'?'Rechtenhouder in Nederland; uitzending per wedstrijd niet afzonderlijk gecontroleerd.':o.basis==='opgegeven'?'Door jullie zelf opgegeven.':'Kijkdienst bevestigd in de tv-gids; de tijd hierboven is de start van de sportsessie.')}</span><a href={o.url} target="_blank" rel="noreferrer">Naar {o.provider}<ExternalLink size={14}/></a></li>)}</ul>:<p>Er is nog geen gecontroleerde Nederlandse zender of streamingdienst opgenomen.</p>}
    <button className="tekstknop" onClick={()=>setServiceOpen(true)}>Wijzig mijn kijkdiensten</button></section>
   <p>{selected.desc||'Wedstrijdschema en deelnemers zijn nog niet opgenomen. Open de officiële bron voor meer informatie.'}</p>
   {selected.nl&&<p><b>Nederlanders.</b> {selected.nl.text} <a href={selected.nl.source} target="_blank" rel="noreferrer">Bron: {selected.nl.label}</a>, gecontroleerd {label(selected.nl.checked,{day:'numeric',month:'short'})}.</p>}
   {weergave.feiten&&<Weetje sport={selected.sport}/>}
   <p className="status"><span className={selected.status==='review'?'':'ok'}>{statuses[selected.status]}</span>Laatst gecontroleerd: {selected.checked?label(selected.checked,{day:'numeric',month:'short',year:'numeric'}):'nog niet opnieuw gevalideerd'}</p>
   <a className="bron" href={selected.source} target="_blank" rel="noreferrer"><ShieldCheck size={18}/>Bekijk de oorspronkelijke bron<ExternalLink size={15}/></a>
   <div className="herinner"><label htmlFor="herinner"><Bell size={18}/>Herinner mij via mijn agenda</label><select id="herinner" value={reminder.mode} onChange={e=>setReminder({mode:e.target.value as Reminder['mode'],...(e.target.value==='custom'?{at:selected.start+'T12:00'}:{})})}><option value="none">Geen herinnering</option>{selected.iso&&<><option value="60">60 minuten vooraf</option><option value="15">15 minuten vooraf</option><option value="0">Bij aanvang</option></>}<option value="custom">Kies zelf een tijdstip</option></select>{!selected.iso&&<small>Een relatieve herinnering kan zodra de begintijd bevestigd is.</small>}{reminder.mode==='custom'&&<label className="eigen">Nederlandse datum en tijd<input type="datetime-local" value={reminder.at||''} onChange={e=>setReminder({mode:'custom',at:e.target.value})}/></label>}<small>Exporteer na wijzigingen opnieuw. Je agenda-app bepaalt of en hoe de melding verschijnt.</small></div>
   <div className="acties"><button className="knop" onClick={()=>favorite(selected)}><Bookmark size={18} fill={favorites.includes(selected.id)?'currentColor':'none'}/>{favorites.includes(selected.id)?'Op kijklijst':'Bewaar'}</button><button className="knop vol" onClick={()=>exportEvents([selected])}><Download size={17}/>Zet in agenda</button></div>
  </div></div>}</dialog>

 <dialog ref={serviceDialog} className="blad smal" onCancel={()=>setServiceOpen(false)}><div className="blad-inhoud"><div className="blad-top"><h2>Waar kijk jij?</h2><button className="rond" aria-label="Sluit kijkdiensten" onClick={()=>setServiceOpen(false)}><X/></button></div><p>Selecteer de diensten waar jullie toegang toe hebben. Je kunt dit altijd aanpassen.</p>
  <div className="dienstlijst">{services.map(v=><label key={v.id}><i style={{background:v.color}}>{v.mark}</i><span><b>{v.name}</b><small>{v.note}</small></span><input type="checkbox" checked={(p.services||[]).includes(v.id)} onChange={()=>update(q=>({...q,services:(q.services||[]).includes(v.id)?q.services!.filter(id=>id!==v.id):[...(q.services||[]),v.id]}))}/></label>)}</div>
  <p className="klein">We koppelen geen accounts en controleren je abonnement niet. Een pakket of sportoptie kan nodig zijn. Alleen bevestigde kijkinformatie wordt met je selectie vergeleken.</p>
  <button className="knop vol" onClick={()=>{update(q=>({...q,servicesConfigured:true}));setServiceOpen(false);notify('Kijkdiensten opgeslagen')}}><Check size={18}/>Sla kijkdiensten op</button></div></dialog>

 <dialog ref={infoDialog} className="blad smal" onCancel={()=>setInfo(false)}><div className="blad-inhoud"><div className="blad-top"><h2>Over de gegevens</h2><button className="rond" aria-label="Sluit bronnen" onClick={()=>setInfo(false)}><X/></button></div><p>Versie {packageInfo.version}</p>
  <p>KijkSport bevat {events.length} evenementen. Het grootste deel moet opnieuw worden gecontroleerd; bij elk evenement staat de status en de laatste controledatum. De kalender wordt niet automatisch bijgewerkt. Er is geen volledige live tv-gids.</p>
  <h3>Wat betekent de status?</h3><p>Aangekondigd, datum bevestigd en begintijd bevestigd zijn afzonderlijke stappen. Een bevestigde kijkmogelijkheid staat los van de sessietijd. Gewijzigde of geannuleerde evenementen moeten bij een volgende import expliciet worden verwerkt.</p>
  <h3>De tekeningen</h3><p>Velden, banen en het bord zijn getekend met de gangbare reglementaire maten. Ze laten de sport zien, niet het stadion van die dag. Circuits komen uit openbare baangegevens en staan met het noorden boven; bij motorsport zonder baankaart staat een startopstelling.</p>
  <h3>Bronnen en hergebruik</h3><p>Officiële bonden en organisatoren zijn de voorkeursbron voor controle. Links staan bij ieder evenement. Voor hun complete kalenders is geen automatische hergebruiktoestemming vastgesteld: scraping staat uit.</p><p>Wikidata biedt gestructureerde gegevens onder CC0. Het is een aanvullende, door vrijwilligers beheerde bron, geen officiële wedstrijdfeed. De Eredivisie komt uit OpenFootball (publiek domein); uitzendingen daarvan zijn nog niet gecontroleerd.</p>
  <p><a href="https://www.wikidata.org/wiki/Wikidata:Licensing" target="_blank" rel="noreferrer">Wikidata-licentie</a> · <a href="https://github.com/openfootball/football.json#license" target="_blank" rel="noreferrer">OpenFootball</a> · <a href="https://github.com/bacinger/f1-circuits" target="_blank" rel="noreferrer">Baanvormen (MIT)</a></p>
  <h3>Privacy en herinneringen</h3><p>Geen trackers, advertenties of accounts in de app. Voorkeuren en de kijklijst staan lokaal; exporteer regelmatig een back-up. Hosting kan technisch noodzakelijke toegangsgegevens verwerken. Pushmeldingen en synchronisatie zijn niet gebouwd. Agenda-export is een eenmalig bestand en werkt niet automatisch bij.</p>
  <button className="knop vol" onClick={()=>setInfo(false)}>Sluit</button></div></dialog>

 <dialog ref={importDialog} className="blad smal" onCancel={()=>setIncoming(null)}>{incoming&&<div className="blad-inhoud"><div className="blad-top"><h2>Selectie overnemen?</h2><button className="rond" aria-label="Sluit" onClick={()=>setIncoming(null)}><X/></button></div><p>Deze link bevat {incoming.sports.length} sporten, {(incoming.services||[]).length} kijkdiensten, {incoming.favorites.length} evenementen op de kijklijst en {Object.keys(incoming.reminders).length} herinneringen. Overnemen vervangt de selectie op dit toestel.</p><div className="acties"><button className="knop" onClick={()=>setIncoming(null)}>Niet nu</button><button className="knop vol" onClick={()=>{setSettings(s=>({...s,preferences:incoming}));setIncoming(null);notify('Selectie overgenomen.')}}><Check size={17}/>Neem selectie over</button></div></div>}</dialog>
 {tabs('onder')}
 {toast&&<div className="toast" role="status"><Check size={18}/>{toast}</div>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL}).catch(()=>{}));
