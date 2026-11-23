// Testkanaal: de testversie draait op /kijksport/test/ en mag de echte gegevens van de testers niet raken.
// In de testversie krijgt elke sleutel het voorvoegsel 'proef:'; bij de eerste start wordt de echte stand één keer gekopieerd (alleen gelezen).
// In de gewone versie is opslag gewoon localStorage.
export const kanaal:'live'|'test'=(import.meta as {env?:Record<string,string>}).env?.VITE_KANAAL==='test'?'test':'live';
const P='proef:';
type S=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
function proef(ls:Storage):S{
 try{if(ls.getItem(P+'sportkijk-v2')===null&&ls.getItem(P+'gekopieerd')===null){for(let i=0;i<ls.length;i++){const k=ls.key(i);if(k&&!k.startsWith(P)&&(k.startsWith('sportkijk')||k.startsWith('kijksport')))ls.setItem(P+k,ls.getItem(k)!)}ls.setItem(P+'gekopieerd',new Date().toISOString())}}catch{/* geen opslag */}
 return {getItem:k=>ls.getItem(P+k),setItem:(k,v)=>ls.setItem(P+k,v),removeItem:k=>ls.removeItem(P+k)};
}
let o:S|null=null;
/** De opslag van dit kanaal. Een functie, zodat een geblokkeerde opslag pas bij gebruik een fout geeft. */
export function opslag():S{return o??=(kanaal==='test'?proef(localStorage):localStorage)}
