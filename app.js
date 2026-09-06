const KEY='nexaro-crm-v2';
let S=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('nexaro-crm-v1')||'{"leads":[]}');
let filter='all';
const $=x=>document.getElementById(x);
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));render()};
const status=x=>({neu:'Neu',kontaktiert:'Kontaktiert',qualifiziert:'Qualifiziert',termin:'Termin',angebot:'Angebot',gewonnen:'Gewonnen',verloren:'Verloren'}[x]||x);

const A={step:1,industry:'',solution:'',satisfaction:'',pain:'',objection:'',decision:'',timing:'',company:'',leadId:'',saved:false};

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
  const id=$('id').value;
  if(id)Object.assign(S.leads.find(x=>x.id===id),data);
  else S.leads.unshift({id:uid(),createdAt:new Date().toISOString(),...data});
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
  $('kAppts').textContent=S.leads.filter(l=>l.status==='termin').length;
  $('kWon').textContent=S.leads.filter(l=>l.status==='gewonnen').length;
  const q=($('search').value||'').toLowerCase();
  const a=S.leads.filter(l=>(filter==='all'||l.status===filter)&&[l.company,l.contact,l.address,l.industry].join(' ').toLowerCase().includes(q));
  $('list').innerHTML=a.length?a.map(card).join(''):'<div class="card">Noch keine passenden Leads.</div>';
  const t=S.leads.filter(l=>l.due&&!['gewonnen','verloren'].includes(l.status)).sort((a,b)=>a.due.localeCompare(b.due));
  $('taskList').innerHTML=t.length?t.map(card).join(''):'<div class="card">Keine offenen Follow-ups. Zeit für neue Besuche! 💪</div>';
  $('preview').innerHTML=t.slice(0,4).map(l=>`<div class="card" style="margin:8px 0"><b>${esc(l.company)}</b><div class="meta">${esc(l.next||'Follow-up')} · ${esc(l.due)}</div></div>`).join('')||'<div class="card">Keine offenen Follow-ups.</div>';
  $('areaList').innerHTML=S.leads.filter(l=>l.address).map(card).join('')||'<div class="card">Leads mit Adresse erscheinen hier.</div>';
  renderAssistant();
}

$('search').oninput=render;
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{
  filter=b.dataset.f;
  document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  render()
});

function nav(a){window.open('https://www.google.com/maps/search/?api=1&query='+a,'_blank')}
function visit(id){
  const l=S.leads.find(x=>x.id===id);
  const n=prompt('Besuchsnotiz für '+l.company,l.notes||'');
  if(n!==null){
    l.notes=n;
    if(l.status==='neu')l.status='kontaktiert';
    save();
  }
}

function startForLead(id){
  const l=S.leads.find(x=>x.id===id);
  A.step=1;
  A.company=l.company;
  A.leadId=id;
  A.industry=l.industry||'';
  A.solution='';
  A.satisfaction='';
  A.pain=l.need||'';
  A.objection='';
  A.decision='';
  A.timing='';
  A.saved=false;
  navTo('assistant');
}

$('startAssistant').onclick=()=>{
  A.step=1;
  A.company='';
  A.leadId='';
  A.industry='';
  A.solution='';
  A.satisfaction='';
  A.pain='';
  A.objection='';
  A.decision='';
  A.timing='';
  A.saved=false;
  navTo('assistant');
};

$('resetAssistant').onclick=()=>{
  $('startAssistant').click();
};

function renderAssistant(){
  const root=$('assistantApp');
  if(!root)return;

  const done=A.step-1;

  let html=`<div class="assistant-shell">
    <div class="stepbar">
      ${[1,2,3,4,5].map((x,i)=>`<span class="${i<done?'done':''}"></span>`).join('')}
    </div>`;

  if(A.step===1)html+=step1();
  if(A.step===2)html+=step2();
  if(A.step===3)html+=step3();
  if(A.step===4)html+=step4();
  if(A.step===5)html+=step5();

  root.innerHTML=html+'</div>';

  root.querySelectorAll('[data-a]').forEach(b=>{
    b.onclick=()=>assistantAction(
      b.dataset.a,
      b.dataset.v||''
    );
  });
}

function step1(){
  return `<div class="assistant-card">
    <div class="assistant-label">Schritt 1 · Einstieg</div>
    <h3>Wen sprichst du an?</h3>

    <label>
      Firma (optional)
      <input data-field="company"
        value="${esc(A.company)}"
        placeholder="z. B. Späti am Markt">
    </label>

    <label>
      Branche
      <select data-field="industry">
        ${Object.keys(openings).map(x=>
          `<option ${A.industry===x?'selected':''}>${x}</option>`
        ).join('')}
      </select>
    </label>

    <div class="script">
      <b>Dein Einstieg:</b><br>
      ${esc(openings[A.industry||Object.keys(openings)[0]])}
    </div>

    <div class="assistant-actions">
      <button class="primary" data-a="step1next">
        Gespräch starten →
      </button>
    </div>
  </div>`;
}

function step2(){
  return `<div class="assistant-card">
    <div class="assistant-label">Schritt 2 · Bedarf ermitteln</div>
    <h3>Wie nimmt der Betrieb aktuell Kartenzahlungen an?</h3>

    <div class="choice-grid two">
      ${['SumUp','Anderes Terminal','Keine Kartenzahlung','Weiß ich noch nicht'].map(x=>
        `<button class="choice" data-a="solution" data-v="${x}">
          ${x}
        </button>`
      ).join('')}
    </div>

    ${A.solution?
      `<div class="tip">
        Auswahl: <b>${esc(A.solution)}</b>
      </div>`:''
    }
  </div>`;
}

function step3(){
  let body='';

  if(A.solution==='Keine Kartenzahlung'){
    body=`
      <div class="question">Frage:</div>

      <div class="script">
        Darf ich fragen, warum Sie aktuell keine Kartenzahlung anbieten?
      </div>

      <div class="choice-grid">
        ${[
          'Kunden zahlen bar',
          'Gebühren zu hoch',
          'Kein Bedarf',
          'Bisher keine passende Lösung'
        ].map(x=>
          `<button class="choice" data-a="pain" data-v="${x}">
            ${x}
          </button>`
        ).join('')}
      </div>`;
  }else{
    body=`
      <div class="question">
        Wie zufrieden ist der Betrieb mit der aktuellen Lösung?
      </div>

      <div class="choice-grid">
        ${[
          'Sehr zufrieden',
          'Grundsätzlich zufrieden',
          'Nicht zufrieden'
        ].map(x=>
          `<button class="choice" data-a="satisfaction" data-v="${x}">
            ${x}
          </button>`
        ).join('')}
      </div>`;
  }

  return `<div class="assistant-card">
    <div class="assistant-label">
      Schritt 3 · Problem & Priorität
    </div>

    <h3>
      ${A.solution==='Keine Kartenzahlung'
        ?'Grund herausfinden'
        :'Zufriedenheit prüfen'}
    </h3>

    ${body}

    ${A.satisfaction?`
      <div class="question">Nächste Frage:</div>

      <div class="script">
        ${A.satisfaction==='Nicht zufrieden'
          ?'Was stört Sie denn momentan am meisten?'
          :'Wenn Sie eine Sache sofort verbessern könnten – welche wäre das?'}
      </div>

      <div class="choice-grid">
        ${[
          'Kosten',
          'Vertrag / Bindung',
          'Bedienung',
          'Geschwindigkeit',
          'Mobilität',
          'Technik',
          'Zahlungsarten',
          'Auszahlung / Abrechnung',
          'Support',
          'Sonstiges'
        ].map(x=>
          `<button class="choice" data-a="pain" data-v="${x}">
            ${x}
          </button>`
        ).join('')}
      </div>`
      :''
    }

    ${A.pain?`
      <div class="tip">
        Bedarf erfasst: <b>${esc(A.pain)}</b>
      </div>

      <div class="assistant-actions">
        <button class="primary" data-a="next3">
          Weiter →
        </button>
      </div>`
      :''
    }
  </div>`;
}
function step4(){
  const ob=A.objection||'';

  if(ob){
    return `<div class="assistant-card">
      <div class="assistant-label">Schritt 4 · Einwandbehandlung</div>
      <h3>${esc(ob)}</h3>

      <div class="script">
        <b>Antwort:</b><br>
        ${esc(objections[ob].say)}
      </div>

      <div class="question">Danach fragen:</div>

      <div class="script">
        ${esc(objections[ob].ask)}
      </div>

      <div class="assistant-actions">
        <button class="primary" data-a="close">
          Zum Abschluss →
        </button>
        <button data-a="clearObjection">
          Anderen Einwand
        </button>
      </div>
    </div>`;
  }

  return `<div class="assistant-card">
    <div class="assistant-label">Schritt 4 · Einwandbehandlung</div>

    <h3>Kommt ein Einwand?</h3>

    <p class="tip">
      Grundregel:
      <b>zuhören → bestätigen → konkretisieren → antworten → zurück zum Abschluss.</b>
    </p>

    <div class="choice-grid two">
      ${Object.keys(objections).map(x=>
        `<button class="choice" data-a="objection" data-v="${x}">
          ${x}
        </button>`
      ).join('')}
    </div>

    <div class="assistant-actions">
      <button class="primary" data-a="close">
        Kein Einwand – zum Abschluss →
      </button>
    </div>
  </div>`;
}


function step5(){
  return `<div class="assistant-card result">
    <div class="assistant-label">Schritt 5 · Abschluss & CRM</div>

    <h3>Was ist der nächste Schritt?</h3>

    <div class="choice-grid">
      ${[
        'Abschluss heute',
        'Rückruf vereinbaren',
        'Termin vereinbaren',
        'Unterlagen / Info senden',
        'Entscheider kontaktieren',
        'Kein Interesse'
      ].map(x=>
        `<button class="choice" data-a="finish" data-v="${x}">
          ${x}
        </button>`
      ).join('')}
    </div>

    ${A.timing?
      `<div class="saved">
        ✓ ${esc(A.timing)}
        ${A.saved?' · CRM gespeichert':''}
      </div>`:''
    }

    <div class="tip" style="margin-top:12px">
      Abschlussformulierung:
      „Nach dem, was Sie mir gerade erzählt haben, sehe ich bei Ihnen grundsätzlich einen sinnvollen Ansatz. Lassen Sie uns das einmal konkret durchgehen. Wenn es für Sie nicht passt, lassen wir es dabei.“
    </div>
  </div>`;
}


function assistantAction(a,v){
  if(a==='step1next'){
    const c=document.querySelector('[data-field="company"]');
    const i=document.querySelector('[data-field="industry"]');

    A.company=c?.value.trim()||'';
    A.industry=i?.value||Object.keys(openings)[0];
    A.step=2;
  }

  if(a==='solution'){
    A.solution=v;
    A.step=3;
  }

  if(a==='satisfaction'){
    A.satisfaction=v;
  }

  if(a==='pain'){
    A.pain=v;
  }

  if(a==='next3'){
    A.step=4;
  }

  if(a==='objection'){
    A.objection=v;
  }

  if(a==='clearObjection'){
    A.objection='';
  }

  if(a==='close'){
    A.step=5;
  }

  if(a==='finish'){
    A.timing=v;
    saveAssistantToCRM(v);
  }

  renderAssistant();
}


function saveAssistantToCRM(action){
  let l=A.leadId
    ?S.leads.find(x=>x.id===A.leadId)
    :null;

  if(!l){
    l={
      id:uid(),
      createdAt:new Date().toISOString(),
      company:A.company||'Unbenannter Lead',
      industry:A.industry||'Sonstiges',
      status:'kontaktiert',
      contact:'',
      phone:'',
      email:'',
      address:'',
      provider:'',
      terminal:'',
      product:'Noch offen',
      priority:'Hoch',
      need:'',
      next:'',
      due:'',
      notes:''
    };

    S.leads.unshift(l);
    A.leadId=l.id;
  }

  l.industry=A.industry||l.industry;

  l.need=[
    A.solution&&'Aktuell: '+A.solution,
    A.satisfaction&&'Zufriedenheit: '+A.satisfaction,
    A.pain&&'Bedarf: '+A.pain,
    A.objection&&'Einwand: '+A.objection
  ].filter(Boolean).join(' · ');

  l.notes=
    (l.notes?l.notes+'\n':'')+
    `Sales Assistant: ${action}.`;

  const map={
    'Abschluss heute':'gewonnen',
    'Rückruf vereinbaren':'kontaktiert',
    'Termin vereinbaren':'termin',
    'Unterlagen / Info senden':'angebot',
    'Entscheider kontaktieren':'kontaktiert',
    'Kein Interesse':'verloren'
  };

  l.status=map[action]||l.status;
  l.next=action;

  if([
    'Rückruf vereinbaren',
    'Termin vereinbaren',
    'Entscheider kontaktieren'
  ].includes(action)){
    l.due=new Date().toISOString().slice(0,10);
  }

  A.saved=true;
  localStorage.setItem(KEY,JSON.stringify(S));
  render();
}


$('locate').onclick=()=>{
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p=>$('locStatus').textContent=
        `Standort: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`,
      ()=>$('locStatus').textContent=
        'Standortzugriff nicht erlaubt.'
    );
  }else{
    alert('Standort wird nicht unterstützt.');
  }
};


function dl(name,text,type){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(
    new Blob([text],{type})
  );
  a.download=name;
  a.click();
}


$('csv').onclick=()=>{
  const c=[
    'company','industry','status','contact','phone','email',
    'address','provider','terminal','product','priority',
    'need','next','due','notes'
  ];

  dl(
    'nexaro-leads.csv',
    '\ufeff'+[
      c.join(';'),
      ...S.leads.map(l=>
        c.map(k=>
          `"${String(l[k]||'').replaceAll('"','""')}"`
        ).join(';')
      )
    ].join('\n'),
    'text/csv'
  );
};


$('json').onclick=()=>{
  dl(
    'nexaro-crm-backup.json',
    JSON.stringify(S,null,2),
    'application/json'
  );
};


$('restore').onchange=e=>{
  const r=new FileReader();

  r.onload=()=>{
    try{
      S=JSON.parse(r.result);
      localStorage.setItem(KEY,JSON.stringify(S));
      render();
      alert('Backup wiederhergestellt.');
    }catch{
      alert('Ungültiges Backup.');
    }
  };

  r.readAsText(e.target.files[0]);
};


$('demo').onclick=()=>{
  S.leads=[
    ['Späti am Markt','Kiosk / Späti','neu','Halbe, Brandenburg','Solo','Heute anrufen'],
    ['Getränke & Mehr','Getränkemarkt','kontaktiert','Lübben','Terminal','Mittwoch nachfassen'],
    ['Mode & Alltag','Einzelhandel','termin','Luckau','Kassensystem / POS','Beratung vorbereiten']
  ].map(x=>({
    id:uid(),
    company:x[0],
    industry:x[1],
    status:x[2],
    address:x[3],
    product:x[4],
    next:x[5],
    priority:'Hoch',
    due:new Date().toISOString().slice(0,10),
    notes:''
  }));

  save();
};


$('clear').onclick=()=>{
  if(confirm('Alle lokalen CRM-Daten löschen?')){
    S={leads:[]};
    save();
  }
};


render();
renderAssistant();

if('serviceWorker'in navigator){
  navigator.serviceWorker
    .register('sw.js')
    .catch(()=>{});
}
