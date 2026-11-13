// Elke sport van bovenaf getekend: het veld, de baan, het bad of het bord, met de echte belijning.
// Maten zijn de gangbare reglementaire maten; ze dienen als tekening, niet als meetgegeven per stadion.
import {useEffect,useRef,type ReactNode} from 'react';
import type {Event} from './core';
import data from './circuits.json';
import {track,type CircuitInfo} from './circuit';

export const circuits=data as unknown as Record<string,CircuitInfo>;
const aliases:[RegExp,string][]=[[/^lv26-/,'las-vegas'],[/^qa26-/,'qatar'],[/^ad26-/,'united-arab-emirates'],[/^br26/,'brazil'],[/^mx(?:q)?26/,'mexico'],[/^us26/,'united-states']];
export function circuitKey(e:Event){if(e.sport!=='f1')return null;return aliases.find(([p])=>p.test(e.id))?.[1]??null}

/** Ondergrond per sport: vloerkleur, tekstkleur op die vloer en een accent voor stippen en lijnen. */
export const veld:Record<string,{vloer:string;inkt:string;accent:string;plaat:string}>={
 f1:{vloer:'#26323c',inkt:'#fff',accent:'#ff4d5e',plaat:'Startopstelling op het rechte stuk'},
 motogp:{vloer:'#3b332b',inkt:'#fff',accent:'#ff8a1f',plaat:'Startopstelling op het rechte stuk'},
 wec:{vloer:'#1e2444',inkt:'#fff',accent:'#a995ff',plaat:'Rollende start, van dag naar nacht'},
 football:{vloer:'#1d7442',inkt:'#fff',accent:'#2fa862',plaat:'Veld, gebruikelijk 105 bij 68 meter'},
 tennis:{vloer:'#245c9e',inkt:'#fff',accent:'#3d8bdf',plaat:'Baan van 23,77 bij 10,97 meter'},
 cycling:{vloer:'#4d6b2c',inkt:'#fff',accent:'#e0a800',plaat:'Peloton en kopgroep op de weg'},
 swimming:{vloer:'#0f7da6',inkt:'#fff',accent:'#18a8cf',plaat:'Wedstrijdbad met acht banen'},
 speed:{vloer:'#dcedf6',inkt:'#10314c',accent:'#2a7fc2',plaat:'Baan van 400 meter met baanwissel'},
 short:{vloer:'#e6eff4',inkt:'#1c2452',accent:'#5d54c4',plaat:'Ovaal van 111,12 meter op 60 bij 30 meter ijs'},
 darts:{vloer:'#201c1a',inkt:'#fff',accent:'#e0523f',plaat:'Bord met twintig vakken, 20 bovenaan'},
 athletics:{vloer:'#b3432e',inkt:'#fff',accent:'#d9603f',plaat:'Atletiekbaan met acht banen'},
 gym:{vloer:'#d9c8a2',inkt:'#2c2414',accent:'#b08a3c',plaat:'Vloer van 12 bij 12 meter'},
 mma:{vloer:'#1c1c21',inkt:'#fff',accent:'#b06fc4',plaat:'Achthoekige kooi'},
 olympics:{vloer:'#c69a5a',inkt:'#2a1c08',accent:'#c98a1c',plaat:'Sporthalvloer met alle lijnen door elkaar'},
};
const fallback={vloer:'#3a4450',inkt:'#fff',accent:'#8aa0b4',plaat:''};
export const vloer=(sport:string)=>veld[sport]||fallback;

type S={play:boolean;mini?:boolean};
const W='#f6f8f4';
/** Stip die langs een pad beweegt; zonder beweging staat hij stil op `at`. */
function Dot({at,path,dur,begin=0,play,children,...rest}:{at:[number,number];path:string;dur:number;begin?:number;play:boolean;children?:ReactNode}&React.SVGProps<SVGGElement>){
 return <g {...rest} transform={play?undefined:`translate(${at[0]} ${at[1]})`}>{children}{play&&<animateMotion path={path} dur={dur+'s'} begin={begin+'s'} repeatCount="indefinite"/>}</g>;
}
const stad=(x1:number,x2:number,y:number,r:number)=>`M${x1} ${y-r}H${x2}A${r} ${r} 0 0 1 ${x2} ${y+r}H${x1}A${r} ${r} 0 0 1 ${x1} ${y-r}Z`;

function Voetbal({play}:S){const pass='M112 196L204 104L296 182L236 226Z';return <>
 <rect width="400" height="300" fill="#1d7442"/>
 {Array.from({length:6},(_,i)=><rect key={i} x={21.5+i*59.5} y="34.5" width="29.75" height="231" fill="#228049"/>)}
 <g fill="none" stroke={W} strokeWidth="1.7">
  <rect x="21.5" y="34.5" width="357" height="231"/><path d="M200 34.5V265.5"/><circle cx="200" cy="150" r="31.1"/>
  <rect x="21.5" y="81.5" width="56.1" height="137.1"/><rect x="322.4" y="81.5" width="56.1" height="137.1"/>
  <rect x="21.5" y="118.85" width="18.7" height="62.3"/><rect x="359.8" y="118.85" width="18.7" height="62.3"/>
  <path d="M77.6 125.15A31.1 31.1 0 0 1 77.6 174.85M322.4 125.15A31.1 31.1 0 0 0 322.4 174.85"/>
  <path d="M21.5 137.6H15.5V162.4H21.5M378.5 137.6H384.5V162.4H378.5" strokeWidth="1.2"/>
  <path d="M21.5 38A3.5 3.5 0 0 0 25 34.5M375 34.5A3.5 3.5 0 0 0 378.5 38M378.5 262A3.5 3.5 0 0 0 375 265.5M25 265.5A3.5 3.5 0 0 0 21.5 262"/>
 </g>
 <g fill={W}><circle cx="200" cy="150" r="2"/><circle cx="58.9" cy="150" r="1.7"/><circle cx="341.1" cy="150" r="1.7"/></g>
 <path d={pass} fill="none" stroke={W} strokeWidth=".8" strokeDasharray="2 4" opacity=".45"/>
 <Dot at={[204,104]} path={pass} dur={9} play={play}><circle r="4.2" fill="#0d3a20" opacity=".35" cx="1.5" cy="2"/><circle r="4" fill="#fff" stroke="#14301f" strokeWidth=".8"/></Dot>
</>}

function Tennis({play}:S){const rally='M96 122L304 186L98 172L302 116Z';return <>
 <rect width="400" height="300" fill="#2b7a55"/>
 <rect x="69.3" y="89.7" width="261.4" height="120.6" fill="#245c9e"/>
 <g fill="none" stroke={W} strokeWidth="1.6">
  <rect x="69.3" y="89.7" width="261.4" height="120.6"/><path d="M69.3 104.8H330.7M69.3 195.2H330.7M129.6 104.8V195.2M270.4 104.8V195.2M129.6 150H270.4M69.3 150h4M330.7 150h-4"/>
 </g>
 <path d="M201.5 82V221" stroke="#0e2b4d" strokeWidth="3" opacity=".3"/><path d="M200 80V220" stroke={W} strokeWidth="2.4"/>
 <circle cx="200" cy="80" r="2.4" fill="#1b1b1b"/><circle cx="200" cy="220" r="2.4" fill="#1b1b1b"/>
 <Dot at={[304,186]} path={rally} dur={5.5} play={play}><circle r="3.4" cx="1.6" cy="2.4" fill="#0e2b4d" opacity=".35"/><circle r="3.4" fill="#d8f03c"/></Dot>
</>}

function Zwembad({play,pool}:S&{pool?:number}){const kort=pool===25,x0=kort?115:30,w=kort?170:340,rope=['#e33e3e','#f6f8f4','#2456b8'];return <>
 <rect width="400" height="300" fill="#cfdde2"/>
 <rect x={x0-8} y="57" width={w+16} height="186" rx="3" fill="#e9f0f2"/>
 <rect x={x0} y="65" width={w} height="170" fill="#0f7da6"/>
 {Array.from({length:8},(_,i)=>{const y=75.6+i*21.25;return <g key={i}>
  <path d={`M${x0+12} ${y}H${x0+w-12}M${x0+12} ${y-5}v10M${x0+w-12} ${y-5}v10`} stroke="#0a5876" strokeWidth="2.2"/>
  <Dot at={[x0+w*(.25+((i*37)%50)/100),y]} path={`M${x0+8} ${y}H${x0+w-8}H${x0+8}`} dur={11+((i*5)%4)} begin={-i*1.3} play={play}><path d="M-9 0h-9" stroke="#bfe6f2" strokeWidth="2.4" strokeLinecap="round" opacity=".7"/><ellipse rx="5" ry="2.6" fill="#f2c9a5"/><circle cx="4.6" r="2" fill="#16242b"/></Dot>
 </g>})}
 {Array.from({length:9},(_,i)=><path key={i} d={`M${x0} ${65+i*21.25}H${x0+w}`} stroke={i%8?rope[i%3]:'#f6f8f4'} strokeWidth={i%8?1.6:0} strokeDasharray="5 3"/>)}
 <path d={`M${x0+34} 61V239M${x0+w-34} 61V239`} stroke="#e33e3e" strokeWidth="1" strokeDasharray="3 3" opacity=".8"/>
 {Array.from({length:8},(_,i)=><rect key={i} x={x0-7} y={69+i*21.25} width="6" height="13" rx="1.5" fill="#f6f8f4" stroke="#8fa3ab" strokeWidth=".6"/>)}
</>}

function Langebaan({play}:S){const lap='M125 208.5H275A58.5 58.5 0 0 0 275 91.5L125 78.5A71.5 71.5 0 0 0 125 221.5H275A71.5 71.5 0 0 0 275 78.5L125 91.5A58.5 58.5 0 0 0 125 208.5Z';return <>
 <rect width="400" height="300" fill="#c9d6dd"/>
 <path d={stad(125,275,150,92)} fill="#f3f8fb" stroke="#1d4f86" strokeWidth="3"/>
 <path d={stad(125,275,150,78)} fill="#dcedf6"/><path d={stad(125,275,150,39)} fill="#eef4f6" stroke="#9fb7c4" strokeWidth="1"/>
 <g fill="none" stroke="#2a7fc2" strokeWidth="1.5"><path d={stad(125,275,150,78)}/><path d={stad(125,275,150,52)}/></g>
 <path d="M125 85H275A65 65 0 0 1 275 215H125A65 65 0 0 1 125 85" fill="none" stroke="#2a7fc2" strokeWidth="1.2" strokeDasharray="4 4"/>
 <path d="M125 72.5H275M125 98H275" stroke="#dcedf6" strokeWidth="3"/>
 <path d="M150 202V228" stroke="#e33e3e" strokeWidth="2"/><path d="M250 202V228" stroke="#10314c" strokeWidth="1.4"/>
 <Dot at={[190,208.5]} path={lap} dur={15} play={play}><circle r="5" fill="#e8642c" stroke="#fff" strokeWidth="1.2"/></Dot>
 <Dot at={[190,221.5]} path={lap} dur={15} begin={-7.35} play={play}><circle r="5" fill="#1d4f86" stroke="#fff" strokeWidth="1.2"/></Dot>
</>}

function Shorttrack({play}:S){const x1=119.2,x2=280.8,r=44.8,line=stad(x1,x2,150,56),kleur=['#e33e3e','#1c2452','#e0a800','#2b9a5f','#5d54c4'];
 const blok=(cx:number,s:number)=>Array.from({length:7},(_,i)=>{const a=(-90+i*30)*Math.PI/180;return <circle key={cx+'-'+i} cx={cx+s*Math.cos(a)*r} cy={150+Math.sin(a)*r} r="2.3" fill="#16181d"/>});
 return <>
 <rect width="400" height="300" fill="#c9d1dd"/>
 <rect x="26" y="60" width="348" height="180" rx="50" fill="#2b3f93"/><rect x="32" y="66" width="336" height="168" rx="45" fill="#e6eff4"/>
 <path d="M200 66V234" stroke="#e33e3e" strokeWidth="1.2" opacity=".5"/><circle cx="200" cy="150" r="20" fill="none" stroke="#2a7fc2" strokeWidth="1" opacity=".5"/>
 {blok(x2,1)}{blok(x1,-1)}
 <path d="M215 194.8V222" stroke="#1c2452" strokeWidth="1.6"/>
 {kleur.map((k,i)=><Dot key={k} at={[150+i*13,206]} path={line} dur={7.5} begin={-i*.33} play={play}><circle r="4.2" fill={k} stroke="#fff" strokeWidth="1"/></Dot>)}
</>}

const nummers=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
function Dartbord({play,mini}:S){const cx=200,cy=150;
 const wig=(i:number,r1:number,r2:number)=>{const a0=(-99+i*18)*Math.PI/180,a1=(-81+i*18)*Math.PI/180,P=(r:number,a:number)=>(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1);return `M${P(r1,a0)}L${P(r2,a0)}A${r2} ${r2} 0 0 1 ${P(r2,a1)}L${P(r1,a1)}A${r1} ${r1} 0 0 0 ${P(r1,a0)}Z`};
 const pijl=(x:number,y:number,begin:number)=><g transform={`translate(${x} ${y})`} opacity={play?0:1}><circle r="3.6" fill="#f6f8f4" stroke="#201c1a" strokeWidth=".8"/><path d="M-3.6 0H3.6M0-3.6V3.6" stroke="#e0a800" strokeWidth="1.2"/>{play&&<animate attributeName="opacity" values="0;1;1;0" keyTimes={`0;${(begin/6).toFixed(3)};.92;1`} calcMode="discrete" dur="6s" repeatCount="indefinite"/>}</g>;
 return <>
 <rect width="400" height="300" fill="#201c1a"/><circle cx={cx} cy={cy} r="133" fill="#131110"/>
 {nummers.map((n,i)=>{const zwart=i%2===0,ring=zwart?'#d8402f':'#2f9a5a',vlak=zwart?'#1a1716':'#eadfc4';return <g key={n}>
  <path d={wig(i,9.4,100)} fill={vlak}/><path d={wig(i,95.3,100)} fill={ring}/><path d={wig(i,58.2,62.9)} fill={ring}/>
  {!mini&&<text x={cx+116*Math.sin(i*18*Math.PI/180)} y={cy-116*Math.cos(i*18*Math.PI/180)+4.6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#eadfc4">{n}</text>}
 </g>})}
 <g fill="none" stroke="#b9b3a6" strokeWidth=".5">{[100,95.3,62.9,58.2,9.4].map(r=><circle key={r} cx={cx} cy={cy} r={r}/>)}</g>
 <circle cx={cx} cy={cy} r="9.4" fill="#2f9a5a"/><circle cx={cx} cy={cy} r="3.7" fill="#d8402f"/>
 {pijl(197,88.5,.8)}{pijl(203.5,91,1.9)}{pijl(200,86,3)}
</>}

function Wielrennen({play}:S){const weg='M-20 232C60 236 82 176 150 170S236 214 292 150S330 74 420 62';
 const renner=(i:number,voor:number,kleur:string,dy:number)=><Dot key={kleur+i} at={[150+voor*16-i*5,170+dy]} path={weg} dur={16} begin={-(voor*.62)+i*.16} play={play}><circle r="3.1" cy={dy} fill={kleur} stroke="#1d2a12" strokeWidth=".7"/></Dot>;
 return <>
 <rect width="400" height="300" fill="#4d6b2c"/>
 <path d="M0 0H170L120 120L0 150Z" fill="#5f7f33"/><path d="M170 0H400V40L250 110L120 120Z" fill="#c7a93a"/><path d="M0 300V250L140 240L210 300Z" fill="#3f5c26"/><path d="M210 300L250 220L400 150V300Z" fill="#6f8f3c"/>
 <path d={weg} fill="none" stroke="#e9e3cf" strokeWidth="27"/><path d={weg} fill="none" stroke="#50545b" strokeWidth="23"/>
 <path d={weg} fill="none" stroke="#f6f8f4" strokeWidth="1.2" strokeDasharray="7 9"/>
 {[0,1,2].map(i=>renner(i,5,i===0?'#ffd23f':'#f6f8f4',i===1?-4:i===2?4:0))}
 {Array.from({length:14},(_,i)=>renner(i,0,['#e33e3e','#2a7fc2','#f6f8f4','#ff8a1f','#2fa862'][i%5],[-6,0,6,-3,3][i%5]))}
</>}

function Startgrid({play,soort}:S&{soort:'f1'|'motogp'|'wec'}){const asfalt=soort==='wec'?'#3c4057':soort==='motogp'?'#55504a':'#4a5560',gras=soort==='wec'?'#1e2444':soort==='motogp'?'#3b332b':'#26323c';
 const vak:[number,number][]=soort==='motogp'?Array.from({length:12},(_,i)=>[300-Math.floor(i/3)*52-(i%3)*10,124+(i%3)*26]):soort==='wec'?Array.from({length:12},(_,i)=>[296-Math.floor(i/2)*40,134+(i%2)*32]):Array.from({length:12},(_,i)=>[300-i*22,i%2?166:134]);
 return <>
 <rect width="400" height="300" fill={gras}/>
 <rect y="98" width="400" height="104" fill={asfalt}/>
 <path d="M0 98H400M0 202H400" stroke={W} strokeWidth="2"/>
 <path d="M0 93H400" stroke="#e33e3e" strokeWidth="6" strokeDasharray="14 14"/><path d="M14 93H400" stroke={W} strokeWidth="6" strokeDasharray="14 14"/>
 <rect y="214" width="400" height="14" fill="#11161b" opacity=".5"/><path d="M0 214H400" stroke="#e0a800" strokeWidth="1.5"/>
 <g><path d="M330 98V202" stroke={W} strokeWidth="7"/><path d="M328.2 98V202M331.8 101.5V202" stroke="#111" strokeWidth="3.5" strokeDasharray="3.5 3.5"/></g>
 {vak.map(([x,y],i)=><g key={i}>{soort==='wec'?<rect x={x-22} y={y-6} width="20" height="12" rx="3.5" fill={['#e33e3e','#f6f8f4','#2a7fc2','#e0a800'][i%4]} stroke="#11161b" strokeWidth=".8"/>:<path d={`M${x-13} ${y-7}H${x}V${y+7}H${x-13}`} fill="none" stroke={W} strokeWidth="1.6"/>}</g>)}
 {soort==='wec'?<rect width="400" height="300" fill="#0a0d24" opacity={play?0:.25}>{play&&<animate attributeName="opacity" values="0;0;.55;.55;0" keyTimes="0;.3;.5;.8;1" dur="24s" repeatCount="indefinite"/>}</rect>
 :<g transform="translate(330 56)"><rect x="-52" y="-13" width="104" height="26" rx="6" fill="#11161b"/>{[0,1,2,3,4].map(i=><circle key={i} cx={-38+i*19} r="6.4" fill={play?'#3a2326':'#ff3b47'}>{play&&<animate attributeName="fill" values="#3a2326;#ff3b47;#3a2326" keyTimes={`0;${((i+1)/9).toFixed(3)};${(6.2/9).toFixed(3)}`} calcMode="discrete" dur="9s" repeatCount="indefinite"/>}</circle>)}</g>}
</>}

function Circuit({c,play,mini,detail,kompas}:S&{c:CircuitInfo;detail?:boolean;kompas:[number,number]}){
 const pts=c.points.map(([x,y])=>[x-40,y+37]),d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'Z',t=track(pts),m=c.markers;
 const deel=(a:number,b:number)=>{let s='';for(let f=a;f<b+.002;f+=.004){const p=t.at(Math.min(f,.9999));s+=(s?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)}return s};
 const sf=t.at(m?.startFinish??0),pijl=t.at((m?.startFinish??0)+.035);
 const grens=m?.sectors?[0,...m.sectors,1]:null,sk=['#ff4d5e','#4aa6ff','#ffd23f'];
 const labels=(detail&&m?.corners||[]).map(k=>{const p=t.at(k.at);return {n:k.n,px:p.x,py:p.y,nx:p.nx,ny:p.ny,r:15}});
 for(let ronde=0;ronde<4;ronde++)labels.forEach((a,i)=>labels.forEach((b,j)=>{if(j<i&&Math.hypot(a.px+a.nx*a.r-b.px-b.nx*b.r,a.py+a.ny*a.r-b.py-b.ny*b.r)<14)a.r+=8}));
 return <>
 <g fill="none" stroke="#31404c" strokeWidth="1">{[0,60,120,180,240,300].map(y=><path key={y} d={`M-200 ${y}H600`}/>)}{[-80,0,80,160,240,320,400,480].map(x=><path key={x} d={`M${x} -100V400`}/>)}</g>
 <path d={d} fill="none" stroke={W} strokeWidth={mini?11:9.5} strokeLinejoin="round"/><path d={d} fill="none" stroke="#3d4853" strokeWidth={mini?6.5:6.6} strokeLinejoin="round"/>
 {!mini&&grens&&sk.map((k,i)=><path key={k} d={deel(grens[i],grens[i+1])} fill="none" stroke={k} strokeWidth="2" strokeLinecap="round"/>)}
 <path d={`M${sf.x-sf.nx*7} ${sf.y-sf.ny*7}L${sf.x+sf.nx*7} ${sf.y+sf.ny*7}`} stroke="#111" strokeWidth="3.6"/><path d={`M${sf.x-sf.nx*7} ${sf.y-sf.ny*7}L${sf.x+sf.nx*7} ${sf.y+sf.ny*7}`} stroke={W} strokeWidth="3.6" strokeDasharray="2.3 2.3"/>
 {!mini&&<path d="M-5-4L4 0L-5 4Z" fill={W} transform={`translate(${pijl.x+pijl.nx*12} ${pijl.y+pijl.ny*12}) rotate(${Math.atan2(pijl.dy,pijl.dx)*180/Math.PI})`}/>}
 {labels.map(l=><g key={l.n}><path d={`M${l.px+l.nx*5.5} ${l.py+l.ny*5.5}L${l.px+l.nx*(l.r-6.5)} ${l.py+l.ny*(l.r-6.5)}`} stroke={W} strokeWidth=".6" opacity=".7"/><circle cx={l.px+l.nx*l.r} cy={l.py+l.ny*l.r} r="6.6" fill="#18222a" stroke={W} strokeWidth=".8"/><text x={l.px+l.nx*l.r} y={l.py+l.ny*l.r+2.9} textAnchor="middle" fontSize="8.2" fontWeight="700" fill={W}>{l.n}</text></g>)}
 <Dot at={[sf.x,sf.y]} path={d} dur={15} play={play}><circle r={mini?5:3.8} fill="#ff4d5e" stroke="#fff" strokeWidth="1.3"/></Dot>
 {!mini&&<g transform={`translate(${kompas[0]} ${kompas[1]})`}><circle r="13" fill="#18222a" stroke="#56646f" strokeWidth=".8"/><path d="M0-9L3.6 2H-3.6Z" fill="#ff4d5e"/><text y="9.5" textAnchor="middle" fontSize="7" fontWeight="700" fill={W}>N</text></g>}
</>}

function Atletiek(){return <><rect width="400" height="300" fill="#2b7a55"/><path d={stad(125,275,150,112)} fill="#b3432e"/><path d={stad(125,275,150,56)} fill="#2f8a5e"/><g fill="none" stroke={W} strokeWidth="1">{[56,63,70,77,84,91,98,105,112].map(r=><path key={r} d={stad(125,275,150,r)}/>)}</g><path d="M250 206V262" stroke={W} strokeWidth="2.4"/></>}
function Turnvloer(){return <><rect width="400" height="300" fill="#8f9aa3"/><rect x="85" y="35" width="230" height="230" fill="#3a66ad"/><rect x="100" y="50" width="200" height="200" fill="#d9c8a2" stroke={W} strokeWidth="3"/><path d="M100 50L300 250" stroke="#c5b288" strokeWidth="1.2" strokeDasharray="5 5"/></>}
function Kooi(){const p=Array.from({length:8},(_,i)=>{const a=(22.5+i*45)*Math.PI/180;return (200+112*Math.cos(a)).toFixed(1)+' '+(150+112*Math.sin(a)).toFixed(1)}).join('L');return <><rect width="400" height="300" fill="#1c1c21"/><path d={'M'+p+'Z'} fill="#d3d6d9" stroke="#0c0c0e" strokeWidth="7"/><circle cx="200" cy="150" r="30" fill="none" stroke="#9aa0a6" strokeWidth="1.4"/>{Array.from({length:8},(_,i)=>{const a=(22.5+i*45)*Math.PI/180;return <circle key={i} cx={200+112*Math.cos(a)} cy={150+112*Math.sin(a)} r="5.5" fill={i===0?'#e33e3e':i===4?'#2a7fc2':'#3b3b42'}/>})}</>}
/** Sporthalvloer: de lijnen van meerdere sporten door elkaar, zoals in elke gymzaal. */
export function Hallijnen(){return <g fill="none" strokeWidth="2"><rect x="20" y="24" width="360" height="252" stroke="#f6f8f4"/><path d="M200 24V276" stroke="#f6f8f4"/><circle cx="200" cy="150" r="34" stroke="#f6f8f4"/><rect x="62" y="60" width="276" height="180" stroke="#e0a800"/><path d="M62 150H338M154 60V240M246 60V240" stroke="#e0a800"/><path d="M20 80A72 72 0 0 1 20 220M380 80A72 72 0 0 0 380 220" stroke="#e33e3e"/><rect x="20" y="108" width="62" height="84" stroke="#e33e3e"/><rect x="318" y="108" width="62" height="84" stroke="#e33e3e"/><rect x="104" y="42" width="192" height="216" stroke="#2456b8"/><path d="M104 114H296M104 186H296" stroke="#2456b8"/></g>}
function Sporthal(){return <><rect width="400" height="300" fill="#c69a5a"/>{Array.from({length:10},(_,i)=><path key={i} d={`M0 ${15+i*30}H400`} stroke="#b88a4a" strokeWidth="1"/>)}<Hallijnen/></>}

/** Het veld van een sport. `detail` toont extra aanduidingen (bochtnummers); `mini` laat fijne details weg. */
export function Veld({sport,event,play=false,mini,detail,className}:{sport:string;event?:Event|null;play?:boolean;mini?:boolean;detail?:boolean;className?:string}){
 const ref=useRef<SVGSVGElement>(null);
 // Buiten beeld staat de animatie stil.
 useEffect(()=>{const el=ref.current;if(!el||!play||!('IntersectionObserver'in window))return;const io=new IntersectionObserver(([x])=>{try{x.isIntersecting?el.unpauseAnimations():el.pauseAnimations()}catch{/* geen SMIL */}});io.observe(el);return()=>io.disconnect()},[play]);
 const key=event?circuitKey(event):null,c=key?circuits[key]:null,p={play,mini};
 // Circuits krijgen een eigen uitsnede rond de baan, zodat ook een smalle baan het beeld vult.
 let vb='0 0 400 300',kompas:[number,number]=[372,30];
 if(c){const xs=c.points.map(q=>q[0]-40),ys=c.points.map(q=>q[1]+37),m=mini?16:detail?40:26,x=Math.min(...xs)-m,y=Math.min(...ys)-m,w=Math.max(...xs)+m-x,h=Math.max(...ys)+m-y;vb=`${x} ${y} ${w} ${h}`;kompas=[x+w-16,y+16]}
 const body=c?<Circuit c={c} detail={detail} kompas={kompas} {...p}/>:sport==='f1'||sport==='motogp'||sport==='wec'?<Startgrid soort={sport} {...p}/>:sport==='football'?<Voetbal {...p}/>:sport==='tennis'?<Tennis {...p}/>:sport==='swimming'?<Zwembad pool={event?.pool} {...p}/>:sport==='speed'?<Langebaan {...p}/>:sport==='short'?<Shorttrack {...p}/>:sport==='darts'?<Dartbord {...p}/>:sport==='cycling'?<Wielrennen {...p}/>:sport==='athletics'?<Atletiek/>:sport==='gym'?<Turnvloer/>:sport==='mma'?<Kooi/>:<Sporthal/>;
 return <svg ref={ref} className={'veld '+(className||'')} viewBox={vb} preserveAspectRatio={c||sport==='darts'?'xMidYMid meet':'xMidYMid slice'} style={{background:c?'#26323c':vloer(sport).vloer}} aria-hidden="true" focusable="false">{body}</svg>;
}
/** Wat de tekening laat zien, in woorden. */
export function plaat(sport:string,event?:Event|null){const key=event?circuitKey(event):null;if(key)return circuits[key].name+', noorden boven';if(sport==='swimming'&&event?.pool===25)return'Kortebaanbad van 25 meter';if(sport==='swimming')return'Wedstrijdbad van 50 meter met acht banen';return vloer(sport).plaat}
