const itemGrid=document.getElementById("itemGrid");
const searchInput=document.getElementById("searchInput");
const genderFilter=document.getElementById("genderFilter");
const mekikiFilter=document.getElementById("mekikiFilter");
const categoryFilter=document.getElementById("categoryFilter");
const brandTypeFilter=document.getElementById("brandTypeFilter");
const careFilter=document.getElementById("careFilter");
const countryFilter=document.getElementById("countryFilter");
const materialButtons=document.getElementById("materialButtons");
const resetFilters=document.getElementById("resetFilters");
const resultCount=document.getElementById("resultCount");
const emptyMessage=document.getElementById("emptyMessage");

let selectedMaterial="all";

const norm=t=>String(t??"").toLowerCase().normalize("NFKC").replace(/\s+/g,"");
const esc=v=>String(v??"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");

function stars(level){
  const n=Math.max(0,Math.min(5,Number(level)||0));
  return "★".repeat(n)+"☆".repeat(5-n);
}

function searchText(i){
  return norm([
    i.title,i.brand,i.brandType,i.category,i.gender,i.size,i.country,i.era,
    i.materialPoint,i.durability,i.shrinkRisk,i.craftPoint,
    ...i.material,...i.care,...i.details,...i.keywords
  ].join(" "));
}

function card(i){
  const a=document.createElement("article");
  a.className="card";

  const mt=i.material.map(x=>'<span class="tag tag-material">'+esc(x)+'</span>').join("");
  const dt=i.details.slice(0,2).map(x=>'<span class="tag">'+esc(x)+'</span>').join("");
  const era=i.era?'<span class="card-era">'+esc(i.era)+'</span>':"";

  a.innerHTML=
    '<a href="'+esc(i.detailUrl)+'" class="card-link">'+
      '<div class="card-image-wrap">'+
        '<span class="badge">'+esc(i.condition)+'</span>'+
        era+
        '<img src="'+esc(i.image)+'" alt="'+esc(i.title)+'" class="card-img" loading="lazy">'+
      '</div>'+
      '<div class="card-content">'+
        '<div class="card-tags">'+
          '<span class="tag tag-gender">'+esc(i.gender)+'</span>'+
          '<span class="tag tag-mekiki" aria-label="目利き度 '+esc(i.mekikiLevel)+'">'+stars(i.mekikiLevel)+'</span>'+
          mt+
          '<span class="tag tag-country">'+esc(i.country)+'</span>'+
          dt+
        '</div>'+
        '<p class="card-category">'+esc(i.category)+' / '+esc(i.brandType)+'</p>'+
        '<h3 class="card-title">'+esc(i.title)+'</h3>'+
        '<p class="card-brand">'+esc(i.brand)+(i.size?' / '+esc(i.size):'')+'</p>'+
        '<div class="card-details">'+
          '<div class="detail-item"><strong>素材</strong><p>'+esc(i.materialPoint)+'</p></div>'+
          '<div class="detail-item"><strong>耐久性</strong><p>'+esc(i.durability)+'</p></div>'+
          '<div class="detail-item"><strong>目利きポイント</strong><p>'+esc(i.craftPoint)+'</p></div>'+
        '</div>'+
        '<div class="card-more">詳しく見る →</div>'+
      '</div>'+
    '</a>';

  return a;
}

function render(items){
  itemGrid.innerHTML="";
  items.forEach(i=>itemGrid.appendChild(card(i)));
  resultCount.textContent=items.length+"件のアイテム";
  emptyMessage.hidden=items.length!==0;
}

function vals(k){
  return [...new Set(ITEMS.map(i=>i[k]).filter(Boolean))].sort();
}

function arrVals(k){
  return [...new Set(ITEMS.flatMap(i=>i[k]??[]))].sort();
}

function options(el,vs){
  vs.forEach(v=>{
    const o=document.createElement("option");
    o.value=v;
    o.textContent=v;
    el.appendChild(o);
  });
}

function materialBtns(){
  materialButtons.innerHTML='<button type="button" class="tag-btn active" data-material="all">すべて</button>';

  arrVals("material").forEach(m=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="tag-btn";
    b.dataset.material=m;
    b.textContent=m;
    materialButtons.appendChild(b);
  });
}

function apply(){
  const k=norm(searchInput.value);
  const gender=genderFilter.value;
  const mekiki=mekikiFilter.value;
  const c=categoryFilter.value;
  const b=brandTypeFilter.value;
  const care=careFilter.value;
  const country=countryFilter.value;

  render(ITEMS.filter(i=>
    (!k||searchText(i).includes(k)) &&
    (gender==="all"||i.gender===gender) &&
    (mekiki==="all"||String(i.mekikiLevel)===mekiki) &&
    (c==="all"||i.category===c) &&
    (b==="all"||i.brandType===b) &&
    (care==="all"||i.care.includes(care)) &&
    (country==="all"||i.country===country) &&
    (selectedMaterial==="all"||i.material.includes(selectedMaterial))
  ));
}

function reset(){
  searchInput.value="";
  genderFilter.value="all";
  mekikiFilter.value="all";
  categoryFilter.value="all";
  brandTypeFilter.value="all";
  careFilter.value="all";
  countryFilter.value="all";
  selectedMaterial="all";

  document.querySelectorAll(".tag-btn").forEach(b=>b.classList.remove("active"));
  document.querySelector('[data-material="all"]')?.classList.add("active");

  apply();
}

options(categoryFilter,vals("category"));
options(brandTypeFilter,vals("brandType"));
options(careFilter,arrVals("care"));
options(countryFilter,vals("country"));
materialBtns();

[searchInput,genderFilter,mekikiFilter,categoryFilter,brandTypeFilter,careFilter,countryFilter]
  .forEach(el=>el.addEventListener(el===searchInput?"input":"change",apply));

materialButtons.addEventListener("click",e=>{
  const b=e.target.closest(".tag-btn");
  if(!b)return;

  selectedMaterial=b.dataset.material;

  document.querySelectorAll(".tag-btn").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");

  apply();
});

resetFilters.addEventListener("click",reset);
render(ITEMS);