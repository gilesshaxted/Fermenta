---
cssclasses:
  - fermenta-home
tags:
  - WiltshireWine
---
<div class="fm-hero"><div class="fm-hero-title">Fermenta</div><div class="fm-hero-sub">A free, linked wine reference. Grapes, regions, styles, producers and where to buy.</div><div class="fm-hero-search"><a class="fm-btn" href="obsidian://omnisearch?query=">🔍 Search the whole vault</a><a class="fm-btn fm-btn-quiet" href="obsidian://search?query=">Plain search</a></div></div>

```dataviewjs
const n=t=>dv.pages().where(p=>p.type===t).length;
const items=[[n("grape"),"grapes"],[n("country"),"countries"],[n("region"),"regions"],[n("style"),"styles"],[n("producer"),"producers"],[n("shop"),"UK shops"]];
dv.container.innerHTML=`<div class="fm-stats">${items.map(([v,l])=>`<div><strong>${v}</strong><span>${l}</span></div>`).join("")}</div>`;
```

## Explore
<div class="fm-grid"><a class="internal-link fm-card" data-href="Grapes.base" href="Grapes.base"><span class="fm-ico">🍇</span><strong>Grapes</strong><span>Where each grape grows, how it tastes and what it makes.</span></a><a class="internal-link fm-card" data-href="Wine Regions.base" href="Wine Regions.base"><span class="fm-ico">🗺️</span><strong>Regions</strong><span>Countries and regions with maps, climate, soils and key wines.</span></a><a class="internal-link fm-card" data-href="Styles" href="Styles"><span class="fm-ico">🥂</span><strong>Styles</strong><span>Champagne, Port, Orange wine, Sherry and more.</span></a><a class="internal-link fm-card" data-href="Producers" href="Producers"><span class="fm-ico">🏡</span><strong>Producers</strong><span>Major houses, notable growers and natural names.</span></a><a class="internal-link fm-card" data-href="Shops" href="Shops"><span class="fm-ico">🛒</span><strong>Shops</strong><span>Where to buy in the UK, from supermarkets to independents.</span></a></div>

## Discover something new
A random grape, region, style, producer and shop each time you open this page. Press shuffle for another set.

```dataviewjs
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const arr=v=>v==null?[]:(typeof v==="string"?[v]:Array.from(v));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const pages=t=>dv.pages().where(p=>p.type===t).array();
const kinds=[
 {ico:"🍇",label:"Grape",pool:pages("grape"),sub:p=>[p.colour,p.origin].filter(Boolean).join(" · "),extra:p=>arr(p.flavours).slice(0,3).join(", ")},
 {ico:"🗺️",label:"Region",pool:pages("region"),sub:p=>p.country,extra:p=>p.climate},
 {ico:"🥂",label:"Style",pool:pages("style"),sub:p=>p.category,extra:p=>""},
 {ico:"🏡",label:"Producer",pool:pages("producer"),sub:p=>p.country,extra:p=>p.category},
 {ico:"🛒",label:"Shop",pool:pages("shop"),sub:p=>p.category,extra:p=>p.area}
].filter(k=>k.pool.length);
const root=dv.container.createDiv({cls:"fm-picks"});
const grid=root.createDiv({cls:"fm-grid"});
const btn=root.createEl("button",{text:"🎲 Shuffle",cls:"fm-shuffle"});
const draw=()=>{grid.innerHTML=kinds.map(k=>{const p=rnd(k.pool);const s=k.sub(p);return `<a class="internal-link fm-card" data-href="${esc(p.file.path)}" href="${esc(p.file.path)}"><span class="fm-ico">${k.ico}</span><strong>${esc(p.file.name)}</strong><span>${esc(k.label)}${s?" · "+esc(s):""}</span><span>${esc(k.extra(p))}</span></a>`;}).join("");};
btn.onclick=draw;draw();
```

## Name that grape
Guess the grape from its clues, then reveal the answer and click through to read about it.

```dataviewjs
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const arr=v=>v==null?[]:(typeof v==="string"?[v]:Array.from(v));
const grapes=dv.pages().where(p=>p.type==="grape").array();
const box=dv.container.createDiv({cls:"fm-quiz"});
const card=box.createDiv({cls:"fm-quiz-card"});
const btn=box.createEl("button",{text:"Another grape",cls:"fm-shuffle"});
const draw=()=>{
 const g=grapes[Math.floor(Math.random()*grapes.length)];
 const clues=[["Colour",g.colour],["Body",g.body],["Acidity",g.acidity],["Tannin",g.tannin&&g.tannin!=="none"?g.tannin:null],["Origin",g.origin],["Tastes of",arr(g.flavours).slice(0,4).join(", ")]].filter(c=>c[1]);
 card.innerHTML=`<ul>${clues.map(c=>`<li><strong>${c[0]}:</strong> ${esc(c[1])}</li>`).join("")}</ul><details><summary>Reveal the grape</summary><a class="internal-link" data-href="${esc(g.file.path)}" href="${esc(g.file.path)}">${esc(g.file.name)}</a></details>`;
};
btn.onclick=draw;draw();
```

## By the numbers
```dataviewjs
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const count=(t,f)=>{const m=new Map();dv.pages().where(p=>p.type===t).array().forEach(p=>{const k=f(p);if(k)m.set(k,(m.get(k)||0)+1);});return [...m].sort((a,b)=>b[1]-a[1]);};
const bars=rows=>{const max=rows.length?rows[0][1]:1;return rows.map(([l,v])=>`<div class="fm-bar"><span class="fm-bar-l">${esc(l)}</span><span class="fm-bar-t"><i style="width:${Math.max(3,Math.round(v/max*100))}%"></i></span><span class="fm-bar-v">${v}</span></div>`).join("");};
const prod=count("producer",p=>p.country).slice(0,10);
const reg=count("region",p=>p.country).slice(0,10);
const col=count("grape",p=>p.colour);
dv.container.innerHTML=`<div class="fm-two"><div><h4>Producers by country</h4>${bars(prod)}</div><div><h4>Regions by country</h4>${bars(reg)}</div><div><h4>Grapes by colour</h4>${bars(col)}</div></div>`;
```

## The world of wine
![[Wine Regions.base#World Map]]

## Browse by continent
<div class="fm-chips"><a class="internal-link" data-href="Europe" href="Europe">Europe</a><a class="internal-link" data-href="North America" href="North America">North America</a><a class="internal-link" data-href="South America" href="South America">South America</a><a class="internal-link" data-href="Asia" href="Asia">Asia</a><a class="internal-link" data-href="Africa" href="Africa">Africa</a><a class="internal-link" data-href="Oceania" href="Oceania">Oceania</a></div>

## Search for something
Click a topic to run the search. This uses the Omnisearch plugin, which searches every note in the vault.
<div class="fm-chips"><a href="obsidian://omnisearch?query=Pinot Noir">Pinot Noir</a><a href="obsidian://omnisearch?query=orange wine">Orange wine</a><a href="obsidian://omnisearch?query=natural">Natural wine</a><a href="obsidian://omnisearch?query=sparkling">Sparkling</a><a href="obsidian://omnisearch?query=volcanic">Volcanic soils</a><a href="obsidian://omnisearch?query=Georgia">Georgia</a><a href="obsidian://omnisearch?query=Rioja">Rioja</a><a href="obsidian://omnisearch?query=sweet wine">Sweet wine</a><a href="obsidian://omnisearch?query=biodynamic">Biodynamic</a><a href="obsidian://omnisearch?query=independent merchant">Independent shops</a></div>

## Good places to start
<div class="fm-chips"><a class="internal-link" data-href="Pinot Noir" href="Pinot Noir">Pinot Noir</a><a class="internal-link" data-href="Riesling" href="Riesling">Riesling</a><a class="internal-link" data-href="Nebbiolo" href="Nebbiolo">Nebbiolo</a><a class="internal-link" data-href="Burgundy" href="Burgundy">Burgundy</a><a class="internal-link" data-href="Piedmont" href="Piedmont">Piedmont</a><a class="internal-link" data-href="Champagne (style)" href="Champagne (style)">Champagne</a><a class="internal-link" data-href="Orange wine" href="Orange wine">Orange wine</a><a class="internal-link" data-href="Sherry" href="Sherry">Sherry</a><a class="internal-link" data-href="Natural wine" href="Natural wine">Natural wine</a><a class="internal-link" data-href="Georgia" href="Georgia">Georgia</a></div>

## How it fits together
> [!tip] Follow the links
> A **grape** links to its regions and styles. A **region** links to its grapes, styles and producers. A **producer** links to its regions, grapes and styles. Start anywhere and keep clicking.

> [!note] Your own notes
> Every page ends with a "Wines I've tried" section, so tasting notes you write will show up on the grape, region, producer or shop they belong to.

## Reading the notes
> [!note] How to read the notes
> Plain text is treated as confident fact. ==Highlighted text with a question mark== is something that still needs confirming against a good source. See everything flagged in [[Needs Checking.base|Needs checking]].

## Help improve it
```dataviewjs
const n=dv.pages().where(p=>p["needs-checking"]===true).length;
dv.paragraph(`**${n}** notes have a claim that still needs confirming. [[Needs Checking.base|See the list]].`);
```

Everything here was written from general knowledge, so please check facts before you rely on them. To add or fix something, see the [GitHub page](https://github.com/gilesshaxted/Fermenta).
