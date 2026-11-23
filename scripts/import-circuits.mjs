// Voegt baanvormen toe aan src/circuits.json uit de map circuits/ van github.com/bacinger/f1-circuits (MIT).
// Projectie gelijk aan de bestaande banen: equirectangulair rond de gemiddelde breedte, passend in 340 x 185 rond x=240, bovenkant y=20.
// Gebruik: node scripts/import-circuits.mjs <pad naar f1-circuits/circuits>
import fs from 'node:fs';
const dir=process.argv[2];
const nieuw={bahrain:['bh-2002','Bahrain International Circuit','Sakhir'],'saudi-arabia':['sa-2021','Jeddah Corniche Circuit','Jeddah'],australia:['au-1953','Albert Park Circuit','Melbourne'],japan:['jp-1962','Suzuka Circuit','Suzuka'],china:['cn-2004','Shanghai International Circuit','Shanghai'],miami:['us-2022','Miami International Autodrome','Miami'],canada:['ca-1978','Circuit Gilles-Villeneuve','Montréal'],monaco:['mc-1929','Circuit de Monaco','Monte Carlo'],portugal:['pt-2008','Autódromo Internacional do Algarve','Portimão'],'great-britain':['gb-1948','Silverstone Circuit','Silverstone'],austria:['at-1969','Red Bull Ring','Spielberg'],belgium:['be-1925','Circuit de Spa-Francorchamps','Stavelot'],hungary:['hu-1986','Hungaroring','Mogyoród'],italy:['it-1922','Autodromo Nazionale Monza','Monza'],spain:['es-2026','Madring','Madrid'],azerbaijan:['az-2016','Baku City Circuit','Bakoe'],turkey:['tr-2005','Istanbul Park','Istanbul'],singapore:['sg-2008','Marina Bay Street Circuit','Singapore']};
function proj(co,W=340,H=185,cx=240,top=20){
 const lat0=co.reduce((a,c)=>a+c[1],0)/co.length,k=Math.cos(lat0*Math.PI/180);
 const q=co.map(([lo,la])=>[lo*k,-la]),xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);
 const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
 const s=Math.min(W/(maxx-minx),H/(maxy-miny)),ox=cx-(maxx-minx)*s/2;
 return q.map(([x,y])=>[+(ox+(x-minx)*s).toFixed(2),+(top+(y-miny)*s).toFixed(2)]);
}
const p='src/circuits.json',c=JSON.parse(fs.readFileSync(p,'utf8'));
for(const [key,[f,name,location]] of Object.entries(nieuw)){
 const g=JSON.parse(fs.readFileSync(`${dir}/${f}.geojson`,'utf8')),co=g.features[0].geometry.coordinates;
 const lat=+(co.reduce((a,x)=>a+x[1],0)/co.length).toFixed(6),lon=+(co.reduce((a,x)=>a+x[0],0)/co.length).toFixed(6);
 c[key]={name,location,source:`https://github.com/bacinger/f1-circuits/blob/master/circuits/${f}.geojson`,points:proj(co),lat,lon,statsSource:'https://www.formula1.com/en/racing/2027',markers:null};
}
fs.writeFileSync(p,JSON.stringify(c));console.log(Object.keys(c).length);
