const state={tops:null,pants:null,shoes:null,outer:null,hat:null,bag:null};
let activeCategory="tops";

const tabs=document.getElementById("categoryTabs");
const itemsEl=document.getElementById("dressupItems");
const selectedEl=document.getElementById("selectedItems");
const savedEl=document.getElementById("savedOutfits");
const outfitName=document.getElementById("outfitName");

function getItem(id){return DRESSUP_ITEMS.find(i=>i.id===id)||null;}
function layerId(category){return "layer-"+category;}

function renderTabs(){
  tabs.innerHTML=DRESSUP_CATEGORIES.map(c=>`
    <button class="category-tab ${c.id===activeCategory?"active":""}" data-category="${c.id}">${c.label}</button>
  `).join("");
}

function renderItems(){
  const categoryItems=DRESSUP_ITEMS.filter(i=>i.category===activeCategory);
  itemsEl.innerHTML=
    `<button class="dressup-item none-item ${state[activeCategory]===null?"selected":""}" data-id="">
      <span class="item-thumb none-thumb">なし</span>
      <strong>なし</strong>
    </button>`+
    categoryItems.map(i=>`
      <button class="dressup-item ${state[i.category]===i.id?"selected":""}" data-id="${i.id}">
        <span class="item-thumb"><img src="${i.image}" alt=""></span>
        <strong>${i.name}</strong>
        <small>${i.color} / ${i.material}</small>
      </button>
    `).join("");
}

function updateLayers(){
  Object.keys(state).forEach(category=>{
    const layer=document.getElementById(layerId(category));
    const item=getItem(state[category]);
    if(!layer)return;
    if(item){
      layer.src=item.image;
      layer.hidden=false;
    }else{
      layer.removeAttribute("src");
      layer.hidden=true;
    }
  });
}

function renderSelected(){
  selectedEl.innerHTML=DRESSUP_CATEGORIES.map(c=>{
    const item=getItem(state[c.id]);
    return `<div class="selected-row"><span>${c.label}</span><strong>${item?item.name:"なし"}</strong></div>`;
  }).join("");
}

function chooseItem(id){
  const item=getItem(id);
  state[activeCategory]=item?item.id:null;
  updateLayers();
  renderItems();
  renderSelected();
}

function resetOutfit(){
  Object.keys(state).forEach(k=>state[k]=null);
  updateLayers();
  renderItems();
  renderSelected();
}

function storageKey(){return "materialCraftOutfitsV1";}
function loadSaved(){try{return JSON.parse(localStorage.getItem(storageKey()))||[];}catch{return [];}}
function writeSaved(list){localStorage.setItem(storageKey(),JSON.stringify(list));}

function saveOutfit(){
  const name=outfitName.value.trim();
  if(!name){outfitName.focus();return;}
  const list=loadSaved();
  list.unshift({id:Date.now(),name,state:{...state}});
  writeSaved(list.slice(0,20));
  outfitName.value="";
  renderSaved();
}

function applySaved(id){
  const found=loadSaved().find(x=>String(x.id)===String(id));
  if(!found)return;
  Object.keys(state).forEach(k=>state[k]=found.state?.[k]||null);
  updateLayers();
  renderItems();
  renderSelected();
}

function deleteSaved(id){
  writeSaved(loadSaved().filter(x=>String(x.id)!==String(id)));
  renderSaved();
}

function renderSaved(){
  const list=loadSaved();
  if(!list.length){
    savedEl.innerHTML='<p class="saved-empty">まだ保存したコーデはありません。</p>';
    return;
  }
  savedEl.innerHTML=list.map(x=>`
    <div class="saved-card">
      <button class="saved-load" data-load="${x.id}">
        <strong>${escapeHtml(x.name)}</strong>
        <small>${Object.values(x.state).filter(Boolean).length}アイテム使用</small>
      </button>
      <button class="saved-delete" data-delete="${x.id}" aria-label="${escapeHtml(x.name)}を削除">×</button>
    </div>
  `).join("");
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

tabs.addEventListener("click",e=>{
  const b=e.target.closest("[data-category]");
  if(!b)return;
  activeCategory=b.dataset.category;
  renderTabs();
  renderItems();
});

itemsEl.addEventListener("click",e=>{
  const b=e.target.closest(".dressup-item");
  if(!b)return;
  chooseItem(b.dataset.id);
});

savedEl.addEventListener("click",e=>{
  const load=e.target.closest("[data-load]");
  const del=e.target.closest("[data-delete]");
  if(load)applySaved(load.dataset.load);
  if(del)deleteSaved(del.dataset.delete);
});

document.getElementById("resetOutfit").addEventListener("click",resetOutfit);
document.getElementById("saveOutfit").addEventListener("click",saveOutfit);

renderTabs();
renderItems();
renderSelected();
renderSaved();
updateLayers();