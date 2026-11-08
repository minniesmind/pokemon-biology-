/* ============================================================
   PLANT HORMONES — "POKÉ-PROFESSOR" GCSE BIOLOGY ADVENTURE
   AQA GCSE Biology content (Save My Exams notes + flashcards)
   All facts below are exam-accurate. The Pokémon wrapper is
   just there to make it stick.
   ============================================================ */

const GAME_DATA = {

  /* ---- Starter "Grass Pokémon" the player picks ---- */
  starters: [
    { id: "bulba",  name: "Budbasaur",  emoji: "🌱", blurb: "A seed-type rookie. Loves soaking up sunlight — a natural at phototropism." },
    { id: "oddish", name: "Rootish",    emoji: "🪴", blurb: "Keeps its roots firmly in the soil. Master of gravitropism." },
    { id: "bell",   name: "Sproutle",   emoji: "🌿", blurb: "A bendy shoot that always leans toward the light. Full of auxin energy." }
  ],

  /* ---- The 5 Gyms (one per exam topic) ---- */
  gyms: [
    /* =========================================================
       GYM 1 — TROPISMS
       ========================================================= */
    {
      id: "tropisms",
      name: "Tropism Town Gym",
      leader: "Leader Sunny",
      badge: "☀️ Sunlight Badge",
      type: "Grass",
      tier: "Foundation + Higher",
      tagline: "Which way do I grow?",
      intro: "Every Grass-type knows the golden rule: grow toward what you need. Shoots chase the sun, roots dive for the ground. Learn the two tropisms and you've won half the battle.",
      lessons: [
        {
          title: "What is a tropism?",
          poke: "Think of a tropism like a Pokémon's instinct to move toward food or water — except plants can't walk, so they GROW in a direction instead.",
          facts: [
            "Plants make chemicals called <b>plant hormones</b> (mainly <b>auxins</b>) to coordinate and control growth.",
            "A <b>tropism</b> is a growth response to a stimulus (something in the environment).",
            "<b>Phototropism</b> = growth in response to <b>light</b>.",
            "<b>Gravitropism</b> (also called <b>geotropism</b>) = growth in response to <b>gravity</b>."
          ],
          terms: [
            ["Phototropism", "Growth in response to light."],
            ["Gravitropism / Geotropism", "Growth in response to gravity."],
            ["Positive response", "Growing TOWARDS the stimulus."],
            ["Negative response", "Growing AWAY from the stimulus."]
          ]
        },
        {
          title: "Shoots vs Roots — who grows where?",
          poke: "Shoots are the 'solar-panel' Pokémon that want sunlight for photosynthesis. Roots are the 'anchor' Pokémon that want water, minerals and grip.",
          facts: [
            "<b>Shoots</b> grow <b>up</b>, away from gravity and towards light — so leaves absorb more light → more photosynthesis → more glucose.",
            "Shoots are therefore <b>positively phototropic</b> (toward light) and <b>negatively gravitropic</b> (away from gravity).",
            "<b>Roots</b> grow <b>down</b>, away from light and towards gravity — to anchor the plant and absorb water and minerals from the soil.",
            "Roots are therefore <b>negatively phototropic</b> (away from light) and <b>positively gravitropic</b> (toward gravity)."
          ],
          terms: [
            ["Shoot response", "Positive phototropism + negative gravitropism (grows up/toward light)."],
            ["Root response", "Negative phototropism + positive gravitropism (grows down/toward gravity)."]
          ]
        }
      ],
      quiz: [
        {
          q: "Phototropism is a plant's growth response to which stimulus?",
          options: ["Gravity", "Light", "Water", "Temperature"],
          answer: 1,
          explain: "Photo = light. Phototropism is growth in response to light."
        },
        {
          q: "Gravitropism is also known as…",
          options: ["Phototropism", "Hydrotropism", "Geotropism", "Thermotropism"],
          answer: 2,
          explain: "Gravitropism and geotropism mean the same thing — growth in response to gravity."
        },
        {
          q: "A plant shoot shows which combination of responses?",
          options: [
            "Positive phototropism, positive gravitropism",
            "Positive phototropism, negative gravitropism",
            "Negative phototropism, positive gravitropism",
            "Negative phototropism, negative gravitropism"
          ],
          answer: 1,
          explain: "Shoots grow TOWARDS light (positive phototropism) and AWAY from gravity (negative gravitropism)."
        },
        {
          q: "Why is it an advantage for shoots to grow towards the light?",
          options: [
            "To anchor the plant",
            "To absorb more water",
            "So leaves absorb more light for more photosynthesis",
            "To avoid being eaten"
          ],
          answer: 2,
          explain: "More light → more photosynthesis → more glucose produced for the plant."
        },
        {
          q: "Roots grow downwards. This is because they are…",
          options: [
            "Positively gravitropic and negatively phototropic",
            "Negatively gravitropic and positively phototropic",
            "Positively phototropic only",
            "Not affected by gravity"
          ],
          answer: 0,
          explain: "Roots grow towards gravity (positive gravitropism) and away from light (negative phototropism) to anchor the plant and absorb water & minerals."
        }
      ]
    },

    /* =========================================================
       GYM 2 — AUXIN
       ========================================================= */
    {
      id: "auxin",
      name: "Auxin Arena Gym",
      leader: "Leader Elonga",
      badge: "📈 Growth Badge",
      type: "Energy",
      tier: "Foundation + Higher",
      tagline: "The hormone behind the bend.",
      intro: "Auxin is the signature move of every Grass-type. It's a growth hormone with a twist: it POWERS UP cells in shoots but POWERS DOWN cells in roots. Master how it moves and you'll explain every bend.",
      lessons: [
        {
          title: "Where auxin is made & what it does",
          poke: "Auxin is like an energy move charged up at the TIP of a shoot or root, then sent to the cells just behind the tip.",
          facts: [
            "Auxins are made in the <b>tips</b> of shoots and roots, then <b>diffuse</b> to the cells just behind the tip.",
            "Only the <b>region behind the tip</b> can grow by cell division and <b>cell elongation</b>.",
            "In <b>shoots</b>, auxin <b>promotes (speeds up) cell elongation</b>: more auxin = more growth.",
            "In <b>roots</b>, auxin <b>inhibits (slows down) cell elongation</b>: more auxin = less growth.",
            "This opposite effect is the key idea — same hormone, different response."
          ],
          terms: [
            ["Cell elongation", "Cells getting longer — how the shoot/root region behind the tip grows."],
            ["Promote (shoots)", "Auxin makes shoot cells elongate faster."],
            ["Inhibit (roots)", "Auxin makes root cells elongate slower."]
          ]
        },
        {
          title: "Phototropism — bending towards light",
          poke: "Picture a Sunflora standing beside a window. Light hits one side only, so auxin dodges to the shady side and 'levels up' those cells — the plant leans toward the light.",
          facts: [
            "If light hits the tip <b>evenly from all sides</b>, auxin spreads evenly and the shoot grows straight up.",
            "If light comes <b>mainly from one side</b>, auxin builds up on the <b>shaded side</b>.",
            "The shaded-side cells get more auxin → <b>elongate faster</b> than the sunny side.",
            "Uneven growth makes the shoot <b>bend and grow towards the light</b> — positive phototropism."
          ],
          terms: [
            ["Unequal distribution", "Auxin collects more on one side → uneven growth → bending."],
            ["Shaded side (shoot)", "More auxin → faster elongation → shoot bends toward light."]
          ]
        },
        {
          title: "Gravitropism — the side-on plant",
          poke: "Lay a seedling on its side like a knocked-over Pokémon. Gravity pulls auxin to the LOWER side. In shoots that side powers up; in roots it powers down.",
          facts: [
            "If a shoot or root is placed on its side, auxin accumulates on the <b>lower side</b> (because of gravity).",
            "The uppermost side ends up with a <b>lower auxin concentration</b>.",
            "In <b>shoots</b>: the lower side grows <b>faster</b> (auxin promotes growth) → shoot bends and grows <b>upwards</b>.",
            "In <b>roots</b>: the lower side grows <b>slower</b> (auxin inhibits growth) → root bends and grows <b>downwards</b>.",
            "Shoot distribution is affected by light AND gravity; root distribution is mainly affected by gravity alone."
          ],
          terms: [
            ["Lower side (shoot)", "More auxin → grows faster → shoot curves upward."],
            ["Lower side (root)", "More auxin → grows slower → root curves downward."]
          ]
        }
      ],
      quiz: [
        {
          q: "Where in the plant is auxin made?",
          options: ["In the leaves", "In the tips of shoots and roots", "In the flowers", "In the oldest cells"],
          answer: 1,
          explain: "Auxin is produced in the tips, then diffuses to the cells just behind the tip."
        },
        {
          q: "What effect does auxin have on cells in the SHOOTS?",
          options: ["Inhibits elongation", "Stimulates/promotes cell elongation", "Has no effect", "Kills the cells"],
          answer: 1,
          explain: "In shoots, auxin promotes cell elongation — more auxin means more growth."
        },
        {
          q: "True or False: Auxin inhibits the growth of cells in plant roots.",
          options: ["True", "False"],
          answer: 0,
          explain: "True. In roots auxin inhibits cell elongation, so more auxin = less growth."
        },
        {
          q: "A shoot is lit strongly from the left. Where does auxin build up?",
          options: ["The lit (left) side", "The shaded (right) side", "The tip only", "It stays even"],
          answer: 1,
          explain: "Auxin accumulates on the shaded side, so those cells elongate faster and the shoot bends toward the light."
        },
        {
          q: "A seedling is laid on its side in the dark. In the ROOT, the lower side has more auxin, so it…",
          options: [
            "Grows faster, bending the root upwards",
            "Grows slower, bending the root downwards",
            "Dies off completely",
            "Is unaffected"
          ],
          answer: 1,
          explain: "In roots auxin inhibits growth, so the auxin-rich lower side grows slower and the root curves downward (toward gravity)."
        },
        {
          q: "Why does unequal distribution of auxin cause bending?",
          options: [
            "It changes the colour of the plant",
            "It makes one side grow at a different rate to the other",
            "It stops photosynthesis",
            "It adds water to one side"
          ],
          answer: 1,
          explain: "Unequal auxin = unequal growth rates on each side = the shoot or root bends."
        }
      ]
    },

    /* =========================================================
       GYM 3 — OTHER HORMONES (HIGHER TIER)
       ========================================================= */
    {
      id: "hormones",
      name: "Hormone Hideout Gym",
      leader: "Leader Gibb",
      badge: "🧪 Hormone Badge",
      type: "Higher Tier",
      tier: "Higher Tier only",
      tagline: "Auxin isn't the only one.",
      intro: "Higher-Tier trainers only! Beyond auxin, plants run two more hormone 'moves': Gibberellins and Ethene. Learn what each one triggers.",
      lessons: [
        {
          title: "Gibberellins",
          poke: "Gibberellins are the 'wake-up & bloom' move — they kick a sleeping seed into action and help the plant flower and fruit.",
          facts: [
            "Gibberellins are important in <b>initiating seed germination</b> (the seed starting to grow).",
            "They also help <b>induce flowering</b>.",
            "They help the <b>growth of fruit</b>."
          ],
          terms: [
            ["Germination", "When a seed starts to grow — gibberellins get it going."],
            ["Flowering & fruit", "Gibberellins induce flowering and support fruit growth."]
          ]
        },
        {
          title: "Ethene",
          poke: "Ethene is a GAS move — invisible, drifts through the air, and tells fruit it's time to ripen.",
          facts: [
            "Ethene is a <b>gas</b> released by plants.",
            "It controls <b>cell division</b> and the <b>ripening of fruits</b>.",
            "Both gibberellins and ethene are used commercially (see the Industry Island Gym)."
          ],
          terms: [
            ["Ethene", "A gas hormone that controls cell division and fruit ripening."]
          ]
        }
      ],
      quiz: [
        {
          q: "Which hormone initiates seed germination? (Higher Tier)",
          options: ["Auxin", "Ethene", "Gibberellins", "Insulin"],
          answer: 2,
          explain: "Gibberellins initiate seed germination."
        },
        {
          q: "Ethene is best described as…",
          options: ["A liquid fertiliser", "A gas that ripens fruit", "A type of auxin", "A root hormone"],
          answer: 1,
          explain: "Ethene is a gas that controls cell division and the ripening of fruit."
        },
        {
          q: "True or False: Ethene prevents fruit ripening. (Higher Tier)",
          options: ["True", "False"],
          answer: 1,
          explain: "False. Ethene CAUSES fruit ripening. Ripening can be slowed by inhibiting ethene production."
        },
        {
          q: "Besides germination, gibberellins also help to…",
          options: ["Induce flowering and fruit growth", "Make roots grow down", "Cool the plant", "Produce chlorophyll"],
          answer: 0,
          explain: "Gibberellins induce flowering and support the growth of fruit."
        }
      ]
    },

    /* =========================================================
       GYM 4 — REQUIRED PRACTICAL
       ========================================================= */
    {
      id: "practical",
      name: "Practical Plateau Gym",
      leader: "Leader Clino",
      badge: "🔬 Method Badge",
      type: "Skills",
      tier: "Foundation + Higher",
      tagline: "Prove it with an experiment.",
      intro: "A real trainer tests their theory. This gym is the Required Practical: investigating how light and gravity affect newly germinated seedlings. The secret weapon? A spinning gadget called a clinostat.",
      lessons: [
        {
          title: "The clinostat — the anti-gravity spin move",
          poke: "A clinostat is like a slow spinning platform. By rotating the seedling, gravity pulls equally on every side — so it CANCELS OUT the one-sided effect of gravity.",
          facts: [
            "<b>Aim:</b> investigate the effect of light or gravity on the growth of newly germinated seedlings.",
            "A <b>clinostat</b> rotates slowly so gravity acts <b>equally on all sides</b>, cancelling out the one-sided effect of gravity.",
            "This lets you control gravity when testing light, or compare growth with and without a one-sided gravity effect."
          ],
          terms: [
            ["Clinostat", "A device that slowly rotates a seedling so gravity acts equally on all sides (cancels its effect)."]
          ]
        },
        {
          title: "Investigating GRAVITY",
          poke: "Put the seedlings in a dark box so light can't interfere — only gravity is on the battlefield.",
          facts: [
            "Set up petri dishes with seeds and let them germinate.",
            "Attach one dish on its <b>side</b> to a support (gravity acts on one side).",
            "Attach a second dish to a <b>clinostat</b> (gravity cancelled).",
            "Place both in a <b>light-proof box</b> (complete darkness) so light can't affect the direction of growth; leave ~2 days.",
            "<b>Result:</b> on the clinostat, roots and shoots grow straight out in whatever direction they were placed (no gravitropic response) because gravity's effect is cancelled."
          ],
          terms: [
            ["Light-proof box", "Keeps seedlings in darkness so only gravity affects growth direction."]
          ]
        },
        {
          title: "Investigating LIGHT",
          poke: "Now light is the challenger. One dish gets light from one side only; the other gets darkness or all-round light.",
          facts: [
            "Add damp cotton wool to two petri dishes and set up equal numbers of germinated seeds in each.",
            "Give each dish a different light condition, e.g. light from <b>one side</b> (box with a slit + lamp) vs <b>complete darkness</b>, or <b>unidirectional</b> light vs light from <b>all directions</b>.",
            "Measure the height of each seedling at the start, leave ~2 days, then measure again.",
            "Use a ruler for straight seedlings; use string + a ruler for curved seedlings. Record appearance as labelled biological drawings.",
            "Calculate the <b>mean height increase</b> for each dish."
          ],
          terms: [
            ["Mean height increase", "The average growth per dish — your main result."],
            ["Measuring curves", "Use string along the curve, then measure the string with a ruler."]
          ]
        },
        {
          title: "Variables (nail these for marks!)",
          poke: "Control variables are the 'fair fight' rules — keep everything the same except the one thing you're testing.",
          facts: [
            "<b>Independent variable:</b> the direction of light (or the direction of gravity) — the thing you change.",
            "<b>Dependent variable:</b> the length and/or direction of growth of the new roots and shoots — the thing you measure.",
            "<b>Control variables:</b> temperature, volume/availability of water (how damp the cotton wool is), plant species, and the type/size/age of the seedlings.",
            "When testing light, also control the direction of gravity."
          ],
          terms: [
            ["Independent variable", "What you change (direction of light or gravity)."],
            ["Dependent variable", "What you measure (length/direction of growth of roots & shoots)."],
            ["Control variables", "Temperature, water, species, age/size of seedlings, direction of gravity."]
          ]
        }
      ],
      quiz: [
        {
          q: "What does a clinostat do?",
          options: [
            "Adds light to the seedlings",
            "Rotates slowly so gravity acts equally on all sides (cancels gravity's effect)",
            "Heats the seedlings",
            "Measures seedling height"
          ],
          answer: 1,
          explain: "A clinostat rotates slowly so gravity acts equally on all sides, cancelling out its one-sided effect."
        },
        {
          q: "Why are seedlings kept in a light-proof box when investigating gravity?",
          options: [
            "To keep them warm",
            "So that light cannot affect the direction of growth (only gravity does)",
            "To speed up germination",
            "To stop water evaporating"
          ],
          answer: 1,
          explain: "Darkness removes light as a variable, so only gravity affects the direction of growth."
        },
        {
          q: "In this investigation, what is the DEPENDENT variable?",
          options: [
            "The direction of gravity",
            "The temperature",
            "The length and/or direction of growth of roots and shoots",
            "The type of seed"
          ],
          answer: 2,
          explain: "You measure the length/direction of growth — that is the dependent variable. The direction of gravity/light is the independent variable."
        },
        {
          q: "Which of these is a control variable for the light investigation?",
          options: ["Direction of light", "Temperature", "Height increase", "Which way seedlings bend"],
          answer: 1,
          explain: "Temperature must be kept the same. Others to control: water, species, age/size of seedlings, and direction of gravity."
        },
        {
          q: "How should you measure the height of a CURVED seedling?",
          options: [
            "Guess it",
            "A ruler held straight across",
            "A piece of string along the curve, then measure the string with a ruler",
            "Weigh it"
          ],
          answer: 2,
          explain: "Lay string along the curve, then measure the length of string with a ruler."
        }
      ]
    },

    /* =========================================================
       GYM 5 — USES OF PLANT HORMONES (HIGHER TIER)
       ========================================================= */
    {
      id: "uses",
      name: "Industry Island Gym",
      leader: "Leader Harvest",
      badge: "🏆 Industry Badge",
      type: "Higher Tier",
      tier: "Higher Tier only",
      tagline: "Hormones at work in the real world.",
      intro: "Final gym, Higher-Tier only! Farmers and gardeners use plant hormones as real tools — weed killers, rooting powders, ripening control and more. Learn each use and why it matters.",
      lessons: [
        {
          title: "Uses of AUXINS",
          poke: "Auxin is a versatile move: as a weed killer it's super-effective against broad-leaved weeds, but as rooting powder it helps new plants spring up.",
          facts: [
            "<b>Selective weed killers:</b> auxins damage the growth of <b>broad-leaved</b> weeds while leaving <b>narrow-leaved</b> crops (grasses & cereals) to grow normally.",
            "This stops weeds competing with crops for space and nutrients, protecting yields.",
            "<b>Rooting powder:</b> dip the cut tips of cuttings in auxins to encourage rapid root development → cheap clones of a desirable plant.",
            "<b>Tissue culture:</b> auxins promote growth of scraped cells to produce clones in a petri dish, later grown in soil.",
            "<b>Downside:</b> everyday use of weed killers can reduce <b>biodiversity</b> — weeds are food/habitat for other organisms."
          ],
          terms: [
            ["Selective weed killer", "Kills broad-leaved weeds but not narrow-leaved crops."],
            ["Rooting powder", "Auxins that make cuttings grow roots fast."],
            ["Tissue culture", "Growing clones from a few cells using auxins."]
          ]
        },
        {
          title: "Uses of ETHENE",
          poke: "Ethene is the ripening gas. Turn it up to ripen fruit on the shop shelf; block it to keep fruit hard for transport.",
          facts: [
            "Ethene is used in the food industry to <b>control ripening of fruit</b> during storage and transport.",
            "It's better to transport <b>unripe</b> fruit — ripe fruit is softer and spoils/damages more easily.",
            "Ripening can be <b>delayed</b> by inhibiting ethene production (or removing ethene from the air around the fruit).",
            "Ripening can be <b>encouraged</b> (e.g. at the supermarket) by releasing artificial ethene gas."
          ],
          terms: [
            ["Delay ripening", "Inhibit/remove ethene so fruit stays firm for transport."],
            ["Encourage ripening", "Add ethene gas to ripen fruit when it's ready to sell."]
          ]
        },
        {
          title: "Uses of GIBBERELLINS",
          poke: "Gibberellins are the 'grow on demand' move — wake up seeds, force flowers, and bulk up fruit.",
          facts: [
            "<b>End seed dormancy:</b> high gibberellin levels promote seed germination (dormancy normally ends after cold/dry conditions, water intake and warmth).",
            "<b>Promote flowering</b> regardless of the weather conditions the plant is in.",
            "<b>Increase fruit size</b> — higher gibberellin levels promote fruit development and growth."
          ],
          terms: [
            ["End dormancy", "Gibberellins trigger germination when you want it."],
            ["Promote flowering", "Flowering on demand, whatever the weather."],
            ["Bigger fruit", "More gibberellin → larger fruit."]
          ]
        }
      ],
      quiz: [
        {
          q: "Auxins used as selective weed killers kill which plants?",
          options: [
            "Narrow-leaved crops",
            "Broad-leaved weeds (sparing narrow-leaved crops)",
            "All plants equally",
            "Only trees"
          ],
          answer: 1,
          explain: "They damage broad-leaved weeds while narrow-leaved crops (grasses/cereals) grow normally."
        },
        {
          q: "How can auxins help produce many clones of a desirable plant?",
          options: [
            "By ripening its fruit",
            "As rooting powder on cuttings / in tissue culture to promote growth",
            "By killing it",
            "By making it flower"
          ],
          answer: 1,
          explain: "Auxins in rooting powder make cuttings grow roots fast, and in tissue culture promote growth of cloned cells."
        },
        {
          q: "To keep fruit firm during long-distance transport, you should…",
          options: [
            "Add lots of ethene",
            "Inhibit/remove ethene to delay ripening",
            "Add gibberellins",
            "Add auxin"
          ],
          answer: 1,
          explain: "Inhibiting or removing ethene delays ripening, so fruit stays firm and is less easily damaged."
        },
        {
          q: "Which hormone is used to end seed dormancy, promote flowering and increase fruit size?",
          options: ["Auxin", "Ethene", "Gibberellins", "Adrenaline"],
          answer: 2,
          explain: "Gibberellins end dormancy, promote flowering regardless of weather, and increase fruit size."
        },
        {
          q: "What is a negative effect of using weed killers everyday?",
          options: [
            "Crops grow too fast",
            "It can reduce biodiversity (weeds are food/habitat for other organisms)",
            "Fruit ripens too soon",
            "Seeds never germinate"
          ],
          answer: 1,
          explain: "Weeds are a food source and habitat for other organisms, so destroying them can harm the ecosystem and reduce biodiversity."
        }
      ]
    }
  ],

  /* ---- Flashcard "battle deck" (straight from the PDF) ---- */
  flashcards: [
    { tier: "F", q: "Why do plants produce plant hormones?", a: "To coordinate and control growth responses." },
    { tier: "F", q: "Define the term phototropism.", a: "The directional growth of plants in response to light, allowing shoots to grow towards light to optimise photosynthesis." },
    { tier: "F", q: "Define the term geotropism (gravitropism).", a: "The directional growth response of plants in relation to gravity; roots grow downwards and shoots grow upwards." },
    { tier: "F", q: "True or False? Unequal distribution of auxin results in uneven growth in shoots AND roots.", a: "True. Auxin distributes unevenly in shoots due to light direction, and in roots due to gravity direction — causing uneven growth." },
    { tier: "F", q: "What effect does auxin have on cells in the shoots?", a: "Auxin stimulates (promotes) cell elongation in plant shoots." },
    { tier: "F", q: "How does auxin distribution in response to light lead to phototropism?", a: "Auxin builds up on the shaded side, making those cells elongate faster than the lit side, so the shoot bends towards the light." },
    { tier: "F", q: "True or False? Auxin inhibits the growth of cells in plant roots.", a: "True. Auxin accumulates on the lower side of roots, inhibiting cell growth so roots bend downwards towards gravity." },
    { tier: "H", q: "What role do gibberellins have in seeds? (Higher)", a: "Gibberellins initiate seed germination." },
    { tier: "F", q: "In a gravity-on-seedlings investigation, what is the dependent variable?", a: "The length and/or direction of growth of the new roots and shoots. (Direction of gravity is the independent variable.)" },
    { tier: "F", q: "Which variables must be controlled when investigating the effect of light on seedlings?", a: "Direction of gravity, temperature, water availability (how damp the cotton wool is), and the type/size/age of seedlings." },
    { tier: "F", q: "Why is a clinostat used?", a: "It cancels out the effects of gravity — so when testing light, gravity is controlled; when testing gravity, you can compare growth with and without gravity's effect." },
    { tier: "H", q: "True or False? Auxins can be used as a weedkiller. (Higher)", a: "True. They cause broad-leaved weeds to die while narrow-leaved crops grow normally." },
    { tier: "H", q: "How can auxins aid production of new plants? (Higher)", a: "Added to rooting powder (encourages cuttings to grow roots) and to cells in tissue culture (promotes growth)." },
    { tier: "H", q: "True or False? Ethene prevents fruit ripening. (Higher)", a: "False. Ethene CAUSES fruit ripening; ripening can be slowed by inhibiting ethene production." },
    { tier: "H", q: "How are gibberellins used in the plant-growing industry? (Higher)", a: "To initiate germination by ending dormancy, promote flowering, and increase fruit size." }
  ]
};
