// Selectie delen tussen toestellen zonder server: de voorkeuren gaan als gecodeerde tekst in een link (#selectie=...).
// De link bevat alleen sporten, kijkdiensten, kijklijst en herinneringen; geen namen of andere persoonsgegevens.
import type {Profile} from './core';
const b64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromB64url=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
export function encodeSelection(p:Profile):string{return b64url(new TextEncoder().encode(JSON.stringify({v:1,p})))}
/** Geeft de voorkeuren uit de link terug, of null als de link geen geldige selectie bevat. Validatie gebeurt daarna in de app. */
export function decodeSelection(code:string):unknown{
 try{const o=JSON.parse(new TextDecoder().decode(fromB64url(code)));return o&&o.v===1&&o.p&&typeof o.p==='object'?o.p:null}catch{return null}
}
export const shareKey='selectie';
