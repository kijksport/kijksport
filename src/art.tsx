import {useLayoutEffect,useRef} from 'react';
// Schematische sportillustraties (geen plattegronden van echte locaties).
export function SportArt({sport}:{sport:string}){
 const r=useRef<SVGSVGElement>(null);useLayoutEffect(()=>{r.current?.querySelectorAll('path:not([stroke-dasharray]),circle:not([stroke-dasharray]),rect:not([stroke-dasharray])').forEach(el=>el.setAttribute('pathLength','1'))},[sport]);
 const lane='M82 103C70 74 100 44 145 44H376C418 44 449 65 449 105S418 166 376 166H151C106 166 89 143 82 103Z';
 const track='M77 148L126 126L160 151L202 119L189 92L222 57L252 65L265 39L309 34L343 70L382 59L416 87L458 107L451 145L410 177L372 160L336 174L303 149L271 169L239 150L195 181L165 181L145 160L93 183Z';
 const artwork:Record<string,React.ReactNode>={
 f1:<><path d={track} strokeWidth="15" opacity=".2"/><path d={track} strokeWidth="3"/><path d={track} strokeWidth="1" strokeDasharray="3 7" transform="translate(5 -5)" opacity=".75"/><path d="M89 127l21 38m-14-41 21 38" strokeWidth="3"/><circle cx="309" cy="34" r="6" fill="currentColor"/></>,
 tennis:<><rect x="69" y="33" width="382" height="145" rx="4"/><path d="M69 55h382M69 156h382M260 33v145M153 55v101m214-101v101m-214-50h214" strokeWidth="3"/><circle cx="353" cy="88" r="17" fill="currentColor" opacity=".78"/><path d="M338 89q15-18 31-6" strokeWidth="3"/></>,
 football:<><rect x="54" y="27" width="412" height="156" rx="5"/><path d="M260 27v156M54 59h79v92H54m412-92h-79v92h79M54 80h31v50H54m412-50h-31v50h31"/><circle cx="260" cy="105" r="29"/><circle cx="260" cy="105" r="3" fill="currentColor"/></>,
 speed:<>{[0,1,2,3,4].map((i)=><path key={i} d={lane} transform={'translate('+i*3+' '+i*2+') scale('+(1-i*.02)+')'} opacity={1-i*.12}/>)}<path d="M194 61l25 111m18-112 25 110" strokeWidth="2" strokeDasharray="4 5"/></>,
 short:<><path d={lane} strokeDasharray="2 9" strokeWidth="4"/><path d={lane} transform="translate(40 18) scale(.85)" opacity=".5"/><path d="M258 52l20 107M263 52l20 107" strokeWidth="3"/></>,
 darts:<><circle cx="260" cy="105" r="85"/><circle cx="260" cy="105" r="74" strokeWidth="6" opacity=".45"/><circle cx="260" cy="105" r="46" strokeWidth="6" opacity=".45"/><circle cx="260" cy="105" r="12"/>{Array.from({length:20},(_,i)=><path key={i} d="M260 93v-73" transform={'rotate('+i*18+' 260 105)'}/>)}<circle cx="260" cy="105" r="4" fill="currentColor"/></>,
 cycling:<><path d="M22 167l80-66 42 22L244 34l75 97 44-29 138 65"/><path d="M24 180l78-63 46 24 97-87 74 96 45-29 134 62" opacity=".35"/><circle cx="317" cy="147" r="27"/><circle cx="398" cy="147" r="27"/><path d="M317 147l27-38 23 38-50 0m27-38h37l17 38m-17-38 10-14h13" strokeWidth="3"/></>,
 olympics:<>{[0,1,2,3,4].map((i)=><circle key={i} cx={140+i*60} cy={i%2?127:84} r="40" strokeWidth="5"/>)}</>,
 mma:<><path d="M151 35h218l65 44v54l-65 44H151l-65-44V79Z" strokeWidth="4"/><path d="M169 50h182l56 38v35l-56 39H169l-56-39V88Z" strokeDasharray="3 5"/><path d="M86 79l65 44h218l65-44M86 133l65-44h218l65 44" opacity=".35"/></>,
 athletics:<>{[0,1,2,3,4,5].map(i=><path key={i} d={lane} transform={'translate('+i*14+' '+i*10+') scale('+(1-i*.055)+')'}/>)}<path d="M308 45v31m14-31v31" strokeWidth="3"/></>,
 swimming:<><rect x="70" y="40" width="380" height="130" rx="6"/>{[0,1,2,3].map(i=><path key={i} d={`M70 ${66+i*26}h380`} strokeDasharray="6 6"/>)}<path d="M120 105q20-14 40 0t40 0t40 0" strokeWidth="4"/><circle cx="262" cy="100" r="9" fill="currentColor"/></>,
 motogp:<><path d="M60 175C170 175 190 55 280 55S420 150 470 120" strokeWidth="18" opacity=".25"/><path d="M60 175C170 175 190 55 280 55S420 150 470 120" strokeWidth="3"/><path d="M60 155C165 155 185 35 280 35" strokeWidth="5" strokeDasharray="10 10"/><circle cx="215" cy="98" r="8" fill="currentColor"/></>,
 wec:<><circle cx="260" cy="105" r="82"/>{Array.from({length:24},(_,i)=><path key={i} d="M260 31v12" transform={'rotate('+i*15+' 260 105)'} strokeWidth={i%6?1.5:3.5}/>)}<path d="M260 105V52M260 105l40 24" strokeWidth="4"/><circle cx="260" cy="105" r="5" fill="currentColor"/></>,
 gym:<><path d="M83 173h356m-324-18h294m-214 0V40h130m0 115V40M224 40v45m72-45v45"/><circle cx="224" cy="95" r="11"/><circle cx="296" cy="95" r="11"/><path d="M105 155l33-22h243l31 22" opacity=".5"/></>
 };
 return <svg ref={r} className="sport-art" viewBox="0 0 520 210" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">{artwork[sport]||artwork.athletics}</svg>
}
