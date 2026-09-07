const $=id=>document.getElementById(id);
const KEY="nexaro-field-crm-v7-data";
const INTERNAL_KEY="nexaro-field-crm-v7-internal";

const PRODUCTS=[
 {id:"tap",name:"Tap to Pay",price:0,kind:"mobile",fit:"Für mobile Verkäufer und Betriebe, die direkt per Smartphone kassieren möchten."},
 {id:"solo-lite",name:"Solo Lite",price:34,kind:"terminal",fit:"Kompaktes Kartenlesegerät für einfache mobile Kartenzahlung."},
 {id:"solo",name:"Solo",price:79,kind:"terminal",fit:"Eigenständiges mobiles Terminal für regelmäßige Kartenzahlungen."},
 {id:"terminal",name:"Terminal",price:169,kind:"terminal",fit:"Stationäres, größeres Gerät für hohe Frequenz und Kassenbetrieb."},
 {id:"pos",name:"Kassensystem / POS",price:0,kind:"software",fit:"Für Betriebe mit umfangreicherem Kassen-, Artikel- und Team-Bedarf."}
];
const TARIFFS=[
 {id:"payg",name:"Umsatzbasiertes Zahlen",fee:.0139,monthly:0},
 {id:"plus",name:"Zahlungen Plus",fee:.0079,monthly:19}
];
const state=load();
let leadFilter="all", areaOrigin=null, areaCandidates=[], route=[];
let assistant={step:1,company:"",industry:"",solution:"",satisfaction:"",pain:"",tpv:0,objection:"",timing:""};

function load(){try{return JSON.parse(localStorage.getItem(KEY))||{leads:[],tasks:[]}}catch{return{leads:[],tasks:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function loadInternal(){try{return JSON.parse(localStorage.getItem(INTERNAL_KEY))||{profile:"partner",netMargin:.007}}catch{return{profile:"partner",netMargin:.007}}}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function money(v){return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(v)||0)}
function today(){return new Date().toISOString().slice(0,10)}
function go(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll(".bottom-nav [data-go]").forEach(b=>b.classList.toggle("active",b.dataset.go===id));if(id==="assistant")renderAssistant();if(id==="more")renderMore()}

document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("newLead").onclick=()=>openLead();
$("leadSearch").oninput=renderLeads;
document.querySelectorAll("#leadFilters .chip").forEach(b=>b.onclick=()=>{leadFilter=b.dataset.filter;document.querySelectorAll("#leadFilters .chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderLeads()});
$("resetAssistant").onclick=()=>{assistant={step:1,company:"",industry:"",solution:"",satisfaction:"",pain:"",tpv:0,objection:"",timing:""};renderAssistant()};
$("useLocation").onclick=useLocation;
$("searchArea").onclick=searchArea;
$("optimizeRoute").onclick=optimizeRoute;
$("openMaps").onclick=openMaps;
$("newTask").onclick=()=>openTask();
$("exportJson").onclick=()=>download("nexaro-field-crm-v7-backup.json",JSON.stringify(state,null,2),"application/json");
$("exportCsv").onclick=exportCsv;
$("restoreJson").onchange=restoreJson;
$("demoData").onclick=demoData;
$("clearData").onclick=()=>{if(confirm("Alle lokalen CRM-Daten löschen?")){state.leads=[];state.tasks=[];save()}};
document.querySelectorAll(".menu-grid [data-panel]").forEach(b=>b.onclick=()=>renderMore(b.dataset.panel));
$("closeModal").onclick=closeModal;
$("installBtn").onclick=()=>{if(window.deferredInstall)window.deferredInstall.prompt();else alert("Auf iPhone: Teilen → Zum Home-Bildschirm.");};
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;window.deferredInstall=e});

function renderAll(){renderDashboard();renderLeads();renderTasks();renderMore()}
function renderDashboard(){
 $("kLeads").textContent=state.leads.filter(l=>l.status!=="gewonnen").length;
 $("kTasks").textContent=state.tasks.filter(t=>!t.done&&t.due<=today()).length;
 $("kAppts").textContent=state.leads.filter(l=>l.status==="termin").length;
 $("kWon").textContent=state.leads.filter(l=>l.status==="gewonnen").length;
 const next=[...state.tasks].filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
 $("homeNext").innerHTML=next.map(t=>`<div class="card" style="margin:8px 0"><b>${esc(t.title)}</b><div class="meta">${esc(t.company||"Allgemein")} · ${esc(t.due)}</div></div>`).join("")||`<div class="card">Keine offenen Follow-ups. Zeit für neue Besuche! 💪</div>`;
}
function statusLabel(s){return ({neu:"Neu",kontakt:"Kontaktiert",termin:"Termin",gewonnen:"Gewonnen"})[s]||s}
function renderLeads(){
 const q=($("leadSearch").value||"").toLowerCase();
 let arr=state.leads.filter(l=>(leadFilter==="all"||l.status===leadFilter)&&JSON.stringify(l).toLowerCase().includes(q));
 $("leadList").innerHTML=arr.map(l=>`<div class="lead-card">
  <div class="lead-top"><div><div class="lead-title">${esc(l.company)}</div><div class="meta">${esc(l.industry||"")} · ${esc(l.address||"")}</div></div><span class="badge ${l.status==="gewonnen"?"green":l.status==="termin"?"orange":""}">${statusLabel(l.status)}</span></div>
  <div class="meta">${esc(l.contact||"Kein Ansprechpartner")} · ${esc(l.phone||"")}</div>
  <div class="meta">TPV: ${l.tpv?money(l.tpv)+"/Monat":"nicht erfasst"} · Lösung: ${esc(l.product||"offen")}</div>
  <div class="lead-actions"><button onclick="editLead('${l.id}')">✏️ Bearbeiten</button><button onclick="callLead('${l.id}')">📞 Anrufen</button><button onclick="mailLead('${l.id}')">✉️ E-Mail</button><button onclick="leadMaps('${l.id}')">🗺️ Maps</button></div>
 </div>`).join("")||`<div class="card">Noch keine Leads vorhanden.</div>`;
}
function openLead(id){
 const l=state.leads.find(x=>x.id===id)||{id:"",company:"",industry:"",contact:"",phone:"",email:"",address:"",status:"neu",tpv:"",provider:"",product:"",notes:"",next:"",due:today()};
 showModal(`<h2>${id?"Lead bearbeiten":"Neuen Lead erfassen"}</h2>
 <div class="form-grid">
 <input id="f_company" class="full" placeholder="Firma *" value="${esc(l.company)}">
 <input id="f_industry" placeholder="Branche" value="${esc(l.industry)}"><input id="f_contact" placeholder="Ansprechpartner" value="${esc(l.contact)}">
 <input id="f_phone" inputmode="tel" placeholder="Telefon" value="${esc(l.phone)}"><input id="f_email" type="email" placeholder="E-Mail" value="${esc(l.email)}">
 <input id="f_address" class="full" placeholder="Adresse / Ort" value="${esc(l.address)}">
 <input id="f_tpv" inputmode="decimal" placeholder="Kartenzahlungsvolumen €/Monat" value="${esc(l.tpv)}"><select id="f_status"><option value="neu">Neu</option><option value="kontakt">Kontaktiert</option><option value="termin">Termin</option><option value="gewonnen">Gewonnen</option></select>
 <input id="f_provider" placeholder="Aktueller Anbieter" value="${esc(l.provider)}"><input id="f_product" placeholder="Empfohlene Lösung" value="${esc(l.product)}">
 <input id="f_next" placeholder="Nächster Schritt" value="${esc(l.next)}"><input id="f_due" type="date" value="${esc(l.due||today())}">
 <textarea id="f_notes" class="full" placeholder="Notizen">${esc(l.notes)}</textarea>
 </div><button class="primary wide" onclick="saveLeadForm('${id}')">Speichern</button>`);
 $("f_status").value=l.status;
}
function saveLeadForm(id){
 const company=$("f_company").value.trim();if(!company)return alert("Firma fehlt.");
 const lead={id:id||uid(),company,industry:$("f_industry").value.trim(),contact:$("f_contact").value.trim(),phone:$("f_phone").value.trim(),email:$("f_email").value.trim(),address:$("f_address").value.trim(),tpv:Number(($("f_tpv").value||"").replace(",","."))||0,provider:$("f_provider").value.trim(),product:$("f_product").value.trim(),status:$("f_status").value,next:$("f_next").value.trim(),due:$("f_due").value||today(),notes:$("f_notes").value.trim(),updatedAt:new Date().toISOString()};
 const i=state.leads.findIndex(x=>x.id===lead.id);if(i>=0)state.leads[i]=lead;else state.leads.unshift(lead);closeModal();save();
}
function editLead(id){openLead(id)}
function callLead(id){const l=state.leads.find(x=>x.id===id);if(l?.phone)location.href="tel:"+l.phone;else alert("Keine Telefonnummer hinterlegt.")}
function mailLead(id){const l=state.leads.find(x=>x.id===id);if(l?.email)location.href=`mailto:${l.email}?subject=${encodeURIComponent("SumUp Beratung – "+l.company)}`;else alert("Keine E-Mail hinterlegt.")}
function leadMaps(id){const l=state.leads.find(x=>x.id===id);if(l?.address)window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(l.address),"_blank");else alert("Keine Adresse hinterlegt.")}
window.editLead=editLead;window.callLead=callLead;window.mailLead=mailLead;window.leadMaps=leadMaps;window.saveLeadForm=saveLeadForm;

function assistantStep(){
 const a=assistant;
 if(a.step===1)return `<div class="assistant-card"><div class="assistant-label">NE XARO · START</div><h3>Wen sprichst du an?</h3><input id="aCompany" placeholder="Firma / Betrieb" value="${esc(a.company)}"><select id="aIndustry"><option value="">Branche auswählen</option>${["Kiosk / Späti","Einzelhandel","Gastronomie","Bäckerei","Friseur","Handwerk","Getränkemarkt","Tankstelle","Sonstiges"].map(x=>`<option ${a.industry===x?"selected":""}>${x}</option>`).join("")}</select><button class="primary wide" data-a="step1">Gespräch starten →</button></div>`;
 if(a.step===2)return `<div class="assistant-card"><div class="assistant-label">NE XARO · IST-SITUATION</div><h3>Wie nimmt der Betrieb aktuell Kartenzahlungen an?</h3><div class="choice-grid">${["SumUp","Anderes Terminal","Keine Kartenzahlung","Weiß ich noch nicht"].map(x=>`<button class="secondary" data-a="solution" data-v="${esc(x)}">${x}</button>`).join("")}</div></div>`;
 if(a.step===3)return `<div class="assistant-card"><div class="assistant-label">NE XARO · ZUFRIEDENHEIT</div><h3>Wie zufrieden ist der Betrieb mit der aktuellen Lösung?</h3><div class="choice-grid">${["Sehr zufrieden","Grundsätzlich zufrieden","Nicht zufrieden"].map(x=>`<button class="secondary" data-a="satisfaction" data-v="${x}">${x}</button>`).join("")}</div></div>`;
 if(a.step===4)return `<div class="assistant-card"><div class="assistant-label">NE XARO · QUALIFIZIERUNG</div><h3>Wie hoch ist ungefähr das monatliche Kartenzahlungsvolumen?</h3><div class="choice-grid">${[[4999,"Unter 5.000 €"],[5000,"5.000–9.999 €"],[10000,"10.000–14.999 €"],[15000,"15.000–19.999 €"],[20000,"20.000 € und mehr"]].map(x=>`<button class="secondary" data-a="tpv" data-v="${x[0]}">${x[1]}</button>`).join("")}</div><div class="tip"><b>Interne Vertriebsqualifizierung:</b> 5.000 €+ Kartenvolumen gilt bei neXaro als Zielkriterium. Das ist keine von SumUp behauptete Mindestanforderung.</div></div>`;
 if(a.step===5){
  if(a.objection)return `<div class="assistant-card"><div class="assistant-label">NE XARO · EINWAND</div><h3>${esc(a.objection)}</h3><div class="tip"><b>Sales Coach:</b> Erst verstehen, dann konkretisieren, dann passende Lösung anbieten. Keine Preisargumentation ohne Ist-Kosten.</div><button class="primary wide" data-a="clearObjection">Einwand klären →</button>`;
  return `<div class="assistant-card"><div class="assistant-label">NE XARO · LÖSUNG</div>${customerRecommendation()}</div>`;
 }
 if(a.step===6)return `<div class="assistant-card result"><div class="assistant-label">NE XARO · ABSCHLUSS</div><h3>Abschluss vorbereiten</h3><div class="choice-grid">${["Abschluss heute","Rückruf vereinbaren","Angebot senden","Kein Interesse"].map(x=>`<button class="secondary" data-a="finish" data-v="${x}">${x}</button>`).join("")}</div></div>`;
}
function customerRecommendation(){
 const r=tariffRecommendation(assistant.tpv);
 const prod=productRecommendation();
 const pain=assistant.pain?`<div class="info">Hauptthema: <b>${esc(assistant.pain)}</b></div>`:"";
 return `${pain}<div class="option"><div class="eyebrow">PASSENDER SUMUP-ANSATZ</div><strong>${r.name}</strong><div class="price">${r.feeText}</div><div class="info">${r.reason}</div></div><div class="option"><div class="eyebrow">EMPFOHLENE LÖSUNG</div><strong>${prod.name}</strong><div class="info">${prod.fit}</div>${prod.price!==null?`<div class="price">${prod.price===0?"0 €":money(prod.price)} <small>zzgl. MwSt. / je nach Angebot</small></div>`:""}</div><div class="tip"><b>Sales Coach:</b> „Lassen Sie uns kurz Ihre aktuelle Situation mit der passenden SumUp-Lösung vergleichen. Dann sehen Sie sofort, ob sich der Wechsel für Sie lohnt.“</div><button class="primary wide" data-a="next">Weiter zum Abschluss →</button>`;
}
function tariffRecommendation(tpv){
 if(Number(tpv)>=3500)return {name:"Zahlungen Plus",feeText:"0,79 % + 19 €/Monat",reason:"Für monatliche Zahlungen ab 3.500 € kann dieser Tarif bei passenden Vor-Ort-Verbraucherkarten Gebühren sparen."};
 return {name:"Umsatzbasiertes Zahlen",feeText:"1,39 % · 0 €/Monat",reason:"Keine feste Monatsgebühr und damit flexibel bei niedrigeren oder schwankenden Umsätzen."};
}
function productRecommendation(){
 const i=assistant.industry||"";
 if(["Gastronomie","Einzelhandel"].includes(i))return PRODUCTS.find(p=>p.id==="terminal");
 if(["Kiosk / Späti","Getränkemarkt","Bäckerei","Friseur","Handwerk","Tankstelle"].includes(i))return PRODUCTS.find(p=>p.id==="solo");
 return PRODUCTS.find(p=>p.id==="solo-lite");
}
function renderAssistant(){
 const root=$("assistantApp");const done=Math.max(0,assistant.step-1);
 root.innerHTML=`<div class="assistant-progress">${[1,2,3,4,5,6].map(i=>`<i class="${i<=assistant.step?"on":""}"></i>`).join("")}</div>${assistantStep()}`;
 root.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>assistantAction(b.dataset.a,b.dataset.v||""));
}
function assistantAction(a,v){
 if(a==="step1"){assistant.company=$("aCompany").value.trim();assistant.industry=$("aIndustry").value;assistant.step=2}
 if(a==="solution"){assistant.solution=v;assistant.step=3}
 if(a==="satisfaction"){assistant.satisfaction=v;if(v==="Nicht zufrieden"){assistant.step=5;assistant.pain="Kosten"}else assistant.step=4}
 if(a==="tpv"){assistant.tpv=Number(v);assistant.step=5}
 if(a==="next"){assistant.step=6}
 if(a==="clearObjection"){assistant.objection="";assistant.step=5}
 if(a==="finish"){assistant.timing=v;saveAssistantLead()}
 renderAssistant();
}
function saveAssistantLead(){
 if(!assistant.company)return;
 const existing=state.leads.find(l=>l.company.toLowerCase()===assistant.company.toLowerCase());
 const l=existing||{id:uid(),company:assistant.company};
 Object.assign(l,{industry:assistant.industry,status:assistant.timing==="Abschluss heute"?"gewonnen":assistant.timing==="Rückruf vereinbaren"?"termin":"kontakt",tpv:assistant.tpv,provider:assistant.solution,product:productRecommendation().name,next:assistant.timing,due:today(),notes:`Sales Assistant: ${assistant.satisfaction}`});
 if(!existing)state.leads.unshift(l);
 if(assistant.timing==="Rückruf vereinbaren")state.tasks.unshift({id:uid(),title:"Rückruf vereinbaren",company:l.company,due:today(),done:false});
 save();
}
function openTask(id){
 const t=state.tasks.find(x=>x.id===id)||{id:"",title:"",company:"",due:today(),done:false};
 showModal(`<h2>${id?"Task bearbeiten":"Neue Aufgabe"}</h2><input id="t_title" placeholder="Aufgabe" value="${esc(t.title)}"><input id="t_company" placeholder="Firma" value="${esc(t.company)}"><input id="t_due" type="date" value="${esc(t.due)}"><button class="primary wide" onclick="saveTask('${id}')">Speichern</button>`);
}
function saveTask(id){const t={id:id||uid(),title:$("t_title").value.trim(),company:$("t_company").value.trim(),due:$("t_due").value,done:false};if(!t.title)return;const i=state.tasks.findIndex(x=>x.id===t.id);if(i>=0)state.tasks[i]=Object.assign(state.tasks[i],t);else state.tasks.push(t);closeModal();save()}
window.saveTask=saveTask;
function renderTasks(){
 const arr=[...state.tasks].sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due));
 $("taskList").innerHTML=arr.map(t=>`<div class="lead-card"><div class="lead-top"><div><div class="lead-title">${esc(t.title)}</div><div class="meta">${esc(t.company||"Allgemein")} · ${esc(t.due)}</div></div><span class="badge ${t.done?"green":""}">${t.done?"Erledigt":"Offen"}</span></div><div class="lead-actions"><button onclick="toggleTask('${t.id}')">${t.done?"↩ Offen":"✓ Erledigt"}</button><button onclick="openTask('${t.id}')">✏️ Bearbeiten</button></div></div>`).join("")||`<div class="card">Keine Tasks.</div>`;
}
function toggleTask(id){const t=state.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save()}
window.toggleTask=toggleTask;window.openTask=openTask;

function renderMore(panel){
 const box=$("morePanel");if(!panel){box.innerHTML="";return}
 if(panel==="settings")box.innerHTML=`<div class="card internal"><h3>⚙️ Einstellungen</h3><p class="info">Daten werden lokal im Browser gespeichert. Für Team-/Cloudbetrieb ist später ein Backend erforderlich.</p><a href="https://www.sumup.com/de-de/preise/" target="_blank" rel="noopener">Aktuelle SumUp-Preise öffnen</a></div>`;
 if(panel==="internal")renderInternal();
}
function renderInternal(){
 const i=loadInternal();
 $("morePanel").innerHTML=`<div class="card internal"><div class="eyebrow">🔒 NUR INTERN</div><h3>Provisions- & Deal-Kalkulation</h3>
 <p class="info">Diese Daten werden niemals in der kundenorientierten Empfehlung angezeigt.</p>
 <label>Profil<select id="ic_profile"><option value="partner">Partner</option><option value="agent">Agent</option></select></label>
 <label>Nettomarge<input id="ic_margin" inputmode="decimal" value="${(i.netMargin*100).toFixed(2)}" placeholder="0,70"></label>
 <label>Monatliches Kartenvolumen<input id="ic_tpv" inputmode="decimal" value="" placeholder="z. B. 15000"></label>
 <label>Hardware-Verkaufspreis<input id="ic_hw" inputmode="decimal" value="" placeholder="z. B. 160"></label>
 <label>Software-Jahrespreis<input id="ic_sw" inputmode="decimal" value="" placeholder="z. B. 588"></label>
 <button id="calcInternal" class="primary wide">🧮 Intern berechnen</button><div id="internalResult"></div></div>`;
 $("ic_profile").value=i.profile;
 $("calcInternal").onclick=calculateInternal;
}
function calculateInternal(){
 const profile=$("ic_profile").value, margin=(Number($("ic_margin").value.replace(",","."))||.7)/100, tpv=Number($("ic_tpv").value.replace(",","."))||0, hw=Number($("ic_hw").value.replace(",","."))||0, sw=Number($("ic_sw").value.replace(",","."))||0;
 localStorage.setItem(INTERNAL_KEY,JSON.stringify({profile,netMargin:margin}));
 const share=profile==="partner"?.5:.4, residual=profile==="partner"?.2:0;
 const activation=tpv>=500?200:0;
 const annual=tpv*margin*12*share;
 const hardware=hw*.5, software=sw*.5;
 const day30=Math.max(0,annual-activation);
 const day60=Math.max(0,annual-day30-activation);
 const extras=(tpv>15000?100:0);
 const immediate=activation+day30+day60+hardware+software+extras;
 $("internalResult").innerHTML=`<div class="option"><b>Interne Schätzung</b><p>Aktivierungsbonus: ${money(activation)}</p><p>Payments annualisiert: ${money(annual)}</p><p>Hardware: ${money(hardware)}</p><p>Software: ${money(software)}</p><p>TPV-Master-Bonus: ${money(extras)}</p><p class="price">Gesamt sofort: ${money(immediate)}</p><p>Residual: ${money(tpv*margin*residual)}/Monat · maximal 24 Monate</p><div class="tip">Quelle: dein hinterlegtes Commission Scheme. Exakte Vertragsbedingungen gehen vor.</div></div>`;
}
function useLocation(){
 if(!navigator.geolocation)return alert("Standort wird nicht unterstützt.");
 navigator.geolocation.getCurrentPosition(p=>{areaOrigin={lat:p.coords.latitude,lon:p.coords.longitude};$("areaStatus").textContent=`📍 Live-Standort · ${areaOrigin.lat.toFixed(5)}, ${areaOrigin.lon.toFixed(5)}`},()=>alert("Standortzugriff wurde nicht erlaubt."));
}
async function geocodePLZ(){
 const p=$("plz").value.trim();if(!/^\d{5}$/.test(p))return null;
 const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=Germany&postalcode=${p}&limit=1`,{headers:{Accept:"application/json"}});
 const d=await r.json();return d[0]?{lat:Number(d[0].lat),lon:Number(d[0].lon)}:null;
}
async function searchArea(){
 try{
  if(!areaOrigin){areaOrigin=await geocodePLZ();if(areaOrigin)$("areaStatus").textContent=`📍 PLZ-Ausgangspunkt · ${areaOrigin.lat.toFixed(5)}, ${areaOrigin.lon.toFixed(5)}`;}
  if(!areaOrigin)return alert("Bitte zuerst Live-Standort oder PLZ setzen.");
  const radius=Number($("radius").value), ind=$("industry").value;
  const tag={bakery:'["shop"="bakery"]',beverage:'["shop"="beverages"]',retail:'["shop"]',gastronomy:'["amenity"~"restaurant|cafe|bar|fast_food"]',hairdresser:'["shop"="hairdresser"]',craft:'["craft"]',kiosk:'["shop"="convenience"]',fuel:'["amenity"="fuel"]'}[ind];
  const body=ind==="all"?`[out:json][timeout:30];(nwr(around:${radius},${areaOrigin.lat},${areaOrigin.lon})["name"]["shop"];nwr(around:${radius},${areaOrigin.lat},${areaOrigin.lon})["name"]["craft"];nwr(around:${radius},${areaOrigin.lat},${areaOrigin.lon})["name"]["amenity"~"restaurant|cafe|bar|fast_food|fuel"];);out center tags;`:`[out:json][timeout:30];nwr(around:${radius},${areaOrigin.lat},${areaOrigin.lon})${tag};out center tags;`;
  $("areaSearchStatus").textContent="Suche läuft…";
  const r=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body});const data=await r.json();
  areaCandidates=data.elements.map(e=>{const lat=e.lat??e.center?.lat,lon=e.lon??e.center?.lon,t=e.tags||{};return{name:t.name||"Unbenannt",lat,lon,address:[t["addr:street"],t["addr:housenumber"],t["addr:postcode"],t["addr:city"]].filter(Boolean).join(" "),distance:dist(areaOrigin.lat,areaOrigin.lon,lat,lon),phone:t.phone||t["contact:phone"]||"",website:t.website||""}}).filter(x=>x.lat&&x.lon).filter((x,i,a)=>a.findIndex(y=>y.name.toLowerCase()===x.name.toLowerCase()&&Math.abs(y.lat-x.lat)<.0001&&Math.abs(y.lon-x.lon)<.0001)===i).map(x=>{const exists=state.leads.some(l=>l.company.toLowerCase()===x.name.toLowerCase());return{...x,existing:exists,score:Math.max(20,Math.round(100-Math.min(45,x.distance/1000*7)-(exists?30:0)))}}).sort((a,b)=>b.score-a.score||a.distance-b.distance).slice(0,50);
  renderAreaResults();$("areaSearchStatus").textContent=`${areaCandidates.length} potenzielle Unternehmen gefunden.`;
 }catch(e){$("areaSearchStatus").textContent="Suche fehlgeschlagen. Bitte später erneut versuchen."}
}
function dist(a,b,c,d){const R=6371000,p=Math.PI/180,x=(c-a)*p,y=(d-b)*p;return 2*R*Math.asin(Math.sqrt(Math.sin(x/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(y/2)**2))}
function renderAreaResults(){
 $("areaResults").innerHTML=areaCandidates.map((x,i)=>`<div class="lead-card"><div class="lead-top"><div><div class="lead-title">${esc(x.name)}</div><div class="meta">${esc(x.address||"Adresse nicht verfügbar")} · ${(x.distance/1000).toFixed(1)} km</div></div><span class="badge orange">Potenzial ${x.score}%</span></div><div class="lead-actions"><button onclick="areaLead(${i})">＋ Als Lead</button><button onclick="areaRoute(${i})">🚗 Route</button></div></div>`).join("")||`<div class="info">Keine Treffer.</div>`;
}
function areaLead(i){const x=areaCandidates[i];if(state.leads.some(l=>l.company===x.name))return;state.leads.unshift({id:uid(),company:x.name,industry:$("industry").selectedOptions[0].text,status:"neu",address:x.address,phone:x.phone,tpv:0,product:"",notes:`Gebietspotenzial ${x.score}%`,next:"Erstkontakt",due:today()});save()}
function areaRoute(i){route.push(areaCandidates[i]);route=uniqueRoute(route);renderRoute()}
function uniqueRoute(a){return a.filter((x,i)=>a.findIndex(y=>y.name===x.name&&y.lat===x.lat&&y.lon===x.lon)===i)}
function optimizeRoute(){if(!route.length)route=areaCandidates.slice(0,8);if(!route.length)return;let cur=areaOrigin||route[0];const remaining=[...route],ordered=[];while(remaining.length){remaining.sort((a,b)=>dist(cur.lat,cur.lon,a.lat,a.lon)-dist(cur.lat,cur.lon,b.lat,b.lon));const n=remaining.shift();ordered.push(n);cur=n}route=ordered;renderRoute()}
function renderRoute(){$("routeResults").innerHTML=route.map((x,i)=>`<div class="route-stop"><div class="route-num">${i+1}</div><div><b>${esc(x.name)}</b><div class="meta">${esc(x.address||"")} · ${(x.distance/1000).toFixed(1)} km</div></div></div>`).join("")||"Noch keine Route."}
function openMaps(){if(!route.length)return alert("Erst eine Route erstellen.");const pts=route.map(x=>`${x.lat},${x.lon}`);let url="https://www.google.com/maps/dir/?api=1";if(areaOrigin)url+=`&origin=${areaOrigin.lat},${areaOrigin.lon}`;url+=`&destination=${pts.at(-1)}&waypoints=${pts.slice(0,-1).join("|")}&travelmode=driving`;window.open(url,"_blank")}

function showModal(html){$("modalContent").innerHTML=html;$("modal").classList.remove("hidden")}
function closeModal(){$("modal").classList.add("hidden");$("modalContent").innerHTML=""}
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportCsv(){const cols=["company","industry","status","contact","phone","email","address","tpv","provider","product","next","due","notes"];const rows=[cols.join(";"),...state.leads.map(l=>cols.map(k=>`"${String(l[k]??"").replaceAll('"','""')}"`).join(";"))];download("nexaro-leads.csv","\ufeff"+rows.join("\n"),"text/csv;charset=utf-8")}
function restoreJson(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(x.leads&&x.tasks){localStorage.setItem(KEY,JSON.stringify(x));location.reload()}else alert("Ungültiges Backup.")}catch{alert("Ungültiges Backup.")}};r.readAsText(f)}
function demoData(){state.leads=[{id:uid(),company:"Späti am Markt",industry:"Kiosk / Späti",status:"neu",address:"Berlin",tpv:6500,provider:"Anderes Terminal",product:"Solo",next:"Erstkontakt",due:today(),notes:"Demo"},{id:uid(),company:"Kaffeehaus Mitte",industry:"Gastronomie",status:"termin",address:"Berlin",tpv:14000,provider:"Anderes Terminal",product:"Terminal",next:"Beratung",due:today(),notes:"Demo"}];state.tasks=[{id:uid(),title:"Kaffeehaus anrufen",company:"Kaffeehaus Mitte",due:today(),done:false}];save()}

if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
renderAll();renderAssistant();
