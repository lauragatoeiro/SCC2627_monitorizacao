const { createClient } = window.supabase;
const configured = window.SUPABASE_URL && !window.SUPABASE_URL.includes('COLOCA_AQUI') && window.SUPABASE_PUBLISHABLE_KEY && !window.SUPABASE_PUBLISHABLE_KEY.includes('COLOCA_AQUI');
const sb = configured ? createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY) : null;
let db={athletes:[],daily:[],body:[],tests:[]};
let charts=[];
const $=id=>document.getElementById(id);
const today=new Date().toISOString().slice(0,10);
['dailyDate','bodyDate','testDate'].forEach(id=>$(id).value=today);
const val=x=>x===''||x==null?null:Number(x);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const sexLabel=s=>String(s)==='1'?'Feminino':'Masculino';
const name=id=>db.athletes.find(a=>a.id===id)?.name||'—';
function showError(msg){console.error(msg); alert(msg);}
function checkClient(){if(!sb){throw new Error('Configuração Supabase em falta. Abre config.js e coloca a Project URL e a Publishable key.');}}
async function loadAll(){checkClient(); const [a,d,b,t]=await Promise.all([
  sb.from('athletes').select('*').order('name'),
  sb.from('daily_records').select('*').order('record_date',{ascending:false}),
  sb.from('body_records').select('*').order('record_date',{ascending:false}),
  sb.from('physical_tests').select('*').order('record_date',{ascending:false})
]);
  for(const r of [a,d,b,t]) if(r.error) throw r.error;
  db.athletes=a.data.map(x=>({id:x.id,name:x.name,sex:String(x.sex)}));
  db.daily=d.data.map(x=>({id:x.id,athleteId:x.athlete_id,date:x.record_date,pseAM:x.pse_am,psePM:x.pse_pm,hr:x.waking_hr,sleep:x.sleep_quality,notes:x.notes}));
  db.body=b.data.map(x=>({id:x.id,athleteId:x.athlete_id,date:x.record_date,mass:x.body_mass,height:x.height_cm,folds:[x.skinfold_1,x.skinfold_2,x.skinfold_3,x.skinfold_4,x.skinfold_5,x.skinfold_6,x.skinfold_7],sum7:x.sum7,bodyFat:x.body_fat}));
  db.tests=t.data.map(x=>({id:x.id,athleteId:x.athlete_id,date:x.record_date,cmj1:x.cmj_1,cmj2:x.cmj_2,broad1:x.horizontal_jump_1,broad2:x.horizontal_jump_2}));
  renderAll();
}
function opts(sel){sel.innerHTML='<option value="">Selecionar atleta</option>'+db.athletes.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('');}
function renderAthletes(){ $('athleteRows').innerHTML=db.athletes.map(a=>`<tr><td>${esc(a.name)}</td><td>${sexLabel(a.sex)}</td><td><button class="danger" onclick="delAthlete('${a.id}')">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="3">Sem atletas.</td></tr>'; ['dailyAthlete','bodyAthlete','testAthlete','dashAthlete'].forEach(id=>opts($(id))); if(!$('dashAthlete').value&&db.athletes[0])$('dashAthlete').value=db.athletes[0].id;}
function renderDaily(){ $('dailyRows').innerHTML=db.daily.map(r=>`<tr><td>${r.date}</td><td>${esc(name(r.athleteId))}</td><td>${r.pseAM??'—'}</td><td>${r.psePM??'—'}</td><td>${r.hr??'—'}</td><td>${r.sleep??'—'}</td><td><button class="danger" onclick="del('daily','${r.id}')">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="7">Sem registos.</td></tr>';}
function renderBody(){ $('bodyRows').innerHTML=db.body.map(r=>`<tr><td>${r.date}</td><td>${esc(name(r.athleteId))}</td><td>${r.mass??'—'} kg</td><td>${r.height??'—'} cm</td><td>${Number(r.sum7).toFixed(1)} mm</td><td>${Number(r.bodyFat).toFixed(2)}%</td><td><button class="danger" onclick="del('body','${r.id}')">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="7">Sem avaliações.</td></tr>';}
function renderTests(){ $('testRows').innerHTML=db.tests.map(r=>`<tr><td>${r.date}</td><td>${esc(name(r.athleteId))}</td><td>${r.cmj1??'—'}</td><td>${r.cmj2??'—'}</td><td>${r.broad1??'—'}</td><td>${r.broad2??'—'}</td><td><button class="danger" onclick="del('tests','${r.id}')">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="7">Sem testes.</td></tr>';}
async function del(type,id){if(!confirm('Eliminar este registo?'))return; const table={daily:'daily_records',body:'body_records',tests:'physical_tests'}[type]; const {error}=await sb.from(table).delete().eq('id',id); if(error)return showError(error.message); await loadAll();}
async function delAthlete(id){if(!confirm('Eliminar o atleta e todos os seus registos?'))return; const {error}=await sb.from('athletes').delete().eq('id',id); if(error)return showError(error.message); await loadAll();}
function renderDashboard(){charts.forEach(c=>c.destroy());charts=[];const id=$('dashAthlete').value;const a=db.athletes.find(x=>x.id===id);$('dashEmpty').style.display=a?'none':'block';$('charts').innerHTML='';if(!a)return;const d=db.daily.filter(r=>r.athleteId===id).sort((a,b)=>a.date.localeCompare(b.date));const b=db.body.filter(r=>r.athleteId===id).sort((a,b)=>a.date.localeCompare(b.date));const t=db.tests.filter(r=>r.athleteId===id).sort((a,b)=>a.date.localeCompare(b.date));
const specs=[['PSE AM',d,x=>x.pseAM],['PSE PM',d,x=>x.psePM],['FC ao acordar',d,x=>x.hr],['Qualidade do sono',d,x=>x.sleep],['Massa corporal',b,x=>x.mass],['Estatura',b,x=>x.height],['Massa gorda',b,x=>x.bodyFat],['Σ 7 pregas',b,x=>x.sum7],['CMJ tentativa 1',t,x=>x.cmj1],['CMJ tentativa 2',t,x=>x.cmj2],['Impulsão horizontal 1',t,x=>x.broad1],['Impulsão horizontal 2',t,x=>x.broad2]];
specs.forEach(([title,arr,fn])=>{if(!arr.some(x=>fn(x)!=null))return;const card=document.createElement('div');card.className='chartcard';card.innerHTML=`<h3>${title}</h3><div class="chartwrap"><canvas></canvas></div>`;$('charts').appendChild(card);charts.push(new Chart(card.querySelector('canvas'),{type:'line',data:{labels:arr.map(x=>x.date),datasets:[{label:title,data:arr.map(x=>fn(x)),tension:.25,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}}));});}
function renderAll(){renderAthletes();renderDaily();renderBody();renderTests();renderDashboard();}
$('loginForm').onsubmit=async e=>{e.preventDefault();$('loginError').textContent='';if(!sb){$('loginError').textContent='Configura primeiro o config.js.';return;}const {error}=await sb.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});if(error)$('loginError').textContent=error.message;};
$('logoutBtn').onclick=async()=>{await sb.auth.signOut();};
$('athleteForm').onsubmit=async e=>{e.preventDefault();try{checkClient();const {error}=await sb.from('athletes').insert({name:$('athleteName').value.trim(),sex:Number($('athleteSex').value)});if(error)throw error;e.target.reset();await loadAll();}catch(err){showError(err.message);}};
$('dailyForm').onsubmit=async e=>{e.preventDefault();try{checkClient();const {error}=await sb.from('daily_records').insert({athlete_id:$('dailyAthlete').value,record_date:$('dailyDate').value,pse_am:val($('pseAM').value),pse_pm:val($('psePM').value),waking_hr:val($('wakeHR').value),sleep_quality:val($('sleep').value),notes:$('dailyNotes').value||null});if(error)throw error;e.target.reset();$('dailyDate').value=today;await loadAll();}catch(err){showError(err.message);}};
$('bodyForm').onsubmit=async e=>{e.preventDefault();try{checkClient();const a=db.athletes.find(x=>x.id===$('bodyAthlete').value);if(!a)throw new Error('Seleciona um atleta.');const folds=[1,2,3,4,5,6,7].map(i=>val($('s'+i).value));if(folds.some(x=>x==null))throw new Error('Preenche as 7 pregas subcutâneas.');const sum7=folds.reduce((s,x)=>s+x,0);const y=Number(a.sex);const bodyFat=10.566+(0.12077*sum7)+(8.057*y);const {error}=await sb.from('body_records').insert({athlete_id:a.id,record_date:$('bodyDate').value,body_mass:val($('mass').value),height_cm:val($('height').value),skinfold_1:folds[0],skinfold_2:folds[1],skinfold_3:folds[2],skinfold_4:folds[3],skinfold_5:folds[4],skinfold_6:folds[5],skinfold_7:folds[6],sum7,body_fat:bodyFat});if(error)throw error;e.target.reset();$('bodyDate').value=today;await loadAll();}catch(err){showError(err.message);}};
$('testForm').onsubmit=async e=>{e.preventDefault();try{checkClient();const {error}=await sb.from('physical_tests').insert({athlete_id:$('testAthlete').value,record_date:$('testDate').value,cmj_1:val($('cmj1').value),cmj_2:val($('cmj2').value),horizontal_jump_1:val($('broad1').value),horizontal_jump_2:val($('broad2').value)});if(error)throw error;e.target.reset();$('testDate').value=today;await loadAll();}catch(err){showError(err.message);}};
$('dashAthlete').onchange=renderDashboard;
document.querySelectorAll('nav button').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(btn.dataset.view).classList.remove('hidden');document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(btn.dataset.view==='dashboard')renderDashboard();});
window.del=del;window.delAthlete=delAthlete;
async function start(){
  if(!configured){$('loginScreen').classList.remove('hidden');$('app').classList.add('hidden');$('loginError').textContent='Falta configurar config.js com os dados do projeto Supabase.';return;}
  const {data:{session}}=await sb.auth.getSession();
  const applySession=async session=>{if(session){$('loginScreen').classList.add('hidden');$('app').classList.remove('hidden');$('userEmail').textContent=session.user.email||'';try{await loadAll();document.querySelector('nav button').click();}catch(e){showError(e.message);}}else{$('loginScreen').classList.remove('hidden');$('app').classList.add('hidden');}};
  await applySession(session); sb.auth.onAuthStateChange(async (_event,s)=>{await applySession(s);});
}
start();
