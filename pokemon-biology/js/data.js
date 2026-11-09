/* ============================================================
   POKÉ-PROFESSOR — GCSE Biology Adventure (multi-topic)
   AQA GCSE Biology content. Pokémon wrapper = memory hook.

   QUESTION TYPES used by the quiz engine:
     mc         single correct option       {answer: idx}
     multi      several correct options      {answers: [idx,...]}
     match      match left items to right    {pairs: [[L,R],...]}
     order      drag items into order        {items: [...correct order...]}
     categorise drag items into buckets      {buckets:[...], items:[[txt,bucketIdx],...]}
     label      drag labels onto a diagram   {svg, zones:[{x,y,answer}]}
   ============================================================ */

/* ---- shared "starter" Pokémon ---- */
const STARTERS = [
  { id: "bulba",  name: "Budbasaur", emoji: "🌱", blurb: "A seed-type rookie who soaks up the sun." },
  { id: "oddish", name: "Rootish",   emoji: "🪴", blurb: "Keeps its roots in the soil. Steady and tough." },
  { id: "char",   name: "Pyroheart", emoji: "🔥", blurb: "A fiery heart with blazing circulation." },
  { id: "squirt", name: "Bubblung",  emoji: "💧", blurb: "Breathes easy — a master of gas exchange." }
];

/* ============================================================
   DIAGRAM HELPERS (SVG strings, viewBox 0 0 100 100)
   Kept schematic and clear, original artwork (no copyright).
   ============================================================ */

const SVG_ALVEOLUS = `
<svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
  <circle cx="26" cy="35" r="20" fill="#ffe3e3" stroke="#e3350d" stroke-width="1.5"/>
  <circle cx="26" cy="35" r="20" fill="none" stroke="#ff9a9a" stroke-width="0.6" stroke-dasharray="2 2"/>
  <path d="M46 20 q18 -6 34 5 q6 12 -4 24 q-16 8 -30 -2" fill="none" stroke="#c0392b" stroke-width="3"/>
  <path d="M46 24 q16 -4 30 5 q5 10 -4 20 q-14 7 -26 -2" fill="none" stroke="#3b5ba5" stroke-width="3"/>
  <path d="M40 30 L50 30" stroke="#2e7d32" stroke-width="1.5" marker-end="url(#ar)"/>
  <path d="M50 44 L40 44" stroke="#8a6d00" stroke-width="1.5" marker-end="url(#ar)"/>
  <defs><marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
    <path d="M0 0 L6 3 L0 6 z" fill="#333"/></marker></defs>
  <text x="26" y="36" font-size="5" text-anchor="middle" fill="#7a1a0a">air</text>
</svg>`;

const SVG_HEART = `
<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
  <rect x="14" y="16" width="34" height="33" rx="6" fill="#ffd9d9" stroke="#c0392b" stroke-width="1.5"/>
  <rect x="52" y="16" width="34" height="33" rx="6" fill="#dbe4ff" stroke="#3b5ba5" stroke-width="1.5"/>
  <rect x="14" y="53" width="34" height="34" rx="6" fill="#ffc2c2" stroke="#c0392b" stroke-width="1.5"/>
  <rect x="52" y="53" width="34" height="34" rx="6" fill="#c2d2ff" stroke="#3b5ba5" stroke-width="4"/>
  <line x1="50" y1="14" x2="50" y2="89" stroke="#555" stroke-width="1" stroke-dasharray="3 2"/>
  <rect x="26" y="4" width="6" height="12" fill="#3b5ba5"/>
  <rect x="40" y="4" width="6" height="12" fill="#c0392b"/>
  <rect x="56" y="4" width="6" height="12" fill="#c0392b"/>
  <rect x="70" y="4" width="6" height="12" fill="#3b5ba5"/>
  <text x="31" y="90" font-size="4.5" text-anchor="middle" fill="#555">(viewer's left = patient's RIGHT)</text>
</svg>`;

const SVG_VESSELS = `
<svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
  <circle cx="20" cy="30" r="17" fill="#e3350d" stroke="#7a1a0a" stroke-width="1"/>
  <circle cx="20" cy="30" r="5" fill="#fff"/>
  <circle cx="52" cy="30" r="15" fill="#5a78c0" stroke="#2a4178" stroke-width="1"/>
  <circle cx="52" cy="30" r="9" fill="#fff"/>
  <circle cx="80" cy="30" r="6" fill="#ff9a9a" stroke="#c0392b" stroke-width="0.8"/>
  <circle cx="80" cy="30" r="3.5" fill="#fff"/>
</svg>`;

const SVG_SHOOT = `
<svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet">
  <rect x="20" y="62" width="60" height="10" fill="#8a5a2b" rx="2"/>
  <path d="M50 62 Q50 40 62 26" fill="none" stroke="#2e7d32" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="64" cy="24" rx="7" ry="4" fill="#4caf50"/>
  <g fill="#ffcb05">
    <path d="M6 14 l8 2 l-8 2 z"/><path d="M6 24 l8 2 l-8 2 z"/><path d="M6 34 l8 2 l-8 2 z"/>
  </g>
  <text x="9" y="9" font-size="5" fill="#8a6d00">☀</text>
  <circle cx="44" cy="40" r="2.2" fill="#e3350d"/><circle cx="45" cy="47" r="2.2" fill="#e3350d"/>
  <circle cx="47" cy="54" r="2.2" fill="#e3350d"/>
</svg>`;

/* ============================================================
   TOPICS
   ============================================================ */

const TOPICS = [

/* ============================================================
   TOPIC A — PLANT HORMONES  (Hormone Highlands)
   ============================================================ */
{
  id: "plants",
  name: "Hormone Highlands",
  subject: "AQA GCSE Biology · Plant Hormones",
  emoji: "🌿",
  blurb: "Grass-type country: tropisms, auxin, and how farmers use plant hormones.",
  gyms: [
    {
      id: "tropisms",
      name: "Tropism Town Gym",
      leader: "Leader Sunny",
      badge: "☀️ Sunlight Badge",
      type: "Grass",
      tier: "Foundation + Higher",
      tagline: "Which way do I grow?",
      intro: "Every Grass-type knows the rule: grow toward what you need. Shoots chase the sun, roots dive for the ground.",
      lessons: [
        {
          title: "What is a tropism?",
          poke: "A tropism is like a Pokémon's instinct to move toward food — but plants can't walk, so they GROW in a direction instead.",
          facts: [
            "Plants make <b>plant hormones</b> (mainly <b>auxins</b>) to coordinate and control growth.",
            "A <b>tropism</b> = a growth response to a stimulus.",
            "<b>Phototropism</b> = growth in response to <b>light</b>.",
            "<b>Gravitropism</b> (a.k.a. <b>geotropism</b>) = growth in response to <b>gravity</b>."
          ],
          terms: [
            ["Phototropism", "Growth in response to light."],
            ["Gravitropism / Geotropism", "Growth in response to gravity."],
            ["Positive response", "Growing TOWARDS the stimulus."],
            ["Negative response", "Growing AWAY from the stimulus."]
          ]
        },
        {
          title: "Shoots vs Roots",
          poke: "Shoots are 'solar-panel' Pokémon chasing sunlight. Roots are 'anchor' Pokémon chasing water and grip.",
          facts: [
            "<b>Shoots</b> grow up, toward light & away from gravity → more light → more photosynthesis → more glucose.",
            "Shoots = <b>positively phototropic</b> + <b>negatively gravitropic</b>.",
            "<b>Roots</b> grow down, away from light & toward gravity → anchor the plant, absorb water & minerals.",
            "Roots = <b>negatively phototropic</b> + <b>positively gravitropic</b>."
          ],
          terms: [
            ["Shoot response", "Positive phototropism + negative gravitropism."],
            ["Root response", "Negative phototropism + positive gravitropism."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"Phototropism is a growth response to which stimulus?",
          options:["Gravity","Light","Water","Temperature"], answer:1,
          explain:"Photo = light. Phototropism is growth in response to light." },
        { type:"mc", q:"Gravitropism is also known as…",
          options:["Phototropism","Hydrotropism","Geotropism","Thermotropism"], answer:2,
          explain:"Gravitropism and geotropism both mean growth in response to gravity." },
        { type:"categorise", q:"Sort each response into the correct part of the plant.",
          buckets:["Shoot","Root"],
          items:[["Grows towards light",0],["Grows away from light",1],
                 ["Grows away from gravity",0],["Grows towards gravity",1],
                 ["Positive phototropism",0],["Positive gravitropism",1]],
          explain:"Shoots: toward light, away from gravity. Roots: away from light, toward gravity." },
        { type:"mc", q:"Why is it an advantage for shoots to grow towards light?",
          options:["To anchor the plant","To absorb water","So leaves absorb more light for more photosynthesis","To avoid being eaten"], answer:2,
          explain:"More light → more photosynthesis → more glucose." },
        { type:"match", q:"Match each term to its meaning.",
          pairs:[["Phototropism","Growth response to light"],
                 ["Gravitropism","Growth response to gravity"],
                 ["Positive response","Grows towards the stimulus"],
                 ["Negative response","Grows away from the stimulus"]],
          explain:"Know these four definitions cold — they unlock every tropism question." }
      ]
    },
    {
      id: "auxin",
      name: "Auxin Arena Gym",
      leader: "Leader Elonga",
      badge: "📈 Growth Badge",
      type: "Energy",
      tier: "Foundation + Higher",
      tagline: "The hormone behind the bend.",
      intro: "Auxin is the signature move of every Grass-type: it POWERS UP cells in shoots but POWERS DOWN cells in roots.",
      lessons: [
        {
          title: "Where auxin is made & what it does",
          poke: "Auxin is an energy move charged at the TIP, then sent to the cells just behind the tip.",
          facts: [
            "Auxins are made in the <b>tips</b> of shoots and roots, then <b>diffuse</b> back to the cells behind the tip.",
            "Only the <b>region behind the tip</b> grows (cell division + <b>cell elongation</b>).",
            "In <b>shoots</b>, auxin <b>promotes</b> cell elongation (more auxin = more growth).",
            "In <b>roots</b>, auxin <b>inhibits</b> cell elongation (more auxin = less growth)."
          ],
          terms: [
            ["Cell elongation", "Cells getting longer — how the region behind the tip grows."],
            ["Promote (shoots)", "Auxin speeds up shoot-cell elongation."],
            ["Inhibit (roots)", "Auxin slows down root-cell elongation."]
          ]
        },
        {
          title: "Phototropism — bending to light",
          poke: "A Sunflora by a window: light hits one side, so auxin dodges to the shady side and levels those cells up.",
          facts: [
            "Even light all around → auxin even → shoot grows straight.",
            "Light from one side → auxin builds up on the <b>shaded side</b>.",
            "Shaded cells get more auxin → <b>elongate faster</b> → shoot <b>bends towards the light</b>."
          ],
          terms: [
            ["Unequal distribution", "Auxin collects on one side → uneven growth → bending."]
          ]
        },
        {
          title: "Gravitropism — the side-on plant",
          poke: "Lay a seedling on its side: gravity pulls auxin to the LOWER side. Shoots power up there; roots power down.",
          facts: [
            "On its side, auxin gathers on the <b>lower side</b>; the top side has less.",
            "In <b>shoots</b>: lower side grows faster → shoot bends <b>upwards</b>.",
            "In <b>roots</b>: lower side grows slower (auxin inhibits) → root bends <b>downwards</b>."
          ],
          terms: [
            ["Lower side (shoot)", "More auxin → faster growth → curves up."],
            ["Lower side (root)", "More auxin → slower growth → curves down."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"Where is auxin made?",
          options:["In the leaves","In the tips of shoots and roots","In the flowers","In the oldest cells"], answer:1,
          explain:"Auxin is produced in the tips, then diffuses to cells just behind the tip." },
        { type:"mc", q:"What does auxin do to cells in the SHOOTS?",
          options:["Inhibits elongation","Promotes cell elongation","Nothing","Kills them"], answer:1,
          explain:"In shoots auxin promotes cell elongation — more auxin = more growth." },
        { type:"mc", q:"True or False: auxin inhibits growth of cells in roots.",
          options:["True","False"], answer:0,
          explain:"True. In roots, auxin inhibits elongation, so more auxin = less growth." },
        { type:"label", q:"Drag the labels onto this shoot bending in one-sided light.",
          svg: SVG_SHOOT,
          zones:[ {x:12,y:30,answer:"Light direction"},
                  {x:40,y:60,answer:"Auxin (shaded side)"},
                  {x:70,y:22,answer:"Shoot bends to light"} ],
          explain:"Light comes from one side; auxin builds on the shaded side; those cells grow faster so the shoot bends toward the light." },
        { type:"mc", q:"A seedling lies on its side in the dark. In the ROOT the lower side has more auxin, so it…",
          options:["Grows faster, bending root up","Grows slower, bending root down","Dies","Is unaffected"], answer:1,
          explain:"Auxin inhibits root growth, so the auxin-rich lower side grows slower and the root curves downward." }
      ]
    },
    {
      id: "hormones",
      name: "Hormone Hideout Gym",
      leader: "Leader Gibb",
      badge: "🧪 Hormone Badge",
      type: "Higher Tier",
      tier: "Higher Tier only",
      tagline: "Auxin isn't the only one.",
      intro: "Higher-Tier trainers only! Two more hormone 'moves': Gibberellins and Ethene.",
      lessons: [
        {
          title: "Gibberellins",
          poke: "The 'wake-up & bloom' move — kicks a sleeping seed awake and helps the plant flower and fruit.",
          facts: [
            "Gibberellins <b>initiate seed germination</b>.",
            "They help <b>induce flowering</b>.",
            "They help the <b>growth of fruit</b>."
          ],
          terms: [["Germination", "A seed starting to grow — gibberellins trigger it."]]
        },
        {
          title: "Ethene",
          poke: "A GAS move — drifts through the air and tells fruit it's time to ripen.",
          facts: [
            "Ethene is a <b>gas</b> released by plants.",
            "It controls <b>cell division</b> and the <b>ripening of fruit</b>."
          ],
          terms: [["Ethene", "A gas hormone controlling cell division & fruit ripening."]]
        }
      ],
      quiz: [
        { type:"mc", q:"Which hormone initiates seed germination? (Higher)",
          options:["Auxin","Ethene","Gibberellins","Insulin"], answer:2,
          explain:"Gibberellins initiate seed germination." },
        { type:"mc", q:"Ethene is best described as…",
          options:["A liquid fertiliser","A gas that ripens fruit","A type of auxin","A root hormone"], answer:1,
          explain:"Ethene is a gas controlling cell division & fruit ripening." },
        { type:"mc", q:"True or False: ethene prevents fruit ripening. (Higher)",
          options:["True","False"], answer:1,
          explain:"False — ethene CAUSES ripening. Ripening is slowed by inhibiting ethene." },
        { type:"match", q:"Match each plant hormone to a key job.",
          pairs:[["Auxin","Controls tropisms (bending)"],
                 ["Gibberellins","Initiate seed germination"],
                 ["Ethene","Ripens fruit"]],
          explain:"Auxin = tropisms; gibberellins = germination/flowering/fruit growth; ethene = ripening." }
      ]
    },
    {
      id: "practical",
      name: "Practical Plateau Gym",
      leader: "Leader Clino",
      badge: "🔬 Method Badge",
      type: "Skills",
      tier: "Foundation + Higher",
      tagline: "Prove it with an experiment.",
      intro: "The Required Practical: how light and gravity affect newly germinated seedlings — using a clinostat.",
      lessons: [
        {
          title: "The clinostat",
          poke: "A slow spinning platform: it rotates the seedling so gravity pulls equally on all sides — cancelling gravity's one-sided effect.",
          facts: [
            "<b>Aim:</b> investigate the effect of light or gravity on newly germinated seedlings.",
            "A <b>clinostat</b> rotates slowly so gravity acts <b>equally on all sides</b> (cancels its one-sided effect)."
          ],
          terms: [["Clinostat", "Rotates a seedling so gravity acts equally on all sides."]]
        },
        {
          title: "The two investigations",
          poke: "Dark box = only gravity on the battlefield. Side-light box = only light on the battlefield.",
          facts: [
            "<b>Gravity:</b> one dish on its side, one on a clinostat, both in a <b>light-proof box</b>; observe growth after ~2 days.",
            "On the clinostat, roots & shoots grow straight out (no gravitropic response).",
            "<b>Light:</b> damp cotton wool, equal germinated seeds; compare one-sided light vs darkness; measure height at start and after ~2 days; calculate <b>mean height increase</b>.",
            "Measure curved seedlings with string + a ruler."
          ],
          terms: [
            ["Independent variable", "Direction of light (or gravity) — what you change."],
            ["Dependent variable", "Length/direction of growth of roots & shoots — what you measure."],
            ["Control variables", "Temperature, water, species, age/size of seedlings, direction of gravity."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"What does a clinostat do?",
          options:["Adds light","Rotates slowly so gravity acts equally on all sides","Heats the seedlings","Measures height"], answer:1,
          explain:"It cancels gravity's one-sided effect by rotating the seedling." },
        { type:"mc", q:"Why keep seedlings in a light-proof box when testing gravity?",
          options:["To keep them warm","So light can't affect growth direction","To speed germination","To stop evaporation"], answer:1,
          explain:"Darkness removes light as a variable so only gravity affects direction." },
        { type:"multi", q:"Select ALL the control variables for the light investigation.",
          options:["Temperature","Direction of light","Water availability","Species of plant","Age/size of seedlings","Length of new growth"],
          answers:[0,2,3,4],
          explain:"Control: temperature, water, species, age/size (and direction of gravity). Direction of light = independent; length of growth = dependent." },
        { type:"mc", q:"How do you measure the height of a CURVED seedling?",
          options:["Guess it","A straight ruler","String along the curve, then measure the string","Weigh it"], answer:2,
          explain:"Lay string along the curve, then measure the string with a ruler." }
      ]
    },
    {
      id: "uses",
      name: "Industry Island Gym",
      leader: "Leader Harvest",
      badge: "🏆 Industry Badge",
      type: "Higher Tier",
      tier: "Higher Tier only",
      tagline: "Hormones at work in the real world.",
      intro: "Final plant gym, Higher-Tier only! Farmers use hormones as real tools.",
      lessons: [
        {
          title: "Auxins & Ethene at work",
          poke: "Auxin as a weed killer is super-effective vs broad-leaved weeds; ethene is the ripening gas you can turn up or down.",
          facts: [
            "<b>Auxins — selective weed killers:</b> kill broad-leaved weeds but spare narrow-leaved crops (grasses/cereals).",
            "<b>Auxins — rooting powder:</b> dip cuttings to grow roots fast → cheap clones. Also used in <b>tissue culture</b>.",
            "<b>Ethene:</b> controls fruit ripening in storage/transport — inhibit it to delay ripening, add it to encourage ripening.",
            "Everyday weed-killer use can reduce <b>biodiversity</b>."
          ],
          terms: [
            ["Selective weed killer", "Kills broad-leaved weeds, not narrow-leaved crops."],
            ["Rooting powder / tissue culture", "Auxins that make cuttings/cells grow into clones."]
          ]
        },
        {
          title: "Gibberellins at work",
          poke: "The 'grow on demand' move: wake seeds, force flowers, bulk up fruit.",
          facts: [
            "<b>End seed dormancy</b> → promote germination.",
            "<b>Promote flowering</b> regardless of weather.",
            "<b>Increase fruit size.</b>"
          ],
          terms: [["Gibberellins (uses)", "End dormancy, promote flowering, increase fruit size."]]
        }
      ],
      quiz: [
        { type:"mc", q:"Auxin weed killers kill which plants?",
          options:["Narrow-leaved crops","Broad-leaved weeds (sparing crops)","All plants","Only trees"], answer:1,
          explain:"They damage broad-leaved weeds while narrow-leaved crops grow normally." },
        { type:"mc", q:"To keep fruit firm during long transport you should…",
          options:["Add lots of ethene","Inhibit/remove ethene to delay ripening","Add gibberellins","Add auxin"], answer:1,
          explain:"Inhibiting ethene delays ripening, so fruit stays firm." },
        { type:"categorise", q:"Sort each commercial use under the hormone responsible.",
          buckets:["Auxin","Ethene","Gibberellins"],
          items:[["Selective weed killer",0],["Rooting powder for cuttings",0],
                 ["Ripening fruit on demand",1],["Increasing fruit size",2],["Ending seed dormancy",2]],
          explain:"Auxin → weed killer + rooting powder; ethene → ripening; gibberellins → dormancy/flowering/fruit size." },
        { type:"multi", q:"Select ALL genuine commercial uses of gibberellins. (Higher)",
          options:["End seed dormancy","Promote flowering","Increase fruit size","Kill broad-leaved weeds","Ripen bananas"],
          answers:[0,1,2],
          explain:"Gibberellins: dormancy, flowering, fruit size. Weed-killing = auxin; ripening = ethene." }
      ]
    }
  ],
  flashcards: [
    { tier:"F", q:"Why do plants produce plant hormones?", a:"To coordinate and control growth responses." },
    { tier:"F", q:"Define phototropism.", a:"The directional growth of plants in response to light, letting shoots grow towards light to optimise photosynthesis." },
    { tier:"F", q:"Define geotropism (gravitropism).", a:"The directional growth response in relation to gravity; roots grow down, shoots grow up." },
    { tier:"F", q:"True/False: unequal auxin distribution causes uneven growth in shoots AND roots.", a:"True. Uneven auxin (from light in shoots, gravity in roots) causes uneven growth." },
    { tier:"F", q:"What does auxin do to cells in the shoots?", a:"It promotes (stimulates) cell elongation." },
    { tier:"F", q:"How does auxin cause phototropism?", a:"Auxin builds up on the shaded side, making those cells elongate faster, so the shoot bends toward light." },
    { tier:"F", q:"True/False: auxin inhibits growth of root cells.", a:"True. Auxin gathers on the lower side of roots, inhibiting growth so roots bend down." },
    { tier:"H", q:"What do gibberellins do in seeds? (Higher)", a:"They initiate seed germination." },
    { tier:"F", q:"In the gravity-on-seedlings practical, what is the dependent variable?", a:"The length and/or direction of growth of the new roots and shoots." },
    { tier:"F", q:"Which variables are controlled when testing light on seedlings?", a:"Direction of gravity, temperature, water availability, and type/size/age of seedlings." },
    { tier:"F", q:"Why use a clinostat?", a:"It cancels out gravity's effect so you can isolate light, or compare growth with/without gravity." },
    { tier:"H", q:"True/False: auxins can be used as weedkillers. (Higher)", a:"True — they kill broad-leaved weeds while narrow-leaved crops grow normally." },
    { tier:"H", q:"How do auxins help make new plants? (Higher)", a:"In rooting powder (cuttings grow roots) and tissue culture (promote growth)." },
    { tier:"H", q:"True/False: ethene prevents ripening. (Higher)", a:"False — ethene CAUSES ripening; slow it by inhibiting ethene." },
    { tier:"H", q:"How are gibberellins used in industry? (Higher)", a:"End dormancy (germination), promote flowering, increase fruit size." }
  ]
},

/* ============================================================
   TOPIC B — CVS & RESPIRATORY  (Circulation Caverns)
   ============================================================ */
{
  id: "cvs",
  name: "Circulation Caverns",
  subject: "AQA GCSE Biology · Cardiovascular & Respiratory System",
  emoji: "🫀",
  blurb: "Fire & Water country: the lungs, the heart, blood vessels and blood.",
  gyms: [
    {
      id: "lungs",
      name: "Alveoli Atoll Gym",
      leader: "Leader Breeze",
      badge: "🫁 Breath Badge",
      type: "Air",
      tier: "Foundation",
      tagline: "Where air meets blood.",
      intro: "Gas exchange central! Trace the air from windpipe to the tiny alveoli, and learn why they're perfect exchange surfaces.",
      lessons: [
        {
          title: "The airway — mouth to alveoli",
          poke: "Think of the airway like a branching cave system: one big tunnel splitting into thousands of tiny chambers.",
          facts: [
            "<b>Trachea (windpipe):</b> connects mouth & nose to the lungs; lined with mucus + <b>ciliated cells</b> to trap/remove pathogens.",
            "<b>Bronchi:</b> tubes branching off the trachea — one bronchus to each lung (also mucus + cilia).",
            "<b>Bronchioles:</b> smaller tubes branching off, connecting to each alveolus.",
            "<b>Alveoli</b> (singular alveolus): tiny air sacs where <b>gas exchange</b> happens by diffusion."
          ],
          terms: [
            ["Trachea", "Windpipe linking mouth/nose to the lungs."],
            ["Alveoli", "Tiny air sacs — the gas exchange surface."],
            ["Ciliated cells", "Hair-like cells that sweep mucus (and trapped pathogens) away."]
          ]
        },
        {
          title: "Adaptations for gas exchange",
          poke: "Every adaptation has ONE goal: speed up diffusion. Link each feature to that job for the marks.",
          facts: [
            "<b>Many alveoli</b> → large <b>surface area</b> for diffusion.",
            "<b>Walls one cell thick</b> → short <b>diffusion distance</b> (never say 'thin walls'!).",
            "<b>Surrounded by capillaries</b> → good blood supply keeps the <b>concentration gradient</b> steep.",
            "<b>Continuous ventilation</b> → constant fresh O₂ in, CO₂ out, maintaining the gradient.",
            "Alveoli are also moist, so gases can dissolve."
          ],
          terms: [
            ["Large surface area", "Many alveoli = more room for diffusion."],
            ["Short diffusion distance", "Walls one cell thick."],
            ["Concentration gradient", "Kept steep by good blood supply + ventilation."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"Where does gas exchange take place in the lungs?",
          options:["Trachea","Bronchi","Alveoli","Diaphragm"], answer:2,
          explain:"The alveoli (tiny air sacs) are the gas exchange surface." },
        { type:"order", q:"Put the airway in order, from where air enters to where gas exchange happens.",
          items:["Trachea","Bronchi","Bronchioles","Alveoli"],
          explain:"Trachea → bronchi → bronchioles → alveoli." },
        { type:"multi", q:"Select ALL adaptations that make alveoli good at gas exchange.",
          options:["Large surface area","Walls one cell thick","Thick muscular walls","Good blood supply (capillaries)","Continuous ventilation","No blood supply"],
          answers:[0,1,3,4],
          explain:"Large SA, one-cell-thick walls, good capillary blood supply, and ventilation all speed diffusion. Thick walls / no blood supply would slow it." },
        { type:"label", q:"Label this alveolus and its capillary.",
          svg: SVG_ALVEOLUS,
          zones:[ {x:26,y:50,answer:"Alveolus (air sac)"},
                  {x:78,y:18,answer:"Capillary"},
                  {x:55,y:28,answer:"Oxygen into blood"},
                  {x:33,y:62,answer:"Carbon dioxide into alveolus"} ],
          explain:"O₂ diffuses from the alveolus into the blood; CO₂ diffuses from the blood into the alveolus to be breathed out." },
        { type:"mc", q:"Which phrase gets the mark when describing alveolar walls?",
          options:["Thin cell walls","Walls one cell thick","Thick walls","No walls"], answer:1,
          explain:"Say 'walls one cell thick' — 'thin cell walls' is marked wrong by AQA." }
      ]
    },
    {
      id: "heart",
      name: "Double-Pump Dojo Gym",
      leader: "Leader Cardia",
      badge: "❤️ Pulse Badge",
      type: "Fire",
      tier: "Foundation + Higher",
      tagline: "Two circuits, one rhythm.",
      intro: "The heart is a double pump. Learn its four chambers, the one-way path of blood, and the pacemaker that sets the beat.",
      lessons: [
        {
          title: "Double circulation & the four chambers",
          poke: "The heart is a dual-type Pokémon running TWO circuits at once — one loop to the lungs, one to the body.",
          facts: [
            "A <b>double circulatory system</b>: blood passes through the heart <b>twice</b> per full trip around the body.",
            "<b>Right side</b> → lungs (<b>pulmonary</b> circuit) and carries <b>deoxygenated</b> blood.",
            "<b>Left side</b> → body (<b>systemic</b> circuit) and carries <b>oxygenated</b> blood.",
            "Four chambers: two upper <b>atria</b> (receive blood) and two lower <b>ventricles</b> (pump blood out).",
            "Benefit: lungs get blood at low pressure (protects capillaries); body gets a strong second push; oxy & deoxy blood never mix."
          ],
          terms: [
            ["Atria", "Upper chambers — receive blood and pass it to the ventricles."],
            ["Ventricles", "Lower chambers — pump blood out to lungs/body."],
            ["Double circulation", "Blood passes through the heart twice per body circuit."]
          ]
        },
        {
          title: "The vessels & the pathway of blood",
          poke: "Veins bring blood IN, arteries take it AWAY. Follow the one-way route through the heart like a racetrack.",
          facts: [
            "Into heart (veins): <b>vena cava</b> (from body), <b>pulmonary vein</b> (from lungs).",
            "Out of heart (arteries): <b>aorta</b> (to body), <b>pulmonary artery</b> (to lungs).",
            "Path: vena cava → <b>right atrium</b> → valve → <b>right ventricle</b> → pulmonary artery → lungs → pulmonary vein → <b>left atrium</b> → valve → <b>left ventricle</b> → aorta → body.",
            "<b>Coronary arteries</b> supply the heart muscle itself with oxygenated blood."
          ],
          terms: [
            ["Vena cava", "Big vein returning deoxygenated blood from the body."],
            ["Aorta", "Big artery carrying oxygenated blood to the body."],
            ["Coronary arteries", "Supply the heart muscle with oxygenated blood."]
          ]
        },
        {
          title: "Adaptations & the pacemaker",
          poke: "The left ventricle is the 'buffed-up' chamber. The pacemaker is the heart's internal metronome.",
          facts: [
            "Ventricle walls are thicker than atria (pump at higher pressure).",
            "The <b>left ventricle</b> has the thickest wall — it pumps blood all around the body.",
            "<b>Valves</b> prevent backflow; a muscle <b>wall (septum)</b> stops oxy/deoxy mixing.",
            "The <b>pacemaker</b> (cells in the wall of the <b>right atrium</b>) sends electrical impulses that set heart rate.",
            "Faulty pacemaker → irregular heartbeat → an <b>artificial pacemaker</b> (implanted device) corrects it."
          ],
          terms: [
            ["Left ventricle", "Thickest wall — pumps blood around the whole body."],
            ["Pacemaker", "Cells in the right atrium wall that control heart rate."],
            ["Valves", "Prevent backflow — keep blood moving one way."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"In a double circulatory system, blood passes through the heart…",
          options:["Once per body circuit","Twice per body circuit","Three times","Never"], answer:1,
          explain:"Twice — once for the pulmonary (lung) circuit and once for the systemic (body) circuit." },
        { type:"label", q:"Label the four chambers of the heart. (Remember: viewer's left = patient's right!)",
          svg: SVG_HEART,
          zones:[ {x:31,y:30,answer:"Right atrium"},
                  {x:69,y:30,answer:"Left atrium"},
                  {x:31,y:68,answer:"Right ventricle"},
                  {x:69,y:68,answer:"Left ventricle"} ],
          explain:"Atria are on top, ventricles below. The patient's right side is drawn on the viewer's left." },
        { type:"order", q:"Order the pathway of blood, starting as it returns from the BODY.",
          items:["Vena cava","Right atrium","Right ventricle","Pulmonary artery","Lungs","Pulmonary vein","Left atrium","Left ventricle","Aorta"],
          explain:"Vena cava → right atrium → right ventricle → pulmonary artery → lungs → pulmonary vein → left atrium → left ventricle → aorta." },
        { type:"mc", q:"Why does the LEFT ventricle have the thickest wall?",
          options:["It pumps blood to the lungs","It pumps blood at high pressure around the whole body","It holds the most blood","It contains the pacemaker"], answer:1,
          explain:"The left ventricle pumps oxygenated blood at high pressure all the way around the body." },
        { type:"mc", q:"Where is the pacemaker located?",
          options:["Left ventricle","Wall of the right atrium","Aorta","Pulmonary vein"], answer:1,
          explain:"A group of cells in the wall of the right atrium acts as the pacemaker, setting heart rate." },
        { type:"match", q:"Match each blood vessel to what it does.",
          pairs:[["Vena cava","Deoxygenated blood from the body → heart"],
                 ["Aorta","Oxygenated blood from heart → body"],
                 ["Pulmonary artery","Deoxygenated blood from heart → lungs"],
                 ["Pulmonary vein","Oxygenated blood from lungs → heart"]],
          explain:"Pulmonary = lungs. Vena cava & pulmonary vein bring blood IN; aorta & pulmonary artery send it OUT." }
      ]
    },
    {
      id: "vessels",
      name: "Vessel Valley Gym",
      leader: "Leader Flow",
      badge: "🩸 Flow Badge",
      type: "Water",
      tier: "Foundation",
      tagline: "Pipes built for the job.",
      intro: "Three vessel types, three different structures — each shaped perfectly for its pressure and purpose.",
      lessons: [
        {
          title: "Arteries, veins & capillaries",
          poke: "Arteries = armoured high-pressure pipes. Veins = wide low-pressure return roads with one-way gates. Capillaries = tiny leaky delivery lanes.",
          facts: [
            "<b>Arteries</b> carry blood <b>away from the heart</b> at high pressure.",
            "<b>Veins</b> carry blood <b>towards the heart</b> at low pressure.",
            "<b>Capillaries</b> link arteries to veins and are the <b>site of exchange</b> with body cells.",
            "Memory tip: <b>A</b>rteries = <b>A</b>way."
          ],
          terms: [
            ["Artery", "Away from the heart, high pressure."],
            ["Vein", "Towards the heart, low pressure."],
            ["Capillary", "Site of substance exchange with cells."]
          ]
        },
        {
          title: "Structure matches function",
          poke: "Each vessel's build is its 'stat spread' tuned to the pressure it handles.",
          facts: [
            "<b>Arteries:</b> thick walls with muscle + elastic tissue (strength, stretch & recoil); <b>narrow lumen</b> keeps pressure high. <b>No valves.</b>",
            "<b>Veins:</b> <b>large lumen</b> for big low-pressure volume; thin walls; <b>valves</b> prevent backflow.",
            "<b>Capillaries:</b> walls <b>one cell thick</b> (short diffusion distance); very narrow lumen slows blood for exchange.",
            "<b>Rate of blood flow</b> = volume of blood ÷ time (e.g. 2460 ml ÷ 4 min = 615 ml/min)."
          ],
          terms: [
            ["Narrow lumen (artery)", "Keeps blood pressure high."],
            ["Valves (vein)", "Stop low-pressure blood flowing backwards."],
            ["Rate of blood flow", "volume ÷ time."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"Which vessel carries blood AWAY from the heart?",
          options:["Vein","Artery","Capillary","Alveolus"], answer:1,
          explain:"Arteries carry blood away (A = Away). Veins carry it back to the heart." },
        { type:"label", q:"Identify these three blood vessels by their cross-section.",
          svg: SVG_VESSELS,
          zones:[ {x:20,y:58,answer:"Artery"},
                  {x:52,y:58,answer:"Vein"},
                  {x:80,y:58,answer:"Capillary"} ],
          explain:"Artery = thick wall + small lumen; vein = thin wall + large lumen; capillary = tiny, one cell thick." },
        { type:"categorise", q:"Sort each feature under the correct vessel.",
          buckets:["Artery","Vein","Capillary"],
          items:[["Thick muscular, elastic wall",0],["Narrow lumen, high pressure",0],
                 ["Large lumen, low pressure",1],["Has valves to stop backflow",1],
                 ["Wall one cell thick",2],["Site of substance exchange",2]],
          explain:"Arteries: thick wall, narrow lumen. Veins: large lumen, valves. Capillaries: one-cell-thick walls, exchange site." },
        { type:"mc", q:"2460 ml of blood flows through a vessel in 4 minutes. Rate of blood flow?",
          options:["615 ml/min","984 ml/min","246 ml/min","9840 ml/min"], answer:0,
          explain:"Rate = volume ÷ time = 2460 ÷ 4 = 615 ml/min." },
        { type:"mc", q:"True or False: arteries have valves to prevent backflow.",
          options:["True","False"], answer:1,
          explain:"False — VEINS have valves. Artery blood pressure is high enough to keep blood moving forward." }
      ]
    },
    {
      id: "blood",
      name: "Plasma Plaza Gym",
      leader: "Leader Marrow",
      badge: "🧬 Blood Badge",
      type: "Water",
      tier: "Foundation",
      tagline: "Four parts, one lifeline.",
      intro: "Blood is a tissue team of four: plasma, red cells, white cells and platelets. Learn each one's role.",
      lessons: [
        {
          title: "The four components",
          poke: "Blood is a four-member squad: a liquid courier, oxygen carriers, defenders, and repair crew.",
          facts: [
            "<b>Plasma:</b> straw-coloured liquid carrying cells + dissolved substances (CO₂, glucose, amino acids, urea, hormones, antibodies, ions) and heat.",
            "<b>Red blood cells:</b> carry <b>oxygen</b>; biconcave disc (large surface area:volume), <b>no nucleus</b>, contain <b>haemoglobin</b> that binds oxygen.",
            "<b>White blood cells:</b> defence; larger than red cells and the only blood cell with a <b>nucleus</b> (often lobed).",
            "<b>Platelets:</b> cell fragments (no nucleus) that form <b>blood clots</b> to stop bleeding.",
            "Exam tip: always NAME the substance plasma carries — 'nutrients'/'waste' don't score."
          ],
          terms: [
            ["Plasma", "Liquid that transports dissolved substances, cells and heat."],
            ["Red blood cell", "Biconcave, no nucleus, haemoglobin — carries oxygen."],
            ["Platelets", "Cell fragments that clot blood."]
          ]
        }
      ],
      quiz: [
        { type:"mc", q:"What is the main job of red blood cells?",
          options:["Fight pathogens","Carry oxygen","Clot blood","Carry hormones"], answer:1,
          explain:"Red blood cells carry oxygen, using haemoglobin." },
        { type:"match", q:"Match each blood component to its role.",
          pairs:[["Plasma","Transports dissolved substances & heat"],
                 ["Red blood cells","Carry oxygen"],
                 ["White blood cells","Defend against pathogens"],
                 ["Platelets","Form blood clots"]],
          explain:"Plasma = transport liquid; red = oxygen; white = defence; platelets = clotting." },
        { type:"multi", q:"Select ALL features of a red blood cell.",
          options:["Biconcave disc shape","Has a nucleus","No nucleus","Contains haemoglobin","Large surface area to volume ratio","A cell fragment"],
          answers:[0,2,3,4],
          explain:"Red cells are biconcave, have NO nucleus, contain haemoglobin and a large SA:V. Having a nucleus = white cell; a fragment = platelet." },
        { type:"multi", q:"Which substances are transported in the PLASMA? Select all.",
          options:["Carbon dioxide","Glucose","Urea","Oxygen (mainly)","Hormones","Antibodies"],
          answers:[0,1,2,4,5],
          explain:"Plasma carries CO₂, glucose, amino acids, urea, hormones, antibodies and ions. Oxygen is carried mainly by red blood cells, not plasma." },
        { type:"mc", q:"Which blood cell is the only one with a nucleus?",
          options:["Red blood cell","White blood cell","Platelet","Plasma"], answer:1,
          explain:"White blood cells are larger and are the only blood cells with a nucleus (often lobed)." }
      ]
    }
  ],
  flashcards: [
    { tier:"F", q:"What is the function of the trachea?", a:"The windpipe connects the nose and mouth to the lungs/bronchi." },
    { tier:"F", q:"What are the alveoli?", a:"Tiny air sacs surrounded by capillaries — the site of gas exchange between air and blood." },
    { tier:"F", q:"Describe the role of the bronchi.", a:"They branch off the trachea carrying air into each lung; contain mucus to trap dust & pathogens." },
    { tier:"F", q:"Which process takes place at the alveoli?", a:"Gas exchange (by diffusion)." },
    { tier:"F", q:"What features make alveoli an efficient exchange surface?", a:"Large surface area, short diffusion distance (walls one cell thick), good blood supply & ventilation (steep gradient), and a moist lining." },
    { tier:"F", q:"Why should you never say alveoli have 'thin cell walls'?", a:"AQA marks it wrong — say the walls are 'one cell thick'." },
    { tier:"F", q:"How is a steep concentration gradient maintained at the alveoli?", a:"Good ventilation keeps O₂ high & CO₂ low in the alveoli; a good blood supply keeps blood next to them low in O₂ and high in CO₂." },
    { tier:"F", q:"What is the function of the heart?", a:"It pumps oxygenated blood from the lungs to the body, and deoxygenated blood from the body to the lungs." },
    { tier:"F", q:"What is a double circulatory system?", a:"Two circuits (lungs and body); blood passes through the heart twice per full circuit of the body." },
    { tier:"F", q:"Describe the pathway of deoxygenated blood from the body.", a:"Vena cava → right atrium → valve → right ventricle → pulmonary artery → lungs." },
    { tier:"F", q:"How does blood return from the lungs to the heart?", a:"Via the pulmonary vein, into the left atrium." },
    { tier:"F", q:"Why does the left ventricle have a thicker wall than the right?", a:"It pumps oxygenated blood at high pressure around the whole body; the right only pumps to the nearby lungs at lower pressure." },
    { tier:"F", q:"What do valves do in the heart?", a:"Prevent backflow — keep blood flowing one way through the chambers and vessels." },
    { tier:"F", q:"What supplies the heart muscle with oxygenated blood?", a:"The coronary arteries." },
    { tier:"F", q:"Where is the pacemaker and what does it do?", a:"In the wall of the right atrium; it sends electrical impulses that coordinate contraction and set heart rate." },
    { tier:"F", q:"What is an artificial pacemaker?", a:"An implanted electrical device that corrects an irregular heartbeat by stimulating regular contraction." },
    { tier:"F", q:"True/False: deoxygenated blood enters the LEFT side of the heart from the body.", a:"False — it enters the RIGHT side (right atrium) via the vena cava." },
    { tier:"F", q:"Which is the only vein carrying oxygenated blood?", a:"The pulmonary vein (from lungs back to the heart)." },
    { tier:"F", q:"What are the three types of blood vessel?", a:"Arteries, veins and capillaries." },
    { tier:"F", q:"Function of arteries?", a:"Carry blood away from the heart at high pressure." },
    { tier:"F", q:"How are arteries adapted to their function?", a:"Thick walls with muscle & elastic tissue, and a narrow lumen to maintain high pressure." },
    { tier:"F", q:"Function of veins?", a:"Carry blood towards the heart at low pressure." },
    { tier:"F", q:"How are veins adapted?", a:"Large lumen, thin walls, and valves to prevent backflow." },
    { tier:"F", q:"Key features of capillaries?", a:"Walls one cell thick and a narrow lumen — the site of substance exchange." },
    { tier:"F", q:"True/False: arteries have valves.", a:"False — veins have valves. Arterial pressure is high enough to keep blood moving forward." },
    { tier:"F", q:"How do you calculate rate of blood flow?", a:"Rate = volume of blood ÷ time (e.g. 1230 ml ÷ 2 min = 615 ml/min)." },
    { tier:"F", q:"What does plasma transport? (name substances)", a:"CO₂, glucose, amino acids, urea, hormones, antibodies and ions — plus heat and the blood cells." },
    { tier:"F", q:"Describe red blood cells.", a:"Biconcave discs with no nucleus, packed with haemoglobin that binds oxygen; large surface area:volume for efficient diffusion." },
    { tier:"F", q:"Describe white blood cells.", a:"Larger than red cells, the only blood cell with a nucleus (often lobed); defend against pathogens." },
    { tier:"F", q:"What are platelets and what do they do?", a:"Cell fragments (no nucleus) involved in forming blood clots to prevent blood loss." },
    { tier:"F", q:"How do you identify blood cells under a microscope?", a:"White cells are largest and have a nucleus; red cells are biconcave with no nucleus; platelets are the smallest fragments." }
  ]
}

]; /* end TOPICS */
