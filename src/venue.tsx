import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,Clock3,MapPin,Pause,Play} from 'lucide-react';
import {type Event,label,time,sortEvents} from './core';
import circuits from './circuits.json';
type Circuit={name:string;location:string;source:string;statsSource:string;points:number[][];lat:number;lon:number;length?:string;laps?:string};
const venues:Record<string,Circuit>=circuits;
const aliases:[RegExp,string][]=[[/^lv26-/,'las-vegas'],[/^qa26-/,'qatar'],[/^ad26-/,'united-arab-emirates'],[/^br26/,'brazil'],[/^mx(?:q)?26/,'mexico'],[/^us26/,'united-states']];
export function circuitKey(event:Event){if(event.sport!=='f1')return null;return aliases.find(([pattern])=>pattern.test(event.id))?.[1]??null}
function geometry(points:number[][]){
 const all=[...points,points[0]];
 let length=0;
 const distances=all.map((p,i)=>{if(i)length+=Math.hypot(p[0]-all[i-1][0],p[1]-all[i-1][1]);return length});
 return {all,length,distances,d:points.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(' ')+' Z'};
}
export function CircuitArt({event}:{event:Event}){
 const key=circuitKey(event),c=key?venues[key]:null;
 if(!c)return null;
 const {d}=geometry(c.points);
 const calm=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 return <><svg className="sport-art circuit-art" viewBox="0 0 480 225" fill="none" aria-hidden="true"><path d={d} pathLength="1" stroke="currentColor" strokeWidth="13" opacity=".18" strokeLinejoin="round"/><path d={d} pathLength="1" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>{!calm&&<circle r="6" fill="currentColor"><animateMotion dur="16s" repeatCount="indefinite" path={d}/></circle>}</svg><span className="art-note">Illustratie van de baanvorm, geen live positie</span></>
}
export function countdown(iso:string,now:number){
 const delta=Date.parse(iso)-now;
 if(delta<=0)return 'Geplande starttijd verstreken';
 const total=Math.ceil(delta/60000),days=Math.floor(total/1440),hours=Math.floor(total%1440/60),minutes=total%60;
 return (days?days+' d ': '')+(hours||days?hours+' u ': '')+minutes+' min tot de start';
}
export function StartClock({iso}:{iso:string}){
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(timer)},[]);
 return <span className="start-clock"><Clock3 size={15}/>{countdown(iso,now)}</span>;
}
export function VenueExplorer({event,events,onSelect}:{event:Event;events:Event[];onSelect:(e:Event)=>void}){
 const key=circuitKey(event),c=key?venues[key]:null;
 const [mode,setMode]=useState<'baan'|'programma'>('baan'),[position,setPosition]=useState(0),[playing,setPlaying]=useState(false);
 const model=useMemo(()=>c?geometry(c.points):null,[c]);
 const sessions=useMemo(()=>key?sortEvents(events.filter(e=>circuitKey(e)===key)):[],[key,events]);
 useEffect(()=>{setMode('baan');setPosition(0);setPlaying(false)},[key]);
 useEffect(()=>{if(!playing||mode!=='baan')return;let frame=0;let last:number|undefined;function next(now:number){if(last!==undefined){const delta=now-last;setPosition(p=>(p+delta/150)%100)}last=now;frame=requestAnimationFrame(next)}frame=requestAnimationFrame(next);return()=>cancelAnimationFrame(frame)},[playing,mode]);
 if(!c||!model){
  if(!event.venue.trim())return null;
  return <section className="venue-fallback"><MapPin size={19}/><div><strong>{event.venue}</strong><p>Verken de omgeving op de kaart.</p></div><a aria-label={'Zoek '+event.venue+' op de kaart'} href={'https://www.openstreetmap.org/search?query='+encodeURIComponent(event.venue)} target="_blank" rel="noreferrer"><ArrowUpRight size={18}/></a></section>;
 }
 const target=model.length*position/100;
 const segment=Math.max(1,model.distances.findIndex(d=>d>=target));
 const a=model.all[segment-1],b=model.all[segment],diff=model.distances[segment]-model.distances[segment-1];
 const t=diff?(target-model.distances[segment-1])/diff:0,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
 return <section className="venue-explorer" aria-label="Circuit en raceweekend">
  <header className="venue-header"><div><span>Circuit</span><h3>{c.name}</h3><p>{c.location}</p></div><a href={'https://www.openstreetmap.org/?mlat='+c.lat+'&mlon='+c.lon+'#map=15/'+c.lat+'/'+c.lon} target="_blank" rel="noreferrer">Omgeving <ArrowUpRight size={15}/></a></header>
  <div className="venue-switch" aria-label="Circuitweergave"><button aria-pressed={mode==='baan'} onClick={()=>setMode('baan')}>Baan</button><button aria-pressed={mode==='programma'} onClick={()=>{setPlaying(false);setMode('programma')}}>Raceweekend</button></div>
  {mode==='baan'?<><div className="venue-map"><svg viewBox="0 0 480 225" role="img" aria-label={'Baanvorm van '+c.name}><path d={model.d} fill="none" stroke="#30333c" strokeWidth="13" strokeLinejoin="round"/><path d={model.d} fill="none" stroke="#f3f2ec" strokeOpacity=".55" strokeWidth="2" strokeLinejoin="round"/><path d={model.d} fill="none" stroke="#ff3d4f" strokeWidth="3" pathLength="100" strokeDasharray={position+' 100'}/><circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#ff3d4f" strokeWidth="2"/></svg></div>
  <div className="venue-controls"><button aria-label={playing?'Pauzeer baanverkenning':'Speel baanverkenning af'} aria-pressed={playing} onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><label><span>Verken de baan</span><input type="range" min="0" max="100" step="1" value={Math.round(position)} onChange={e=>{setPlaying(false);setPosition(+e.target.value)}}/></label><output>{Math.round(position)}%</output></div>
  <p className="venue-caption">Verkenning van de baanvorm, geen live positie of rondetijd.</p>
  {(c.length||c.laps)&&<div className="venue-facts">{c.length&&<span><b>{Number(c.length).toLocaleString('nl-NL',{minimumFractionDigits:3})} km</b> baanlengte</span>}{c.laps&&<span><b>{c.laps}</b> raceronden</span>}<a href={c.statsSource} target="_blank" rel="noreferrer">Formula 1 ↗</a></div>}
  <p className="venue-caption"><a href={c.source} target="_blank" rel="noreferrer">Baanvorm: Tomislav Bacinger</a> · <a href={import.meta.env.BASE_URL+'licenses/f1-circuits.txt'} target="_blank" rel="noreferrer">MIT-licentie</a></p></>:<div className="venue-sessions">{sessions.map(s=><button key={s.id} className={s.id===event.id?'current':''} aria-current={s.id===event.id?'true':undefined} onClick={()=>onSelect(s)}><span>{s.title}</span><time dateTime={s.iso??s.start}>{label(s.start,{weekday:'short',day:'numeric',month:'short'})}{s.iso?' · '+time(s.iso):''}</time><ArrowUpRight size={15}/></button>)}</div>}
 </section>;
}
