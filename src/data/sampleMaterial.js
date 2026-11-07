export const DEFAULT_ENABLED_FEATURES = {
  summary: true,
  flashcards: true,
  exercises: true,
  quickTest: true,
  shortCalc: true,
  formulaSheet: true,
  spacedRepetition: true,
  mockExam: true
};

export const sampleMaterials = [
  {
    id: 'sample-tuletised-et',
    isSample: true,
    pairedSampleId: 'sample-tuletised-en',
    title: 'Tuletised — Funktsiooni muudu kiirus ja diferentseerimine',
    subject: 'Matemaatiline analüüs',
    fileName: 'Loeng_04_Tuletised.pptx',
    fileType: 'PPTX',
    contentLang: 'et',
    createdAt: '2026-11-05T10:00:00.000Z',
    lastOpenedAt: '2026-11-07T14:30:00.000Z',
    enabledFeatures: { ...DEFAULT_ENABLED_FEATURES },
    pages: [
      {
        pageNumber: 1,
        unitType: 'slide',
        title: 'Slaid 1: Funktsiooni muut ja hetkeline muutumiskiirus',
        content: `LOENG 4: TULETISED JA DIFERENTSEERIMINE
1. Funktsiooni muudu kiirus ja tuletise mõiste

Olgu funktsioon y = f(x) määratud punkti x₀ ümbruses.
Kui argument x saab muudu Δx, siis funktsiooni vastav muut on:
Δy = f(x₀ + Δx) − f(x₀)

Keskmine muutumiskiirus lõigul [x₀, x₀ + Δx] on muudu suhe:
Δy / Δx = (f(x₀ + Δx) − f(x₀)) / Δx

Funktsiooni tuletiseks punktis x₀ nimetatakse funktsiooni muudu ja argumendi muudu suhte piirväärtust, kui argumendi muut läheneb nullile:
f'(x₀) = lim (Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ]

Kui see piirväärtus eksisteerib ja on lõplik, siis öeldakse, et funktsioon f(x) on punktis x₀ diferentseeruv.`
      },
      {
        pageNumber: 2,
        unitType: 'slide',
        title: 'Slaid 2: Tuletise geomeetriline ja füüsikaline tähendus',
        content: `2. Geomeetriline ja mehaaniline (füüsikaline) tähendus

Geomeetriline tähendus:
Funktsiooni y = f(x) tuletis f'(x₀) võrdub funktsiooni graafiku puutuja tõusuga k = tan(α) punktis (x₀, f(x₀)).
Joone puutuja võrrand punktis (x₀, f(x₀)):
y − f(x₀) = f'(x₀) · (x − x₀)

Normaaljoone võrrand (ristsirge puutujale):
y − f(x₀) = (−1 / f'(x₀)) · (x − x₀), eeldusel et f'(x₀) ≠ 0.

Füüsikaline tähendus:
Kui s = s(t) kirjeldab keha teepikkust sõltuvalt ajast t, siis:
• Esimene tuletis v(t) = s'(t) on keha hetkkiirus ajahetkel t.
• Teine tuletis a(t) = v'(t) = s''(t) on keha hetkkiirendus ajahetkel t.`
      },
      {
        pageNumber: 3,
        unitType: 'slide',
        title: 'Slaid 3: Põhifunktsioonide tuletised ja diferentseerimisreeglid',
        content: `3. Põhifunktsioonide tuletiste tabel ja reeglid

Põhivalemid:
• Konstant: (C)' = 0
• Astmefunktsioon: (xⁿ)' = n · xⁿ⁻¹
• Eksponentfunktsioon: (eˣ)' = eˣ  ning  (aˣ)' = aˣ · ln(a)
• Logaritmfunktsioon: (ln x)' = 1 / x
• Trigonomeetrilised funktsioonid: (sin x)' = cos x,  (cos x)' = −sin x,  (tan x)' = 1 / cos²x

Aritmeetilised diferentseerimisreeglid (olgu u = u(x) ja v = v(x) diferentseeruvad):
• Summa ja vahe: (u ± v)' = u' ± v'
• Konstandi toomine märgi ette: (c · u)' = c · u'
• Korrutise tuletis: (u · v)' = u'v + uv'
• Jagatise tuletis: (u / v)' = (u'v − uv') / v²   (kui v ≠ 0)`
      },
      {
        pageNumber: 4,
        unitType: 'slide',
        title: 'Slaid 4: Liitfunktsiooni tuletis (ahelreegel)',
        content: `4. Liitfunktsiooni diferentseerimine (Ahelreegel)

Kui y = f(u) ja u = g(x), siis liitfunktsiooni y = f(g(x)) tuletis leitakse valemiga:
(f(g(x)))' = f'(g(x)) · g'(x)   ehk   dy/dx = (dy/du) · (du/dx)

Sõnaline reegel:
Liitfunktsiooni tuletis võrdub välisfunktsiooni tuletisega siseavaldist muutmata, korrutatud sisefunktsiooni tuletisega.

Näide 1:
Leia funktsiooni y = sin(3x² + 1) tuletis.
Välisfunktsioon: sin(u), sisefunktsioon: u = 3x² + 1.
y' = cos(3x² + 1) · (3x² + 1)' = 6x · cos(3x² + 1).

Näide 2:
Leia funktsiooni y = e^(−2x) tuletis.
y' = e^(−2x) · (−2x)' = −2e^(−2x).`
      },
      {
        pageNumber: 5,
        unitType: 'slide',
        title: 'Slaid 5: Ekstreemumid ja funktsiooni uurimine tuletise abil',
        content: `5. Funktsiooni kasvamine, kahanemine ja lokaalsed ekstreemumid

Monotoonsuse seos tuletisega vahemikus (a, b):
• Kui f'(x) > 0 igal x ∈ (a, b), siis funktsioon f(x) kasvab selles vahemikus.
• Kui f'(x) < 0 igal x ∈ (a, b), siis funktsioon f(x) kahaneb selles vahemikus.

Statsionaarsed ja kriitilised punktid:
Punkti x₀, kus f'(x₀) = 0, nimetatakse funktsiooni statsionaarseks punktiks (Fermat' teoreem: lokaalses ekstreemumipunktis on diferentseeruva funktsiooni tuletis null).

Piisav tingimus ekstreemumi olemasoluks:
• Kui tuletis f'(x) muudab punktis x₀ märki plussilt miinusele (+ → −), on punktis x₀ lokaalne maksimum.
• Kui tuletis f'(x) muudab punktis x₀ märki miinuselt plussile (− → +), on punktis x₀ lokaalne miinimum.
• Teise tuletise test: kui f'(x₀) = 0 ja f''(x₀) < 0, on x₀ maksimumipunkt; kui f''(x₀) > 0, on x₀ miinimumipunkt.`
      }
    ],
    topics: [
      {
        id: 'topic-et-1',
        title: 'Tuletise definitsioon ja diferentseeruvus',
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' },
        summary:
          'Funktsiooni tuletis punktis kirjeldab funktsiooni väärtuse hetkelist muutumiskiirust argumendi suhtes. See defineeritakse funktsiooni muudu Δy ja argumendi muudu Δx jagatise piirväärtusena, kui Δx läheneb nullile.',
        bulletPoints: [
          'Keskmine muutumiskiirus lõigul [x₀, x₀ + Δx] leitakse muutude suhtena Δy / Δx.',
          "Hetkeline muutumiskiirus ehk tuletis f'(x₀) tekib piirprotsessil Δx → 0.",
          'Funktsioon on punktis diferentseeruv parajasti siis, kui see piirväärtus eksisteerib ja on lõplik.',
          'Igast diferentseeruvast funktsioonist järeldub pidevus selles punktis.'
        ],
        concepts: [
          {
            term: 'Funktsiooni muut (Δy)',
            definition: 'Funktsiooni väärtuste vahe Δy = f(x₀ + Δx) − f(x₀) argumendi muudu Δx korral.'
          },
          {
            term: 'Tuletis punktis x₀',
            definition: 'Piirväärtus lim(Δx→0) (f(x₀+Δx)−f(x₀))/Δx, mis iseloomustab hetkelist muutumiskiirust.'
          },
          {
            term: 'Diferentseeruvus',
            definition: 'Funktsiooni omadus omada antud punktis lõplikku tuletist.'
          }
        ],
        formulas: [
          {
            id: 'form-et-1',
            label: 'Funktsiooni muut ja keskmine muutumiskiirus',
            expression: 'Δy / Δx = (f(x₀ + Δx) − f(x₀)) / Δx',
            symbols: 'Δx — argumendi muut; Δy — funktsiooni muut; x₀ — algpunkt',
            units: 'Dimensioon sõltub suurustest (nt Δs/Δt korral m/s)',
            example: 'Kui f(x) = x², x₀ = 2 ja Δx = 0.5, siis Δy = 2.5² − 2² = 2.25 ning Δy/Δx = 4.5.',
            sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
          },
          {
            id: 'form-et-2',
            label: 'Tuletise definitsioon piirväärtusena',
            expression: "f'(x₀) = lim(Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ]",
            symbols: "f'(x₀) — tuletis punktis x₀; lim — piirväärtus protsessil Δx → 0",
            units: 'Funktsiooni ühik jagatud argumendi ühikuga',
            example: "Funktsiooni f(x) = x² korral f'(x₀) = lim(Δx→0) ((2x₀·Δx + (Δx)²)/Δx) = 2x₀.",
            sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
          }
        ]
      },
      {
        id: 'topic-et-2',
        title: 'Tuletise geomeetriline ja füüsikaline tähendus',
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' },
        summary:
          'Geomeetriliselt annab tuletis funktsiooni graafiku puutuja tõusu antud punktis. Füüsikas väljendab teepikkuse tuletis aja järgi keha hetkkiirust ning teine tuletis hetkkiirendust.',
        bulletPoints: [
          "Graafiku puutuja tõus k punktis (x₀, f(x₀)) on võrdne tuletisega: k = tan(α) = f'(x₀).",
          "Kui f'(x₀) = 0, on puutuja selles punktis horisontaalne (paralleelne x-teljega).",
          'Mehaanikas on kiirus v(t) teepikkuse s(t) esimene tuletis aja t järgi.',
          'Kiirendus a(t) on kiiruse tuletis ehk teepikkuse teine tuletis aja järgi.'
        ],
        concepts: [
          {
            term: 'Puutuja tõus (k)',
            definition: 'Puutuja tõusunurga tangens tan(α), mis võrdub tuletise väärtusega puutepunktis.'
          },
          {
            term: 'Hetkkiirus v(t)',
            definition: "Teepikkuse funktsiooni s(t) esimene tuletis ajahetkel t: v(t) = s'(t)."
          },
          {
            term: 'Hetkkiirendus a(t)',
            definition: "Kiiruse funktsiooni esimene tuletis ehk teepikkuse teine tuletis: a(t) = s''(t)."
          }
        ],
        formulas: [
          {
            id: 'form-et-3',
            label: 'Puutuja võrrand punktis x₀',
            expression: "y − f(x₀) = f'(x₀) · (x − x₀)",
            symbols: "(x₀, f(x₀)) — puutepunkti koordinaadid; f'(x₀) — puutuja tõus k",
            units: 'Ühikuta (koordinaattasandil)',
            example: "Kui f(x) = x² ja x₀ = 3, siis f(3) = 9, f'(3) = 6 ning puutuja on y − 9 = 6(x − 3) ehk y = 6x − 9.",
            sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
          },
          {
            id: 'form-et-4',
            label: 'Hetkkiirus ja hetkkiirendus',
            expression: "v(t) = s'(t),   a(t) = v'(t) = s''(t)",
            symbols: 's(t) — teepikkus; t — aeg; v(t) — hetkkiirus; a(t) — hetkkiirendus',
            units: 's: meeter (m), t: sekund (s), v: m/s, a: m/s²',
            example: 'Kui s(t) = 5t², siis v(t) = 10t (m/s) ja kiirendus a(t) = 10 (m/s²).',
            sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
          }
        ]
      },
      {
        id: 'topic-et-3',
        title: 'Põhivalemid ja aritmeetilised diferentseerimisreeglid',
        sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' },
        summary:
          'Keerukamate avaldiste diferentseerimiseks kombineeritakse elementaarfunktsioonide tuletiste tabelit summa, korrutise ja jagatise diferentseerimisreeglitega.',
        bulletPoints: [
          'Konstandi tuletis on alati 0; astmefunktsiooni xⁿ tuletis on n·xⁿ⁻¹.',
          "Eksponentfunktsioon eˣ on ainulaadne, kuna tema tuletis võrdub funktsiooni endaga: (eˣ)' = eˣ.",
          "Korrutise diferentseerimisel kehtib valem (u·v)' = u'v + uv'.",
          "Jagatise tuletise lugejas on vahe u'v − uv' ja nimetajas nimetaja ruut v²."
        ],
        concepts: [
          {
            term: 'Korrutise reegel',
            definition: 'Kahe funktsiooni korrutise tuletis on esimese tuletis korda teine pluss esimene korda teise tuletis.'
          },
          {
            term: 'Jagatise reegel',
            definition: "Murru tuletis leitakse valemiga (u'v − uv') / v², kus v(x) ≠ 0."
          }
        ],
        formulas: [
          {
            id: 'form-et-5',
            label: 'Astmefunktsiooni, eksponendi ja logaritmi tuletis',
            expression: "(xⁿ)' = n·xⁿ⁻¹,   (ln x)' = 1/x,   (eˣ)' = eˣ",
            symbols: 'n — astmenäitaja (reaalarv); e — Euleri arv (≈ 2.718); ln — naturaallogaritm',
            units: 'Arvuline / ühikuta',
            example: "(x⁵)' = 5x⁴;  (3x²)' = 6x.",
            sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
          },
          {
            id: 'form-et-6',
            label: 'Korrutise ja jagatise diferentseerimisreegel',
            expression: "(u · v)' = u'v + uv',   (u / v)' = (u'v − uv') / v²",
            symbols: "u, v — diferentseeruvad funktsioonid argumendist x; u', v' — nende tuletised",
            units: 'Ühikuta',
            example: "(x · eˣ)' = (x)'·eˣ + x·(eˣ)' = 1·eˣ + x·eˣ = eˣ(1 + x).",
            sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
          }
        ]
      },
      {
        id: 'topic-et-4',
        title: 'Ahelreegel ja funktsiooni ekstreemumid',
        sourceRef: { type: 'slide', number: 4, label: 'Slaidid 4–5' },
        summary:
          'Liitfunktsiooni f(g(x)) tuletis leitakse ahelreegliga, korrutades välisfunktsiooni tuletise sisefunktsiooni tuletisega. Tuletise märk määrab funktsiooni kasvamise ja kahanemise vahemikud ning lokaalsed ekstreemumid.',
        bulletPoints: [
          'Ahelreegel: diferentseeri esmalt välimine funktsioon (hoides sisemist muutmata) ja korruta sisemise funktsiooni tuletisega.',
          "Kui f'(x) > 0, siis funktsioon kasvab; kui f'(x) < 0, siis funktsioon kahaneb.",
          "Statsionaarses punktis kehtib f'(x₀) = 0.",
          'Üleminek tuletise märgilt + märgile − tähistab lokaalset maksimumi; üleminek − pealt + peale lokaalset miinimumi.'
        ],
        concepts: [
          {
            term: 'Ahelreegel',
            definition: "Liitfunktsiooni diferentseerimise eeskiri (f(g(x)))' = f'(g(x)) · g'(x)."
          },
          {
            term: 'Statsionaarne punkt',
            definition: "Funktsiooni määramispiirkonna punkt x₀, milles esimene tuletis võrdub nulliga: f'(x₀) = 0."
          },
          {
            term: 'Lokaalne ekstreemum',
            definition: 'Lokaalne maksimum või miinimum, kus funktsiooni kasvamine asendub kahanemisega või vastupidi.'
          }
        ],
        formulas: [
          {
            id: 'form-et-7',
            label: 'Liitfunktsiooni tuletis (ahelreegel)',
            expression: "(f(g(x)))' = f'(g(x)) · g'(x)",
            symbols: 'f(u) — välisfunktsioon; u = g(x) — sisefunktsioon',
            units: 'Ühikuta',
            example: "(sin(4x))' = cos(4x) · (4x)' = 4·cos(4x).",
            sourceRef: { type: 'slide', number: 4, label: 'Slaid 4' }
          },
          {
            id: 'form-et-8',
            label: 'Ekstreemumi tarvilik tingimus (statsionaarne punkt)',
            expression: "f'(x₀) = 0",
            symbols: 'x₀ — statsionaarne punkt; f\'\'(x₀) < 0 ⇒ maksimum, f\'\'(x₀) > 0 ⇒ miinimum',
            units: 'Ühikuta',
            example: "Funktsiooni f(x) = x² − 6x korral f'(x) = 2x − 6 = 0 ⇒ x₀ = 3 (miinimum).",
            sourceRef: { type: 'slide', number: 5, label: 'Slaid 5' }
          }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-et-1',
        topicId: 'topic-et-1',
        question: 'Kuidas defineeritakse funktsiooni f(x) tuletis punktis x₀ piirväärtuse kaudu?',
        answer: "f'(x₀) = lim(Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ], ehk funktsiooni muudu ja argumendi muudu suhte piirväärtus, kui Δx → 0.",
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
      },
      {
        id: 'fc-et-2',
        topicId: 'topic-et-2',
        question: "Mis on tuletise f'(x₀) geomeetriline tähendus?",
        answer: "Tuletis f'(x₀) võrdub funktsiooni y = f(x) graafiku puutuja tõusuga k = tan(α) punktis (x₀, f(x₀)).",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fc-et-3',
        topicId: 'topic-et-2',
        question: 'Milline on funktsiooni graafiku puutuja võrrand punktis (x₀, f(x₀))?',
        answer: "y − f(x₀) = f'(x₀) · (x − x₀)",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fc-et-4',
        topicId: 'topic-et-2',
        question: 'Kuidas on teepikkuse funktsioon s(t) seotud keha hetkkiiruse v(t) ja hetkkiirendusega a(t)?',
        answer: "Hetkkiirus on teepikkuse esimene tuletis v(t) = s'(t) ja hetkkiirendus on teepikkuse teine tuletis a(t) = v'(t) = s''(t).",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fc-et-5',
        topicId: 'topic-et-3',
        question: "Milline on kahe diferentseeruva funktsiooni korrutise (u · v)' tuletise valem?",
        answer: "(u · v)' = u'v + uv' (esimese tuletis korda teine pluss esimene korda teise tuletis).",
        sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
      },
      {
        id: 'fc-et-6',
        topicId: 'topic-et-3',
        question: "Milline on jagatise (u / v)' diferentseerimise valem?",
        answer: "(u / v)' = (u'v − uv') / v², kus v(x) ≠ 0.",
        sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
      },
      {
        id: 'fc-et-7',
        topicId: 'topic-et-4',
        question: 'Kuidas kõlab liitfunktsiooni y = f(g(x)) diferentseerimise ahelreegel?',
        answer: "(f(g(x)))' = f'(g(x)) · g'(x) — välisfunktsiooni tuletis (siseavaldist muutmata) korda sisefunktsiooni tuletis.",
        sourceRef: { type: 'slide', number: 4, label: 'Slaid 4' }
      },
      {
        id: 'fc-et-8',
        topicId: 'topic-et-4',
        question: 'Kuidas teha esimese tuletise märgi abil kindlaks, kas statsionaarses punktis x₀ on lokaalne maksimum või miinimum?',
        answer: "Kui punktist x₀ läbimisel muutub f'(x) märk plussilt miinusele (+ → −), on seal lokaalne maksimum; kui miinuselt plussile (− → +), siis lokaalne miinimum.",
        sourceRef: { type: 'slide', number: 5, label: 'Slaid 5' }
      }
    ],
    exercises: [
      {
        id: 'ex-et-1',
        topicId: 'topic-et-2',
        type: 'multiple_choice',
        question: "Mida näitab funktsiooni y = f(x) tuletise väärtus f'(2) = −3 geomeetriliselt?",
        hint: 'Meenuta seost tuletise ja funktsiooni graafiku puutuja tõusu k vahel.',
        options: [
          'Funktsiooni graafiku puutuja punktis x = 2 on tõusuga k = −3 ning funktsioon selles kohas kahaneb.',
          'Funktsiooni väärtus punktis x = 2 on võrdne −3-ga ehk f(2) = −3.',
          'Funktsiooni graafik lõikab y-telge punktis (0, −3).',
          'Funktsioonil on punktis x = 2 lokaalne miinimum.'
        ],
        correctIndex: 0,
        steps: [
          "Tuletise geomeetrilise tähenduse põhjal võrdub f'(x₀) graafiku puutuja tõusuga k punktis x₀.",
          "Kuna f'(2) = −3, on puutuja tõus k = −3.",
          'Negatiivne tuletis tähendab ühtlasi, et funktsioon selles punktis kahaneb.'
        ],
        explanation:
          "Geomeetriliselt võrdub tuletis f'(x₀) puutuja tõusuga k punktis x₀. Kuna f'(2) = −3 < 0, on puutuja tõus −3 ja funktsioon selles punktis kahaneb.",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'ex-et-2',
        topicId: 'topic-et-3',
        type: 'calculation',
        templateType: 'poly_deriv_eval',
        question: "Arvutusülesanne: Leia funktsiooni f(x) = 3x⁴ − 5x² + 7x − 12 tuletis f'(x) ning arvuta tuletise täpne arvväärtus punktis x = 1.",
        hint: "Kasuta astmefunktsiooni valemit (xⁿ)' = n·xⁿ⁻¹ liikmete kaupa ja asenda lõpus x = 1.",
        expectedAnswer: '9',
        acceptedAnswers: ['9', "f'(1)=9", "f'(1) = 9"],
        options: [
          "f'(x) = 12x³ − 10x + 7  ning  f'(1) = 9",
          "f'(x) = 12x³ − 5x + 7  ning  f'(1) = 14",
          "f'(x) = 3x³ − 10x + 7  ning  f'(1) = 0",
          "f'(x) = 12x⁴ − 10x² + 7  ning  f'(1) = 9"
        ],
        correctIndex: 0,
        steps: [
          "1. Diferentseerime polünoomi liikmete kaupa: (3x⁴)' = 12x³, (−5x²)' = −10x, (7x)' = 7, (−12)' = 0.",
          "2. Saame tuletisfunktsiooni: f'(x) = 12x³ − 10x + 7.",
          "3. Asendame x = 1: f'(1) = 12·(1)³ − 10·(1) + 7 = 12 − 10 + 7 = 9."
        ],
        explanation:
          "Diferentseerides liikmete kaupa saame f'(x) = 12x³ − 10x + 7. Asendades x = 1: f'(1) = 12 − 10 + 7 = 9.",
        sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
      },
      {
        id: 'ex-et-3',
        topicId: 'topic-et-1',
        type: 'short_answer',
        question: 'Lühivastus: Kuidas nimetatakse funktsiooni muudu ja argumendi muudu suhte piirväärtust, kui argumendi muut Δx läheneb nullile?',
        hint: 'See on käesoleva loengu keskne põhimõiste (tähistatakse f\'(x₀)).',
        expectedAnswer: 'tuletis',
        acceptedAnswers: ['tuletis', 'funktsiooni tuletis', 'tuletiseks', "f'(x)", "f'(x0)"],
        options: [
          'Funktsiooni tuletis punktis x₀',
          'Funktsiooni algfunktsioon',
          'Keskmine muutumiskiirus',
          'Funktsiooni pidevus'
        ],
        correctIndex: 0,
        steps: [
          '1. Suhe Δy / Δx kirjeldab keskmist muutumiskiirust lõigul [x₀, x₀ + Δx].',
          '2. Võttes piirväärtuse protsessil Δx → 0, saame hetkelise muutumiskiiruse.',
          "3. Seda piirväärtust nimetatakse funktsiooni tuletiseks punktis x₀ (tähis f'(x₀))."
        ],
        explanation:
          "Funktsiooni muudu Δy ja argumendi muudu Δx suhte piirväärtust, kui Δx → 0, nimetatakse funktsiooni tuletiseks punktis x₀.",
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
      },
      {
        id: 'ex-et-4',
        topicId: 'topic-et-2',
        type: 'calculation',
        templateType: 'kinematics_vel',
        question: 'Arvutusülesanne: Punktmass liigub sirgjooneliselt seaduse s(t) = t³ − 6t² + 15t (meetrit) järgi. Arvuta keha hetkkiirus v(3) (m/s) ajahetkel t = 3 s.',
        hint: "Hetkkiirus on teepikkuse esimene tuletis: v(t) = s'(t). Leia tuletis ja asenda t = 3.",
        expectedAnswer: '6',
        acceptedAnswers: ['6', '6 m/s', 'v(3)=6', '6m/s'],
        options: [
          'v(3) = 6 m/s',
          'v(3) = 18 m/s',
          'v(3) = 9 m/s',
          'v(3) = 15 m/s'
        ],
        correctIndex: 0,
        steps: [
          "1. Leiame kiiruse funktsiooni kui teepikkuse tuletise: v(t) = s'(t) = (t³ − 6t² + 15t)' = 3t² − 12t + 15.",
          '2. Asendame ajahetke t = 3 s: v(3) = 3·(3)² − 12·(3) + 15.',
          '3. Arvutame: v(3) = 27 − 36 + 15 = 6 m/s.'
        ],
        explanation:
          "Hetkkiirus v(t) = s'(t) = 3t² − 12t + 15. Ajahetkel t = 3 s: v(3) = 27 − 36 + 15 = 6 m/s.",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'ex-et-5',
        topicId: 'topic-et-4',
        type: 'application',
        question: 'Rakendusülesanne: Leia ahelreegli abil liitfunktsiooni f(x) = ln(x² + 4) tuletis.',
        hint: 'Välisfunktsioon on ln(u) tuletisega 1/u ja sisefunktsioon on u = x² + 4.',
        options: [
          "f'(x) = 2x / (x² + 4)",
          "f'(x) = 1 / (x² + 4)",
          "f'(x) = 2x · ln(x² + 4)",
          "f'(x) = 1 / (2x)"
        ],
        correctIndex: 0,
        steps: [
          '1. Eristame välisfunktsiooni ln(u) ja sisefunktsiooni u = x² + 4.',
          '2. Välisfunktsiooni tuletis u järgi on 1 / u = 1 / (x² + 4).',
          '3. Korrutame sisefunktsiooni tuletisega (x² + 4)\' = 2x ning saame 2x / (x² + 4).'
        ],
        explanation:
          "Ahelreegli (f(g(x)))' = f'(g(x))·g'(x) põhjal: (ln(x² + 4))' = (1 / (x² + 4)) · (x² + 4)' = 2x / (x² + 4).",
        sourceRef: { type: 'slide', number: 4, label: 'Slaid 4' }
      },
      {
        id: 'ex-et-6',
        topicId: 'topic-et-4',
        type: 'calculation',
        templateType: 'stationary_min',
        question: 'Arvutusülesanne: Leia funktsiooni f(x) = x² − 6x + 8 lokaalse miinimumi abstsiss x₀ (st punkt x, kus tuletis võrdub nulliga).',
        hint: "Leia tuletis f'(x), võrdsusta see nulliga f'(x) = 0 ja lahenda võrrand x suhtes.",
        expectedAnswer: '3',
        acceptedAnswers: ['3', 'x=3', 'x = 3', 'x0=3'],
        options: [
          'x₀ = 3',
          'x₀ = −3',
          'x₀ = 6',
          'x₀ = 8'
        ],
        correctIndex: 0,
        steps: [
          "1. Leiame funktsiooni esimese tuletise: f'(x) = (x² − 6x + 8)' = 2x − 6.",
          '2. Lokaalses ekstreemumipunktis kehtib Fermat\' tingimus f\'(x₀) = 0 ⇒ 2x − 6 = 0.',
          '3. Lahendame võrrandi: 2x = 6 ⇒ x₀ = 3. Kuna f\'\'(x) = 2 > 0, on tegemist miinimumiga.'
        ],
        explanation:
          "Leiame tuletise: f'(x) = 2x − 6 = 0 ⇒ x = 3. Kuna tuletise märk muutub punktis x = 3 miinuselt plussile, on seal lokaalne miinimum.",
        sourceRef: { type: 'slide', number: 5, label: 'Slaid 5' }
      },
      {
        id: 'ex-et-7',
        topicId: 'topic-et-3',
        type: 'multiple_choice',
        question: 'Milline on funktsiooni y = x² · eˣ tuletis korrutise diferentseerimisreegli põhjal?',
        hint: "Kasuta valemit (u·v)' = u'v + uv', kus u = x² ja v = eˣ.",
        options: [
          "y' = 2x · eˣ + x² · eˣ = eˣ(2x + x²)",
          "y' = 2x · eˣ",
          "y' = 2x + eˣ",
          "y' = x² · eˣ − 2x · eˣ"
        ],
        correctIndex: 0,
        steps: [
          "1. Valime u = x² (tuletis u' = 2x) ja v = eˣ (tuletis v' = eˣ).",
          "2. Rakendame korrutise valemit u'v + uv': 2x·eˣ + x²·eˣ.",
          "3. Toome ühise teguri eˣ sulgude ette: eˣ(2x + x²)."
        ],
        explanation:
          "Korrutise reegli (u·v)' = u'v + uv' järgi, kus u = x² (u' = 2x) ja v = eˣ (v' = eˣ), saame y' = 2x·eˣ + x²·eˣ = eˣ(2x + x²).",
        sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
      },
      {
        id: 'ex-et-8',
        topicId: 'topic-et-1',
        type: 'calculation',
        templateType: 'tangent_slope',
        question: 'Arvutusülesanne: Leia funktsiooni f(x) = x² + 4x − 1 graafiku puutuja tõus k punktis x₀ = 2.',
        hint: "Puutuja tõus k võrdub tuletise väärtusega punktis x₀: k = f'(2).",
        expectedAnswer: '8',
        acceptedAnswers: ['8', 'k=8', 'k = 8'],
        options: [
          'k = 8',
          'k = 11',
          'k = 4',
          'k = 6'
        ],
        correctIndex: 0,
        steps: [
          "1. Puutuja tõus antud punktis võrdub funktsiooni tuletisega selles punktis: k = f'(x₀).",
          "2. Leiame tuletise: f'(x) = (x² + 4x − 1)' = 2x + 4.",
          "3. Arvutame väärtuse kohal x₀ = 2: k = f'(2) = 2·2 + 4 = 8."
        ],
        explanation:
          "Puutuja tõus k = f'(x₀). Kuna f'(x) = 2x + 4, siis punktis x₀ = 2 on tõus k = 2(2) + 4 = 8.",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      }
    ]
  },
  {
    id: 'sample-tuletised-en',
    isSample: true,
    pairedSampleId: 'sample-tuletised-et',
    title: 'Tuletised / Derivatives — Rate of Change & Differentiation Rules',
    subject: 'Matemaatiline analüüs',
    fileName: 'Lecture_04_Derivatives_EN.pdf',
    fileType: 'PDF',
    contentLang: 'en',
    createdAt: '2026-11-05T10:05:00.000Z',
    lastOpenedAt: '2026-11-07T14:20:00.000Z',
    enabledFeatures: { ...DEFAULT_ENABLED_FEATURES },
    pages: [
      {
        pageNumber: 1,
        unitType: 'page',
        title: 'Page 1: Difference Quotient & Definition of the Derivative',
        content: `LECTURE 4: DERIVATIVES AND DIFFERENTIATION
1. Average Rate of Change and the Derivative

Let y = f(x) be defined on an open interval containing x₀.
When the independent variable changes by Δx, the increment of the function is:
Δy = f(x₀ + Δx) − f(x₀)

The average rate of change on the interval [x₀, x₀ + Δx] is the difference quotient:
Δy / Δx = (f(x₀ + Δx) − f(x₀)) / Δx

The derivative of f at x₀ is the instantaneous rate of change, defined as the limit:
f'(x₀) = lim (Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ]

If this limit exists and is finite, the function f(x) is said to be differentiable at x₀.`
      },
      {
        pageNumber: 2,
        unitType: 'page',
        title: 'Page 2: Geometric and Physical Interpretations',
        content: `2. Geometric and Physical Meaning of the Derivative

Geometric Interpretation:
The derivative f'(x₀) equals the slope k = tan(α) of the tangent line to the graph y = f(x) at the point (x₀, f(x₀)).
Tangent line equation at (x₀, f(x₀)):
y − f(x₀) = f'(x₀) · (x − x₀)

Physical (Kinematic) Interpretation:
If s = s(t) denotes the position of a moving object as a function of time t:
• The first derivative v(t) = s'(t) represents instantaneous velocity at time t.
• The second derivative a(t) = v'(t) = s''(t) represents instantaneous acceleration at time t.`
      },
      {
        pageNumber: 3,
        unitType: 'page',
        title: 'Page 3: Elementary Derivatives and Differentiation Rules',
        content: `3. Core Derivative Formulas and Algebraic Rules

Elementary Derivatives:
• Constant: (C)' = 0
• Power Rule: (xⁿ)' = n · xⁿ⁻¹
• Exponential: (eˣ)' = eˣ  and  (aˣ)' = aˣ · ln(a)
• Natural Logarithm: (ln x)' = 1 / x
• Trigonometric: (sin x)' = cos x,  (cos x)' = −sin x,  (tan x)' = 1 / cos²x

Differentiation Rules (for differentiable functions u(x) and v(x)):
• Sum / Difference Rule: (u ± v)' = u' ± v'
• Constant Multiple Rule: (c · u)' = c · u'
• Product Rule: (u · v)' = u'v + uv'
• Quotient Rule: (u / v)' = (u'v − uv') / v²   (where v ≠ 0)`
      },
      {
        pageNumber: 4,
        unitType: 'page',
        title: 'Page 4: The Chain Rule and Extrema Analysis',
        content: `4. Composite Functions (Chain Rule) & Local Extrema

The Chain Rule:
If y = f(u) and u = g(x) are differentiable, then the derivative of the composite function y = f(g(x)) is:
(f(g(x)))' = f'(g(x)) · g'(x)   or   dy/dx = (dy/du) · (du/dx)

Monotonicity & First Derivative Test:
• If f'(x) > 0 on (a, b), then f(x) is strictly increasing on (a, b).
• If f'(x) < 0 on (a, b), then f(x) is strictly decreasing on (a, b).
• Stationary points satisfy f'(x₀) = 0.
• If f'(x) changes sign from + to − at x₀, f has a local maximum at x₀.
• If f'(x) changes sign from − to + at x₀, f has a local minimum at x₀.`
      }
    ],
    topics: [
      {
        id: 'topic-en-1',
        title: 'Definition of the Derivative & Differentiability',
        sourceRef: { type: 'page', number: 1, label: 'Page 1' },
        summary:
          'The derivative of a function at a point measures the instantaneous rate at which the output changes with respect to the input. It is defined as the limit of the difference quotient Δy / Δx as Δx approaches zero.',
        bulletPoints: [
          'The average rate of change over [x₀, x₀ + Δx] is the slope of the secant line Δy / Δx.',
          "Taking the limit as Δx → 0 yields the instantaneous rate of change f'(x₀).",
          'A function is differentiable at x₀ if and only if this limit exists and is finite.',
          'Every differentiable function is continuous at that point.'
        ],
        concepts: [
          {
            term: 'Difference Quotient (Δy / Δx)',
            definition: 'The average rate of change (f(x₀ + Δx) − f(x₀)) / Δx over an interval.'
          },
          {
            term: 'Derivative at x₀',
            definition: 'The limit lim(Δx→0) (f(x₀+Δx)−f(x₀))/Δx representing instantaneous rate of change.'
          },
          {
            term: 'Differentiability',
            definition: 'The property of a function having a well-defined finite derivative at a point.'
          }
        ],
        formulas: [
          {
            id: 'form-en-1',
            label: 'Limit Definition of Derivative',
            expression: "f'(x₀) = lim(Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ]",
            symbols: 'Δx — input increment; f(x₀ + Δx) − f(x₀) — output change Δy',
            units: 'Output unit per input unit',
            example: "For f(x) = x², f'(x₀) = lim(Δx→0) (2x₀ + Δx) = 2x₀.",
            sourceRef: { type: 'page', number: 1, label: 'Page 1' }
          }
        ]
      },
      {
        id: 'topic-en-2',
        title: 'Geometric and Kinematic Interpretations',
        sourceRef: { type: 'page', number: 2, label: 'Page 2' },
        summary:
          "Geometrically, f'(x₀) gives the slope of the tangent line to the curve y = f(x) at x₀. In physics, the first derivative of position with respect to time is instantaneous velocity, and the second derivative is acceleration.",
        bulletPoints: [
          "Slope of the tangent line at (x₀, f(x₀)) is k = tan(α) = f'(x₀).",
          "A horizontal tangent occurs wherever f'(x₀) = 0.",
          'Instantaneous velocity v(t) is the first derivative of position s(t) with respect to time.',
          'Instantaneous acceleration a(t) is the derivative of velocity.'
        ],
        concepts: [
          {
            term: 'Tangent Line Slope',
            definition: "The steepness k = f'(x₀) of the line locally touching the curve at (x₀, f(x₀))."
          },
          {
            term: 'Instantaneous Velocity v(t)',
            definition: "First derivative of displacement with respect to time: v(t) = s'(t)."
          }
        ],
        formulas: [
          {
            id: 'form-en-2',
            label: 'Tangent Line Equation',
            expression: "y − f(x₀) = f'(x₀) · (x − x₀)",
            symbols: "(x₀, f(x₀)) — point of tangency; f'(x₀) — slope k",
            units: 'Dimensionless (Cartesian plane)',
            example: "For f(x) = x² at x₀ = 2: f(2) = 4, f'(2) = 4 ⇒ y − 4 = 4(x − 2).",
            sourceRef: { type: 'page', number: 2, label: 'Page 2' }
          },
          {
            id: 'form-en-3',
            label: 'Velocity & Acceleration',
            expression: "v(t) = s'(t),   a(t) = v'(t) = s''(t)",
            symbols: 's(t) — position; v(t) — instantaneous velocity; a(t) — acceleration',
            units: 's: meters (m), v: m/s, a: m/s²',
            example: 'If s(t) = 3t², then v(t) = 6t m/s and a(t) = 6 m/s².',
            sourceRef: { type: 'page', number: 2, label: 'Page 2' }
          }
        ]
      },
      {
        id: 'topic-en-3',
        title: 'Elementary Derivatives, Product & Quotient Rules',
        sourceRef: { type: 'page', number: 3, label: 'Page 3' },
        summary:
          'Standard differentiation rules allow computing derivatives of polynomials, exponentials, logarithms, products, and quotients without evaluating limits from scratch.',
        bulletPoints: [
          "Power rule reduces the exponent by one: (xⁿ)' = n·xⁿ⁻¹.",
          "The natural exponential function is its own derivative: (eˣ)' = eˣ.",
          'Product rule: differentiate the first factor times the second, plus the first times the derivative of the second.',
          "Quotient rule: (u'v − uv') / v² for any differentiable numerator u and non-zero denominator v."
        ],
        concepts: [
          {
            term: 'Product Rule',
            definition: "Formula for the derivative of a product of two functions: (uv)' = u'v + uv'."
          },
          {
            term: 'Quotient Rule',
            definition: "Formula for the derivative of a ratio of two functions: (u/v)' = (u'v − uv') / v²."
          }
        ],
        formulas: [
          {
            id: 'form-en-4',
            label: 'Power, Exponential & Log Rules',
            expression: "(xⁿ)' = n·xⁿ⁻¹,   (eˣ)' = eˣ,   (ln x)' = 1/x",
            symbols: 'n — real exponent; e — Euler’s number; ln — natural log',
            units: 'Dimensionless',
            example: "(x⁴)' = 4x³.",
            sourceRef: { type: 'page', number: 3, label: 'Page 3' }
          },
          {
            id: 'form-en-5',
            label: 'Product & Quotient Rules',
            expression: "(u · v)' = u'v + uv',   (u / v)' = (u'v − uv') / v²",
            symbols: "u(x), v(x) — differentiable functions; u', v' — first derivatives",
            units: 'Dimensionless',
            example: "(x²·eˣ)' = 2x·eˣ + x²·eˣ.",
            sourceRef: { type: 'page', number: 3, label: 'Page 3' }
          }
        ]
      },
      {
        id: 'topic-en-4',
        title: 'Chain Rule & Local Extrema Analysis',
        sourceRef: { type: 'page', number: 4, label: 'Page 4' },
        summary:
          "The Chain Rule differentiates composite functions by multiplying the outer derivative evaluated at the inner function by the inner derivative. Sign analysis of f'(x) identifies intervals of increase/decrease and local extrema.",
        bulletPoints: [
          "Chain rule: (f(g(x)))' = f'(g(x)) · g'(x).",
          "Positive derivative (f' > 0) means increasing; negative derivative (f' < 0) means decreasing.",
          "Stationary points occur where f'(x₀) = 0.",
          'First Derivative Test: sign change + to − indicates a local maximum; − to + indicates a local minimum.'
        ],
        concepts: [
          {
            term: 'Chain Rule',
            definition: 'Method for differentiating composite functions: dy/dx = (dy/du) · (du/dx).'
          },
          {
            term: 'Stationary Point',
            definition: "An interior point x₀ in the domain where f'(x₀) = 0."
          }
        ],
        formulas: [
          {
            id: 'form-en-6',
            label: 'Chain Rule',
            expression: "(f(g(x)))' = f'(g(x)) · g'(x)",
            symbols: 'f — outer function; g — inner function',
            units: 'Dimensionless',
            example: "(ln(x² + 4))' = (1/(x² + 4)) · 2x = 2x/(x² + 4).",
            sourceRef: { type: 'page', number: 4, label: 'Page 4' }
          }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-en-1',
        topicId: 'topic-en-1',
        question: "How is the derivative f'(x₀) formally defined using a limit?",
        answer: "f'(x₀) = lim(Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ], the limit of the difference quotient as Δx approaches 0.",
        sourceRef: { type: 'page', number: 1, label: 'Page 1' }
      },
      {
        id: 'fc-en-2',
        topicId: 'topic-en-2',
        question: "What is the geometric interpretation of the derivative f'(x₀)?",
        answer: 'It equals the slope k = tan(α) of the tangent line to the graph y = f(x) at the point (x₀, f(x₀)).',
        sourceRef: { type: 'page', number: 2, label: 'Page 2' }
      },
      {
        id: 'fc-en-3',
        topicId: 'topic-en-2',
        question: 'What is the equation of the tangent line to y = f(x) at x = x₀?',
        answer: "y − f(x₀) = f'(x₀) · (x − x₀)",
        sourceRef: { type: 'page', number: 2, label: 'Page 2' }
      },
      {
        id: 'fc-en-4',
        topicId: 'topic-en-3',
        question: 'State the Product Rule for differentiable functions u(x) and v(x).',
        answer: "(u · v)' = u'v + uv'",
        sourceRef: { type: 'page', number: 3, label: 'Page 3' }
      },
      {
        id: 'fc-en-5',
        topicId: 'topic-en-3',
        question: 'State the Quotient Rule for differentiable functions u(x) and v(x) ≠ 0.',
        answer: "(u / v)' = (u'v − uv') / v²",
        sourceRef: { type: 'page', number: 3, label: 'Page 3' }
      },
      {
        id: 'fc-en-6',
        topicId: 'topic-en-4',
        question: 'How do you differentiate a composite function y = f(g(x)) using the Chain Rule?',
        answer: "(f(g(x)))' = f'(g(x)) · g'(x) — multiply the derivative of the outer function (evaluated at the inner function) by the derivative of the inner function.",
        sourceRef: { type: 'page', number: 4, label: 'Page 4' }
      }
    ],
    exercises: [
      {
        id: 'ex-en-1',
        topicId: 'topic-en-2',
        type: 'multiple_choice',
        question: "What does f'(2) = −3 tell you geometrically about the graph of y = f(x)?",
        hint: "Recall the connection between f'(x₀) and the tangent line slope.",
        options: [
          'The tangent line to the graph at x = 2 has slope −3, and the function is decreasing there.',
          'The y-value of the function at x = 2 is −3.',
          'The graph crosses the y-axis at (0, −3).',
          'The function has a local minimum at x = 2.'
        ],
        correctIndex: 0,
        steps: [
          "1. By geometric definition, f'(x₀) is the slope k of the tangent line at x = x₀.",
          "2. Since f'(2) = −3 < 0, the slope is −3 and the function is strictly decreasing at x = 2."
        ],
        explanation:
          "The derivative f'(x₀) gives the slope of the tangent line at x₀. Because f'(2) = −3 < 0, the tangent line has slope −3 and the function is decreasing at x = 2.",
        sourceRef: { type: 'page', number: 2, label: 'Page 2' }
      },
      {
        id: 'ex-en-2',
        topicId: 'topic-en-3',
        type: 'calculation',
        templateType: 'poly_deriv_eval',
        question: "Calculation Problem: Find the derivative of f(x) = 3x⁴ − 5x² + 7x − 12 and compute the exact numerical value of f'(1).",
        hint: "Apply the Power Rule (xⁿ)' = n·xⁿ⁻¹ term by term, then plug in x = 1.",
        expectedAnswer: '9',
        acceptedAnswers: ['9', "f'(1)=9", "f'(1) = 9"],
        options: [
          "f'(x) = 12x³ − 10x + 7  and  f'(1) = 9",
          "f'(x) = 12x³ − 5x + 7  and  f'(1) = 14",
          "f'(x) = 3x³ − 10x + 7  and  f'(1) = 0",
          "f'(x) = 12x⁴ − 10x² + 7  and  f'(1) = 9"
        ],
        correctIndex: 0,
        steps: [
          "1. Differentiate term by term: (3x⁴)' = 12x³, (−5x²)' = −10x, (7x)' = 7, (−12)' = 0.",
          "2. Combine: f'(x) = 12x³ − 10x + 7.",
          "3. Substitute x = 1: f'(1) = 12(1)³ − 10(1) + 7 = 9."
        ],
        explanation:
          "Differentiating term-by-term gives f'(x) = 12x³ − 10x + 7. Substituting x = 1 yields f'(1) = 12 − 10 + 7 = 9.",
        sourceRef: { type: 'page', number: 3, label: 'Page 3' }
      },
      {
        id: 'ex-en-3',
        topicId: 'topic-en-1',
        type: 'short_answer',
        question: 'Short Answer: What is the mathematical name for the limit of the difference quotient Δy / Δx as Δx approaches 0?',
        hint: 'It represents the instantaneous rate of change of a function.',
        expectedAnswer: 'derivative',
        acceptedAnswers: ['derivative', 'the derivative', "f'(x)", 'instantaneous rate of change'],
        options: [
          'The derivative',
          'The antiderivative',
          'The secant slope',
          'Continuity'
        ],
        correctIndex: 0,
        steps: [
          '1. The ratio Δy / Δx is the average rate of change.',
          '2. Taking the limit as Δx → 0 yields the instantaneous rate of change, called the derivative.'
        ],
        explanation:
          'The limit lim(Δx→0) (f(x₀+Δx)−f(x₀))/Δx is defined as the derivative of f at x₀.',
        sourceRef: { type: 'page', number: 1, label: 'Page 1' }
      },
      {
        id: 'ex-en-4',
        topicId: 'topic-en-4',
        type: 'calculation',
        templateType: 'stationary_min',
        question: 'Calculation Problem: At which x-coordinate x₀ does f(x) = x² − 6x + 8 attain its local minimum?',
        hint: "Set the first derivative f'(x) = 0 and solve for x.",
        expectedAnswer: '3',
        acceptedAnswers: ['3', 'x=3', 'x = 3'],
        options: [
          'x₀ = 3',
          'x₀ = −3',
          'x₀ = 6',
          'x₀ = 0'
        ],
        correctIndex: 0,
        steps: [
          "1. Compute the first derivative: f'(x) = 2x − 6.",
          "2. Set f'(x) = 0 ⇒ 2x − 6 = 0 ⇒ x = 3.",
          "3. Since f''(x) = 2 > 0, x = 3 is a local minimum."
        ],
        explanation:
          "Setting f'(x) = 2x − 6 = 0 gives x = 3. Since f'(x) changes sign from − to +, x = 3 is a local minimum.",
        sourceRef: { type: 'page', number: 4, label: 'Page 4' }
      }
    ]
  }
];
