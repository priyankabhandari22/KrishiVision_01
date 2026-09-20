const RESOURCES = {
  ccri: {
    title: "ICAR-Central Citrus Research Institute (Nagpur)",
    note: "Official ICAR research institute for citrus diseases and management in India.",
    url: "https://ccri.org.in/"
  },
  cish: {
    title: "ICAR-Central Institute for Subtropical Horticulture (Lucknow)",
    note: "ICAR institute for guava and subtropical fruit research in India.",
    url: "https://www.cish.org.in/"
  },
  icar: {
    title: "ICAR Institute Network",
    note: "Directory of Indian Council of Agricultural Research institutes by discipline.",
    url: "https://icar.org.in/en/institute"
  },
  tnau: {
    title: "TNAU AgriTech Portal",
    note: "Tamil Nadu Agricultural University extension portal with crop management guides.",
    url: "http://www.agritech.tnau.ac.in/"
  },
  fao: {
    title: "FAO - Plant Production and Protection",
    note: "FAO plant health and crop protection information for farmers and researchers.",
    url: "https://www.fao.org/plant-production-protection/en/"
  },
  usdaPpd: {
    title: "USDA APHIS - Plant Pests and Diseases",
    note: "United States Department of Agriculture plant health and quarantine information.",
    url: "https://www.aphis.usda.gov/plant-pests-diseases"
  },
  usdaCitrus: {
    title: "USDA APHIS - Citrus Diseases",
    note: "Disease identification, treatment, and prevention guidance for citrus.",
    url: "https://www.aphis.usda.gov/plant-pests-diseases/citrus-diseases"
  },
  usdaCanker: {
    title: "USDA APHIS - Citrus Canker",
    note: "Symptoms, treatment, and prevention of citrus canker.",
    url: "https://www.aphis.usda.gov/plant-pests-diseases/citrus-diseases/citrus-canker"
  },
  usdaBlSpot: {
    title: "USDA APHIS - Citrus Black Spot",
    note: "Symptoms and management of citrus black spot.",
    url: "https://www.aphis.usda.gov/plant-pests-diseases/citrus-diseases/citrus-black-spot"
  },
  usdaHlb: {
    title: "USDA APHIS - Citrus Greening and Asian Citrus Psyllid",
    note: "Identification and management of Huanglongbing (HLB) and its insect vector.",
    url: "https://www.aphis.usda.gov/plant-pests-diseases/citrus-diseases/citrus-greening-and-asian-citrus-psyllid"
  }
};

const CONTENT = {
  "citrus-canker": {
    displayTitle: "Citrus Canker",
    keyPoints: [
      "Raised, corky lesions surrounded by a yellow halo appear on leaves, stems, and fruit.",
      "The bacteria spread through wind-driven rain and contaminated tools, clothing, and plant material.",
      "Infected fruit becomes unmarketable and may drop early; the disease is not cured once established.",
      "Warm, wet, and windy weather accelerates spread. Citrus Canker may be a notifiable disease in some regions."
    ],
    monitoring: [
      "Inspect trees at least weekly while symptoms are active, especially new growth flushes.",
      "Check both sides of leaves and young fruit for new raised lesions with yellow halos.",
      "Record which trees are affected and how the spots spread across the orchard.",
      "Re-check trees after rain, wind, or pruning work - these are the main spread events.",
      "Inspect nearby trees and neighbouring groves for early lesions.",
      "Signs it is worsening: lesions appearing on stems and fruit, more trees affected, fruit dropping early."
    ],
    expertHelp: [
      "Symptoms are spreading rapidly or appearing on multiple trees.",
      "Lesions are seen on fruit or stems, not just leaves.",
      "You suspect canker and your local agricultural department requires reporting.",
      "Before removing any tree - severe trees may need removal, but only after expert guidance.",
      "Current management is not slowing the spread."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Immediate containment", description: "Stop moving plant material, disinfect tools, and confirm the diagnosis with your local agricultural department." },
      { period: "2-6 weeks", title: "Monitor for new symptoms", description: "Inspect weekly, especially new growth flushes and after rain or wind; record affected trees." },
      { period: "6-12 weeks", title: "Reassess with an expert", description: "Review spread with an extension officer and follow approved management steps before the next wet season." },
      { period: "3-6 months", title: "Long-term orchard management", description: "Maintain orchard hygiene, windbreaks, and a written monitoring plan for the coming seasons." }
    ],
    resources: ["usdaCanker", "ccri", "usdaPpd"]
  },
  "citrus-greening": {
    displayTitle: "Citrus Greening (Huanglongbing)",
    keyPoints: [
      "A bacterial disease spread tree to tree by the Asian citrus psyllid insect.",
      "Symptoms include blotchy, uneven yellowing of leaves, stunted shoots, and small, lopsided, bitter fruit.",
      "There is currently no cure - infected trees decline and stop producing usable fruit.",
      "Managing the psyllid vector and stopping its movement is the main line of defence."
    ],
    monitoring: [
      "Inspect weekly for blotchy yellow mottling, vein yellowing, and small misshapen fruit.",
      "Watch for psyllid insects - adults are small and jump when disturbed; look for waxy secretions from nymphs.",
      "Keep a written record of every symptomatic tree and track spread across the grove.",
      "Check new planting material and nursery stock carefully before it is introduced.",
      "Signs it is worsening: fruit tastes bitter, twig dieback appears, and more trees become symptomatic."
    ],
    expertHelp: [
      "You suspect greening at all - it may be notifiable; report to your local agricultural department immediately.",
      "Blotchy yellowing or lopsided, bitter fruit appears on one or more trees.",
      "Before removing any tree - confirm the diagnosis with a plant pathologist first.",
      "You plan new plantings near a suspected outbreak area."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Confirm the diagnosis", description: "Report the suspect tree and have it inspected and laboratory-confirmed before acting." },
      { period: "2-6 weeks", title: "Contain and protect", description: "Stop moving plant material and manage the psyllid vector only as advised by an extension officer." },
      { period: "6-12 weeks", title: "Reassess tree health", description: "Track symptom spread, remove confirmed trees only with expert approval, and protect remaining trees." },
      { period: "3-6 months", title: "Long-term plan", description: "Update the grove plan with authorities and follow approved regional management programs." }
    ],
    resources: ["usdaHlb", "ccri", "usdaPpd"]
  },
  "citrus-black-spot": {
    displayTitle: "Citrus Black Spot",
    keyPoints: [
      "A fungal disease that causes dark, sunken spots (lesions) on the fruit skin.",
      "Spots range from small raised dots to larger depressed lesions; fruit pulp usually stays edible.",
      "Heavily spotted fruit is often unmarketable and severe infections can cause early fruit drop.",
      "The fungus spreads through leaf litter and rain splash during warm, wet periods."
    ],
    monitoring: [
      "Inspect fruit and young leaves regularly during and after wet or humid weather.",
      "Look for dark spots on the fruit surface and raised lesions on leaves, especially at colour break.",
      "Keep records of affected trees and track where spots first appear each season.",
      "Inspect neighbouring trees after periods of heavy rain.",
      "Signs it is worsening: fruit drop increases and spotting spreads to healthy fruit."
    ],
    expertHelp: [
      "Fruit drop or spotting is increasing rapidly across the grove.",
      "Heavy spotting is visible on much of the young fruit at colour break.",
      "You need approved treatment options for your region - treatments vary by location.",
      "Lesions also appear on leaves of many trees, indicating widespread disease pressure."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Remove spores", description: "Remove and destroy infected fruit and fallen debris; avoid overhead irrigation." },
      { period: "2-6 weeks", title: "Monitor after rain", description: "Inspect fruit and foliage weekly during wet weather and keep records." },
      { period: "6-12 weeks", title: "Seasonal review", description: "Discuss an approved seasonal management plan with an extension officer." },
      { period: "3-6 months", title: "Pre-season plan", description: "Prepare the pre-wet-season plan, prune for airflow, and maintain orchard hygiene." }
    ],
    resources: ["usdaBlSpot", "ccri", "usdaPpd"]
  },
  "citrus-melanose": {
    displayTitle: "Citrus Melanose",
    keyPoints: [
      "A fungal disease that lives on the dead and dying wood of the citrus tree.",
      "Produces small, raised, dark-brown or rust-coloured specks on fruit, leaves, and young stems.",
      "Specks can feel rough and sandpaper-like; on fruit they form tear-stain patterns after rain.",
      "Melanose lowers fruit market value but does not damage the inside of the fruit."
    ],
    monitoring: [
      "Inspect trees for dead wood and new specks after storms or heavy rains.",
      "Check young growth flushes, which are most susceptible to infection.",
      "Record which trees repeatedly show symptoms - they may need more aggressive dead-wood management.",
      "Signs it is worsening: specks spreading to young fruit and new flush."
    ],
    expertHelp: [
      "Dead wood is widespread and specks keep appearing even after pruning.",
      "You need a seasonal pruning and management schedule for your region.",
      "Heavy fruit blemish is reducing marketable yield."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Remove the source", description: "Prune out and destroy dead and dying wood - the fungus source." },
      { period: "2-6 weeks", title: "Monitor new growth", description: "Check new flush and young fruit for specks; avoid overhead irrigation." },
      { period: "6-12 weeks", title: "Seasonal review", description: "Review pruning records with an extension officer before the wet season." },
      { period: "3-6 months", title: "Prevent dead-wood regrowth", description: "Keep a regular pruning schedule and an open, well-ventilated canopy." }
    ],
    resources: ["ccri", "usdaCitrus", "tnau"]
  },
  "citrus-healthy": {
    displayTitle: "Healthy Citrus - No Disease Detected",
    keyPoints: [
      "No disease was detected on the uploaded leaf and the tree appears healthy.",
      "Routine care - watering, feeding, and canopy management - is the best disease prevention.",
      "Watch for early warning signs: unusual spots, yellowing, or leaf distortion."
    ],
    monitoring: [
      "Inspect leaves, fruit, and stems at least monthly and after heavy rain or extreme weather.",
      "Watch for early warning signs such as spots, yellowing, or distorted leaves.",
      "Keep simple records so changes over time are easier to spot."
    ],
    expertHelp: [
      "Unusual symptoms appear that you cannot identify.",
      "Several trees decline at the same time.",
      "You need seasonal guidance for disease outbreaks in your region."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Routine care", description: "Continue normal watering, feeding, and canopy maintenance." },
      { period: "2-6 weeks", title: "Monitor", description: "Check trees weekly and note any new spots or yellowing." },
      { period: "6-12 weeks", title: "Seasonal check", description: "Consult an extension officer for seasonal guidance." },
      { period: "3-6 months", title: "Preventive routine", description: "Keep orchard hygiene and pruning practices consistent through the year." }
    ],
    resources: ["ccri", "usdaCitrus", "fao"]
  },
  "guava-phytopthora": {
    displayTitle: "Guava Phytophthora",
    keyPoints: [
      "A water-mould organism that thrives in poorly drained, waterlogged soil.",
      "Attacks the root system and the base of the trunk, causing dark, water-soaked lesions that girdle the tree.",
      "Affected trees wilt, turn yellow, and die back even when the soil appears moist.",
      "Can also cause fruit rot and spreads through infected soil, irrigation water, and runoff."
    ],
    monitoring: [
      "Inspect the trunk base and root zone after heavy rainfall or flooding.",
      "Watch for sudden wilting or yellowing in well-watered trees - an early warning.",
      "Check the low-lying parts of the grove where water collects.",
      "Signs it is worsening: canopy dieback, trunk lesions girdling the base, and tree decline."
    ],
    expertHelp: [
      "Tree decline continues despite improved drainage.",
      "Dark lesions are girdling the trunk base.",
      "You plan to replant in an area where Phytophthora has been confirmed.",
      "Several neighbouring trees wilt at the same time."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Improve drainage", description: "Remove standing water and stop over-watering at the root zone." },
      { period: "2-6 weeks", title: "Check and protect", description: "Inspect the trunk base weekly and avoid moving soil or water from affected areas." },
      { period: "6-12 weeks", title: "Reassess severely affected trees", description: "Consult an expert; severely affected trees may not recover." },
      { period: "3-6 months", title: "Long-term drainage plan", description: "Install drainage infrastructure and consider raised planting mounds." }
    ],
    resources: ["cish", "tnau", "icar"]
  },
  "guava-red-rust": {
    displayTitle: "Guava Red Rust (Algal Leaf Spot)",
    keyPoints: [
      "A parasitic green alga that causes raised, velvety, orange-red rust patches on leaf surfaces.",
      "Spreads in warm, humid conditions and is often found on stressed or overcrowded trees.",
      "Rarely kills a tree by itself but weakens it and reduces photosynthesis."
    ],
    monitoring: [
      "Inspect upper leaf surfaces for rust-coloured patches during warm, wet seasons.",
      "Check overall tree vigour - repeated infestations may point to nutrition or drainage problems.",
      "Signs it is worsening: patches spreading to stems and young shoots."
    ],
    expertHelp: [
      "The infestation persists despite pruning and canopy improvements.",
      "You need guidance on approved algal management options.",
      "The tree looks generally unwell - combine advice with a nutrition check."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Reduce moisture", description: "Remove heavily infected leaves and keep foliage dry." },
      { period: "2-6 weeks", title: "Prune and monitor", description: "Open the canopy and inspect weekly for new patches." },
      { period: "6-12 weeks", title: "Improve tree health", description: "Review nutrition and drainage with an expert and treat underlying stress." },
      { period: "3-6 months", title: "Maintain an open canopy", description: "Keep up regular pruning and moisture control before wet seasons." }
    ],
    resources: ["cish", "tnau", "icar"]
  },
  "guava-scab": {
    displayTitle: "Guava Scab",
    keyPoints: [
      "A fungal disease causing raised, rough, corky, or warty lesions on fruit, young leaves, and shoots.",
      "Lesions look cracked or crusty and turn brown or grey; scab rarely affects the inner fruit flesh.",
      "Most active in warm, humid, rainy periods and spread by wind and water splash.",
      "Can make young fruit drop prematurely and leave fruit unmarketable."
    ],
    monitoring: [
      "Inspect young fruit and new flushes during and after rainy periods.",
      "Look for early scab on leaves and shoots before it reaches the fruit.",
      "Signs it is worsening: lesions on young fruit and premature fruit drop."
    ],
    expertHelp: [
      "Young fruit is dropping prematurely.",
      "Scab persists across the grove despite sanitation.",
      "You need approved treatment guidance before the rainy season."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Remove sources", description: "Remove infected fruit and young shoots and dispose of them away from the grove." },
      { period: "2-6 weeks", title: "Monitor", description: "Check fruit and flush weekly during wet weather and keep foliage dry." },
      { period: "6-12 weeks", title: "Seasonal review", description: "Plan approved management with an extension officer before the rainy season." },
      { period: "3-6 months", title: "Long-term care", description: "Maintain airflow, hygiene, and a regular monitoring schedule." }
    ],
    resources: ["cish", "tnau", "icar"]
  },
  "guava-styler-and-root": {
    displayTitle: "Guava Stylar End and Root Disease",
    keyPoints: [
      "Covers disease conditions of the fruit stylar (blossom) end and of the root system.",
      "Stylar conditions: brown, sunken, or rotting areas at the fruit tip, often fungal and entering through the flower scar.",
      "Root conditions: root rot and decline causing reduced uptake, wilting, yellowing, and tree decline.",
      "Both are worsened by poor drainage, wounds, and high humidity."
    ],
    monitoring: [
      "Inspect the stylar end of developing fruit regularly - early lesions are easier to manage.",
      "Monitor the root zone and trunk base, especially after heavy rain or flooding.",
      "Track whether stylar rot is concentrated on specific trees or grove areas.",
      "Signs it is worsening: slow growth, yellowing leaves, wilting despite watering, and spreading fruit rot."
    ],
    expertHelp: [
      "Significant root decline is suspected.",
      "Widespread stylar-end fruit rot is observed.",
      "Soil or drainage issues need expert evaluation for long-term fixes."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Sanitize", description: "Remove affected fruit, check the trunk base, and improve drainage." },
      { period: "2-6 weeks", title: "Monitor roots and fruit", description: "Inspect stylar ends and the root zone weekly; avoid wounding roots." },
      { period: "6-12 weeks", title: "Reassess", description: "Consult an expert on soil conditions and planting layout." },
      { period: "3-6 months", title: "Sustainable practices", description: "Improve drainage, increase spacing, and avoid mechanical root damage long term." }
    ],
    resources: ["cish", "tnau", "icar"]
  },
  "guava-disease-free": {
    displayTitle: "Healthy Guava - No Disease Detected",
    keyPoints: [
      "No disease was detected on the uploaded leaf and the tree appears healthy.",
      "Routine care - watering, feeding, and canopy management - is the best disease prevention.",
      "Watch for early warning signs: unusual spots, yellowing, or leaf distortion."
    ],
    monitoring: [
      "Inspect leaves, fruit, and stems at least monthly and after heavy rain or extreme weather.",
      "Watch for early warning signs such as spots, yellowing, or distorted leaves.",
      "Keep simple records so changes over time are easier to spot."
    ],
    expertHelp: [
      "Unusual symptoms appear that you cannot identify.",
      "Several trees decline at the same time.",
      "You need seasonal guidance for disease outbreaks in your region."
    ],
    timeline: [
      { period: "0-2 weeks", title: "Routine care", description: "Continue normal watering, feeding, and canopy maintenance." },
      { period: "2-6 weeks", title: "Monitor", description: "Check trees weekly and note any new spots or yellowing." },
      { period: "6-12 weeks", title: "Seasonal check", description: "Consult an extension officer for seasonal guidance." },
      { period: "3-6 months", title: "Preventive routine", description: "Keep orchard hygiene and pruning practices consistent through the year." }
    ],
    resources: ["cish", "fao", "icar"]
  }
};

const FALLBACK = {
  displayTitle: "Detected Condition",
  keyPoints: [
    "The diagnosis from the model is based only on this uploaded leaf image and should be confirmed in the field.",
    "Notes below come from the verified advisory knowledge base used by KrishiVision.",
    "A local agricultural expert is the best source for region-specific management steps."
  ],
  monitoring: [
    "Inspect affected plants regularly, especially after rain, wind, or extreme weather.",
    "Note which plants are affected and how symptoms spread over time.",
    "Review your watering, drainage, and hygiene practices for anything that may worsen conditions."
  ],
  expertHelp: [
    "Symptoms spread quickly or affect many plants.",
    "You cannot identify the cause with confidence.",
    "You need region-specific approved management guidance."
  ],
  timeline: [
    { period: "0-2 weeks", title: "Confirm the diagnosis", description: "Verify the model result with a local agricultural expert." },
    { period: "2-6 weeks", title: "Monitor", description: "Inspect weekly and record how symptoms change." },
    { period: "6-12 weeks", title: "Reassess", description: "Review the situation with an expert for next-season planning." },
    { period: "3-6 months", title: "Long-term plan", description: "Adopt hygiene, drainage, and monitoring practices tailored to the crop." }
  ],
  resources: ["icar", "fao", "usdaPpd"]
};

function contentKey(crop, disease) {
  return `${String(crop || "").toLowerCase().trim()}-${String(disease || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")}`;
}

export function getDiseaseContent(crop, disease) {
  return CONTENT[contentKey(crop, disease)] || FALLBACK;
}

export const TIMELINE_NOTES = {
  diseased: "Recovery time cannot be reliably predicted from a single leaf image. Continue monitoring and follow the recommended management steps. Actual response depends on disease severity, weather, crop condition and management practices.",
  healthy: "This schedule reflects routine maintenance because no disease was detected on the uploaded leaf. Continue regular care and keep monitoring."
};

export { RESOURCES };