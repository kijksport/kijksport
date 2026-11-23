// Welkomstscherm na een update, zoals Apple dat in de eigen apps doet: kort wat er nieuw is, één knop om verder te gaan.
// Verschijnt één keer per versie, alleen voor wie de app al gebruikte. Nieuwe gebruikers slaan het over.
import {useEffect,useRef,type CSSProperties} from 'react';
import {opslag} from './kanaal';
import {Bookmark,History,Target,Sparkles,CalendarClock,MapPin,Flag,SlidersHorizontal,Users,Tv,type LucideIcon} from 'lucide-react';
import packageInfo from '../package.json';

type Punt={icoon:LucideIcon;kleur:string;titel:string;tekst:string};
/** Nieuwste versie bovenaan. Houd het kort: hoogstens vier punten per versie, in gewone woorden. */
export const versies:{versie:string;punten:Punt[]}[]=[
 {versie:'1.7.6',punten:[
  {icoon:MapPin,kleur:'var(--rood)',titel:'Staande banen liggen nu dwars',tekst:'Lange, smalle circuits zoals Jeddah en Montréal liggen een kwartslag gedraaid, zodat ze het beeld vullen. Het kompas wijst dan naar rechts.'},
  {icoon:Sparkles,kleur:'var(--focus)',titel:'Status zonder knopvorm',tekst:'De status bij een evenement is een stip met tekst; het was nooit een knop.'}]},
 {versie:'1.7.5',punten:[
  {icoon:Sparkles,kleur:'var(--focus)',titel:'Kortere, duidelijkere teksten',tekst:'Werkaantekeningen uit de beginfase zijn weg. Status, controledatum en bron staan op één regel.'},
  {icoon:Flag,kleur:'var(--rood)',titel:'Groter circuit met vlag',tekst:'Baan en vlag vullen het hele beeld; de baaninfo staat er direct onder.'}]},
 {versie:'1.7.3',punten:[
  {icoon:Flag,kleur:'var(--rood)',titel:'Circuit met vlag en info in beeld',tekst:'Baanlengte, ronden, record en de sectorkleuren staan nu in de baankaart, met de vlag van het land erachter.'},
  {icoon:MapPin,kleur:'var(--focus)',titel:'Volgende circuit in Sporten',tekst:'Bij Formule 1 zie je in de Sporten-tab de baan van de eerstvolgende race.'},
  {icoon:Tv,kleur:'var(--let)',titel:'Testbeeld op lege dagen',tekst:'Staat er niets op tv, dan zie je een testbeeld.'}]},
 {versie:'1.7.2',punten:[
  {icoon:MapPin,kleur:'var(--rood)',titel:'Alle circuits van 2027',tekst:'Elk F1-raceweekend van 2027 heeft nu een eigen baantekening.'},
  {icoon:SlidersHorizontal,kleur:'var(--focus)',titel:'Overzichtelijke Sporten-tab',tekst:'Sporten zijn ingeklapt. Met Sober zet je in één keer alle tekeningen en feiten uit.'},
  {icoon:Users,kleur:'var(--ok)',titel:'Nieuw colofon',tekst:'Wie KijkSport hebben gemaakt, met links naar ChatGPT en Claude.'}]},
 {versie:'1.7.1',punten:[
  {icoon:CalendarClock,kleur:'var(--focus)',titel:'Hele wedstrijd in je agenda',tekst:'Races en wedstrijden staan nu van begin tot (geschat) einde in je agenda. Toernooien van meerdere dagen blokkeren je agenda niet.'},
  {icoon:MapPin,kleur:'var(--rood)',titel:'Circuits bij de F1 van 2027',tekst:'Bij elk raceweekend van 2027 staat nu het circuit, met bron.'},
  {icoon:Flag,kleur:'var(--let)',titel:'Uitleg bij de circuitkleuren',tekst:'Onder de tekening staat wat de rode, blauwe en gele delen zijn: de drie tijdsectoren.'}]},
 {versie:'1.7.0',punten:[
  {icoon:Bookmark,kleur:'var(--rood)',titel:'Je kijklijst blijft bewaard',tekst:'Bij een nieuwe versie blijven je kijklijst en voorkeuren staan. Klopt één onderdeel niet meer, dan valt alleen dat weg.'},
  {icoon:History,kleur:'var(--ok)',titel:'Automatische reservekopie',tekst:'KijkSport bewaart zelf de laatste standen op dit toestel. Terugzetten kan via de informatieknop, onder Back-up.'},
  {icoon:Target,kleur:'var(--let)',titel:'Rustiger dartspijlen',tekst:'De pijlen vliegen nog steeds het bord in, maar trillen niet meer na.'},
  {icoon:Sparkles,kleur:'var(--focus)',titel:'Wat is nieuw',tekst:'Na elke update zie je voortaan op dit scherm kort wat er veranderd is.'}]},
];
const KEY='kijksport-gezien';
const nr=(v:string)=>v.split('.').map(Number).reduce((a,b)=>a*1000+(b||0),0);

/** Of het scherm bij deze start moet verschijnen. Bij een nieuwe gebruiker wordt de versie meteen als gezien genoteerd. */
export function nieuwTonen(status:'nieuw'|string):boolean{
 try{const gezien=opslag().getItem(KEY);if(gezien===packageInfo.version)return false;if(status==='nieuw'){opslag().setItem(KEY,packageInfo.version);return false}return versies.some(v=>v.versie===packageInfo.version)}catch{return false}
}
/** De punten sinds de laatst geziene versie, hoogstens vijf. Zonder eerdere notitie alleen die van deze versie. */
function punten(){let gezien:string|null=null;try{gezien=opslag().getItem(KEY)}catch{/* geen opslag */}
 const lijst=versies.filter(v=>nr(v.versie)<=nr(packageInfo.version)&&(gezien?nr(v.versie)>nr(gezien):v.versie===packageInfo.version));
 return (lijst.length?lijst:versies.slice(0,1)).flatMap(v=>v.punten).slice(0,5)}

export function Nieuw({open,onClose}:{open:boolean;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close()},[open]);
 const klaar=()=>{try{opslag().setItem(KEY,packageInfo.version)}catch{/* dan verschijnt het scherm de volgende keer opnieuw */}onClose()};
 return <dialog ref={ref} className="nieuw" aria-labelledby="nieuw-titel" onCancel={e=>{e.preventDefault();klaar()}}>{open&&<div className="nieuw-inhoud">
  <header><img src={import.meta.env.BASE_URL+'icon-192.png'} alt="" width="72" height="72"/><h2 id="nieuw-titel">Nieuw in KijkSport</h2><p>Versie {packageInfo.version}</p></header>
  <ul>{punten().map((p,i)=>{const I=p.icoon;return <li key={p.titel} style={{'--i':i} as CSSProperties}><span className="nieuw-icoon" style={{color:p.kleur}}><I size={30} strokeWidth={2.2} aria-hidden="true"/></span><span><b>{p.titel}</b><span>{p.tekst}</span></span></li>})}</ul>
  <button className="knop vol" autoFocus onClick={klaar}>Ga verder</button>
 </div>}</dialog>;
}
