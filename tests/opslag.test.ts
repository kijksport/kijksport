import test from 'node:test';import assert from 'node:assert/strict';
import {defaults,repairSettings,type Sport} from '../src/core.ts';
import {laad,bewaar,leesReserve,terugzetten,KEY,ONLEESBAAR} from '../src/opslag.ts';
const sports=[{id:'f1'},{id:'darts'},{id:'tennis'}] as Sport[];
const mem=(init:Record<string,string>={})=>{const m=new Map(Object.entries(init));return {getItem:(k:string)=>m.has(k)?m.get(k)!:null,setItem:(k:string,v:string)=>{m.set(k,v)},m}};
const standaard=defaults(sports);
const opgeslagen={version:3,theme:'dark',preferences:{sports:['f1','darts'],excluded:[],favorites:['a','b','c'],reminders:{a:{mode:'15'}}}};

test('kijklijst blijft staan als één herinnering beschadigd is (lege eigen tijd)',()=>{
 const x=structuredClone(opgeslagen) as any;x.preferences.reminders.b={mode:'custom',at:''};
 const o=mem({[KEY]:JSON.stringify(x)}),r=laad(o,sports,standaard);
 assert.equal(r.status,'hersteld');assert.deepEqual(r.settings.preferences.favorites,['a','b','c']);
 assert.deepEqual(Object.keys(r.settings.preferences.reminders),['a']);assert.ok(o.getItem(ONLEESBAAR),'origineel apart bewaard');
});
test('onbekende sport valt weg, de rest blijft',()=>{
 const x=structuredClone(opgeslagen) as any;x.preferences.sports.push('curling');x.preferences.services=['npo','onbekend'];
 const r=laad(mem({[KEY]:JSON.stringify(x)}),sports,standaard);
 assert.deepEqual(r.settings.preferences.sports,['f1','darts']);assert.deepEqual(r.settings.preferences.services,['npo']);assert.equal(r.settings.preferences.favorites.length,3);
});
test('onleesbare opslag wordt niet overschreven en de reservekopie komt terug',()=>{
 const o=mem();bewaar(o,repairSettings(opgeslagen,sports).settings,'1.6.1','2026-11-20');
 o.setItem(KEY,'{kapot');const r=laad(o,sports,standaard);
 assert.equal(r.status,'teruggezet');assert.deepEqual(r.settings.preferences.favorites,['a','b','c']);assert.equal(o.getItem(ONLEESBAAR),'{kapot');
});
test('zonder iets bruikbaars: standaard, met status',()=>{assert.equal(laad(mem(),sports,standaard).status,'nieuw');assert.equal(laad(mem({[KEY]:'null'}),sports,standaard).status,'onleesbaar')});
test('reservekopie: één per dag en versie, lege kijklijst vervangt geen gevulde',()=>{
 const o=mem(),s=repairSettings(opgeslagen,sports).settings;
 bewaar(o,s,'1.6.1','2026-11-20');bewaar(o,{...s,theme:'light'},'1.6.1','2026-11-20');assert.equal(leesReserve(o).length,1);
 bewaar(o,s,'1.7.0','2026-11-21');assert.equal(leesReserve(o).length,2);
 bewaar(o,{...s,preferences:{...s.preferences,favorites:[]}},'1.7.0','2026-11-21');
 const l=leesReserve(o);assert.equal(l.length,3);assert.equal(l[1].settings.preferences.favorites.length,3);
 for(let i=0;i<10;i++)bewaar(o,{...s,preferences:{...s.preferences,favorites:[String(i)]}},'1.7.0','2026-12-'+String(i+1).padStart(2,'0'));assert.equal(leesReserve(o).length,6);
});
test('terugzetten geeft de kijklijst en weergave van die kopie',()=>{
 const o=mem({'kijksport-weergave':'{"feiten":false}'}),s=repairSettings(opgeslagen,sports).settings;bewaar(o,s,'1.6.1','2026-11-20');
 o.setItem('kijksport-weergave','{}');const t=terugzetten(o,leesReserve(o)[0],sports);
 assert.deepEqual(t.preferences.favorites,['a','b','c']);assert.equal(o.getItem('kijksport-weergave'),'{"feiten":false}');
});
