export const DEFAULT_ENABLED_FEATURES = {
  summary: true,
  figures: true,
  flashcards: true,
  exercises: true,
  quickTest: true,
  shortCalc: true,
  formulaSheet: true,
  spacedRepetition: true,
  mockExam: true
};

const SVG_SECANT_TO_TANGENT = `<svg viewBox="0 0 520 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funktsiooni muut ja lõikaja">
  <rect width="520" height="270" rx="12" fill="#FBF8F3"/>
  <!-- Grid -->
  <g stroke="#E6DEC8" stroke-width="1">
    <line x1="60" y1="40" x2="60" y2="230"/>
    <line x1="60" y1="230" x2="480" y2="230"/>
    <line x1="160" y1="40" x2="160" y2="230" stroke-dasharray="4 4"/>
    <line x1="340" y1="40" x2="340" y2="230" stroke-dasharray="4 4"/>
    <line x1="60" y1="180" x2="340" y2="180" stroke-dasharray="4 4"/>
    <line x1="60" y1="75" x2="340" y2="75" stroke-dasharray="4 4"/>
  </g>
  <!-- Axes arrows & labels -->
  <polygon points="485,230 475,225 475,235" fill="#5A4638"/>
  <polygon points="60,35 55,45 65,45" fill="#5A4638"/>
  <text x="475" y="250" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#5A4638">x</text>
  <text x="40" y="45" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#5A4638">y</text>
  <!-- Curve y = f(x) -->
  <path d="M 80 205 Q 210 190 390 42" fill="none" stroke="#3F6A52" stroke-width="3.2"/>
  <text x="398" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#3F6A52">y = f(x)</text>
  <!-- Secant line (lõikaja) -->
  <line x1="110" y1="209" x2="385" y2="49" stroke="#8C5A3C" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="215" y="108" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#8C5A3C">Lõikaja (Δy / Δx)</text>
  <!-- Tangent line at x0 (puutuja) -->
  <line x1="95" y1="202" x2="310" y2="130" stroke="#2D5A40" stroke-width="2"/>
  <text x="245" y="162" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#2D5A40">Puutuja (Δx → 0)</text>
  <!-- Delta x and Delta y brackets -->
  <line x1="160" y1="180" x2="340" y2="180" stroke="#A65E2E" stroke-width="2.2"/>
  <line x1="340" y1="180" x2="340" y2="75" stroke="#B84A39" stroke-width="2.5"/>
  <text x="235" y="198" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#A65E2E">Δx</text>
  <text x="350" y="133" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#B84A39">Δy = f(x₀+Δx) − f(x₀)</text>
  <!-- Points A and B -->
  <circle cx="160" cy="180" r="5.5" fill="#3F6A52" stroke="#fff" stroke-width="1.5"/>
  <circle cx="340" cy="75" r="5.5" fill="#8C5A3C" stroke="#fff" stroke-width="1.5"/>
  <text x="138" y="170" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#2F241D">A(x₀; f(x₀))</text>
  <text x="295" y="63" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#2F241D">B(x₀+Δx; f(x₀+Δx))</text>
  <!-- Axis ticks -->
  <text x="152" y="248" font-family="JetBrains Mono, monospace" font-size="12" fill="#5A4638">x₀</text>
  <text x="318" y="248" font-family="JetBrains Mono, monospace" font-size="12" fill="#5A4638">x₀ + Δx</text>
</svg>`;

const SVG_TANGENT_AND_NORMAL = `<svg viewBox="0 0 520 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Puutuja ja normaaljoon punktis x0">
  <rect width="520" height="270" rx="12" fill="#FBF8F3"/>
  <g stroke="#E6DEC8" stroke-width="1">
    <line x1="65" y1="35" x2="65" y2="230"/>
    <line x1="65" y1="230" x2="480" y2="230"/>
    <line x1="250" y1="125" x2="250" y2="230" stroke-dasharray="4 4"/>
    <line x1="65" y1="125" x2="250" y2="125" stroke-dasharray="4 4"/>
  </g>
  <!-- Curve y = f(x) -->
  <path d="M 90 215 Q 190 190 375 45" fill="none" stroke="#3F6A52" stroke-width="3.2"/>
  <text x="382" y="52" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#3F6A52">y = f(x)</text>
  <!-- Tangent line (puutuja) -->
  <line x1="115" y1="230" x2="385" y2="20" stroke="#2D5A40" stroke-width="2.4"/>
  <text x="335" y="85" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#2D5A40">Puutuja: k = tan α = f'(x₀)</text>
  <!-- Normal line (normaaljoon, perpendicular) -->
  <line x1="160" y1="55" x2="355" y2="207" stroke="#8C5A3C" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="320" y="218" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#8C5A3C">Normaal: kₙ = −1 / f'(x₀)</text>
  <!-- Right angle symbol between tangent and normal -->
  <path d="M 261 116 L 270 123 L 261 132" fill="none" stroke="#5A4638" stroke-width="1.5"/>
  <!-- Angle alpha arc at x-axis -->
  <path d="M 148 230 A 33 33 0 0 0 141 210" fill="none" stroke="#A65E2E" stroke-width="2"/>
  <text x="155" y="222" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#A65E2E">α</text>
  <!-- Point of tangency -->
  <circle cx="250" cy="125" r="5.5" fill="#2D5A40" stroke="#fff" stroke-width="1.5"/>
  <text x="165" y="114" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#2F241D">P(x₀; f(x₀))</text>
  <text x="243" y="248" font-family="JetBrains Mono, monospace" font-size="12" fill="#5A4638">x₀</text>
  <text x="28" y="129" font-family="JetBrains Mono, monospace" font-size="12" fill="#5A4638">f(x₀)</text>
</svg>`;

const SVG_KINEMATICS_GRAPHS = `<svg viewBox="0 0 520 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Teepikkuse, kiiruse ja kiirenduse seos">
  <rect width="520" height="250" rx="12" fill="#FBF8F3"/>
  <!-- Panel 1: s(t) -->
  <g transform="translate(20, 25)">
    <rect width="145" height="195" rx="8" fill="#F4EFE6" stroke="#E2D9C5"/>
    <line x1="25" y1="160" x2="130" y2="160" stroke="#5A4638" stroke-width="1.5"/>
    <line x1="25" y1="25" x2="25" y2="160" stroke="#5A4638" stroke-width="1.5"/>
    <path d="M 25 160 Q 75 155 122 38" fill="none" stroke="#3F6A52" stroke-width="2.8"/>
    <text x="32" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#3F6A52">1. Teepikkus s(t)</text>
    <text x="32" y="182" font-family="JetBrains Mono, monospace" font-size="11" fill="#5A4638">s = 5t² (parabool)</text>
  </g>
  <!-- Arrow 1 -->
  <text x="171" y="118" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#8C5A3C">d/dt →</text>
  <!-- Panel 2: v(t) = s'(t) -->
  <g transform="translate(205, 25)">
    <rect width="145" height="195" rx="8" fill="#F4EFE6" stroke="#E2D9C5"/>
    <line x1="25" y1="160" x2="130" y2="160" stroke="#5A4638" stroke-width="1.5"/>
    <line x1="25" y1="25" x2="25" y2="160" stroke="#5A4638" stroke-width="1.5"/>
    <line x1="25" y1="160" x2="122" y2="42" stroke="#8C5A3C" stroke-width="2.8"/>
    <text x="28" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#8C5A3C">2. Hetkkiirus v(t)</text>
    <text x="28" y="182" font-family="JetBrains Mono, monospace" font-size="11" fill="#5A4638">v = s'(t) = 10t</text>
  </g>
  <!-- Arrow 2 -->
  <text x="356" y="118" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#A65E2E">d/dt →</text>
  <!-- Panel 3: a(t) = v'(t) -->
  <g transform="translate(385, 25)">
    <rect width="120" height="195" rx="8" fill="#F4EFE6" stroke="#E2D9C5"/>
    <line x1="22" y1="160" x2="108" y2="160" stroke="#5A4638" stroke-width="1.5"/>
    <line x1="22" y1="25" x2="22" y2="160" stroke="#5A4638" stroke-width="1.5"/>
    <line x1="22" y1="88" x2="105" y2="88" stroke="#A65E2E" stroke-width="2.8"/>
    <text x="18" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#A65E2E">3. Kiirendus a(t)</text>
    <text x="18" y="182" font-family="JetBrains Mono, monospace" font-size="11" fill="#5A4638">a = s''(t) = 10</text>
  </g>
</svg>`;

const SVG_EXTREMA_MONOTONICITY = `<svg viewBox="0 0 520 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funktsiooni kasvamine, kahanemine ja lokaalsed ekstreemumid">
  <rect width="520" height="270" rx="12" fill="#FBF8F3"/>
  <g stroke="#E6DEC8" stroke-width="1">
    <line x1="55" y1="35" x2="55" y2="230"/>
    <line x1="55" y1="230" x2="485" y2="230"/>
    <line x1="175" y1="68" x2="175" y2="230" stroke-dasharray="4 4"/>
    <line x1="345" y1="185" x2="345" y2="230" stroke-dasharray="4 4"/>
  </g>
  <!-- Cubic curve with max at (175, 68) and min at (345, 185) -->
  <path d="M 75 210 C 115 68, 140 68, 175 68 C 235 68, 285 185, 345 185 C 390 185, 425 120, 460 48" fill="none" stroke="#3F6A52" stroke-width="3.2"/>
  <!-- Horizontal tangents at extrema -->
  <line x1="120" y1="68" x2="230" y2="68" stroke="#2D5A40" stroke-width="2.2" stroke-dasharray="5 3"/>
  <line x1="290" y1="185" x2="400" y2="185" stroke="#8C5A3C" stroke-width="2.2" stroke-dasharray="5 3"/>
  <!-- Extrema points -->
  <circle cx="175" cy="68" r="6" fill="#2D5A40" stroke="#fff" stroke-width="1.5"/>
  <circle cx="345" cy="185" r="6" fill="#8C5A3C" stroke="#fff" stroke-width="1.5"/>
  <!-- Labels -->
  <text x="112" y="54" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#2D5A40">Lokaalne maksimum: f'(x₁) = 0</text>
  <text x="275" y="207" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#8C5A3C">Lokaalne miinimum: f'(x₂) = 0</text>
  <!-- Monotonicity regions -->
  <text x="72" y="135" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#3F6A52">f'(x) &gt; 0 (↗)</text>
  <text x="225" y="125" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#B84A39">f'(x) &lt; 0 (↘)</text>
  <text x="405" y="135" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#3F6A52">f'(x) &gt; 0 (↗)</text>
  <text x="168" y="248" font-family="JetBrains Mono, monospace" font-size="12" fill="#5A4638">x₁</text>
  <text x="338" y="248" font-family="JetBrains Mono, monospace" font-size="12" fill="#5A4638">x₂</text>
</svg>`;

export const sampleMaterials = [
  {
    id: 'sample-tuletised-et',
    isSample: true,
    pairedSampleId: 'sample-tuletised-en',
    title: 'Tuletised – funktsiooni muutumiskiirus ja diferentseerimine',
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
1. Funktsiooni muutumiskiirus ja tuletise mõiste

Olgu funktsioon y = f(x) määratud punkti x₀ ümbruses.
Kui argument x saab muudu Δx, siis funktsiooni vastav muut on:
Δy = f(x₀ + Δx) − f(x₀)

Keskmine muutumiskiirus lõigul [x₀, x₀ + Δx] on muutude suhe (lõikaja tõus joonisel 1):
Δy / Δx = (f(x₀ + Δx) − f(x₀)) / Δx

Funktsiooni tuletiseks punktis x₀ nimetatakse funktsiooni muudu ja argumendi muudu suhte piirväärtust, kui argumendi muut läheneb nullile:
f'(x₀) = lim (Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ]

Kui see piirväärtus leidub ja on lõplik, siis öeldakse, et funktsioon f(x) on punktis x₀ diferentseeruv.`
      },
      {
        pageNumber: 2,
        unitType: 'slide',
        title: 'Slaid 2: Tuletise geomeetriline ja füüsikaline tähendus',
        content: `2. Geomeetriline ja mehaaniline (füüsikaline) tähendus

Geomeetriline tähendus (vt joonis 2):
Funktsiooni y = f(x) tuletis f'(x₀) võrdub funktsiooni graafiku puutuja tõusuga k = tan(α) punktis (x₀; f(x₀)).
Joone puutuja võrrand punktis (x₀; f(x₀)):
y − f(x₀) = f'(x₀) · (x − x₀)

Normaaljoone võrrand (puutuja ristsirge puutepunktis):
y − f(x₀) = (−1 / f'(x₀)) · (x − x₀), eeldusel et f'(x₀) ≠ 0.

Füüsikaline tähendus (vt joonis 3):
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
• Konstandi toomine tuletise märgi ette: (c · u)' = c · u'
• Korrutise tuletis: (u · v)' = u'v + uv'
• Jagatise tuletis: (u / v)' = (u'v − uv') / v²   (kui v ≠ 0)`
      },
      {
        pageNumber: 4,
        unitType: 'slide',
        title: 'Slaid 4: Liitfunktsiooni tuletis (ahelreegel)',
        content: `4. Liitfunktsiooni diferentseerimine (ahelreegel)

Kui y = f(u) ja u = g(x), siis liitfunktsiooni y = f(g(x)) tuletis leitakse valemiga:
(f(g(x)))' = f'(g(x)) · g'(x)   ehk   dy/dx = (dy/du) · (du/dx)

Sõnaline reegel:
Liitfunktsiooni tuletis võrdub välisfunktsiooni tuletisega (siseavaldist muutmata), mis on korrutatud sisefunktsiooni tuletisega.

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

Monotoonsuse seos tuletisega vahemikus (a; b) (vt joonis 4):
• Kui f'(x) > 0 igal x ∈ (a; b), siis funktsioon f(x) kasvab selles vahemikus.
• Kui f'(x) < 0 igal x ∈ (a; b), siis funktsioon f(x) kahaneb selles vahemikus.

Statsionaarsed ja kriitilised punktid:
Punkti x₀, kus f'(x₀) = 0, nimetatakse funktsiooni statsionaarseks punktiks (Fermat' teoreem: lokaalses ekstreemumipunktis on diferentseeruva funktsiooni tuletis null).

Piisav tingimus ekstreemumi olemasoluks:
• Kui tuletis f'(x) muudab punkti x₀ läbimisel märki plussilt miinusele (+ → −), on punktis x₀ lokaalne maksimum.
• Kui tuletis f'(x) muudab punkti x₀ läbimisel märki miinuselt plussile (− → +), on punktis x₀ lokaalne miinimum.
• Teise tuletise test: kui f'(x₀) = 0 ja f''(x₀) < 0, on x₀ maksimumipunkt; kui f''(x₀) > 0, on x₀ miinimumipunkt.`
      }
    ],
    figures: [
      {
        id: 'fig-et-1',
        figureNumber: 1,
        topicId: 'topic-et-1',
        title: 'Joonis 1. Funktsiooni muut Δy ja lõikaja lähenemine puutujale',
        description:
          'Joonisel on kujutatud funktsiooni y = f(x) graafik, argumendi muut Δx ning sellele vastav funktsiooni muut Δy. Kui Δx → 0, läheneb punkt B mööda kõverat punktile A ning lõikaja siht läheneb graafiku puutuja sihile punktis A.',
        callouts: [
          'A(x₀; f(x₀)) – algpunkt funktsiooni graafikul',
          'Δx ja Δy – argumendi muut ja funktsiooni muut',
          'Lõikaja – sirge läbi punktide A ja B, mille tõus on Δy / Δx',
          'Puutuja – lõikaja piirasend, mille tõus võrdub tuletisega f\'(x₀)'
        ],
        svgMarkup: SVG_SECANT_TO_TANGENT,
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
      },
      {
        id: 'fig-et-2',
        figureNumber: 2,
        topicId: 'topic-et-2',
        title: 'Joonis 2. Graafiku puutuja, tõusunurk α ja normaaljoon punktis P',
        description:
          'Joonis selgitab tuletise geomeetrilist tähendust: puutuja tõus k punktis P(x₀; f(x₀)) võrdub x-telje positiivse suuna ja puutuja vahelise nurga α tangensiga ehk tuletise väärtusega f\'(x₀). Normaaljoon on puutujaga risti.',
        callouts: [
          'α – puutuja tõusunurk x-telje suhtes (k = tan α = f\'(x₀))',
          'Puutuja – puudutab graafikut punktis P(x₀; f(x₀))',
          'Normaal – puutuja ristsirge puutepunktis tõusuga kₙ = −1 / f\'(x₀)'
        ],
        svgMarkup: SVG_TANGENT_AND_NORMAL,
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fig-et-3',
        figureNumber: 3,
        topicId: 'topic-et-2',
        title: 'Joonis 3. Teepikkuse s(t), hetkkiiruse v(t) ja kiirenduse a(t) graafikute seos',
        description:
          'Võrdlusjoonis näitab, kuidas ühtlaselt kiireneva liikumise korral saadakse ruutfunktsioonina kasvavast teepikkusest s(t) diferentseerimisel lineaarne kiirusfunktsioon v(t) = s\'(t) ning teistkordsel diferentseerimisel konstantne kiirendus a(t) = s\'\'(t).',
        callouts: [
          's(t) = 5t² – teepikkuse sõltuvus ajast (parabool)',
          'v(t) = s\'(t) = 10t – hetkkiirus ajahetkel t (sirge)',
          'a(t) = v\'(t) = 10 – püsiv hetkkiirendus'
        ],
        svgMarkup: SVG_KINEMATICS_GRAPHS,
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fig-et-4',
        figureNumber: 4,
        topicId: 'topic-et-4',
        title: 'Joonis 4. Funktsiooni kasvamine, kahanemine ja lokaalsed ekstreemumid',
        description:
          'Joonisel on näha seos esimese tuletise märgi ja graafiku kuju vahel: kasvamisvahemikus on f\'(x) > 0 ja kahanemisvahemikus f\'(x) < 0. Ekstreemumipunktides x₁ ja x₂ on graafiku puutuja horisontaalne ehk f\'(x) = 0.',
        callouts: [
          'x₁ – lokaalne maksimum (tuletise märk muutub + → −)',
          'x₂ – lokaalne miinimum (tuletise märk muutub − → +)',
          'Horisontaalsed puutujad – statsionaarsed punktid, kus f\'(x) = 0'
        ],
        svgMarkup: SVG_EXTREMA_MONOTONICITY,
        sourceRef: { type: 'slide', number: 5, label: 'Slaid 5' }
      }
    ],
    topics: [
      {
        id: 'topic-et-1',
        title: 'Tuletise definitsioon ja diferentseeruvus',
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' },
        summary:
          'Funktsiooni tuletis punktis näitab funktsiooni väärtuse hetkelist muutumiskiirust argumendi suhtes. See defineeritakse funktsiooni muudu Δy ja argumendi muudu Δx jagatise piirväärtusena, kui Δx läheneb nullile.',
        bulletPoints: [
          'Keskmine muutumiskiirus lõigul [x₀, x₀ + Δx] leitakse muutude suhtena Δy / Δx.',
          "Hetkeline muutumiskiirus ehk tuletis f'(x₀) saadakse piirprotsessil Δx → 0.",
          'Funktsioon on punktis diferentseeruv parajasti siis, kui see piirväärtus leidub ja on lõplik.',
          'Iga punktis diferentseeruv funktsioon on selles punktis ka pidev.'
        ],
        concepts: [
          {
            term: 'Funktsiooni muut (Δy)',
            definition: 'Funktsiooni väärtuste vahe Δy = f(x₀ + Δx) − f(x₀), mis tekib argumendi muudu Δx korral.'
          },
          {
            term: 'Tuletis punktis x₀',
            definition: 'Piirväärtus lim(Δx→0) (f(x₀+Δx)−f(x₀))/Δx, mis väljendab funktsiooni hetkelist muutumiskiirust.'
          },
          {
            term: 'Diferentseeruvus',
            definition: 'Funktsiooni omadus, mille korral tal leidub vaadeldavas punktis lõplik tuletis.'
          }
        ],
        formulas: [
          {
            id: 'form-et-1',
            label: 'Funktsiooni muut ja keskmine muutumiskiirus',
            expression: 'Δy / Δx = (f(x₀ + Δx) − f(x₀)) / Δx',
            symbols: 'Δx – argumendi muut; Δy – funktsiooni muut; x₀ – algpunkt',
            units: 'Ühik sõltub suurustest (nt Δs / Δt korral m/s)',
            example: 'Kui f(x) = x², x₀ = 2 ja Δx = 0,5, siis Δy = 2,5² − 2² = 2,25 ning Δy / Δx = 4,5.',
            sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
          },
          {
            id: 'form-et-2',
            label: 'Tuletise definitsioon piirväärtusena',
            expression: "f'(x₀) = lim(Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ]",
            symbols: "f'(x₀) – tuletis punktis x₀; lim – piirväärtus protsessil Δx → 0",
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
          'Geomeetriliselt näitab tuletis funktsiooni graafiku puutuja tõusu vaadeldavas punktis. Füüsikas väljendab teepikkuse esimene tuletis aja järgi keha hetkkiirust ning teine tuletis hetkkiirendust.',
        bulletPoints: [
          "Graafiku puutuja tõus k punktis (x₀; f(x₀)) võrdub tuletisega: k = tan(α) = f'(x₀).",
          "Kui f'(x₀) = 0, on puutuja selles punktis horisontaalne ehk paralleelne x-teljega.",
          'Mehaanikas on hetkkiirus v(t) teepikkuse s(t) esimene tuletis aja t järgi.',
          'Hetkkiirendus a(t) on kiiruse tuletis ehk teepikkuse teine tuletis aja järgi.'
        ],
        concepts: [
          {
            term: 'Puutuja tõus (k)',
            definition: 'Puutuja tõusunurga tangens tan(α), mis võrdub funktsiooni tuletise väärtusega puutepunktis.'
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
            symbols: "(x₀; f(x₀)) – puutepunkti koordinaadid; f'(x₀) – puutuja tõus k",
            units: 'Ühikuta suurus (koordinaattasandil)',
            example: "Kui f(x) = x² ja x₀ = 3, siis f(3) = 9 ja f'(3) = 6 ning puutuja võrrand on y − 9 = 6(x − 3) ehk y = 6x − 9.",
            sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
          },
          {
            id: 'form-et-4',
            label: 'Hetkkiirus ja hetkkiirendus',
            expression: "v(t) = s'(t),   a(t) = v'(t) = s''(t)",
            symbols: 's(t) – teepikkus; t – aeg; v(t) – hetkkiirus; a(t) – hetkkiirendus',
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
          'Keerukamate avaldiste diferentseerimiseks kombineeritakse põhifunktsioonide tuletiste valemeid summa, vahe, korrutise ja jagatise diferentseerimisreeglitega.',
        bulletPoints: [
          'Konstandi tuletis on alati 0; astmefunktsiooni xⁿ tuletis on n·xⁿ⁻¹.',
          "Eksponentfunktsioon eˣ on eriline selle poolest, et tema tuletis võrdub funktsiooni endaga: (eˣ)' = eˣ.",
          "Korrutise diferentseerimisel kehtib reegel (u·v)' = u'v + uv'.",
          "Jagatise tuletise lugejas on vahe u'v − uv' ja nimetajas nimetaja ruut v²."
        ],
        concepts: [
          {
            term: 'Korrutise diferentseerimisreegel',
            definition: 'Kahe funktsiooni korrutise tuletis võrdub esimese teguri tuletise ja teise teguri korrutise ning esimese teguri ja teise teguri tuletise korrutise summaga.'
          },
          {
            term: 'Jagatise diferentseerimisreegel',
            definition: "Murru tuletis leitakse valemiga (u'v − uv') / v², kus nimetaja v(x) ≠ 0."
          }
        ],
        formulas: [
          {
            id: 'form-et-5',
            label: 'Astmefunktsiooni, eksponendi ja logaritmi tuletis',
            expression: "(xⁿ)' = n·xⁿ⁻¹,   (ln x)' = 1/x,   (eˣ)' = eˣ",
            symbols: 'n – astmenäitaja (reaalarv); e – Euleri arv (≈ 2,718); ln – naturaallogaritm',
            units: 'Arvuline ehk ühikuta suurus',
            example: "(x⁵)' = 5x⁴;  (3x²)' = 6x.",
            sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
          },
          {
            id: 'form-et-6',
            label: 'Korrutise ja jagatise diferentseerimisreegel',
            expression: "(u · v)' = u'v + uv',   (u / v)' = (u'v − uv') / v²",
            symbols: "u, v – argumendi x diferentseeruvad funktsioonid; u', v' – nende tuletised",
            units: 'Ühikuta suurus',
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
          'Ahelreegel: võta esmalt välisfunktsiooni tuletis (jättes siseavaldise samaks) ja korruta see sisefunktsiooni tuletisega.',
          "Kui f'(x) > 0, siis funktsioon kasvab; kui f'(x) < 0, siis funktsioon kahaneb.",
          "Statsionaarses punktis võrdub tuletis nulliga: f'(x₀) = 0.",
          'Kui tuletise märk muutub plussilt miinusele, on punktis lokaalne maksimum; kui miinuselt plussile, siis lokaalne miinimum.'
        ],
        concepts: [
          {
            term: 'Ahelreegel',
            definition: "Liitfunktsiooni diferentseerimise reegel (f(g(x)))' = f'(g(x)) · g'(x)."
          },
          {
            term: 'Statsionaarne punkt',
            definition: "Funktsiooni määramispiirkonna punkt x₀, kus esimene tuletis võrdub nulliga: f'(x₀) = 0."
          },
          {
            term: 'Lokaalne ekstreemum',
            definition: 'Lokaalne maksimum või miinimum, kus funktsiooni kasvamine läheb üle kahanemiseks või vastupidi.'
          }
        ],
        formulas: [
          {
            id: 'form-et-7',
            label: 'Liitfunktsiooni tuletis (ahelreegel)',
            expression: "(f(g(x)))' = f'(g(x)) · g'(x)",
            symbols: 'f(u) – välisfunktsioon; u = g(x) – sisefunktsioon',
            units: 'Ühikuta suurus',
            example: "(sin(4x))' = cos(4x) · (4x)' = 4·cos(4x).",
            sourceRef: { type: 'slide', number: 4, label: 'Slaid 4' }
          },
          {
            id: 'form-et-8',
            label: 'Ekstreemumi tarvilik tingimus (statsionaarne punkt)',
            expression: "f'(x₀) = 0",
            symbols: "x₀ – statsionaarne punkt; f''(x₀) < 0 ⇒ maksimum, f''(x₀) > 0 ⇒ miinimum",
            units: 'Ühikuta suurus',
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
        answer: "f'(x₀) = lim(Δx → 0) [ (f(x₀ + Δx) − f(x₀)) / Δx ] ehk funktsiooni muudu ja argumendi muudu suhte piirväärtus, kui Δx → 0.",
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
      },
      {
        id: 'fc-et-2',
        topicId: 'topic-et-2',
        question: "Mis on tuletise f'(x₀) geomeetriline tähendus?",
        answer: "Tuletis f'(x₀) võrdub funktsiooni y = f(x) graafiku puutuja tõusuga k = tan(α) punktis (x₀; f(x₀)).",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fc-et-3',
        topicId: 'topic-et-2',
        question: 'Milline on funktsiooni graafiku puutuja võrrand punktis (x₀; f(x₀))?',
        answer: "y − f(x₀) = f'(x₀) · (x − x₀)",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fc-et-4',
        topicId: 'topic-et-2',
        question: 'Kuidas on teepikkuse funktsioon s(t) seotud keha hetkkiiruse v(t) ja hetkkiirendusega a(t)?',
        answer: "Hetkkiirus on teepikkuse esimene tuletis v(t) = s'(t) ning hetkkiirendus on teepikkuse teine tuletis a(t) = v'(t) = s''(t).",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'fc-et-5',
        topicId: 'topic-et-3',
        question: "Milline on kahe diferentseeruva funktsiooni korrutise (u · v)' tuletise valem?",
        answer: "(u · v)' = u'v + uv' (esimese funktsiooni tuletis korda teine funktsioon pluss esimene funktsioon korda teise tuletis).",
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
        answer: "(f(g(x)))' = f'(g(x)) · g'(x) – välisfunktsiooni tuletis (siseavaldist muutmata) korrutatakse sisefunktsiooni tuletisega.",
        sourceRef: { type: 'slide', number: 4, label: 'Slaid 4' }
      },
      {
        id: 'fc-et-8',
        topicId: 'topic-et-4',
        question: 'Kuidas teha esimese tuletise märgi põhjal kindlaks, kas statsionaarses punktis x₀ on lokaalne maksimum või miinimum?',
        answer: "Kui punkti x₀ läbimisel muutub tuletise f'(x) märk plussilt miinusele (+ → −), on seal lokaalne maksimum; kui miinuselt plussile (− → +), siis lokaalne miinimum.",
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
          'Funktsiooni graafiku puutuja tõus kohal x = 2 on k = −3 ning funktsioon selles punktis kahaneb.',
          'Funktsiooni väärtus kohal x = 2 võrdub −3-ga ehk f(2) = −3.',
          'Funktsiooni graafik lõikab y-telge punktis (0; −3).',
          'Funktsioonil on kohal x = 2 lokaalne miinimum.'
        ],
        correctIndex: 0,
        steps: [
          "Tuletise geomeetrilise tähenduse järgi võrdub f'(x₀) graafiku puutuja tõusuga k kohal x₀.",
          "Kuna f'(2) = −3, on puutuja tõus k = −3.",
          'Negatiivne tuletis tähendab ühtlasi, et funktsioon selles punktis kahaneb.'
        ],
        explanation:
          "Geomeetriliselt võrdub tuletis f'(x₀) puutuja tõusuga k kohal x₀. Kuna f'(2) = −3 < 0, on puutuja tõus −3 ja funktsioon selles punktis kahaneb.",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'ex-et-2',
        topicId: 'topic-et-3',
        type: 'calculation',
        templateType: 'poly_deriv_eval',
        question: "Arvutusülesanne: leia funktsiooni f(x) = 3x⁴ − 5x² + 7x − 12 tuletis f'(x) ja arvuta selle täpne väärtus kohal x = 1.",
        hint: "Kasuta astmefunktsiooni valemit (xⁿ)' = n·xⁿ⁻¹ liikmete kaupa ning asenda lõpus x = 1.",
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
          "3. Asendame x = 1: f'(1) = 12·1³ − 10·1 + 7 = 12 − 10 + 7 = 9."
        ],
        explanation:
          "Liikmete kaupa diferentseerides saame f'(x) = 12x³ − 10x + 7. Kui asendame x = 1, saame f'(1) = 12 − 10 + 7 = 9.",
        sourceRef: { type: 'slide', number: 3, label: 'Slaid 3' }
      },
      {
        id: 'ex-et-3',
        topicId: 'topic-et-1',
        type: 'short_answer',
        question: 'Lühivastus: kuidas nimetatakse funktsiooni muudu ja argumendi muudu suhte piirväärtust, kui argumendi muut Δx läheneb nullile?',
        hint: "See on loengu keskne mõiste, mida tähistatakse f'(x₀).",
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
          '1. Jagatis Δy / Δx väljendab keskmist muutumiskiirust lõigul [x₀, x₀ + Δx].',
          '2. Piirväärtuse võtmisel protsessil Δx → 0 saame hetkelise muutumiskiiruse.',
          "3. Seda piirväärtust nimetatakse funktsiooni tuletiseks punktis x₀ (tähis f'(x₀))."
        ],
        explanation:
          "Funktsiooni muudu Δy ja argumendi muudu Δx suhte piirväärtust protsessil Δx → 0 nimetatakse funktsiooni tuletiseks punktis x₀.",
        sourceRef: { type: 'slide', number: 1, label: 'Slaid 1' }
      },
      {
        id: 'ex-et-4',
        topicId: 'topic-et-2',
        type: 'calculation',
        templateType: 'kinematics_vel',
        question: 'Arvutusülesanne: punktmass liigub sirgjooneliselt seaduse s(t) = t³ − 6t² + 15t (meetrit) järgi. Arvuta keha hetkkiirus v(3) (m/s) ajahetkel t = 3 s.',
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
          "1. Leiame kiiruse funktsiooni teepikkuse tuletisena: v(t) = s'(t) = (t³ − 6t² + 15t)' = 3t² − 12t + 15.",
          '2. Asendame ajahetke t = 3 s: v(3) = 3·3² − 12·3 + 15.',
          '3. Arvutame tulemuse: v(3) = 27 − 36 + 15 = 6 m/s.'
        ],
        explanation:
          "Hetkkiirus on v(t) = s'(t) = 3t² − 12t + 15. Ajahetkel t = 3 s on kiirus v(3) = 27 − 36 + 15 = 6 m/s.",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      },
      {
        id: 'ex-et-5',
        topicId: 'topic-et-4',
        type: 'application',
        question: 'Rakendusülesanne: leia ahelreegli abil liitfunktsiooni f(x) = ln(x² + 4) tuletis.',
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
          "3. Korrutame selle sisefunktsiooni tuletisega (x² + 4)' = 2x ning saame 2x / (x² + 4)."
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
        question: 'Arvutusülesanne: leia funktsiooni f(x) = x² − 6x + 8 lokaalse miinimumi abstsiss x₀ (st koht x, kus tuletis võrdub nulliga).',
        hint: "Leia tuletis f'(x), võrdsusta see nulliga f'(x) = 0 ja lahenda võrrand x-i suhtes.",
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
          "2. Lokaalses ekstreemumipunktis kehtib Fermat' tingimus f'(x₀) = 0 ⇒ 2x − 6 = 0.",
          "3. Lahendame võrrandi: 2x = 6 ⇒ x₀ = 3. Kuna f''(x) = 2 > 0, on tegemist miinimumiga."
        ],
        explanation:
          "Tuletis on f'(x) = 2x − 6 = 0, millest x = 3. Kuna tuletise märk muutub kohal x = 3 miinuselt plussile, paikneb seal lokaalne miinimum.",
        sourceRef: { type: 'slide', number: 5, label: 'Slaid 5' }
      },
      {
        id: 'ex-et-7',
        topicId: 'topic-et-3',
        type: 'multiple_choice',
        question: 'Milline on funktsiooni y = x² · eˣ tuletis korrutise diferentseerimisreegli järgi?',
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
          "2. Rakendame korrutise diferentseerimisreeglit u'v + uv': 2x·eˣ + x²·eˣ.",
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
        question: 'Arvutusülesanne: leia funktsiooni f(x) = x² + 4x − 1 graafiku puutuja tõus k kohal x₀ = 2.',
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
          "1. Puutuja tõus vaadeldavas punktis võrdub funktsiooni tuletisega selles punktis: k = f'(x₀).",
          "2. Leiame tuletise: f'(x) = (x² + 4x − 1)' = 2x + 4.",
          "3. Arvutame väärtuse kohal x₀ = 2: k = f'(2) = 2·2 + 4 = 8."
        ],
        explanation:
          "Puutuja tõus on k = f'(x₀). Kuna f'(x) = 2x + 4, siis kohal x₀ = 2 on tõus k = 2·2 + 4 = 8.",
        sourceRef: { type: 'slide', number: 2, label: 'Slaid 2' }
      }
    ]
  },
  {
    id: 'sample-tuletised-en',
    isSample: true,
    pairedSampleId: 'sample-tuletised-et',
    title: 'Tuletised / Derivatives – Rate of Change & Differentiation Rules',
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

The average rate of change on the interval [x₀, x₀ + Δx] is the difference quotient (see Figure 1):
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

Geometric Interpretation (see Figure 2):
The derivative f'(x₀) equals the slope k = tan(α) of the tangent line to the graph y = f(x) at the point (x₀, f(x₀)).
Tangent line equation at (x₀, f(x₀)):
y − f(x₀) = f'(x₀) · (x − x₀)

Physical (Kinematic) Interpretation (see Figure 3):
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

Monotonicity & First Derivative Test (see Figure 4):
• If f'(x) > 0 on (a, b), then f(x) is strictly increasing on (a, b).
• If f'(x) < 0 on (a, b), then f(x) is strictly decreasing on (a, b).
• Stationary points satisfy f'(x₀) = 0.
• If f'(x) changes sign from + to − at x₀, f has a local maximum at x₀.
• If f'(x) changes sign from − to + at x₀, f has a local minimum at x₀.`
      }
    ],
    figures: [
      {
        id: 'fig-en-1',
        figureNumber: 1,
        topicId: 'topic-en-1',
        title: 'Figure 1. Function Increment Δy and Secant Line Approaching the Tangent',
        description:
          'Illustrates the curve y = f(x), the input increment Δx, and the corresponding output change Δy. As Δx → 0, point B slides along the curve toward point A, and the secant line approaches the tangent line at A.',
        callouts: [
          'A(x₀, f(x₀)) – initial point on the curve',
          'Δx and Δy – input increment and output change',
          'Secant line – line through A and B with slope Δy / Δx',
          'Tangent line – limiting position with slope f\'(x₀)'
        ],
        svgMarkup: SVG_SECANT_TO_TANGENT,
        sourceRef: { type: 'page', number: 1, label: 'Page 1' }
      },
      {
        id: 'fig-en-2',
        figureNumber: 2,
        topicId: 'topic-en-2',
        title: 'Figure 2. Tangent Line, Slope Angle α, and Normal Line at Point P',
        description:
          'Shows the geometric meaning of the derivative: the tangent slope k at P(x₀, f(x₀)) equals tan(α) = f\'(x₀), while the normal line is perpendicular to the tangent at the point of tangency.',
        callouts: [
          'α – inclination angle of the tangent line (k = tan α = f\'(x₀))',
          'Tangent line – touches the curve locally at P(x₀, f(x₀))',
          'Normal line – perpendicular line with slope kₙ = −1 / f\'(x₀)'
        ],
        svgMarkup: SVG_TANGENT_AND_NORMAL,
        sourceRef: { type: 'page', number: 2, label: 'Page 2' }
      },
      {
        id: 'fig-en-3',
        figureNumber: 3,
        topicId: 'topic-en-2',
        title: 'Figure 3. Kinematic Relationship Between Position s(t), Velocity v(t), and Acceleration a(t)',
        description:
          'Side-by-side comparison showing how differentiating quadratic position s(t) = 5t² yields linear velocity v(t) = 10t, and differentiating a second time yields constant acceleration a(t) = 10.',
        callouts: [
          's(t) = 5t² – position vs. time (parabola)',
          'v(t) = s\'(t) = 10t – instantaneous velocity (line)',
          'a(t) = v\'(t) = 10 – constant acceleration'
        ],
        svgMarkup: SVG_KINEMATICS_GRAPHS,
        sourceRef: { type: 'page', number: 2, label: 'Page 2' }
      },
      {
        id: 'fig-en-4',
        figureNumber: 4,
        topicId: 'topic-en-4',
        title: 'Figure 4. Monotonicity Intervals and Local Extrema Where f\'(x) = 0',
        description:
          'Demonstrates how the sign of f\'(x) governs increasing (f\' > 0) and decreasing (f\' < 0) intervals, and how horizontal tangent lines identify stationary points at local maxima and minima.',
        callouts: [
          'x₁ – local maximum (sign of f\' changes from + to −)',
          'x₂ – local minimum (sign of f\' changes from − to +)',
          'Horizontal tangents – stationary points where f\'(x) = 0'
        ],
        svgMarkup: SVG_EXTREMA_MONOTONICITY,
        sourceRef: { type: 'page', number: 4, label: 'Page 4' }
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
            symbols: 'Δx – input increment; f(x₀ + Δx) − f(x₀) – output change Δy',
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
            symbols: "(x₀, f(x₀)) – point of tangency; f'(x₀) – slope k",
            units: 'Dimensionless (Cartesian plane)',
            example: "For f(x) = x² at x₀ = 2: f(2) = 4, f'(2) = 4 ⇒ y − 4 = 4(x − 2).",
            sourceRef: { type: 'page', number: 2, label: 'Page 2' }
          },
          {
            id: 'form-en-3',
            label: 'Velocity & Acceleration',
            expression: "v(t) = s'(t),   a(t) = v'(t) = s''(t)",
            symbols: 's(t) – position; v(t) – instantaneous velocity; a(t) – acceleration',
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
            symbols: 'n – real exponent; e – Euler’s number; ln – natural log',
            units: 'Dimensionless',
            example: "(x⁴)' = 4x³.",
            sourceRef: { type: 'page', number: 3, label: 'Page 3' }
          },
          {
            id: 'form-en-5',
            label: 'Product & Quotient Rules',
            expression: "(u · v)' = u'v + uv',   (u / v)' = (u'v − uv') / v²",
            symbols: "u(x), v(x) – differentiable functions; u', v' – first derivatives",
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
            symbols: 'f – outer function; g – inner function',
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
        answer: "(f(g(x)))' = f'(g(x)) · g'(x) – multiply the derivative of the outer function (evaluated at the inner function) by the derivative of the inner function.",
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
