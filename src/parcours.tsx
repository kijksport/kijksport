// KijkSport — Parcours. De dag is een route: evenementen zijn waypoints, 'nu' is je positie.
// Alle beweging is illustratief en staat los van live gegevens; informatie is ook zonder animatie leesbaar.
import React,{useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import {Bookmark,Pause,Play,Flag,Maximize2,X,ArrowUpRight} from 'lucide-react';
import {type Event,type Sport,time,label,sortEvents} from './core';
import circuits from './circuits.json';
import {circuitKey} from './venue';
import {track,km,type CircuitInfo} from './circuit';
import type {TvRow} from './viewing';
import {SportArt} from './art';
import {sportFacts} from './sportfacts';

/** Ontwerpkleur per sport; vervangt de gedempte kleur uit de dataset in de interface. */
export const tone:Record<string,string>={f1:'#ff3d4f',tennis:'#4aa6ff',cycling:'#ffc531',football:'#2fd38a',darts:'#ff7a59',speed:'#7fd4ff',short:'#b49cff',olympics:'#ffd36b',mma:'#e86bff',athletics:'#ff9a4d',gym:'#ff8fc8',swimming:'#5ee7e0',motogp:'#ff8a1f',wec:'#a98bff'};

const calm=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
type Style=React.CSSProperties&Record<`--${string}`,string|number>;

/** Wissel van scherm met een View Transition waar de browser die ondersteunt. */
export function go(run:()=>void,dir?:'next'|'prev'){
 const doc=document as Document&{startViewTransition?:(cb:()=>void)=>unknown};
 if(dir)document.documentElement.dataset.dir=dir;else delete document.documentElement.dataset.dir;
 if(doc.startViewTransition&&!calm())doc.startViewTransition(()=>flushSync(run));else run();
}

export function useNow(ms:number){
 const[now,setNow]=useState(Date.now);
 useEffect(()=>{const t=window.setInterval(()=>setNow(Date.now()),ms);return()=>clearInterval(t)},[ms]);
 return now;
}

/** Animatie loopt alleen als het podium in beeld is en de gebruiker niet heeft gepauzeerd. */
function useRunning<T extends HTMLElement>(){
 const ref=useRef<T>(null);
 const[visible,setVisible]=useState(true),[paused,setPaused]=useState(calm);
 useEffect(()=>{
  const el=ref.current;if(!el||typeof IntersectionObserver==='undefined')return;
  const io=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.05});
  io.observe(el);return()=>io.disconnect();
 },[]);
 return {ref,running:visible&&!paused,paused,setPaused};
}

const pathOf=(pts:number[][],close=true)=>pts.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(' ')+(close?' Z':'');
const venues=circuits as Record<string,CircuitInfo>;

/** Komeet: een kop met drie vervagende staarten die over hetzelfde pad reizen (pathLength 1).
 *  De voorsprong van kop en staarten komt uit een negatieve animatievertraging (zie .comet in parcours.css). */
function Comet({d}:{d:string}){
 return <g className="comet">
  <path d={d} pathLength="1" className="tail t3" strokeDasharray="0.18 0.82"/>
  <path d={d} pathLength="1" className="tail t2" strokeDasharray="0.09 0.91"/>
  <path d={d} pathLength="1" className="tail t1" strokeDasharray="0.04 0.96"/>
  <path d={d} pathLength="1" className="head" strokeDasharray="0.008 0.992"/>
 </g>;
}

/** Duw bochtlabels uit elkaar en weg van de baan zodat ze niet overlappen. */
function spread<T extends {x:number;y:number;ax:number;ay:number}>(ls:T[],pts:number[][]){
 const r=14.5;
 for(let it=0;it<60;it++){
  for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++){
   const a=ls[i],b=ls[j];let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||.01;
   if(d<r){const k=(r-d)/2/d;dx*=k;dy*=k;a.x-=dx;a.y-=dy;b.x+=dx;b.y+=dy}
  }
  for(const l of ls){ // niet op de baan zelf
   for(const p of pts){const dx=l.x-p[0],dy=l.y-p[1],d=Math.hypot(dx,dy)||.01;if(d<11){l.x+=dx/d*(11-d)*.5;l.y+=dy/d*(11-d)*.5}}
  }
 }
 return ls;
}

/** Baanvorm, noorden boven. Met gecontroleerde markeringen: sectoren, start/finish, rijrichting en (groot) bochtnummers. */
function CircuitScene({id,detail=false}:{id:string;detail?:boolean}){
 const c=venues[id];
 const pts=c.points,d=pathOf(pts),t=track(pts),m=c.markers;
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),pad=detail?30:16;
 const box=[Math.min(...xs)-pad,Math.min(...ys)-pad,Math.max(...xs)-Math.min(...xs)+pad*2,Math.max(...ys)-Math.min(...ys)+pad*2].map(v=>Math.round(v)).join(' ');
 const sf=m?.startFinish!==undefined?t.at(m.startFinish):null;
 const bounds=m?.sectors?.length?[0,...m.sectors,1]:null;
 const deg=(p:{dx:number;dy:number})=>Math.atan2(p.dy,p.dx)*180/Math.PI;
 const arrow=sf&&detail?t.at((m!.startFinish||0)+0.025):null;
 const labels=detail&&m?.corners?spread(m.corners.map(k=>{const p=t.at(k.at);return {n:k.n,ax:p.x,ay:p.y,x:p.x+p.nx*15,y:p.y+p.ny*15}}),pts):[];
 return <svg viewBox={box} className={'scene-svg circuit'+(detail?' detail':'')}>
  <defs><pattern id={'chk-'+id} width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#f3f2ec"/><rect width="1.5" height="1.5" fill="#0e0f12"/><rect x="1.5" y="1.5" width="1.5" height="1.5" fill="#0e0f12"/></pattern></defs>
  <path d={d} className="trk-outline"/>
  <path d={d} className="trk-road"/>
  {bounds?bounds.slice(0,-1).map((a,i)=>{const b=bounds[i+1];return <path key={i} d={d} pathLength="1" className={'sector s'+(i+1)} strokeDasharray={`${b-a} ${1-(b-a)}`} strokeDashoffset={-a}/>}):<path d={d} pathLength="1" className="trk-edge"/>}
  <Comet d={d}/>
  {sf&&<g className="sf" transform={`translate(${sf.x} ${sf.y}) rotate(${deg(sf)})`}><rect x="-2.25" y="-8" width="4.5" height="16" fill={`url(#chk-${id})`}/></g>}
  {arrow&&<path className="dir-arrow" d="M-4 -4 L3 0 L-4 4" transform={`translate(${arrow.x+arrow.nx*13} ${arrow.y+arrow.ny*13}) rotate(${deg(arrow)})`}/>}
  {detail&&labels.map(l=><g key={l.n} className="corner" transform={`translate(${l.x} ${l.y})`}>{(Math.hypot(l.x-l.ax,l.y-l.ay)>18)&&<line x1="0" y1="0" x2={l.ax-l.x} y2={l.ay-l.y} className="leader"/>}<circle r="6.6"/><text y="2.6">{l.n}</text></g>)}
 </svg>;
}

/** Passpatroon over een speelveld. Abstract, geen opstelling of wedstrijdverloop. */
function PitchScene(){
 const pass='M110 150 L190 92 L262 168 L318 70 L384 132 L300 214 L196 196 Z';
 return <div className="tilt"><svg viewBox="0 0 480 300" className="scene-svg pitch">
  {Array.from({length:8},(_,i)=><rect key={i} x={30+i*52.5} y="20" width="52.5" height="260" className={i%2?'mow a':'mow b'}/>)}
  <g className="lines">
   <rect x="30" y="20" width="420" height="260"/><path d="M240 20v260"/><circle cx="240" cy="150" r="38"/><circle cx="240" cy="150" r="2.5" className="spot"/>
   <path d="M30 86h62v128H30M450 86h-62v128h62M30 120h22v60H30M450 120h-22v60h22"/>
   <path d="M30 136h-8v28h8M450 136h8v28h-8"/>
  </g>
  <Comet d={pass}/>
 </svg></div>;
}

type Surface={id:'clay'|'grass'|'hard';name:string};
/** Ondergrond alleen voor toernooien waarvan die algemeen bekend is; anders geen claim. */
export function surfaceOf(e:Event):Surface|null{
 if(/Roland Garros/.test(e.title))return {id:'clay',name:'gravel'};
 if(/Wimbledon/.test(e.title))return {id:'grass',name:'gras'};
 if(/Australian Open|US Open|ATP Finals|ABN AMRO/.test(e.title))return {id:'hard',name:'hardcourt'};
 return null;
}
function CourtScene({surface}:{surface:Surface|null}){
 const rally='M150 70 L330 228 L372 84 L118 214 Z';
 return <div className="tilt"><svg viewBox="0 0 480 300" className={'scene-svg court '+(surface?.id||'neutral')}>
  <rect x="20" y="16" width="440" height="268" className="apron"/>
  <g className="lines">
   <rect x="60" y="40" width="360" height="220"/><path d="M60 66h360M60 234h360M150 66v168M330 66v168M150 150h180"/>
  </g>
  <path d="M240 30v240" className="net"/>
  {surface?.id==='clay'&&<g className="marks"><ellipse cx="330" cy="228" rx="7" ry="4"/><ellipse cx="118" cy="214" rx="7" ry="4" className="m2"/></g>}
  <Comet d={rally}/>
 </svg></div>;
}

function RoadScene({cobbles}:{cobbles:boolean}){
 return <div className={'road-scene'+(cobbles?' cobbles':'')}>
  <svg viewBox="0 0 480 120" className="hills" preserveAspectRatio="none" aria-hidden="true"><path d="M0 120V78l60-22 52 14 70-38 64 30 58-44 72 40 56-18 48 22v58Z"/><path d="M0 120V96l80-16 70 12 90-26 80 20 90-14 70 12v36Z" className="near"/></svg>
  <div className="road"><div className="road-plane"/></div>
 </div>;
}

/** Zwembad van boven; de komeet zwemt baantjes. Badlengte alleen als die in de data staat. */
function PoolScene({length}:{length?:number}){
 const lap='M70 150 L410 150 L410 162 L70 162 Z';
 return <div className="tilt"><svg viewBox="0 0 480 300" className="scene-svg pool">
  <rect x="40" y="30" width="400" height="240" rx="6" className="deck"/>
  <rect x="60" y="50" width="360" height="200" className="water"/>
  {Array.from({length:7},(_,i)=><path key={i} d={`M60 ${75+i*25}h360`} className="rope"/>)}
  <path d="M60 50v200M420 50v200" className="wall"/>
  {length&&<text x="240" y="44" className="pool-len">{length} m</text>}
  <Comet d={lap}/>
 </svg></div>;
}

/** Een bocht met kerbstenen. Niet de baanvorm van het circuit. */
function BendScene(){
 // Heen en terug over dezelfde ideale lijn, zodat er geen zichtbare terugweg is.
 const line='M40 190 C140 190 170 60 250 60 C330 60 360 170 440 120 C360 170 330 60 250 60 C170 60 140 190 40 190 Z';
 const edge='M40 190 C140 190 170 60 250 60 S360 170 440 120';
 return <svg viewBox="0 0 480 260" className="scene-svg bend">
  <path d={edge} className="bend-road"/>
  <path d={edge} className="kerb" transform="translate(0 -20)"/>
  <path d={edge} className="kerb" transform="translate(0 20)"/>
  <Comet d={line}/>
 </svg>;
}

/** Duurrace: een wijzerplaat met één streep per uur (alleen als de raceduur in de bron staat). */
function EnduranceScene({hours}:{hours?:number|null}){
 const r=82,ring=`M240 ${130-r} A${r} ${r} 0 1 1 239.9 ${130-r} Z`;
 return <svg viewBox="0 0 480 260" className="scene-svg dial">
  <circle cx="240" cy="130" r={r} className="dial-ring"/>
  {hours&&Array.from({length:hours},(_,i)=>{const a=i/hours*Math.PI*2-Math.PI/2;return <path key={i} className="tick" d={`M${240+Math.cos(a)*(r-10)} ${130+Math.sin(a)*(r-10)}L${240+Math.cos(a)*(r+6)} ${130+Math.sin(a)*(r+6)}`}/>})}
  <Comet d={ring}/>
  {hours&&<text x="240" y="142" className="dial-label">{hours} uur</text>}
 </svg>;
}

/** Langebaan: twee banen; de komeet wisselt elke ronde van baan op het overgangsrecht (tegen de klok in). */
function OvalScene(){
 const lane=(r:number)=>`M140 ${150-r}H340A${r} ${r} 0 0 1 340 ${150+r}H140A${r} ${r} 0 0 1 140 ${150-r}Z`;
 const run='M140 216 L340 216 A66 66 0 0 0 340 84 L280 84 L200 66 L140 66 A84 84 0 0 0 140 234 L340 234 A84 84 0 0 0 340 66 L280 66 L200 84 L140 84 A66 66 0 0 0 140 216 Z';
 return <div className="tilt"><svg viewBox="0 0 480 300" className="scene-svg oval">
  <path d={lane(75)} className="ice"/>
  <path d={lane(57)} className="ice-line"/><path d={lane(93)} className="ice-line"/><path d={lane(75)} className="ice-line dashed"/>
  <path d="M280 84 L200 66 M280 66 L200 84" className="cross"/>
  <Comet d={run}/>
 </svg></div>;
}

/** Shorttrack: krappe ovaal met blokjes in de bochten; twee rijders in de groep. */
function ShortScene(){
 const r=48,a=153,b=327,oval=(s:number)=>`M${a+s} ${150-r}H${b}A${r} ${r} 0 0 1 ${b} ${150+r}H${a}A${r} ${r} 0 0 1 ${a} ${150-r}H${a+s}Z`;
 // zeven blokjes per bocht, op de lijn van de baan (links 90° tot 270°, rechts -90° tot 90°)
 const blocks=[[a,90],[b,-90]].flatMap(([cx,from])=>Array.from({length:7},(_,i)=>{const t=(from+i*30)*Math.PI/180;return [cx+r*Math.cos(t),150+r*Math.sin(t)]}));
 return <div className="tilt"><svg viewBox="0 0 480 300" className="scene-svg short">
  <rect x="60" y="60" width="360" height="180" rx="36" className="rink"/>
  <path d={oval(0)} className="ice-line"/>
  {blocks.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.4" className="block"/>)}
  <g className="pack"><Comet d={oval(0)}/></g><g className="pack p2"><Comet d={oval(70)}/></g>
 </svg></div>;
}

const board=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
/** Dartbord: drie pijlen landen in de triple 20, daarna 180. */
function BoardScene(){
 const cx=240,cy=150,R={d2:110,d1:104,t2:69,t1:64,ob:10.3,b:4.1};
 const wedge=(i:number,r1:number,r2:number)=>{const a0=(-90-9+i*18)*Math.PI/180,a1=(-90+9+i*18)*Math.PI/180,p=(r:number,a:number)=>`${cx+r*Math.cos(a)} ${cy+r*Math.sin(a)}`;return `M${p(r1,a0)}L${p(r2,a0)}A${r2} ${r2} 0 0 1 ${p(r2,a1)}L${p(r1,a1)}A${r1} ${r1} 0 0 0 ${p(r1,a0)}Z`};
 const darts=[[-5,-66],[4,-65.5],[0,-67.5]];
 return <svg viewBox="0 0 480 300" className="scene-svg board">
  <circle cx={cx} cy={cy} r="132" className="surround"/>
  {board.map((n,i)=><g key={n}>
   <path d={wedge(i,R.ob,R.t1)} className={i%2?'s-light':'s-dark'}/><path d={wedge(i,R.t1,R.t2)} className={i%2?'r-green':'r-red'}/>
   <path d={wedge(i,R.t2,R.d1)} className={i%2?'s-light':'s-dark'}/><path d={wedge(i,R.d1,R.d2)} className={i%2?'r-green':'r-red'}/>
   <text x={cx+121*Math.cos((-90+i*18)*Math.PI/180)} y={cy+121*Math.sin((-90+i*18)*Math.PI/180)+4} className="num">{n}</text>
  </g>)}
  <circle cx={cx} cy={cy} r={R.ob} className="r-green"/><circle cx={cx} cy={cy} r={R.b} className="r-red"/>
  {darts.map(([dx,dy],i)=><g key={i} className={'dart d'+(i+1)} transform={`translate(${cx+dx} ${cy+dy})`}><g className="dart-body"><circle r="2.2" className="tip"/><path d="M0 0 L16 22" className="barrel"/><path d="M14 19 L24 24 L19 33 Z" className="flight"/></g></g>)}
  <text x={cx+150} y={cy-80} className="callout">180</text>
 </svg>;
}

export type Kind='circuit'|'pitch'|'court'|'road'|'pool'|'bend'|'dial'|'oval'|'short'|'board'|'art';
export function kindOf(e:Event):Kind{
 if(circuitKey(e))return 'circuit';
 return ({football:'pitch',tennis:'court',cycling:'road',swimming:'pool',motogp:'bend',wec:'dial',speed:'oval',short:'short',darts:'board'} as Record<string,Kind>)[e.sport]||'art';
}
const notes:Record<Kind,string>={circuit:'Illustratie over de echte baanvorm. Geen live positie of rondetijd.',pitch:'Illustratie van een speelveld. Geen wedstrijdverloop.',court:'Illustratie van een tennisbaan. Geen wedstrijdverloop.',road:'Illustratie. Geen routeprofiel van deze koers.',pool:'Illustratie van een zwembad. Geen wedstrijdverloop.',bend:'Illustratie van een bocht, niet de baanvorm van dit circuit.',dial:'Illustratie van de raceduur. Geen live stand.',oval:'Illustratie van een 400 meterbaan; de rijder wisselt elke ronde van baan op het overgangsrecht. Geen live stand.',short:'Illustratie van een shorttrackbaan met blokjes in de bochten. Geen wedstrijdverloop.',board:'Illustratie: drie pijlen in de triple 20. Geen wedstrijdverloop.',art:'Schematische illustratie.'};
export function noteOf(e:Event){const s=kindOf(e)==='court'?surfaceOf(e):null;return notes[kindOf(e)]+(s?' Ondergrond: '+s.name+'.':'')}

function Scene({event,detail=false}:{event:Event;detail?:boolean}){
 const kind=kindOf(event);
 if(kind==='circuit')return <CircuitScene id={circuitKey(event)!} detail={detail}/>;
 if(kind==='pitch')return <PitchScene/>;
 if(kind==='court')return <CourtScene surface={surfaceOf(event)}/>;
 if(kind==='road')return <RoadScene cobbles={/Roubaix|Vlaanderen/.test(event.title)}/>;
 if(kind==='pool')return <PoolScene length={event.pool}/>;
 if(kind==='bend')return <BendScene/>;
 if(kind==='dial')return <EnduranceScene hours={event.duration}/>;
 if(kind==='oval')return <OvalScene/>;
 if(kind==='short')return <ShortScene/>;
 if(kind==='board')return <BoardScene/>;
 return <div className="art-scene"><SportArt sport={event.sport}/></div>;
}

const Compass=()=><span className="compass" title="Noorden boven"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 L13.5 11 L10 9.4 L6.5 11 Z" className="needle"/><path d="M10 18 L13.5 11 L10 12.6 L6.5 11 Z" className="tail"/></svg><b>N</b></span>;

/** Miniatuur naast de starttijd. Tikken opent het grote podium. */
export function Mini({event,sport,onOpen}:{event:Event;sport:Sport;onOpen:()=>void}){
 const {ref,running,paused,setPaused}=useRunning<HTMLDivElement>();
 const kind=kindOf(event);
 return <div ref={ref} className={'mini stage-'+kind} data-running={running} style={{'--tone':sport.color} as Style}>
  <button className="mini-open" onClick={onOpen} aria-label={(kind==='circuit'?'Open de baan groot':'Open de illustratie groot')+': '+event.title}>
   <span className="stage-scene" aria-hidden="true"><Scene event={event}/>{kind==='circuit'&&<Compass/>}</span>
   <span className="mini-hint" aria-hidden="true"><Maximize2 size={12}/>{kind==='circuit'?'Baan':'Groter'}</span>
  </button>
  <button className="mini-pause" aria-label={paused?'Speel de animatie af':'Pauzeer de animatie'} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={12}/>:<Pause size={12}/>}</button>
 </div>;
}

/** Compacte circuitfeiten naast of onder de miniatuur. */
export function FactStrip({event}:{event:Event}){
 const c=circuitKey(event)?venues[circuitKey(event)!]:null;
 if(!c?.length)return null;
 return <dl className="fact-strip">
  <div><dt>Baan</dt><dd>{km(c.length)}</dd></div>
  {c.laps&&<div><dt>Ronden</dt><dd>{c.laps}</dd></div>}
  {c.record&&<div><dt>Ronderecord</dt><dd>{c.record.time}</dd></div>}
 </dl>;
}

/** Ronderecord: tijd zichtbaar; coureur en jaar bij aanwijzen, focus, tikken of vasthouden. */
function RecordFact({rec}:{rec:{time:string;driver:string;year:number}}){
 const[open,setOpen]=useState(false);const timer=useRef<number|undefined>(undefined),held=useRef(false),ptr=useRef('');
 return <div className="rec">
  <button type="button" className="rec-btn" aria-expanded={open} aria-label={'Ronderecord in de race '+rec.time+'. '+rec.driver+', '+rec.year}
   onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true)}} onPointerLeave={e=>{if(e.pointerType==='mouse')setOpen(false)}}
   onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))setOpen(true)}} onBlur={()=>setOpen(false)}
   onPointerDown={e=>{ptr.current=e.pointerType;if(e.pointerType!=='mouse'){held.current=false;timer.current=window.setTimeout(()=>{held.current=true;setOpen(true)},380)}}}
   onPointerUp={()=>clearTimeout(timer.current)} onPointerCancel={()=>clearTimeout(timer.current)}
   onClick={()=>{if(ptr.current==='mouse')return;if(held.current){held.current=false;return}setOpen(o=>!o)}} onContextMenu={e=>e.preventDefault()}>
   <b>{rec.time}</b><small>Wie en wanneer?</small>
  </button>
  {open&&<span role="tooltip" className="rec-tip"><b>{rec.driver}</b>{rec.year}</span>}
 </div>;
}

/** Baaninformatie naast de kaart. */
function CircuitInfo({id}:{id:string}){
 const c=venues[id];if(!c.length)return null;
 const rows:[string,React.ReactNode][]=[['Baanlengte',km(c.length)],...(c.laps?[['Raceronden',c.laps]] as [string,string][]:[]),...(c.distance?[['Raceafstand',km(c.distance)]] as [string,string][]:[]),...(c.firstGp?[['Eerste Grand Prix',String(c.firstGp)]] as [string,string][]:[]),...(c.markers?.corners?[['Bochten',String(c.markers.corners.length)]] as [string,string][]:[])];
 return <dl className="side-facts">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}{c.record&&<div><dt>Ronderecord in de race</dt><dd><RecordFact rec={c.record}/></dd></div>}</dl>;
}

/** Kaart of scène met de informatie ernaast; daaronder alleen legenda en bronnen. */
export function ScenePanel({event,events,now,onSelect}:{event:Event;events:Event[];now:number;onSelect:(e:Event)=>void}){
 const {ref,running,paused,setPaused}=useRunning<HTMLElement>();
 const key=circuitKey(event),c=key?venues[key]:null,kind=kindOf(event);
 return <div className="scene-panel" style={{'--tone':tone[event.sport]||'#ff3d4f'} as Style}>
  <div className="panel-row">
   <figure ref={ref} className={'stage big stage-'+kind} data-running={running}>
    <div className="stage-scene" aria-hidden="true"><Scene event={event} detail/>{key&&<Compass/>}</div>
    <button className="stage-toggle" aria-label={paused?'Speel de animatie af':'Pauzeer de animatie'} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>
   </figure>
   <aside className="panel-side">{key?<CircuitInfo id={key}/>:<dl className="side-facts">
    <div><dt>Wanneer</dt><dd>{label(event.start,{day:'numeric',month:'short'})}{event.end!==event.start?' tot '+label(event.end,{day:'numeric',month:'short'}):''}</dd></div>
    {event.iso&&<div><dt>Begintijd</dt><dd>{time(event.iso)}</dd></div>}
    {event.duration&&<div><dt>Raceduur</dt><dd>{event.duration} uur</dd></div>}
    {event.pool&&<div><dt>Bad</dt><dd>{event.pool} meter</dd></div>}
    {event.venue&&<div><dt>Locatie</dt><dd className="small">{event.venue}</dd></div>}
   </dl>}</aside>
  </div>
  <p className="panel-note">{noteOf(event)}{c&&' Noorden boven.'}{c&&!c.markers&&' Start/finish, bochtnummers en sectoren volgen na controle tegen de officiële baankaart.'}</p>
  {c?.markers&&<div className="legend"><span><i className="lg-s1"/>Sector 1</span><span><i className="lg-s2"/>Sector 2</span><span><i className="lg-s3"/>Sector 3</span><span><i className="lg-sf"/>Start/finish</span></div>}
  {key&&<Weekend event={event} events={events} now={now} onSelect={onSelect}/>}
  <Facts sport={event.sport}/>
  {c&&<p className="facts-source">Baangegevens: <a href={c.statsSource} target="_blank" rel="noreferrer">formula1.com <ArrowUpRight size={12}/></a>, gecontroleerd op {c.statsChecked?label(c.statsChecked,{day:'numeric',month:'long',year:'numeric'}):'onbekende datum'}. Het ronderecord is de snelste ronde in een race.{c.markers&&<> Bochten, start/finish en sectoren: van de F1-baankaart over deze baanvorm gelegd, gecontroleerd op {label(c.markers.checked,{day:'numeric',month:'long',year:'numeric'})}.{c.markers.note?' '+c.markers.note:''}</>} Baanvorm: <a href={c.source} target="_blank" rel="noreferrer">Tomislav Bacinger</a>, MIT-licentie. <a href={'https://www.openstreetmap.org/?mlat='+c.lat+'&mlon='+c.lon+'#map=15/'+c.lat+'/'+c.lon} target="_blank" rel="noreferrer">Omgeving op OpenStreetMap <ArrowUpRight size={12}/></a></p>}
 </div>;
}

/** Wist je dat: gecontroleerde feiten over de sport, met bron. */
export function Facts({sport,limit}:{sport:string;limit?:number}){
 const list=(sportFacts[sport]||[]).slice(0,limit);
 if(!list.length)return null;
 return <section className="did-you-know" aria-label="Wist je dat"><h3>Wist je dat</h3><ul>{list.map((f,i)=><li key={i}><span>{f.text}</span> <a href={f.source} target="_blank" rel="noreferrer">{f.label}</a></li>)}</ul></section>;
}

/** Eén roterend feit in het uitgelichte evenement. */
export function FactTicker({sport}:{sport:string}){
 const list=sportFacts[sport]||[];const[i,setI]=useState(0);
 useEffect(()=>{if(list.length<2||calm())return;const t=window.setInterval(()=>setI(x=>(x+1)%list.length),9000);return()=>clearInterval(t)},[list.length]);
 if(!list.length)return null;const f=list[i%list.length];
 return <p className="fact-ticker" aria-live="off"><b>Wist je dat</b> <span key={i}>{f.text}</span></p>;
}

/** Groot podium als sheet. */
export function PodiumSheet({event,sport,events,now,onClose,onSelect,onDetails}:{event:Event|null;sport:Sport|null;events:Event[];now:number;onClose:()=>void;onSelect:(e:Event)=>void;onDetails:(e:Event)=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(event&&d&&!d.open)d.showModal();else if(!event)d?.close()},[event]);
 const key=event?circuitKey(event):null,c=key?venues[key]:null;
 return <dialog ref={ref} className="podium-sheet" onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose()}} aria-label={event?event.title:'Podium'}>{event&&sport&&<div className="podium" style={{'--tone':sport.color} as Style}>
  <div className="dialog-top"><span className="eyebrow">{sport.name}</span><button className="icon-button" aria-label="Sluit het podium" onClick={onClose}><X/></button></div>
  <h2>{c?c.name:event.title}</h2>
  <p className="detail-venue">{c?c.location:event.venue}</p>
  <ScenePanel event={event} events={events} now={now} onSelect={onSelect}/>
  <div className="detail-actions"><button className="primary" onClick={()=>onDetails(event)}>Tijden, zender en herinnering</button></div>
 </div>}</dialog>;
}

const tvWhen=(e:Event)=>e.iso?label(e.start,{weekday:'short',day:'numeric',month:'short'})+' '+time(e.iso):e.start===e.end?label(e.start,{weekday:'short',day:'numeric',month:'short'}):label(e.start,{day:'numeric',month:'short'})+' tot '+label(e.end,{day:'numeric',month:'short'});

/** Per gekozen sport: wanneer is die weer op tv, en op welke zender. */
export function OnTv({rows,sports,today,watch,onSelect}:{rows:TvRow[];sports:Sport[];today:string;watch:(e:Event)=>string;onSelect:(e:Event)=>void}){
 return <ul className="ontv">{rows.map(r=>{const s=sports.find(x=>x.id===r.sport)!;const tv=r.tv,early=r.next&&r.next!==tv?r.next:null;
  return <li key={r.sport} style={{'--tone':s.color} as Style}>
   <span className="ontv-sport"><i/>{s.name}</span>
   {tv?<button className="ontv-main" onClick={()=>onSelect(tv)}>
     <b>{tv.start<=today&&tv.end>=today?'Vandaag'+(tv.iso?' '+time(tv.iso):''):tvWhen(tv)}</b>
     <span>{tv.title}</span>
     <em>{watch(tv)}</em>
    </button>:<span className="ontv-none">{r.next?'Nog geen zender bekend':'Nog niets in de kalender'}</span>}
   {early&&<button className="ontv-early" onClick={()=>onSelect(early)}>{tv?'Eerder':'Eerstvolgende'}: {tvWhen(early)}, {early.title}. Zender nog onbekend.</button>}
  </li>})}</ul>;
}

function Digits({value}:{value:string}){
 return <span className="digits">{[...value].map((ch,i)=><span className="digit" key={i}><span className="strip" style={{'--n':ch} as Style}>{'0123456789'.split('').map(n=><span key={n}>{n}</span>)}</span></span>)}</span>;
}

/** Aftelling tot de geplande start. Zegt niets over de actuele wedstrijdstatus. */
export function Countdown({iso}:{iso:string}){
 const now=useNow(1000);
 const left=Math.floor((Date.parse(iso)-now)/1000);
 if(left<=0)return <p className="count passed">Geplande starttijd verstreken</p>;
 const d=Math.floor(left/86400),h=Math.floor(left%86400/3600),m=Math.floor(left%3600/60),s=left%60;
 const units:[number,string][]=[...(d?[[d,'d']] as [number,string][]:[]),[h,'u'],[m,'min'],[s,'s']];
 const spoken=(d?d+(d===1?' dag, ':' dagen, '):'')+h+' uur en '+m+' minuten tot de geplande start';
 return <div className={'count'+(left<3600?' last-hour':'')} role="timer" aria-label={spoken}>
  <span className="count-label" aria-hidden="true">nog</span>
  {units.map(([v,u])=><span className="unit" key={u} aria-hidden="true"><Digits value={String(v).padStart(u==='d'?1:2,'0')}/><small>{u}</small></span>)}
  {left<3600&&<span className="flamme" aria-hidden="true"><i/>laatste uur</span>}
 </div>;
}

const shortName=(t:string)=>{const m=t.match(/vrije training\s*(\d)/i);return m?'VT'+m[1]:/sprint/i.test(t)?'Sprint':/kwalificatie/i.test(t)?'Kwal.':'Race'};

/** Raceweekend uit de kalender: sessies als waypoints. 'Geweest' betekent: geplande start voorbij. */
export function Weekend({event,events,now,onSelect}:{event:Event;events:Event[];now:number;onSelect:(e:Event)=>void}){
 const key=circuitKey(event);if(!key)return null;
 const sessions=sortEvents(events.filter(e=>circuitKey(e)===key));if(sessions.length<2)return null;
 return <div className="weekend"><h3>Raceweekend volgens de kalender</h3><ol>{sessions.map(s=>{const past=!!s.iso&&Date.parse(s.iso)<now;return <li key={s.id} className={(past?'past':'')+(s.id===event.id?' current':'')}><button onClick={()=>onSelect(s)} aria-label={s.title+', '+label(s.start,{weekday:'long'})+(s.iso?' '+time(s.iso):'')+(past?', geplande start voorbij':'')}><i/><b>{shortName(s.title)}</b><span>{label(s.start,{weekday:'short'})} {s.iso?time(s.iso):''}</span></button></li>})}</ol></div>;
}

type RouteProps={watch:(e:Event)=>string;items:Event[];now:number;hero?:Event;sports:Sport[];favorites:string[];onSelect:(e:Event)=>void;onSave:(e:Event)=>void;badge:(e:Event)=>React.ReactNode};

/** Het programma van vandaag als route. Afstand tussen haltes volgt de tijd ertussen. */
export function DayRoute({watch,items,now,hero,sports,favorites,onSelect,onSave,badge}:RouteProps){
 const allDay=items.filter(e=>!e.iso),timed=items.filter(e=>e.iso);
 const at=(e:Event)=>Date.parse(e.iso!);
 const nextIdx=timed.findIndex(e=>at(e)>now),nu=nextIdx===-1?timed.length:nextIdx;
 const gap=(a:number,b:number)=>Math.max(10,Math.min(96,(b-a)/60000*.5));
 type Row={kind:'event';e:Event;past:boolean;pad:number}|{kind:'now';pad:number}|{kind:'finish';pad:number};
 const rows:Row[]=[];
 allDay.forEach(e=>rows.push({kind:'event',e,past:false,pad:10}));
 timed.forEach((e,i)=>{
  const prev=i?at(timed[i-1]):null;
  if(i===nu){const before=prev===null?10:gap(prev,now);rows.push({kind:'now',pad:before});rows.push({kind:'event',e,past:false,pad:gap(now,at(e))});}
  else rows.push({kind:'event',e,past:i<nu,pad:prev===null?10:gap(prev,at(e))});
 });
 if(nu===timed.length)rows.push({kind:'now',pad:timed.length?gap(at(timed[timed.length-1]),now):10});
 rows.push({kind:'finish',pad:18});
 const nowIdx=rows.findIndex(r=>r.kind==='now');
 const nowLabel=new Intl.DateTimeFormat('nl-NL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Amsterdam'}).format(now);
 return <ol className="day-route">{rows.map((r,i)=>{
  const above=i<=nowIdx?'ridden':'ahead',below=i<nowIdx?'ridden':'ahead';
  const rail=<span className="rail" aria-hidden="true"><i className={'seg up '+above}/><i className="node"/><i className={'seg down '+below}/></span>;
  if(r.kind==='now')return <li key="nu" className="stop now" style={{'--pad':r.pad+'px','--d':i} as Style}>{rail}<span className="now-label"><b>{nowLabel}</b> nu</span></li>;
  if(r.kind==='finish')return <li key="finish" className="stop finish" style={{'--pad':r.pad+'px','--d':i} as Style}>{rail}<span className="finish-label"><Flag size={15}/> Einde van het programma voor vandaag</span></li>;
  const e=r.e,s=sports.find(x=>x.id===e.sport)!,saved=favorites.includes(e.id);
  return <li key={e.id} className={'stop'+(r.past?' past':'')+(e.iso?'':' all-day')+(hero?.id===e.id?' is-hero':'')} style={{'--pad':r.pad+'px','--tone':s.color,'--d':i} as Style}>
   {rail}
   <button className="stop-main" onClick={()=>onSelect(e)}>
    <time dateTime={e.iso??e.start}>{e.iso?time(e.iso):'Hele dag'}</time>
    <span className="stop-sport">{s.name}{r.past&&<em>geplande start voorbij</em>}</span>
    <span className="stop-title">{e.title}</span>
    <span className="stop-watch">{e.broadcast?watch(e):'Uitzending nog onbekend'}{badge(e)}</span>
   </button>
   <button className={'save'+(saved?' saved':'')} aria-label={(saved?'Verwijder uit':'Bewaar in')+' kijklijst: '+e.title} onClick={()=>onSave(e)}><Bookmark size={19} fill={saved?'currentColor':'none'}/></button>
  </li>;
 })}</ol>;
}

const daysBetween=(a:string,b:string)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/864e5);

/** Komende evenementen als startnummers. */
export function Bibs({items,today,sports,watch,onSelect}:{items:Event[];today:string;sports:Sport[];watch:(e:Event)=>string;onSelect:(e:Event)=>void}){
 return <ul className="bibs">{items.map((e,i)=>{
  const s=sports.find(x=>x.id===e.sport)!,n=daysBetween(today,e.start);
  return <li key={e.id} style={{'--tone':s.color,'--tilt':(i%3===0?-1.4:i%3===1?.9:-.4)+'deg'} as Style}><button className="bib" onClick={()=>onSelect(e)}><i className="pin p1"/><i className="pin p2"/><i className="pin p3"/><i className="pin p4"/>
   <span className="bib-band"><span>{s.name}</span><span>{n===1?'morgen':'over '+n+' dagen'}</span></span>
   <b className="bib-num">{e.iso?time(e.iso):label(e.start,{day:'numeric',month:'short'})}</b>
   <span className="bib-date">{label(e.start,{weekday:'long',day:'numeric',month:'long'})}</span>
   <span className="bib-title">{e.title}</span>
   <span className="bib-watch">{e.broadcast?watch(e):'Uitzending nog onbekend'}</span>
  </button></li>;
 })}</ul>;
}
