document.querySelectorAll('[data-icon]').forEach(el => { const name = el.dataset.icon; if (icons[name]) el.innerHTML = icons[name]; });

const addressInput = document.getElementById('addressInput');
const heroSearch = document.getElementById('heroSearch');
const webviewsContainer = document.getElementById('webviews');
const homeStage = document.getElementById('homeStage');
const homeBtn = document.getElementById('homeBtn');
const brandHome = document.getElementById('brandHome');
const homeLogoBtn = document.getElementById('homeLogoBtn');
const tabsEl = document.getElementById('tabs');
const skinDrawer = document.getElementById('skinDrawer');
const favoritesDrawer = document.getElementById('favoritesDrawer');
const favList = document.getElementById('favList');
const quickGrid = document.getElementById('quickGrid');
let activeTabId = null, tabSeq = 1, tabs = [];
let favorites = JSON.parse(localStorage.getItem('mahvegator:favorites') || 'null') || [
  { name:'Google', url:'https://www.google.com', icon:'G' },
  { name:'YouTube', url:'https://www.youtube.com', icon:'▶' },
  { name:'ChatGPT', url:'https://chat.openai.com', icon:'AI' },
  { name:'GitHub', url:'https://github.com', icon:'GH' },
  { name:'Notion', url:'https://www.notion.so', icon:'N' }
];
function saveFavorites(){ localStorage.setItem('mahvegator:favorites', JSON.stringify(favorites)); }
let searchEngine = localStorage.getItem('mahvegator:engine') || 'duck';

function normalize(value){
  value = value.trim();
  if (!value) return '';
  if (value.includes('.') && !value.includes(' ')) {
    if (!value.startsWith('http')) return 'https://' + value;
    return value;
  }

  const q = encodeURIComponent(value);
  const engines = {
    duck: 'https://duckduckgo.com/?q=',
    perplexity: 'https://www.perplexity.ai/search?q=',
    brave: 'https://search.brave.com/search?q=',
    you: 'https://you.com/search?q='
  };

  return (engines[searchEngine] || engines.duck) + q;
}


function domainName(url){ try { return new URL(url).hostname.replace('www.',''); } catch { return 'Nova página'; } }
function activeTab(){ return tabs.find(t=>t.id===activeTabId); }
function activeWebview(){ const t=activeTab(); return t ? document.getElementById(t.webviewId) : null; }
function renderTabs(){
  tabsEl.innerHTML = '';
  tabs.forEach(t=>{
    const el=document.createElement('div');
    el.className='tab'+(t.id===activeTabId?' active':''); el.dataset.tabId=t.id;
    el.innerHTML='<span data-icon="sparkle"></span><span class="tab-title">'+t.title+'</span><button class="tab-close">×</button>';
    tabsEl.appendChild(el);
  });
  tabsEl.querySelectorAll('[data-icon]').forEach(el=>{ const name=el.dataset.icon; if(icons[name]) el.innerHTML=icons[name]; });
}
function showHome(){ webviewsContainer.classList.remove('active'); homeStage.classList.add('active-home'); addressInput.value=''; renderTabs(); }
function setActiveTab(id){
  activeTabId=id; document.querySelectorAll('.webview').forEach(w=>w.classList.remove('active'));
  const w=activeWebview(); if(w) w.classList.add('active');
  const t=activeTab();
  if(t && t.url && t.url !== 'about:blank'){ webviewsContainer.classList.add('active'); homeStage.classList.remove('active-home'); addressInput.value=t.url; }
  else showHome();
  renderTabs();
}
function createTab(url=null){
  const id='tab-'+tabSeq++, webviewId='webview-'+id;
  const w=document.createElement('webview'); w.id=webviewId; w.className='webview'; w.src=url||'about:blank'; webviewsContainer.appendChild(w);
  tabs.push({id,webviewId,title:'Nova guia',url:url||'about:blank'}); setActiveTab(id);
  w.addEventListener('did-navigate', e=>updateTabUrl(id,e.url));
  w.addEventListener('did-navigate-in-page', e=>updateTabUrl(id,e.url));
  w.addEventListener('page-title-updated', e=>{ const t=tabs.find(x=>x.id===id); if(t){ t.title=e.title||domainName(t.url); renderTabs(); }});
  if(url) openUrlInTab(url,id); else showHome();
}
function closeTab(id){ const i=tabs.findIndex(t=>t.id===id); if(i<0) return; const t=tabs[i]; const w=document.getElementById(t.webviewId); if(w) w.remove(); tabs.splice(i,1); if(!tabs.length) createTab(); else setActiveTab(tabs[Math.max(0,i-1)].id); }
function updateTabUrl(id,url){ const t=tabs.find(x=>x.id===id); if(!t) return; t.url=url; t.title=domainName(url); if(id===activeTabId) addressInput.value=url; renderTabs(); }
function openUrlInTab(value, tabId=activeTabId){ const url=normalize(value); if(!url) return; const t=tabs.find(x=>x.id===tabId); if(!t) return; const w=document.getElementById(t.webviewId); t.url=url; t.title=domainName(url); w.src=url; webviewsContainer.classList.add('active'); homeStage.classList.remove('active-home'); addressInput.value=url; renderTabs(); }
function goHome(){ const t=activeTab(); if(t){ t.url='about:blank'; t.title='Nova guia'; const w=activeWebview(); if(w) w.src='about:blank'; } showHome(); }
function addFavorite(url=null){ const finalUrl=normalize(url||addressInput.value); if(!finalUrl || finalUrl==='about:blank') return; const name=domainName(finalUrl); if(!favorites.some(f=>f.url===finalUrl)){ favorites.unshift({name,url:finalUrl,icon:name.slice(0,1).toUpperCase()}); saveFavorites(); renderFavorites(); } favoritesDrawer.classList.add('open'); }
function renderFavorites(){
  favList.innerHTML=favorites.map((f,i)=>`<div class="fav-row" data-url="${f.url}"><span class="fav-dot">${f.icon||f.name[0]}</span><div><b>${f.name}</b><small>${f.url}</small></div><button class="icon-only remove-fav" data-index="${i}">×</button></div>`).join('');
  quickGrid.innerHTML=favorites.slice(0,5).map(f=>`<button class="quick-tile" data-url="${f.url}"><span class="q favicon-letter">${f.icon||f.name[0]}</span><b>${f.name}</b></button>`).join('') + `<button class="quick-tile add" id="quickAdd"><span data-icon="plus"></span><b>Adicionar</b></button>`;
  quickGrid.querySelectorAll('[data-icon]').forEach(el=>{ const name=el.dataset.icon; if(icons[name]) el.innerHTML=icons[name]; });
  document.querySelectorAll('.fav-row').forEach(row=>row.onclick=e=>{ if(e.target.closest('.remove-fav')) return; openUrlInTab(row.dataset.url); favoritesDrawer.classList.remove('open'); });
  document.querySelectorAll('.remove-fav').forEach(btn=>btn.onclick=e=>{ e.stopPropagation(); favorites.splice(Number(btn.dataset.index),1); saveFavorites(); renderFavorites(); });
  document.querySelectorAll('.quick-tile[data-url]').forEach(el=>el.onclick=()=>openUrlInTab(el.dataset.url));
  const qa=document.getElementById('quickAdd'); if(qa) qa.onclick=()=>addFavorite();
}
addressInput.onkeydown=e=>{ if(e.key==='Enter') openUrlInTab(addressInput.value); };
heroSearch.onkeydown=e=>{ if(e.key==='Enter') openUrlInTab(heroSearch.value); };
document.getElementById('heroGo').onclick=()=>openUrlInTab(heroSearch.value);
document.getElementById('backBtn').onclick=()=>{ const w=activeWebview(); try{ if(w&&w.canGoBack()) w.goBack(); }catch{} };
document.getElementById('forwardBtn').onclick=()=>{ const w=activeWebview(); try{ if(w&&w.canGoForward()) w.goForward(); }catch{} };
document.getElementById('refreshBtn').onclick=()=>{ const w=activeWebview(); if(webviewsContainer.classList.contains('active')&&w) w.reload(); };
homeBtn.onclick=goHome; brandHome.onclick=goHome; homeLogoBtn.onclick=goHome;
document.getElementById('newTabBtn').onclick=()=>createTab();
tabsEl.onclick=e=>{ const el=e.target.closest('.tab'); if(!el) return; if(e.target.closest('.tab-close')) closeTab(el.dataset.tabId); else setActiveTab(el.dataset.tabId); };
document.getElementById('favoriteBtn').onclick=()=>addFavorite(); document.getElementById('addCurrentFav').onclick=()=>addFavorite();
document.getElementById('favoritesFolderBtn').onclick=()=>favoritesDrawer.classList.toggle('open'); document.getElementById('closeFavs').onclick=()=>favoritesDrawer.classList.remove('open');
document.getElementById('skinToggle').onclick=()=>skinDrawer.classList.toggle('open'); document.getElementById('settingsBtn').onclick=()=>skinDrawer.classList.toggle('open'); document.getElementById('closeSkins').onclick=()=>skinDrawer.classList.remove('open');
let selectedSkin=document.body.dataset.skin||'aurora'; document.querySelectorAll('.skin-card').forEach(card=>card.onclick=()=>{ document.querySelectorAll('.skin-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); selectedSkin=card.dataset.setskin; document.body.dataset.skin=selectedSkin; localStorage.setItem('mahvegator:skin',selectedSkin); });
document.getElementById('applySkin').onclick=()=>{ document.body.dataset.skin=selectedSkin; skinDrawer.classList.remove('open'); };
document.getElementById('minBtn').onclick=()=>window.mahWindow?.minimize(); document.getElementById('maxBtn').onclick=()=>window.mahWindow?.maximize(); document.getElementById('closeBtn').onclick=()=>window.mahWindow?.close();
const savedSkin=localStorage.getItem('mahvegator:skin'); if(savedSkin){ document.body.dataset.skin=savedSkin; selectedSkin=savedSkin; document.querySelectorAll('.skin-card').forEach(c=>c.classList.toggle('selected',c.dataset.setskin===savedSkin)); }
renderFavorites(); createTab();


// V7 — Importar/Exportar favoritos HTML padrão de navegadores
function parseBookmarksHtml(html){
  const found = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  anchors.forEach(a => {
    const url = a.getAttribute('href');
    const name = (a.textContent || url || 'Favorito').trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !/^file:\/\//i.test(url)) return;
    if (!found.some(f => f.url === url)) found.push({ name, url, icon: name.slice(0, 1).toUpperCase() });
  });
  return found;
}

function setFavStatus(msg){
  const el = document.getElementById('favStatus');
  if(el) el.textContent = msg || '';
}

const importBtn = document.getElementById('importFavHtml');
if(importBtn){
  importBtn.addEventListener('click', async () => {
    try {
      const result = await window.mahBookmarks.importHtml();
      if(result?.canceled) return setFavStatus('Importação cancelada.');
      const imported = parseBookmarksHtml(result.html || '');
      if(!imported.length) return setFavStatus('Nenhum favorito válido foi encontrado no HTML.');
      let added = 0;
      imported.forEach(item => {
        if(!favorites.some(f => f.url === item.url)){
          favorites.push(item);
          added++;
        }
      });
      saveFavorites();
      renderFavorites();
      setFavStatus(`${added} favoritos importados. ${imported.length - added} já existiam.`);
    } catch (err) {
      setFavStatus('Erro ao importar favoritos: ' + err.message);
    }
  });
}

const exportBtn = document.getElementById('exportFavHtml');
if(exportBtn){
  exportBtn.addEventListener('click', async () => {
    try {
      const result = await window.mahBookmarks.exportHtml(favorites);
      if(result?.canceled) return setFavStatus('Exportação cancelada.');
      setFavStatus('Favoritos exportados com sucesso.');
    } catch (err) {
      setFavStatus('Erro ao exportar favoritos: ' + err.message);
    }
  });
}


// V1 — limpar campos e alternar mecanismo sem Google por padrão
const clearAddress = document.getElementById('clearAddress');
if(clearAddress){
  clearAddress.addEventListener('click', () => {
    addressInput.value = '';
    addressInput.focus();
  });
}

const clearHero = document.getElementById('clearHero');
if(clearHero){
  clearHero.addEventListener('click', () => {
    heroSearch.value = '';
    heroSearch.focus();
  });
}

const aiSelector = document.getElementById('aiSelector');
const aiMenu = document.getElementById('aiMenu');
const aiLabel = document.getElementById('aiLabel');

const engineNames = {
  duck: 'DuckDuckGo',
  perplexity: 'Perplexity',
  brave: 'Brave Search',
  you: 'You.com'
};

function updateEngineLabel(){
  if(aiLabel) aiLabel.textContent = engineNames[searchEngine] || 'DuckDuckGo';
}
updateEngineLabel();

if(aiSelector && aiMenu){
  aiSelector.addEventListener('click', () => {
    aiMenu.classList.toggle('open');
  });

  aiMenu.querySelectorAll('[data-engine]').forEach(btn => {
    btn.addEventListener('click', () => {
      searchEngine = btn.dataset.engine;
      localStorage.setItem('mahvegator:engine', searchEngine);
      updateEngineLabel();
      aiMenu.classList.remove('open');
    });
  });
}

document.addEventListener('click', (e) => {
  if(aiMenu && aiSelector && !aiMenu.contains(e.target) && !aiSelector.contains(e.target)){
    aiMenu.classList.remove('open');
  }
});
