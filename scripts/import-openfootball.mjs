// OpenFootball's published public-domain Dutch Eredivisie fixtures.
import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const source='https://github.com/openfootball/football.json/blob/master/2026-27/nl.1.json';
const feed='https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/nl.1.json';
const dateOk=d=>typeof d==='string'&&/^2026-\d{2}-\d{2}$|^2027-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
function utc(date,time){
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time??''))return null;
 const target=Date.parse(date+'T'+time+'Z'),fmt=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 let t=target;
 for(let i=0;i<4;i++){const gap=target-Date.parse(fmt.format(new Date(t)).replace(' ','T')+'Z');if(!gap)return new Date(t).toISOString();t+=gap}
 return null;
}
export function fixtures(data,from,through,checked){
 if(data?.name!=='Netherlands Eredivisie 2026/27'||!Array.isArray(data.matches)||data.matches.length<1||!dateOk(from)||!dateOk(through)||from>through)throw Error('Onverwachte bron of periode.');
 const selected=data.matches.filter(m=>dateOk(m.date)&&m.date>=from&&m.date<=through&&typeof m.team1==='string'&&m.team1.trim()&&typeof m.team2==='string'&&m.team2.trim());
 return [...new Map(selected.map(m=>{
  const id='eredivisie-'+createHash('sha256').update('2026-27|'+m.team1+'|'+m.team2).digest('hex').slice(0,16);
  return [id,{id,sport:'football',title:m.team1+' – '+m.team2,start:m.date,end:m.date,iso:utc(m.date,m.time),source,desc:'Eredivisie 2026/27 · '+m.round+'. Wedstrijdprogramma via OpenFootball. Wijzigingen mogelijk; Nederlandse uitzending niet gecontroleerd.',venue:'',highlight:false,tags:['men','eredivisie'],status:'announced',checked,broadcast:null}];
 })).values()];
}
async function run(){
 const [from,through]=process.argv.slice(2);
 const res=await fetch(feed,{signal:AbortSignal.timeout(15000)});if(!res.ok)throw Error('OpenFootball HTTP '+res.status);
 const checked=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',dateStyle:'short'}).format(new Date());
 const updates=fixtures(await res.json(),from,through,checked);if(!updates.length)throw Error('Geen wedstrijden in deze periode; dataset is niet aangepast.');
 const data=JSON.parse(await readFile('src/data.json','utf8'));
 const ids=new Set(updates.map(e=>e.id));
 const next={...data,events:[...data.events.filter(e=>!ids.has(e.id)),...updates]};
 await writeFile('src/data.json.tmp',JSON.stringify(next,null,2)+'\n');await rename('src/data.json.tmp','src/data.json');
 console.log(updates.length+' wedstrijden geïmporteerd.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)run().catch(e=>{console.error(e.message);process.exitCode=1});
