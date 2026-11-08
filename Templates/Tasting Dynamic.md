<%*
// ---------- Helper: single-choice list ----------
async function choose(promptText, options) {
    let result = await tp.system.suggester(options, options, false, promptText);
    return result || "";
}

// ---------- Aroma & Flavour characteristic map (from the WSET card) ----------
const aromaFlavourMap = {
  "Citrus": ["Grapefruit","Lemon","Lime"],
  "Green Fruit": ["Apple (green)","Apple (ripe)","Gooseberry","Pear"],
  "Stone Fruit": ["Apricot","Peach"],
  "Red Fruit": ["Raspberry","Red Cherry","Plum","Redcurrant","Strawberry"],
  "Black Fruit": ["Blackberry","Black Cherry","Blackcurrant"],
  "Tropical Fruit": ["Banana","Kiwi","Lychee","Mango","Melon","Passion Fruit","Pineapple"],
  "Dried Fruit": ["Fig","Prune","Raisin","Sultana"],
  "Blossom": ["Elderflower","Orange Blossom"],
  "Flowers": ["Perfume","Rose","Violet"],
  "Sweet Spice": ["Cinnamon","Cloves","Ginger","Nutmeg","Vanilla"],
  "Pungent Spice": ["Black Pepper","White Pepper","Liquorice","Juniper"],
  "Fresh Vegetal": ["Asparagus","Green Bell Pepper","Mushroom","Black Olive"],
  "Cooked Vegetal": ["Cabbage","Tinned Vegetables"],
  "Herbaceous": ["Eucalyptus","Grass","Hay","Mint","Blackcurrant Leaf","Wet Leaves"],
  "Kernel": ["Almond","Coconut","Hazelnut","Walnut","Chocolate","Coffee"],
  "Oak": ["Cedar","Medicinal","Resinous","Smoke","Vanilla","Tobacco"],
  "Animal": ["Leather","Wet Wool","Meaty"],
  "Autolytic": ["Yeast","Biscuit","Bread","Toast"],
  "Dairy": ["Butter","Cheese","Cream","Yoghurt"],
  "Mineral": ["Earth","Petrol","Rubber","Tar","Stony/Steely"],
  "Ripeness": ["Caramel","Candy","Honey","Jam","Marmalade","Treacle","Cooked","Baked","Stewed"]
};

// ---------- Helper: multi-pick characteristics, with custom terms allowed ----------
async function pickCharacteristics(label) {
    let picked = [];
    const CUSTOM = "+ Add my own term";
    const DONE = "✓ Done adding";
    while (true) {
        let categoryNames = Object.keys(aromaFlavourMap);
        let options = categoryNames.concat([CUSTOM, DONE]);
        let category = await tp.system.suggester(options, options, false, `${label} (${picked.length} added so far)`);

        if (!category || category === DONE) break;

        if (category === CUSTOM) {
            let term = await tp.system.prompt(`Type your own term`, "", false, true);
            if (term) picked.push(term);
            continue;
        }

        let descriptors = aromaFlavourMap[category].concat(["+ Add my own term for this category"]);
        let descriptor = await tp.system.suggester(descriptors, descriptors, false, category);

        if (descriptor === "+ Add my own term for this category") {
            let term = await tp.system.prompt(`Your own ${category} term`, "", false, true);
            if (term) picked.push(term);
        } else if (descriptor) {
            picked.push(descriptor);
        }
    }
    return picked.join(", ");
}

// ---------- Wine details ----------
let producer = (await tp.system.prompt("Producer:", "", false, true)) || "";
let wineName = (await tp.system.prompt("Wine Name:", "", false, true)) || "";
let vintage = (await tp.system.prompt("Vintage:", "", false, true)) || "";
let region = (await tp.system.prompt("Region:", "", false, true)) || "";
let abv = (await tp.system.prompt("ABV:", "", false, true)) || "";
let price = (await tp.system.prompt("Price / where bought:", "", false, true)) || "";
let backLabelNotes = (await tp.system.prompt("Back Label / Producer Notes:", "", false, true)) || "";
let storeNotes = (await tp.system.prompt("Wine Store / Shelf Tag Notes:", "", false, true)) || "";

// ---------- Tasters ----------
let tasterCountStr = await tp.system.prompt("How many tasters in total today?", "2", false, true);
let tasterCount = parseInt(tasterCountStr) || 2;
let tasters = [];
let taster1 = await tp.system.prompt("Taster 1 Name:", "Giles", false, true);
tasters.push(taster1);
for (let i = 2; i <= tasterCount; i++) {
    let name = await tp.system.prompt(`Taster ${i} Name:`, "", false, true);
    tasters.push(name || `Taster ${i}`);
}
let yamlTasters = "";
tasters.forEach((t, i) => { yamlTasters += `Taster${i+1}: ${t}\n`; });
let allTastersString = tasters.join(", ");
let personalNose = "";
let personalPalate = "";
tasters.forEach(t => {
    personalNose += `- **${t}:** \n`;
    personalPalate += `- **${t}:** \n`;
});

// ---------- WSET Systematic Approach ----------
let wineType = await choose("Wine Type (sets the colour options)", ["White","Rosé","Red"]);

let colourOptions = wineType === "Red"
    ? ["Purple","Ruby","Garnet","Tawny"]
    : wineType === "Rosé"
    ? ["Pink","Orange"]
    : ["Lemon","Gold","Amber"];

let clarity = await choose("Appearance — Clarity", ["Clear","Dull"]);
let appearanceIntensity = await choose("Appearance — Intensity", ["Pale","Medium","Deep"]);
let colour = await choose("Appearance — Colour", colourOptions);

let noseCondition = await choose("Nose — Condition", ["Clean","Unclean"]);
let noseIntensity = await choose("Nose — Intensity", ["Light","Medium","Pronounced"]);
let aromaCharacteristics = await pickCharacteristics("Nose — Aroma characteristics");

let sweetness = await choose("Palate — Sweetness", ["Dry","Off-Dry","Medium","Sweet"]);
let acidity = await choose("Palate — Acidity", ["Low","Medium","High"]);
let tannin = wineType === "Red" ? await choose("Palate — Tannin", ["Low","Medium","High"]) : "N/A";
let body = await choose("Palate — Body", ["Light","Medium","Full"]);
let flavourCharacteristics = await pickCharacteristics("Palate — Flavour characteristics");
let length = await choose("Palate — Length", ["Short","Medium","Long"]);

let quality = await choose("Conclusions — Quality", ["Poor","Acceptable","Good","Very Good","Outstanding"]);
%>---
tags:
  - WiltshireWine
  - TastingNotes
  - Template
date: <% tp.file.creation_date("YYYY-MM-DD") %>
<% yamlTasters.trim() %>
---

# Tasting Note - <% wineName || "[Wine Name]" %>

**Producer:** <% producer %>
**Wine:** <% wineName %>
**Vintage:** <% vintage %>
**Region:** <% region %>
**ABV:** <% abv %>
**Price / where bought:** <% price %>
**Tasters:** <% allTastersString %>

## Eyeball

- **Clarity:** <% clarity %>
- **Intensity:** <% appearanceIntensity %>
- **Colour:** <% colour %>

## Sniff

- **Condition:** <% noseCondition %>
- **Intensity:** <% noseIntensity %>
- **Aroma characteristics:** <% aromaCharacteristics %>

## Slurp

- **Sweetness:** <% sweetness %>
- **Acidity:** <% acidity %>
- **Tannin:** <% tannin %>
- **Body:** <% body %>
- **Flavour characteristics:** <% flavourCharacteristics %>
- **Length:** <% length %>

## Conclusions

- **Quality:** <% quality %>

## Personal Impressions

**Nose**
<% personalNose.trim() %>

**Palate**
<% personalPalate.trim() %>

## Producer's own notes (back label)
<% backLabelNotes %>

## Store Shelf Notes
<% storeNotes %>

## Overall thoughts


## Would I recommend / buy again?