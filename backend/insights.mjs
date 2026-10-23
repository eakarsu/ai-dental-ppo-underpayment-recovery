// Deterministic domain insights over own feature_records. No provider call here:
// callers label results aiGenerated:false when served from this fallback.
export function filterRecords(rows,{q="",status="",risk=""}={}){
  const needle=String(q).trim().toLowerCase();
  return (rows||[]).filter(r=>{
    if(status&&r.status!==status)return false;
    if(risk&&r.risk!==risk)return false;
    if(!needle)return true;
    const hay=[r.reference,r.title,r.owner,r.status,r.risk,JSON.stringify(r.payload||{})].join(" ").toLowerCase();
    return hay.includes(needle);
  });
}
export function toCSV(rows){
  const cols=["id","feature_id","reference","title","status","owner","risk","due_date","amount"];
  const esc=v=>{const s=v==null?"":String(v);return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
  return [cols.join(","),...(rows||[]).map(r=>cols.map(c=>esc(r[c])).join(","))].join("\n")+"\n";
}
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0;};
export function varianceSummary(rows,calc={}){
  let actual=0,expected=0,count=0;
  for(const r of rows||[]){const p=r.payload||{};const a=num(p[calc.actualKey]);const e=num(p[calc.expectedKey]);if(a||e){actual+=a;expected+=e;count+=1;}}
  const variance=calc.direction==="expected-minus-actual"?Math.max(0,expected-actual):Math.max(0,actual-expected);
  return {aiGenerated:false,source:"deterministic-fallback",label:"Deterministic variance summary (not AI-generated)",totalRecords:(rows||[]).length,recordsWithAmounts:count,actualTotal:actual,expectedTotal:expected,variance,sections:[{title:"Variance",detail:`${calc.varianceLabel||"Variance"}: ${variance}`},{title:"Coverage",detail:`${count} of ${(rows||[]).length} records carry both amounts.`},{title:"Zero and empty values",detail:"Records with 0 or missing amounts are counted above and retained, not dropped."}]};
}
export function riskTriage(rows){
  const open=(rows||[]).filter(r=>!["Approved","Closed"].includes(r.status));
  const high=open.filter(r=>["High","Critical"].includes(r.risk)).length;
  return {aiGenerated:false,source:"deterministic-fallback",label:"Deterministic risk triage (not AI-generated)",openCount:open.length,highRiskOpen:high,hasOpenWork:open.length>0,sections:[{title:"Open work",detail:`${open.length} records are not Approved or Closed.`},{title:"High risk",detail:`${high} open records are High or Critical risk.`}]};
}
export function nextActions(rows){
  const open=(rows||[]).filter(r=>!["Approved","Closed"].includes(r.status)).slice(0,10);
  return {aiGenerated:false,source:"deterministic-fallback",label:"Deterministic next actions (not AI-generated)",actions:open.map(r=>`Review ${r.reference||r.id} (${r.title||"untitled"}) - status ${r.status}, risk ${r.risk}, amount ${num(r.amount)}`),sections:[{title:"Suggested next actions",detail:open.length?`${open.length} open records listed.`:"No open records."}]};
}
