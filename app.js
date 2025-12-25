// Simple client-side dictionary app
const searchInput = document.getElementById('search');
const resultsEl = document.getElementById('results');
const entryEl = document.getElementById('entry');

let entries = [];
let loaded = false;

async function loadData(){
  try{
    const res = await fetch('runyakitara.json');
    if(!res.ok) throw new Error('HTTP ' + res.status);
    entries = await res.json();
    loaded = true;
    renderResults(entries.slice(0,200));
  }catch(e){
    console.error('Failed to load runyakitara.json', e);
    resultsEl.innerHTML = '<p class="error">Dictionary data failed to load. Check that runyakitara.json exists in the repository root.</p>';
  }
}

function normalize(s){return (s||'').toString().normalize('NFKD').toLowerCase();}

function search(q){
  q = normalize(q).trim();
  if(!q) return entries.slice(0,200);
  const tokens = q.split(/\s+/);
  const out = entries.filter(e=>{
    const h = normalize(e.headword||e.word||e.term||'');
    const def = normalize(e.definition||e.gloss||'');
    // all tokens must match either headword or definition
    return tokens.every(t => h.includes(t) || def.includes(t));
  });
  return out.slice(0,500);
}

function renderResults(list){
  resultsEl.innerHTML = '';
  if(!list.length){ resultsEl.innerHTML = '<p>No matches</p>'; return; }
  for(const e of list){
    const div = document.createElement('div');
    div.className = 'result';
    const title = e.headword||e.word||e.term||'(no headword)';
    div.textContent = title + (e.partOfSpeech? ' — ' + e.partOfSpeech : '');
    div.onclick = ()=>{ location.hash = '#' + encodeURIComponent(e.id || title); renderEntry(e); };
    resultsEl.appendChild(div);
  }
}

function renderEntry(e){
  entryEl.hidden = false;
  entryEl.className = 'entry';
  const head = e.headword||e.word||e.term||'(no headword)';
  const def = e.definition || e.gloss || '';
  entryEl.innerHTML = `<h2>${escapeHtml(head)}</h2>
    <p><strong>Definition:</strong> ${escapeHtml(def)}</p>
    <pre>${escapeHtml(JSON.stringify(e, null, 2))}</pre>`;
}

function escapeHtml(s){ return (s||'').toString().replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[c])); }

searchInput.addEventListener('input', ()=>{
  if(!loaded) return;
  const list = search(searchInput.value);
  renderResults(list);
});

window.addEventListener('hashchange', ()=>{
  const key = decodeURIComponent(location.hash.slice(1));
  const e = entries.find(x => (x.id==key) || (x.headword==key) || (x.word==key));
  if(e) renderEntry(e);
});

// init
loadData();
