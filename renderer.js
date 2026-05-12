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

let favorites = JSON.parse(localStorage.getItem('mahvegator:favorites') || '[]');

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

function domainName(url){ 
  if (!url || url === 'about:blank') return 'Nova página';
  try { return new URL(url).hostname.replace('www.',''); } 
  catch { return 'Nova página'; } 
}

function activeTab(){ return tabs.find(t=>t.id===activeTabId); }
function activeWebview(){ const t=activeTab(); return t ? document.getElementById(t.webviewId) : null; }

function renderTabs(){
  tabsEl.innerHTML = '';
  tabs.forEach(t=>{
    const el=document.createElement('div');
    el.className='tab'+(t.id===activeTabId?' active':''); el.dataset.tabId=t.id;
    el.innerHTML='<span class="tab-title">'+t.title+'</span><button class="tab-close">×</button>';
    tabsEl.appendChild(el);
  });
}

function showHome(){ 
  closeIconGallery();
  closeSkinDrawer();
  webviewsContainer.classList.remove('active'); 
  homeStage.classList.add('active-home'); 
  addressInput.value = ''; 
  heroSearch.value = '';
  renderTabs(); 
}

function closeSkinDrawer() {
  if (skinDrawer) skinDrawer.classList.remove('open');
}

function setActiveTab(id){
  activeTabId=id; 
  document.querySelectorAll('.webview').forEach(w=>w.classList.remove('active'));
  const w=activeWebview(); 
  if(w) w.classList.add('active');
  const t=activeTab();
  if(t && t.url && t.url !== 'about:blank' && t.url !== 'mahvegator://home'){ 
    webviewsContainer.classList.add('active'); 
    homeStage.classList.remove('active-home'); 
    addressInput.value=t.url; 
  } else {
    showHome();
  }
  renderTabs();
}

function createTab(url=null){
  const id='tab-'+tabSeq++, webviewId='webview-'+id;
  const w=document.createElement('webview'); 
  w.id=webviewId; 
  w.className='webview'; 
  w.src = (url && url !== 'about:blank' && url !== 'mahvegator://home') ? url : 'about:blank';
  webviewsContainer.appendChild(w);
  tabs.push({id,webviewId,title:'Nova guia',url: w.src === 'about:blank' ? 'mahvegator://home' : w.src}); 
  setActiveTab(id);
  
  w.addEventListener('did-navigate', e=>updateTabUrl(id,e.url));
  w.addEventListener('did-navigate-in-page', e=>updateTabUrl(id,e.url));
  w.addEventListener('page-title-updated', e=>{ 
    const t=tabs.find(x=>x.id===id); 
    if(t){ 
      t.title=e.title || domainName(t.url); 
      renderTabs(); 
    }
  });
  
  if(url && url !== 'about:blank') openUrlInTab(url,id); 
  else showHome();
}

function closeTab(id){ 
  const i=tabs.findIndex(t=>t.id===id); 
  if(i<0) return; 
  const t=tabs[i]; 
  const w=document.getElementById(t.webviewId); 
  if(w) w.remove(); 
  tabs.splice(i,1); 
  if(!tabs.length) createTab(); 
  else setActiveTab(tabs[Math.max(0,i-1)].id); 
}

function updateTabUrl(id,url){
  if (!url || url === 'about:blank') return;
  const t=tabs.find(x=>x.id===id); 
  if(!t) return; 
  t.url=url; 
  t.title=domainName(url); 
  if(id===activeTabId) addressInput.value=url; 
  renderTabs(); 
}

function openUrlInTab(value, tabId=activeTabId){ 
  if (!value || value === 'mahvegator://home') {
    showHome();
    return;
  }
  const url=normalize(value); 
  if(!url) return; 
  
  closeIconGallery();
  closeSkinDrawer();
  
  const t=tabs.find(x=>x.id===tabId); 
  if(!t) return; 
  const w=document.getElementById(t.webviewId); 
  if (!w) return;
  t.url=url; 
  t.title=domainName(url); 
  w.src=url; 
  webviewsContainer.classList.add('active'); 
  homeStage.classList.remove('active-home'); 
  addressInput.value=url; 
  renderTabs(); 
}

function goHome(){ 
  closeIconGallery();
  closeSkinDrawer();
  showHome();
}

function addFavorite(url=null){ 
  let finalUrl = url || addressInput.value;
  if (!finalUrl || finalUrl === 'about:blank' || finalUrl === 'mahvegator://home') {
    finalUrl = addressInput.value;
  }
  finalUrl = normalize(finalUrl);
  if(!finalUrl) return; 
  const name=domainName(finalUrl); 
  if(!favorites.some(f=>f.url===finalUrl)){ 
    favorites.unshift({name, url:finalUrl}); 
    saveFavorites(); 
    renderFavorites(); 
  } 
  openIconGallery();
}

function renderFavorites(){
  favList.innerHTML=favorites.map((f,i)=>`<div class="fav-row" data-url="${f.url}"><span class="fav-dot">${f.name.charAt(0).toUpperCase()}</span><div class="fav-meta"><span>${f.name}</span><small>${f.url}</small></div><button class="icon-only remove-fav" data-index="${i}">×</button></div>`).join('');
  
  quickGrid.innerHTML=favorites.slice(0,5).map(f=>`<button class="quick-tile" data-url="${f.url}"><span class="q favicon-letter">${f.name.charAt(0).toUpperCase()}</span><b>${f.name}</b></button>`).join('') + `<button class="quick-tile add" id="quickAdd"><span data-icon="plus"></span><b>Adicionar</b></button>`;
  quickGrid.querySelectorAll('[data-icon]').forEach(el=>{ const name=el.dataset.icon; if(icons[name]) el.innerHTML=icons[name]; });
  
  document.querySelectorAll('.fav-row').forEach(row=>row.onclick=e=>{ if(e.target.closest('.remove-fav')) return; openUrlInTab(row.dataset.url); favoritesDrawer.classList.remove('open'); });
  document.querySelectorAll('.remove-fav').forEach(btn=>btn.onclick=e=>{ e.stopPropagation(); favorites.splice(Number(btn.dataset.index),1); saveFavorites(); renderFavorites(); renderIconGallery(); });
  document.querySelectorAll('.quick-tile[data-url]').forEach(el=>el.onclick=()=>openUrlInTab(el.dataset.url));
  const qa=document.getElementById('quickAdd'); if(qa) qa.onclick=()=>addFavorite();
  
  renderIconGallery();
}

addressInput.onkeydown=e=>{ if(e.key==='Enter') openUrlInTab(addressInput.value); };
heroSearch.onkeydown=e=>{ if(e.key==='Enter') openUrlInTab(heroSearch.value); };
document.getElementById('heroGo').onclick=()=>openUrlInTab(heroSearch.value);

document.getElementById('backBtn').onclick=()=>{ 
  const w=activeWebview(); 
  if(w && w.canGoBack && w.canGoBack()) { w.goBack(); }
};

document.getElementById('forwardBtn').onclick=()=>{ 
  const w=activeWebview(); 
  if(w && w.canGoForward && w.canGoForward()) { w.goForward(); }
};

document.getElementById('refreshBtn').onclick=()=>{ 
  const w=activeWebview(); 
  if(webviewsContainer.classList.contains('active') && w && w.reload) { w.reload(); } 
};

homeBtn.onclick=goHome; brandHome.onclick=goHome; homeLogoBtn.onclick=goHome;
document.getElementById('newTabBtn').onclick=()=>createTab();

tabsEl.onclick=e=>{ 
  const el=e.target.closest('.tab'); 
  if(!el) return; 
  if(e.target.closest('.tab-close')) closeTab(el.dataset.tabId); 
  else setActiveTab(el.dataset.tabId); 
};

document.getElementById('favoriteBtn').onclick=()=>addFavorite(); 
document.getElementById('addCurrentFav').onclick=()=>addFavorite();

document.getElementById('favoritesFolderBtn').onclick=()=>{ 
  closeSkinDrawer();
  const gallery = document.getElementById('iconGallery');
  if (gallery && gallery.classList.contains('active')) {
    closeIconGallery();
  } else {
    openIconGallery();
  }
};

document.getElementById('closeFavs').onclick=()=>favoritesDrawer.classList.remove('open');

document.getElementById('skinToggle').onclick=()=>{ 
  closeIconGallery();
  skinDrawer.classList.toggle('open'); 
};
document.getElementById('closeSkins').onclick=()=>skinDrawer.classList.remove('open');

const settingsBtn = document.getElementById('settingsBtn');
if(settingsBtn) { settingsBtn.style.display = 'none'; }

let selectedSkin=document.body.dataset.skin||'aurora'; 
document.querySelectorAll('.skin-card').forEach(card=>card.onclick=()=>{ 
  document.querySelectorAll('.skin-card').forEach(c=>c.classList.remove('selected')); 
  card.classList.add('selected'); 
  selectedSkin=card.dataset.setskin; 
  document.body.dataset.skin=selectedSkin; 
  localStorage.setItem('mahvegator:skin',selectedSkin); 
});

document.getElementById('applySkin').onclick=()=>{ 
  document.body.dataset.skin=selectedSkin; 
  skinDrawer.classList.remove('open'); 
};

document.getElementById('minBtn').onclick=()=>{
  try {
    if(window.mahWindow?.minimize) window.mahWindow.minimize();
    else if(window.require) { const { ipcRenderer } = window.require('electron'); ipcRenderer.send('window-minimize'); }
  } catch(e) { console.log('Erro ao minimizar'); }
};

document.getElementById('maxBtn').onclick=()=>{
  try {
    if(window.mahWindow?.maximize) window.mahWindow.maximize();
    else if(window.require) { const { ipcRenderer } = window.require('electron'); ipcRenderer.send('window-maximize'); }
  } catch(e) { console.log('Erro ao maximizar'); }
};

document.getElementById('closeBtn').onclick=()=>{
  try {
    if(window.mahWindow?.close) window.mahWindow.close();
    else if(window.require) { const { ipcRenderer } = window.require('electron'); ipcRenderer.send('window-close'); }
  } catch(e) { console.log('Erro ao fechar'); }
};

const savedSkin=localStorage.getItem('mahvegator:skin'); 
if(savedSkin){ 
  document.body.dataset.skin=savedSkin; 
  selectedSkin=savedSkin; 
  document.querySelectorAll('.skin-card').forEach(c=>c.classList.toggle('selected',c.dataset.setskin===savedSkin)); 
}

// ========== FUNÇÕES DA GALERIA ==========

function criarGaleria() {
  if (!document.getElementById('iconGallery')) {
    const gallery = document.createElement('div');
    gallery.id = 'iconGallery';
    gallery.className = 'icon-gallery';
    gallery.innerHTML = `<div id="galleryGrid" class="gallery-grid"></div>`;
    document.querySelector('.browser-stage').appendChild(gallery);
    gallery.addEventListener('click', (e) => { if (e.target === gallery) closeIconGallery(); });
  }
}

function removerFavoritoPorUrl(url) {
  const index = favorites.findIndex(f => f.url === url);
  if (index !== -1) {
    favorites.splice(index, 1);
    saveFavorites();
    renderFavorites();
    renderIconGallery();
  }
}

function editarNomeFavorito(index) {
  const novoNome = prompt('✏️ Editar nome do favorito:', favorites[index].name);
  if (novoNome && novoNome.trim()) {
    favorites[index].name = novoNome.trim();
    saveFavorites();
    renderFavorites();
    renderIconGallery();
    setFavStatus(`✅ Renomeado para "${novoNome.trim()}"`);
  }
}

let dragSourceIndex = null;

function renderIconGallery() {
  criarGaleria();
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  
  if (favorites.length === 0) {
    grid.innerHTML = `<div style="text-align:center; color:#fff; grid-column:1/-1; padding:40px;">Nenhum favorito ainda. Clique na estrela para adicionar.</div>`;
    return;
  }
  
  grid.innerHTML = favorites.map((fav, idx) => `
    <div class="gallery-icon-item" data-url="${fav.url}" data-index="${idx}" draggable="true">
      <div class="gallery-icon-remove" data-url="${fav.url}">✕</div>
      <img class="gallery-icon-img" src="https://www.google.com/s2/favicons?domain=${fav.url}&sz=64" alt="${fav.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2752%27 height=%2752%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-width=%272%27%3E%3Cpath d=%27M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z%27/%3E%3Cpath d=%27M22 6l-10 7L2 6%27/%3E%3C/svg%3E'">
      <span class="gallery-icon-name" data-index="${idx}">${fav.name}</span>
    </div>
  `).join('');
  
  // Clique no ícone para abrir o site
  document.querySelectorAll('.gallery-icon-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('gallery-icon-remove')) return;
      if (e.target.classList.contains('gallery-icon-name')) return;
      e.stopPropagation();
      const url = item.dataset.url;
      if (url) {
        openUrlInTab(url);
        closeIconGallery();
      }
    });
  });
  
  // Botão de remover
  document.querySelectorAll('.gallery-icon-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.dataset.url;
      removerFavoritoPorUrl(url);
    });
  });
  
  // Duplo clique no nome para editar
  document.querySelectorAll('.gallery-icon-name').forEach(el => {
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const index = parseInt(el.dataset.index);
      editarNomeFavorito(index);
    });
  });
  
  // DRAG AND DROP para reorganizar
  const items = document.querySelectorAll('.gallery-icon-item');
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      dragSourceIndex = parseInt(item.dataset.index);
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragSourceIndex);
    });
    
    item.addEventListener('dragend', (e) => {
      item.classList.remove('dragging');
      dragSourceIndex = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    
    item.addEventListener('dragenter', (e) => {
      item.classList.add('drag-over');
    });
    
    item.addEventListener('dragleave', (e) => {
      item.classList.remove('drag-over');
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const targetIndex = parseInt(item.dataset.index);
      if (dragSourceIndex !== null && dragSourceIndex !== targetIndex) {
        const [movedItem] = favorites.splice(dragSourceIndex, 1);
        favorites.splice(targetIndex, 0, movedItem);
        saveFavorites();
        renderIconGallery();
      }
    });
  });
}

function openIconGallery() {
  renderIconGallery();
  const gallery = document.getElementById('iconGallery');
  if (gallery) gallery.classList.add('active');
}

function closeIconGallery() {
  const gallery = document.getElementById('iconGallery');
  if (gallery) gallery.classList.remove('active');
}

function parseBookmarksHtml(html){
  const found = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  anchors.forEach(a => {
    const url = a.getAttribute('href');
    const name = (a.textContent || url || 'Favorito').trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return;
    if (!found.some(f => f.url === url)) found.push({ name, url });
  });
  return found;
}

function setFavStatus(msg){
  const el = document.getElementById('favStatus');
  if(el) el.textContent = msg || '';
  setTimeout(() => { if(el) el.textContent = ''; }, 3000);
}

// ========== IMPORTAR/EXPORTAR ==========
const importBtn = document.getElementById('importFavHtml');
if(importBtn){
  importBtn.addEventListener('click', async () => {
    try {
      const result = await window.mahBookmarks.importHtml();
      if(result?.canceled) return setFavStatus('Importação cancelada.');
      const imported = parseBookmarksHtml(result.html || '');
      if(!imported.length) return setFavStatus('Nenhum favorito válido encontrado.');
      let added = 0;
      imported.forEach(item => {
        if(!favorites.some(f => f.url === item.url)){
          favorites.push(item);
          added++;
        }
      });
      saveFavorites();
      renderFavorites();
      setFavStatus(`${added} favoritos importados.`);
    } catch (err) {
      setFavStatus('Erro ao importar: ' + err.message);
    }
  });
}

const exportBtn = document.getElementById('exportFavHtml');
if(exportBtn){
  exportBtn.addEventListener('click', async () => {
    try {
      const result = await window.mahBookmarks.exportHtml(favorites);
      if(result?.canceled) return setFavStatus('Exportação cancelada.');
      setFavStatus('Favoritos exportados!');
    } catch (err) {
      setFavStatus('Erro ao exportar: ' + err.message);
    }
  });
}

// ========== MENU GERENCIAR FAVORITOS ==========
const manageFavBtn = document.getElementById('manageFavBtn');
const manageFavMenu = document.getElementById('manageFavMenu');

if (manageFavBtn && manageFavMenu) {
  manageFavBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    manageFavMenu.classList.toggle('open');
  });
  
  document.addEventListener('click', (e) => {
    if (!manageFavBtn.contains(e.target) && !manageFavMenu.contains(e.target)) {
      manageFavMenu.classList.remove('open');
    }
  });
}

const importMenuBtn = document.getElementById('importFavHtmlMenu');
if (importMenuBtn) {
  importMenuBtn.addEventListener('click', () => {
    manageFavMenu.classList.remove('open');
    document.getElementById('importFavHtml').click();
  });
}

const exportMenuBtn = document.getElementById('exportFavHtmlMenu');
if (exportMenuBtn) {
  exportMenuBtn.addEventListener('click', () => {
    manageFavMenu.classList.remove('open');
    document.getElementById('exportFavHtml').click();
  });
}

renderFavorites(); 
createTab();