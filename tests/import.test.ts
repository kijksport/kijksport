import{test}from'node:test';import assert from'node:assert/strict';
// @ts-ignore The importer is an executable ESM module as well as a pure normalization library.
import{dates,merge}from'../scripts/import-wikidata.mjs';
const claim=(time:string,precision=11,rank='normal')=>({rank,mainsnak:{datavalue:{value:{time,precision}}}});
test('import rejects insufficient precision and conflicting dates',()=>{assert.throws(()=>dates({claims:{P580:[claim('+2028-07-00T00:00:00Z',10)],P582:[claim('+2028-07-30T00:00:00Z')]}}));assert.throws(()=>dates({claims:{P580:[claim('+2028-07-14T00:00:00Z'),claim('+2028-07-15T00:00:00Z')],P582:[claim('+2028-07-30T00:00:00Z')]}}))});
test('import preserves IDs/favorites, detects changes and is idempotent',()=>{const e={id:'e086',start:'2028-07-13',end:'2028-07-30',broadcast:null};const u=[{eventId:'e086',qid:'Q1451505',start:'2028-07-14',end:'2028-07-30'}];const out=merge([e],u,'2026-10-25');assert.equal(out.length,1);assert.equal(out[0].id,e.id);assert.equal(out[0].status,'changed');assert.deepEqual(merge(out,u,'2026-10-25'),out);assert.equal(out[0].broadcast,null)});
