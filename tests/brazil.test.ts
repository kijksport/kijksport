import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {occurs,time,type Event} from '../src/core.ts';
const entries=JSON.parse(readFileSync(new URL('../src/data.json',import.meta.url),'utf8')).events as Event[];
test('São Paulo is zichtbaar op de juiste Nederlandse dagen en tijden',()=>{for(const [id,date,nl] of [['br26p1','2026-11-06','16:30'],['br26p2','2026-11-06','20:00'],['br26p3','2026-11-07','15:30'],['br26q','2026-11-07','19:00'],['br26race','2026-11-08','18:00']]){const e=entries.find(x=>x.id===id);assert.ok(e);assert.equal(occurs(e,date),true);assert.equal(time(e.iso!),nl);assert.equal(e.broadcast?.provider,'Viaplay')}});

test('Las Vegas staat op de Nederlandse dag na de lokale raceavond',()=>{const race=entries.find(x=>x.id==='lv26-5');assert.ok(race);assert.equal(occurs(race,'2026-11-22'),true);assert.equal(occurs(race,'2026-11-21'),false);assert.equal(time(race.iso!),'05:00')});
