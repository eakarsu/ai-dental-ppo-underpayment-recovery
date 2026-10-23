import test from "node:test";import assert from "node:assert/strict";
import {filterRecords,toCSV,varianceSummary,riskTriage,nextActions} from "../insights.mjs";
const rows=[{id:1,reference:"A-1",title:"Alpha case",status:"Open",owner:"Sam",risk:"High",amount:0,payload:{paidAmount:100,expectedAmount:140}},{id:2,reference:"B-2",title:"Beta",status:"Closed",owner:"Jo",risk:"Low",amount:50,payload:{}}];
test("search/filter keeps false/0/empty visible",()=>{assert.equal(filterRecords(rows,{q:"alpha"}).length,1);assert.equal(filterRecords(rows,{status:"Closed"})[0].amount,50);assert.equal(filterRecords(rows,{})[0].amount,0);});
test("CSV export includes header and zero amount",()=>{const c=toCSV(rows);assert.ok(c.startsWith("id,feature_id"));assert.ok(c.includes(",0"));});
test("insights are labelled deterministic fallback",()=>{const calc={actualKey:"paidAmount",expectedKey:"expectedAmount",direction:"expected-minus-actual",varianceLabel:"Var"};const v=varianceSummary(rows,calc);assert.equal(v.aiGenerated,false);assert.equal(v.variance,40);assert.ok(v.sections.length>=2);assert.equal(riskTriage(rows).aiGenerated,false);assert.equal(nextActions(rows).aiGenerated,false);});
