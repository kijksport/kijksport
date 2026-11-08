// Baangeometrie: posities langs de baanvorm als fractie (0 tot 1) van de totale lengte.
// Gebruikt voor start/finish, bochtnummers en sectoren zodra die per circuit zijn gecontroleerd.
export type Markers={startFinish?:number;corners?:{n:number;at:number}[];sectors?:number[];reverse?:boolean;source:string;checked:string;note?:string};
export type CircuitInfo={name:string;location:string;source:string;statsSource:string;points:number[][];lat:number;lon:number;length?:string;laps?:string;distance?:string;firstGp?:number;record?:{time:string;driver:string;year:number};statsChecked?:string;markers?:Markers|null};

export function track(points:number[][]){
 const all=[...points,points[0]];
 const cum=[0];
 for(let i=1;i<all.length;i++)cum.push(cum[i-1]+Math.hypot(all[i][0]-all[i-1][0],all[i][1]-all[i-1][1]));
 const total=cum[cum.length-1];
 const cx=points.reduce((a,p)=>a+p[0],0)/points.length,cy=points.reduce((a,p)=>a+p[1],0)/points.length;
 /** Punt op fractie f van de baan, met eenheidsnormaal die van het midden van de baanvorm af wijst. */
 function at(f:number){
  const t=((f%1)+1)%1*total;
  let i=1;while(i<cum.length-1&&cum[i]<t)i++;
  const a=all[i-1],b=all[i],seg=cum[i]-cum[i-1]||1,u=(t-cum[i-1])/seg;
  const x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;
  const dx=(b[0]-a[0])/seg,dy=(b[1]-a[1])/seg;
  let nx=-dy,ny=dx;
  if(nx*(x-cx)+ny*(y-cy)<0){nx=-nx;ny=-ny}
  return {x,y,nx,ny,dx,dy};
 }
 return {total,at};
}

export const km=(s:string)=>Number(s).toLocaleString('nl-NL',{minimumFractionDigits:3,maximumFractionDigits:3})+' km';
