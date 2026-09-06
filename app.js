const KEY='nexaro-crm-v5-2';
let S=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('nexaro-crm-v4')||localStorage.getItem('nexaro-crm-v3')||localStorage.getItem('nexaro-crm-v2')||localStorage.getItem('nexaro-crm-v1')||'{"leads":[]}');
let filter='all';
const $=x=>document.getElementById(x);
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));render()};
const status=x=>({neu:'Neu',kontaktiert:'Kontaktiert',qualifiziert:'Qualifiziert',termin:'Termin',angebot:'Angebot',gewonnen:'Gewonnen',verloren:'Verloren'}[x]||x);

const A={step:1,industry:'',solution:'',satisfaction:'',pain:'',objection:'',decision:'',timing:'',company:'',leadId:'',saved:false};

const SUMUP={
  country:'DE',market:'Deutschland',locale:'de-DE',sourceDomain:'sumup.com/de-de',
  verified:'06.09.2026',
  pricesUrl:'https://www.sumup.com/de-de/preise/',
  productsUrl:'https://www.sumup.com/de-de/kartenterminals/',
  payg:{monthly:'0 €',rate:'1,39 %',note:'Umsatzbasiertes Zahlen; keine monatliche Grundgebühr.'},
  plus:{monthly:'19 €',yearly:'199 €',rate:'0,79 %',note:'Für Vor-Ort-Zahlungen mit inländischen/EWR-Verbraucherkarten; andere Karten können 1,39 % kosten.'},
  products:[
    {name:'Tap to Pay',price:'0 € Hardware',fit:'Kontaktlose Zahlungen direkt mit kompatiblem Smartphone',url:'https://www.sumup.com/de-de/tap-to-pay/'},
    {name:'Solo Lite',price:'34 €*',fit:'Kompaktes Kartenlesegerät, mit Smartphone gekoppelt',url:'https://www.sumup.com/de-de/solo-lite-kartenterminal/'},
    {name:'Solo',price:'79 €*',fit:'Eigenständiges Kartenterminal für mobile und stationäre Nutzung',url:'https://www.sumup.com/de-de/solo-kartenlesegeraet/'},
    {name:'Terminal',price:'169 €*',fit:'Eigenständiges All-in-one-Gerät mit Bestell- und Kassenfunktionen',url:'https://www.sumup.com/de-de/terminal-kartenterminal/'}
  ]
};
function sumupTariffHtml(){return `<div class="tariff-card"><div class="assistant-label">SUMUP DEUTSCHLAND 🇩🇪 · TARIF-CHECK</div><h3>Aktueller Preisstand</h3><div class="tariff-grid"><div><b>Umsatzbasiert</b><strong>${SUMUP.payg.rate}</strong><small>${SUMUP.payg.monthly}/Monat</small></div><div><b>Zahlungen Plus</b><strong>${SUMUP.plus.rate}</strong><small>${SUMUP.plus.monthly}/Monat · ${SUMUP.plus.yearly}/Jahr</small></div></div><p class="meta">Verifiziert am ${SUMUP.verified}. Nur deutsche SumUp-Konditionen (${SUMUP.sourceDomain}). ${SUMUP.plus.note}</p><a class="official-link" href="${SUMUP.pricesUrl}" target="_blank" rel="noopener">↗ Offizielle SumUp-Preise prüfen</a></div>`}
function productHtml(name){const p=SUMUP.products.find(x=>x.name===name);if(!p)return '';return `<div class="product-card"><div><b>Passender SumUp-Ansatz</b><h4>${p.name}</h4><div class="meta">${p.fit}</div></div><strong>${p.price}</strong><a class="official-link" href="${p.url}" target="_blank" rel="noopener">↗ Produktdetails bei SumUp</a></div>`}
function fitHtml(){
  const product=recommendedProduct();
  const fits={
    'Tap to Pay':'Gut, wenn der Außendienstler bzw. Betrieb kontaktlose Zahlungen direkt mit einem kompatiblen Smartphone annehmen möchte.',
    'Solo Lite':'Sinnvoll, wenn ein kompaktes Kartenlesegerät genügt und ein Smartphone gekoppelt werden kann.',
    'Solo':'Sinnvoll für mobile oder stationäre Kartenzahlungen mit einem eigenständigen Terminal.',
    'Terminal':'Sinnvoll, wenn ein eigenständiges All-in-one-Gerät mit zusätzlichen Bestell-/Kassenfunktionen gefragt ist.'
  };
  return `<div class="tip"><b>Warum dieser Ansatz?</b> ${fits[product]||''}</div>`;
}
function nextQuestion(){
  if(A.solution==='Keine Kartenzahlung') return 'Was müsste sich bei Kosten, Bedienung oder Einfachheit ändern, damit Sie Kartenzahlung testen würden?';
  if(A.pain==='Kosten') return 'Geht es Ihnen eher um die einmaligen Anschaffungskosten oder um die laufenden Transaktionskosten?';
  if(A.pain==='Vertrag / Bindung') return 'Was stört Sie an der aktuellen Bindung konkret?';
  if(A.pain==='Mobilität') return 'Brauchen Sie die Kartenzahlung auch außerhalb eines festen Kassenplatzes?';
  if(A.pain==='Geschwindigkeit') return 'Geht es vor allem um die Dauer pro Zahlung oder um Wartezeiten bei Stoßzeiten?';
  if(A.pain==='Bedienung') return 'Was ist in der täglichen Bedienung aktuell unnötig kompliziert?';
  if(A.pain==='Technik') return 'Welche technische Situation tritt bei Ihnen am häufigsten auf?';
  if(A.pain==='Zahlungsarten') return 'Welche Zahlungsart fehlt Ihnen heute konkret?';
  if(A.pain==='Auszahlung / Abrechnung') return 'Was genau möchten Sie bei Auszahlung oder Abrechnung verbessern?';
  if(A.pain==='Support') return 'Was erwarten Sie von einem besseren Support konkret?';
  return 'Wenn Sie eine Sache sofort ändern könnten – welche wäre das?';
}
function recommendationHtml(){
  const product=recommendedProduct();
  const solution=A.solution||'';
  let headline='Nächster Gesprächsschritt';
  let text=nextQuestion();
  if(A.pain && solution!=='Keine Kartenzahlung'){
    headline='Verkaufsansatz';
    text=`Sie haben als Hauptthema „${A.pain}“ genannt. Sprich jetzt nicht über alles, sondern genau über diesen Punkt.`;
  }
  return `<div class="recommendation"><div class="assistant-label">NE XARO · EMPFEHLUNG</div><h4>${headline}</h4><div class="script">${esc(text)}</div>${productHtml(product)}${fitHtml()}</div>`;
}

function recommendedProduct(){
  if(A.pain==='Mobilität') return 'Solo';
  if(A.pain==='Technik' || A.pain==='Bedienung') return 'Solo';
  if(A.pain==='Geschwindigkeit' || A.pain==='Zahlungsarten') return 'Solo';
  if(A.solution==='Keine Kartenzahlung') return 'Solo Lite';
  if(A.industry==='Gastronomie' && (A.pain==='Bedienung' || A.pain==='Geschwindigkeit')) return 'Terminal';
  return 'Solo';
}

const openings={
'Kiosk / Späti':'Moin, ich bin gerade bei einigen Geschäften hier in der Gegend unterwegs. Ich hätte mal eine kurze Frage: Wie zufrieden sind Sie aktuell mit Ihrer Kartenzahlung?',
'Einzelhandel':'Ich wollte Sie kurz etwas zu Ihrer Kartenzahlung fragen. Sind Sie mit Ihrer jetzigen Lösung zufrieden?',
'Bäckerei':'Bei Ihnen geht es beim Bezahlen wahrscheinlich ziemlich schnell. Wie zufrieden sind Sie denn mit Ihrer aktuellen Kartenzahlung?',
'Getränkemarkt':'Moin, ich bin gerade im regionalen Außendienst unterwegs. Darf ich kurz fragen, wie Sie Ihre Kartenzahlungen aktuell lösen?',
'Gastronomie':'Ich sehe, bei Ihnen läuft ordentlich Betrieb. Eine kurze Frage: Wie lösen Sie aktuell Ihre Kartenzahlungen?',
'Tankstelle':'Ich bin gerade im regionalen Außendienst unterwegs und spreche mit Tankstellen zum Thema Kartenzahlung. Darf ich kurz fragen, wie Sie das aktuell gelöst haben?',
'Friseur / Beauty':'Eine kurze Frage: Wie läuft bei Ihnen die Kartenzahlung aktuell – sind Sie damit zufrieden?',
'Handwerk':'Ich bin gerade im Außendienst unterwegs und habe eine kurze Frage: Können Ihre Kunden bei Ihnen bzw. direkt beim Kunden mit Karte bezahlen?',
'Mobiler Service':'Wie nehmen Sie unterwegs eigentlich Kartenzahlungen an?',
'Sonstiges':'Moin, ich bin gerade im regionalen Außendienst unterwegs. Darf ich Ihnen kurz zwei Fragen zu Ihrer Kartenzahlung stellen?'
};

const objections={
'Zu teuer':{say:'Verstehe. Meinen Sie die einmaligen Kosten, die laufenden Kosten oder die Kosten im Vergleich zu Ihrer jetzigen Lösung?',ask:'Welche Kosten sind für Sie dabei konkret der Knackpunkt?'},
'Habe schon ein Terminal':{say:'Das verstehe ich. Die Frage ist gar nicht, ob Sie grundsätzlich ein Terminal brauchen – Sie haben ja bereits eins. Mich interessiert eher: Was gefällt Ihnen an Ihrer jetzigen Lösung und was würden Sie daran gerne verbessern?',ask:'Wenn Sie eine Sache sofort ändern könnten – welche wäre das?'},
'Bin zufrieden':{say:'Das ist gut. Dann möchte ich Ihnen auch nichts einreden. Gibt es trotzdem etwas, das Sie sich zusätzlich wünschen würden?',ask:'Was wäre das, wenn Sie eine Sache ergänzen könnten?'},
'Keine Zeit':{say:'Verstehe ich. Dann machen wir es ganz einfach: eine einzige Frage. Wenn es für Sie nicht interessant ist, bin ich sofort wieder weg.',ask:'Sind Sie mit Ihrer aktuellen Kartenzahlung wirklich vollständig zufrieden?'},
'Schicken Sie Unterlagen':{say:'Gerne. Damit ich Ihnen nicht einfach irgendwelche Unterlagen schicke: Was ist für Sie dabei am wichtigsten – Kosten, Funktionen oder die praktische Nutzung?',ask:'Was soll ich in den Unterlagen für Sie besonders berücksichtigen?'},
'Muss mit meinem Partner sprechen':{say:'Klar. Dann sollten wir die richtige Person direkt mitnehmen.',ask:'Wann ist die Person am besten erreichbar und was ist ihr bei einer Lösung besonders wichtig?'},
'Kein Bedarf':{say:'Verstanden. Darf ich kurz fragen, woran Sie das festmachen?',ask:'Was müsste sich ändern, damit Kartenzahlung für Sie interessant würde?'},
'Schlechte Erfahrung':{say:'Das kann ich nachvollziehen. Gerade dann ist wichtig zu verstehen, was damals konkret schiefgelaufen ist.',ask:'Was war bei der damaligen Lösung das größte Problem?'},
'Sonstiger Einwand':{say:'Verstehe. Lassen Sie uns den Punkt kurz konkret machen, dann kann ich einschätzen, ob er überhaupt relevant ist.',ask:'Was genau hält Sie momentan noch zurück?'}
};

function navTo(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.s===id));
  render();
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>navTo(b.dataset.s));

function openLead(id){
  $('form').reset();$('id').value=id||'';$('dlgTitle').textContent=id?'Lead bearbeiten':'Neuer Lead';
  if(id){const l=S.leads.find(x=>x.id===id);['company','industry','status','contact','phone','email','address','provider','terminal','product','priority','need','next','due','notes'].forEach(k=>$(k).value=l[k]||'')}
  $('dlg').showModal();
}
$('quick').onclick=()=>openLead();$('add').onclick=()=>openLead();$('close').onclick=()=>$('dlg').close();$('cancel').onclick=()=>$('dlg').close();
$('form').onsubmit=e=>{
  e.preventDefault();
  const data={company:$('company').value.trim(),industry:$('industry').value,status:$('status').value,contact:$('contact').value,phone:$('phone').value,email:$('email').value,address:$('address').value,provider:$('provider').value,terminal:$('terminal').value,product:$('product').value,priority:$('priority').value,need:$('need').value,next:$('next').value,due:$('due').value,notes:$('notes').value};
  const id=$('id').value;if(id)Object.assign(S.leads.find(x=>x.id===id),data);else S.leads.unshift({id:uid(),createdAt:new Date().toISOString(),...data});
  $('dlg').close();save();
};

function card(l){
  return `<div class="card lead"><div class="top"><div><b>${esc(l.company)}</b><div class="meta">${esc(l.industry)}${l.address?' · '+esc(l.address):''}</div></div><span class="pill">${esc(status(l.status))}</span></div>
  <div class="meta">${l.contact?esc(l.contact)+' · ':''}${esc(l.product||'Noch offen')}${l.provider?' · aktuell: '+esc(l.provider):''}</div>
  ${l.need?`<div class="meta">Bedarf: ${esc(l.need)}</div>`:''}
  ${l.next?`<div><b>Nächster Schritt:</b> ${esc(l.next)}${l.due?' · '+esc(l.due):''}</div>`:''}
  <button onclick="openLead('${l.id}')">Bearbeiten</button>${l.phone?`<a href="tel:${esc(l.phone)}">📞 Anrufen</a>`:''}${l.address?`<button onclick="nav('${encodeURIComponent(l.address)}')">🧭 Navigation</button>`:''}<button onclick="startForLead('${l.id}')">🤝 Assistant</button><button onclick="visit('${l.id}')">📝 Besuch</button></div>`;
}

function render(){
  const today=new Date().toISOString().slice(0,10);
  $('kLeads').textContent=S.leads.filter(l=>!['gewonnen','verloren'].includes(l.status)).length;
  $('kTasks').textContent=S.leads.filter(l=>l.due===today&&!['gewonnen','verloren'].includes(l.status)).length;
  $('kAppts').textContent=S.leads.filter(l=>l.status==='termin').length;$('kWon').textContent=S.leads.filter(l=>l.status==='gewonnen').length;
  const q=($('search').value||'').toLowerCase();const a=S.leads.filter(l=>(filter==='all'||l.status===filter)&&[l.company,l.contact,l.address,l.industry].join(' ').toLowerCase().includes(q));
  $('list').innerHTML=a.length?a.map(card).join(''):'<div class="card">Noch keine passenden Leads.</div>';
  const t=S.leads.filter(l=>l.due&&!['gewonnen','verloren'].includes(l.status)).sort((a,b)=>a.due.localeCompare(b.due));
  $('taskList').innerHTML=t.length?t.map(card).join(''):'<div class="card">Keine offenen Follow-ups. Zeit für neue Besuche! 💪</div>';
  $('preview').innerHTML=t.slice(0,4).map(l=>`<div class="card" style="margin:8px 0"><b>${esc(l.company)}</b><div class="meta">${esc(l.next||'Follow-up')} · ${esc(l.due)}</div></div>`).join('')||'<div class="card">Keine offenen Follow-ups.</div>';
  $('areaList').innerHTML=S.leads.filter(l=>l.address).map(card).join('')||'<div class="card">Leads mit Adresse erscheinen hier.</div>';
  if($('tariffBox')) $('tariffBox').innerHTML=sumupTariffHtml();
  renderAssistant();
}
$('search').oninput=render;
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{filter=b.dataset.f;document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
function nav(a){window.open('https://www.google.com/maps/search/?api=1&query='+a,'_blank')}
function visit(id){const l=S.leads.find(x=>x.id===id);const n=prompt('Besuchsnotiz für '+l.company,l.notes||'');if(n!==null){l.notes=n;if(l.status==='neu')l.status='kontaktiert';save()}}

function startForLead(id){
  const l=S.leads.find(x=>x.id===id);A.step=1;A.company=l.company;A.leadId=id;A.industry=l.industry||'';A.solution='';A.satisfaction='';A.pain=l.need||'';A.objection='';A.decision='';A.timing='';A.saved=false;navTo('assistant');
}
$('startAssistant').onclick=()=>{A.step=1;A.company='';A.leadId='';A.industry='';A.solution='';A.satisfaction='';A.pain='';A.objection='';A.decision='';A.timing='';A.saved=false;navTo('assistant')};
$('resetAssistant').onclick=()=>{$('startAssistant').click()};

function renderAssistant(){
  const root=$('assistantApp');if(!root)return;
  const done=A.step-1;
  let html=`<div class="assistant-shell"><div class="stepbar">${[1,2,3,4,5].map((x,i)=>`<span class="${i<done?'done':''}"></span>`).join('')}</div>`;
  if(A.step===1)html+=step1();
  if(A.step===2)html+=step2();
  if(A.step===3)html+=step3();
  if(A.step===4)html+=step4();
  if(A.step===5)html+=step5();
  root.innerHTML=html+'</div>';
  root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>assistantAction(b.dataset.a,b.dataset.v||''));
}

function step1(){
 return `<div class="assistant-card"><div class="assistant-label">Schritt 1 · Einstieg</div><h3>Wen sprichst du an?</h3>
 <label>Firma (optional)<input data-field="company" value="${esc(A.company)}" placeholder="z. B. Späti am Markt"></label>
 <label>Branche<select data-field="industry">${Object.keys(openings).map(x=>`<option ${A.industry===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <div class="script"><b>Dein Einstieg:</b><br>${esc(openings[A.industry||Object.keys(openings)[0]])}</div>
 <div class="assistant-actions"><button class="primary" data-a="step1next">Gespräch starten →</button></div></div>`;
}

function step2(){
 return `<div class="assistant-card"><div class="assistant-label">Schritt 2 · Bedarf ermitteln</div><h3>Wie nimmt der Betrieb aktuell Kartenzahlungen an?</h3>
 <div class="choice-grid two">${['SumUp','Anderes Terminal','Keine Kartenzahlung','Weiß ich noch nicht'].map(x=>`<button class="choice" data-a="solution" data-v="${x}">${x}</button>`).join('')}</div>
 ${A.solution?`<div class="tip">Auswahl: <b>${esc(A.solution)}</b></div>${A.solution==='SumUp'||A.solution==='Anderes Terminal'?sumupTariffHtml():sumupTariffHtml()}`:''}</div>`;
}


/* ===== neXaro V5.2 · robuste Kostenmatrix + Hardware-Rabatt + Angebotsmail ===== */
const V52={
 emailSubject:'Ihr individuelles SumUp-Angebot – neXaro Solutions',
 calc:{turnover:'',currentRate:'',currentFixed:'',currentOther:'',calculated:false},
 offer:{customer:'',email:'',note:'',product:'',discount:'0'}
};
function euro(n){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0)}
function num(v){return Math.max(0,Number(String(v??'').replace(',','.'))||0)}
function hardwareBase(name){
 const p=SUMUP.products.find(x=>x.name===name);if(!p)return 0;
 const m=p.price.match(/([0-9]+(?:[.,][0-9]+)?)/);return m?num(m[1]):0;
}
function hardwareDiscount(name){
 const excluded=['Kassenschublade','Handscanner','Epson-Drucker'];
 return excluded.includes(name)?0:Math.min(25,num(V52.offer.discount));
}
function hardwarePrice(name){
 const base=hardwareBase(name),d=hardwareDiscount(name);
 return base*(1-d/100);
}
function calcCosts(){
 const t=num(V52.calc.turnover),r=num(V52.calc.currentRate)/100,fixed=num(V52.calc.currentFixed),other=num(V52.calc.currentOther);
 const current=t*r+fixed+other,payg=t*0.0139,plus=t*0.0079+19;
 const best=t>=3500?plus:payg;
 return {t,current,payg,plus,best,saving:current-best};
}
function costResultsHtml(){
 const c=calcCosts();
 if(!c.t)return `<div class="tip">Noch keine Kosten berechnet. Bitte Werte eingeben und anschließend auf <b>„Kosten berechnen“</b> tippen.</div>`;
 return `<div class="tariff-grid">
  <div><b>Aktuell</b><strong>${euro(c.current)}</strong><small>geschätzt / Monat</small></div>
  <div><b>SumUp Umsatzbasiert</b><strong>${euro(c.payg)}</strong><small>1,39 %</small></div>
  <div><b>SumUp Zahlungen Plus</b><strong>${euro(c.plus)}</strong><small>0,79 % + 19 €</small></div>
  <div><b>${c.saving>=0?'Ersparnis':'Mehrkosten'}</b><strong>${euro(Math.abs(c.saving))}</strong><small>vs. passende SumUp-Option</small></div>
 </div>`;
}
function costMatrixHtml(){
 return `<div class="tariff-card" id="v52Matrix">
  <div class="assistant-label">NE XARO · KOSTENMATRIX 🇩🇪</div>
  <h3>Aktuelle Kosten vs. SumUp</h3>
  <div class="tariff-grid">
   <div><b>Kartenumsatz / Monat</b><input id="v52Turnover" inputmode="decimal" value="${esc(V52.calc.turnover)}" placeholder="z. B. 5000"></div>
   <div><b>Effektive aktuelle Transaktionsgebühr</b><input id="v52Rate" inputmode="decimal" value="${esc(V52.calc.currentRate)}" placeholder="z. B. 1,90"></div>
   <div><b>Aktuelle Monatsgebühr</b><input id="v52Fixed" inputmode="decimal" value="${esc(V52.calc.currentFixed)}" placeholder="z. B. 15"></div>
   <div><b>Sonstige Monatskosten</b><input id="v52Other" inputmode="decimal" value="${esc(V52.calc.currentOther)}" placeholder="z. B. 5"></div>
  </div>
  <div id="v52CostResults" style="margin-top:12px">${V52.calc.calculated?costResultsHtml():`<div class="tip">Die Eingabe wird bewusst <b>nicht automatisch neu gerendert</b>. So bleibt die iPhone-Tastatur stabil. Erst nach vollständiger Eingabe berechnen.</div>`}</div>
  <div class="assistant-actions"><button class="primary" data-a="calcCosts">🧮 Kosten berechnen</button></div>
  <p class="meta">Schätzung auf Basis der eingegebenen aktuellen Kosten. Bei gemischten Kartenarten oder Sonderkonditionen kann das tatsächliche Ergebnis abweichen. Für die Vergleichsanzeige wird Zahlungen Plus ab 3.500 € monatlichem Zahlungsvolumen als passende Option berücksichtigt.</p>
  <a class="official-link" href="${SUMUP.pricesUrl}" target="_blank" rel="noopener">↗ Deutsche SumUp-Preise prüfen</a>
 </div>`;
}
function readCostFields(){
 V52.calc.turnover=$('v52Turnover')?.value||V52.calc.turnover;
 V52.calc.currentRate=$('v52Rate')?.value||V52.calc.currentRate;
 V52.calc.currentFixed=$('v52Fixed')?.value||V52.calc.currentFixed;
 V52.calc.currentOther=$('v52Other')?.value||V52.calc.currentOther;
 V52.calc.calculated=true;
}
function offerHardwareOptions(selected){
 const names=[...SUMUP.products.map(x=>x.name),'Kassenschublade','Handscanner','Epson-Drucker'];
 return names.map(name=>`<option value="${esc(name)}" ${selected===name?'selected':''}>${esc(name)}</option>`).join('');
}
function offerHtml(){
 const p=V52.offer.product||recommendedProduct();
 const base=hardwareBase(p),d=hardwareDiscount(p),price=hardwarePrice(p);
 const excluded=['Kassenschublade','Handscanner','Epson-Drucker'].includes(p);
 return `<div class="tariff-card" id="v52Offer">
  <div class="assistant-label">NE XARO · ANGEBOTSMODUS</div>
  <h3>Angebot per E-Mail vorbereiten</h3>
  <div class="tariff-grid">
   <div><b>Kundenname / Firma</b><input id="v52Customer" value="${esc(V52.offer.customer||A.company)}" placeholder="Name oder Firma"></div>
   <div><b>E-Mail des Kunden</b><input id="v52Email" type="email" value="${esc(V52.offer.email)}" placeholder="kunde@beispiel.de"></div>
   <div><b>Hardware</b><select id="v52Product">${offerHardwareOptions(p)}</select></div>
   <div><b>Hardware-Rabatt</b><input id="v52Discount" inputmode="decimal" value="${esc(V52.offer.discount)}" placeholder="0–25 %"></div>
  </div>
  <div class="tip" style="margin-top:12px">
   ${esc(p)}: <b>${excluded?'Rabatt nicht anwendbar':euro(price)}</b>${excluded?'':' nach '+d+' % Rabatt'}${base&&!excluded?' · regulär '+euro(base):''}.
   <br><b>Rabattregel:</b> bis zu 25 % auf rabattfähige SumUp-Hardware. Ausgenommen sind Kassenschublade, Handscanner und Epson-Drucker.
  </div>
  <label style="display:block;margin-top:12px"><b>Persönliche Notiz</b><textarea id="v52Note" rows="3" placeholder="z. B. besprochenes Einsparpotenzial, nächster Schritt ...">${esc(V52.offer.note)}</textarea></label>
  <div class="assistant-actions"><button class="primary" data-a="sendOffer">✉️ Angebot in Mail öffnen</button></div>
  <p class="meta">Die Mail wird vorbereitet und in der auf dem iPhone eingerichteten Mail-App geöffnet. Du prüfst sie und tippst selbst auf „Senden“.</p>
 </div>`;
}
function coachHtml(){
 const q=nextQuestion(),p=recommendedProduct();
 const scripts={
  Mobilität:'„Wenn Sie auch unterwegs kassieren, würde ich genau auf die mobile Nutzung eingehen. Entscheidend ist, dass Sie nicht an einen festen Kassenplatz gebunden sind.“',
  Kosten:'„Lassen Sie uns nicht über ein Bauchgefühl sprechen. Wir rechnen Ihre heutigen Kosten einmal konkret gegen die SumUp-Konditionen.“',
  Geschwindigkeit:'„Wenn Geschwindigkeit Ihr Thema ist, sprechen wir über den Ablauf pro Zahlung und die Situation zu Stoßzeiten.“',
  Bedienung:'„Dann schauen wir uns nicht zehn Funktionen an, sondern genau den Ablauf, der Sie heute Zeit kostet.“',
  Technik:'„Dann würde ich zuerst klären, wann die Technik Probleme macht und welche Situation die Lösung konkret entschärfen soll.“'
 };
 return `<div class="product-card"><div><b>Sales Coach · Nächste Formulierung</b><div class="script">${esc(scripts[A.pain]||'„Lassen Sie uns genau den Punkt anschauen, der Sie heute am meisten stört.“')}</div><div class="meta"><b>Nächste Frage:</b> ${esc(q)}</div></div><strong>${esc(p)}</strong></div>`;
}

function step3(){
 let body='';
 if(A.solution==='Keine Kartenzahlung') body=`<div class="question">Frage:</div><div class="script">Darf ich fragen, warum Sie aktuell keine Kartenzahlung anbieten?</div>
 <div class="choice-grid">${['Kunden zahlen bar','Gebühren zu hoch','Kein Bedarf','Bisher keine passende Lösung'].map(x=>`<button class="choice" data-a="pain" data-v="${x}">${x}</button>`).join('')}</div>`;
 else body=`<div class="question">Wie zufrieden ist der Betrieb mit der aktuellen Lösung?</div><div class="choice-grid">${['Sehr zufrieden','Grundsätzlich zufrieden','Nicht zufrieden'].map(x=>`<button class="choice" data-a="satisfaction" data-v="${x}">${x}</button>`).join('')}</div>`;
 return `<div class="assistant-card"><div class="assistant-label">Schritt 3 · Problem & Priorität</div><h3>${A.solution==='Keine Kartenzahlung'?'Grund herausfinden':'Zufriedenheit prüfen'}</h3>${body}
 ${A.satisfaction?`<div class="question">Nächste Frage:</div><div class="script">${A.satisfaction==='Nicht zufrieden'?'Was stört Sie denn momentan am meisten?':'Wenn Sie eine Sache sofort verbessern könnten – welche wäre das?'}</div>
 <div class="choice-grid">${['Kosten','Vertrag / Bindung','Bedienung','Geschwindigkeit','Mobilität','Technik','Zahlungsarten','Auszahlung / Abrechnung','Support','Sonstiges'].map(x=>`<button class="choice" data-a="pain" data-v="${x}">${x}</button>`).join('')}</div>`:''}
 ${A.pain?`<div class="tip">Bedarf erfasst: <b>${esc(A.pain)}</b></div>${recommendationHtml()}${coachHtml()}${costMatrixHtml()}<div class="assistant-actions"><button class="primary" data-a="next3">Einwand vorbereiten →</button></div>`:''}</div>`;
}

function step4(){
 const ob=A.objection||'';
 if(ob)return `<div class="assistant-card"><div class="assistant-label">Schritt 4 · Einwandbehandlung</div><h3>${esc(ob)}</h3><div class="script"><b>Antwort:</b><br>${esc(objections[ob].say)}</div><div class="question">Danach fragen:</div><div class="script">${esc(objections[ob].ask)}</div>${A.pain?`<div class="tip"><b>Zurück zum Bedarf:</b> ${esc(nextQuestion())}</div>`:''}<div class="assistant-actions"><button class="primary" data-a="close">Zum Abschluss →</button><button data-a="clearObjection">Anderen Einwand</button></div></div>`;
 return `<div class="assistant-card"><div class="assistant-label">Schritt 4 · Einwandbehandlung</div><h3>Kommt ein Einwand?</h3><p class="tip">Grundregel: <b>zuhören → bestätigen → konkretisieren → antworten → zurück zum Abschluss.</b></p>
 <div class="choice-grid two">${Object.keys(objections).map(x=>`<button class="choice" data-a="objection" data-v="${x}">${x}</button>`).join('')}</div>
 <div class="assistant-actions"><button class="primary" data-a="close">Kein Einwand – zum Abschluss →</button></div></div>`;
}

function step5(){
 return `<div class="assistant-card result"><div class="assistant-label">Schritt 5 · Abschluss & CRM</div><h3>Was ist der nächste Schritt?</h3>
 <div class="choice-grid">${['Abschluss heute','Rückruf vereinbaren','Termin vereinbaren','Unterlagen / Info senden','Entscheider kontaktieren','Kein Interesse'].map(x=>`<button class="choice" data-a="finish" data-v="${x}">${x}</button>`).join('')}</div>
 ${A.timing?`<div class="saved">✓ ${esc(A.timing)}${A.saved?' · CRM gespeichert':''}</div>`:''}
 ${A.timing&&['Abschluss heute','Unterlagen / Info senden'].includes(A.timing)?offerHtml():''}
 <div class="tip" style="margin-top:12px">Abschlussformulierung: „Nach dem, was Sie mir gerade erzählt haben, sehe ich bei Ihnen grundsätzlich einen sinnvollen Ansatz. Lassen Sie uns das einmal konkret durchgehen. Wenn es für Sie nicht passt, lassen wir es dabei.“</div></div>`;
}

function assistantAction(a,v){
 if(a==='step1next'){
   const c=document.querySelector('[data-field="company"]'),i=document.querySelector('[data-field="industry"]');A.company=c?.value.trim()||'';A.industry=i?.value||Object.keys(openings)[0];A.step=2;
 }
 if(a==='solution'){A.solution=v;A.step=3}
 if(a==='satisfaction'){A.satisfaction=v}
 if(a==='pain'){A.pain=v}
 if(a==='calcCosts'){readCostFields()}
 if(a==='next3')A.step=4;
 if(a==='objection')A.objection=v;
 if(a==='clearObjection')A.objection='';
 if(a==='close')A.step=5;
 if(a==='finish'){A.timing=v;saveAssistantToCRM(v)}
 if(a==='sendOffer'){
   V52.offer.customer=$('v52Customer')?.value.trim()||A.company||'Ihr Ansprechpartner';
   V52.offer.email=$('v52Email')?.value.trim()||'';
   V52.offer.product=$('v52Product')?.value||recommendedProduct();
   V52.offer.discount=$('v52Discount')?.value||'0';
   V52.offer.note=$('v52Note')?.value.trim()||'Vielen Dank für das Gespräch.';
   if(!V52.offer.email){alert('Bitte zuerst die E-Mail-Adresse des Kunden eingeben.');return}
   const p=V52.offer.product,d=hardwareDiscount(p),base=hardwareBase(p),excluded=['Kassenschublade','Handscanner','Epson-Drucker'].includes(p),price=hardwarePrice(p),c=calcCosts();
   const saving=c.t?Math.max(0,c.saving):0;
   const body=[`Hallo ${V52.offer.customer},`,'','vielen Dank für das Gespräch.','','Wie besprochen, hier die Eckdaten Ihres individuellen SumUp-Angebots über neXaro Solutions:','',`Empfohlene Hardware: ${p}`,excluded?'Hardware-Rabatt: nicht anwendbar (ausgenommen von der Rabattregel).':`Hardwarepreis nach ${d}% Rabatt: ${euro(price)}${base?' (regulär '+euro(base)+')':''}`,'','Rabattregel: Bis zu 25 % auf rabattfähige SumUp-Hardware. Ausgenommen sind Kassenschublade, Handscanner und Epson-Drucker.','','SumUp Deutschland:','Umsatzbasiert: 1,39 % pro Zahlung, 0 € monatliche Grundgebühr.','Zahlungen Plus: 0,79 % für passende Vor-Ort-Zahlungen, 19 € pro Monat bzw. 199 € pro Jahr.',c.t?`Kostenvergleich auf Basis Ihrer Angaben: aktuell ca. ${euro(c.current)} / Monat · passende SumUp-Option ca. ${euro(c.best)} / Monat · Potenzial ca. ${euro(saving)} / Monat.`:'Kostenvergleich: Noch keine aktuellen Kosten eingegeben.','',V52.offer.note,'','Die finalen Konditionen richten sich nach dem aktuellen SumUp-Angebot und den jeweiligen Zahlungsarten.','','Viele Grüße','neXaro Solutions'].join('\n');
   window.location.href=`mailto:${encodeURIComponent(V52.offer.email)}?subject=${encodeURIComponent(V52.emailSubject)}&body=${encodeURIComponent(body)}`;
   return;
 }
 renderAssistant();
}

function saveAssistantToCRM(action){
 let l=A.leadId?S.leads.find(x=>x.id===A.leadId):null;
 if(!l){
   l={id:uid(),createdAt:new Date().toISOString(),company:A.company||'Unbenannter Lead',industry:A.industry||'Sonstiges',status:'kontaktiert',contact:'',phone:'',email:'',address:'',provider:'',terminal:'',product:'Noch offen',priority:'Hoch',need:'',next:'',due:'',notes:''};
   S.leads.unshift(l);A.leadId=l.id;
 }
 l.industry=A.industry||l.industry;l.need=[A.solution&&'Aktuell: '+A.solution,A.satisfaction&&'Zufriedenheit: '+A.satisfaction,A.pain&&'Bedarf: '+A.pain,A.objection&&'Einwand: '+A.objection].filter(Boolean).join(' · ');
 l.notes=(l.notes?l.notes+'\n':'')+`Sales Assistant: ${action}.`;
 const map={'Abschluss heute':'gewonnen','Rückruf vereinbaren':'kontaktiert','Termin vereinbaren':'termin','Unterlagen / Info senden':'angebot','Entscheider kontaktieren':'kontaktiert','Kein Interesse':'verloren'};
 l.status=map[action]||l.status;
 l.next=action;
 if(['Rückruf vereinbaren','Termin vereinbaren','Entscheider kontaktieren'].includes(action))l.due=new Date().toISOString().slice(0,10);
 A.saved=true;localStorage.setItem(KEY,JSON.stringify(S));
 render();
}

$('locate').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>$('locStatus').textContent=`Standort: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`,()=>$('locStatus').textContent='Standortzugriff nicht erlaubt.'):alert('Standort wird nicht unterstützt.');
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
$('csv').onclick=()=>{const c=['company','industry','status','contact','phone','email','address','provider','terminal','product','priority','need','next','due','notes'];dl('nexaro-leads.csv','\ufeff'+[c.join(';'),...S.leads.map(l=>c.map(k=>`"${String(l[k]||'').replaceAll('"','""')}"`).join(';'))].join('\n'),'text/csv')};
$('json').onclick=()=>dl('nexaro-crm-backup.json',JSON.stringify(S,null,2),'application/json');
$('restore').onchange=e=>{const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);localStorage.setItem(KEY,JSON.stringify(S));render();alert('Backup wiederhergestellt.')}catch{alert('Ungültiges Backup.')}};r.readAsText(e.target.files[0])};
$('demo').onclick=()=>{S.leads=[['Späti am Markt','Kiosk / Späti','neu','Halbe, Brandenburg','Solo','Heute anrufen'],['Getränke & Mehr','Getränkemarkt','kontaktiert','Lübben','Terminal','Mittwoch nachfassen'],['Mode & Alltag','Einzelhandel','termin','Luckau','Kassensystem / POS','Beratung vorbereiten']].map(x=>({id:uid(),company:x[0],industry:x[1],status:x[2],address:x[3],product:x[4],next:x[5],priority:'Hoch',due:new Date().toISOString().slice(0,10),notes:''}));save()};
$('clear').onclick=()=>{if(confirm('Alle lokalen CRM-Daten löschen?')){S={leads:[]};save()}};
render();renderAssistant();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
