/**
 * Scientific Textbook & Academic Curriculum Knowledge Base + Noise/URL Sanitizer.
 *
 * 1. Filters out URLs (https://, youtube.com, etc.), timestamps, headers/footers, and non-academic noise.
 * 2. Compares full document text against established scientific textbooks and university courses.
 * 3. Produces non-binding subject/category recommendations with matched textbook references and core concepts.
 */

export const ACADEMIC_DOMAINS = [
  {
    id: 'mechanics_strength',
    subjectET: 'Tugevusõpetus ja tehniline mehaanika',
    subjectEN: 'Mechanics of Materials & Engineering Mechanics',
    textbooksET: [
      'R. C. Hibbeler „Mechanics of Materials“ / „Engineering Mechanics“',
      'S. Timoshenko „Strength of Materials“',
      'A. Jürgenson, E. Soonurm „Tugevusõpetus“'
    ],
    textbooksEN: [
      'R. C. Hibbeler "Mechanics of Materials" & "Statics / Dynamics"',
      'S. Timoshenko "Strength of Materials"',
      'Beer & Johnston "Mechanics of Materials"'
    ],
    keywords: [
      'tugevusõpetus',
      'mehaanika',
      'normaalpinge',
      'nihkepinge',
      'paindemoment',
      'põikjõud',
      'pikijõud',
      'väändemoment',
      'sisejõud',
      'epüür',
      'toereaktsioon',
      'tasakaaluvõrrand',
      'hooke',
      'elastsusmoodul',
      'inertsimoment',
      'vastupanumoment',
      'deformatsioon',
      'suhteline pikenemine',
      'tõmme',
      'surve',
      'vääne',
      'paine',
      'varras',
      'tala',
      'lubatav pinge',
      'varutegur',
      'voolavuspiir',
      'tugevuspiir',
      'stabiilsus',
      'euleri valem',
      'raskuskese',
      'staatiline moment',
      'stress',
      'strain',
      'bending moment',
      'shear force',
      'torsion',
      'young',
      'modulus of elasticity',
      'moment of inertia',
      'beam',
      'truss',
      'axial load',
      'deflection',
      'buckling'
    ],
    canonicalConceptsET: [
      {
        term: 'Normaalpinge (σ)',
        definition:
          'Ristlõike pinnaga risti mõjuva sisejõu intensiivsus σ = N / A (pikijõul) või σ = M / W (paindel), ühik Pa või MPa.'
      },
      {
        term: 'Hooke’i seadus',
        definition:
          'Elastse deformatsiooni piirkonnas on normaalpinge võrdeline suhtelise pikenemisega: σ = E · ε, kus E on materjali elastsusmoodul.'
      },
      {
        term: 'Sisejõudude epüür',
        definition:
          'Graafik, mis kujutab sisejõu (pikijõu N, põikjõu Q, väändemomendi T või paindemomendi M) muutumist piki varda telge.'
      },
      {
        term: 'Tugevustingimus',
        definition:
          'Konstruktsioonielemendi suurim tekkiv pinge ei tohi ületada materjali lubatavat pinget: σ_max ≤ [σ] = σ_piir / [n].'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Normal Stress (σ)',
        definition:
          'Internal force intensity acting perpendicular to the cross-section: σ = N / A (axial) or σ = M / W (bending), measured in Pa or MPa.'
      },
      {
        term: 'Hooke’s Law',
        definition:
          'Within the elastic region, normal stress is proportional to axial strain: σ = E · ε, where E is Young’s modulus of elasticity.'
      },
      {
        term: 'Shear and Bending Moment Diagram',
        definition:
          'Graphical representation showing how internal shear force V(x) and bending moment M(x) vary along the length of a beam.'
      }
    ]
  },
  {
    id: 'calculus_math',
    subjectET: 'Matemaatiline analüüs',
    subjectEN: 'Calculus & Mathematical Analysis',
    textbooksET: [
      'J. Stewart „Calculus: Early Transcendentals“',
      'G. Fichtenholz „Diferentsiaal- ja integraalarvutuse kursus“',
      'I. Tammeraid „Matemaatiline analüüs I–II“'
    ],
    textbooksEN: [
      'J. Stewart "Calculus: Early Transcendentals"',
      'M. Spivak "Calculus"',
      'W. Rudin "Principles of Mathematical Analysis"'
    ],
    keywords: [
      'tuletis',
      'diferentsiaal',
      'integraal',
      'algfunktsioon',
      'piirväärtus',
      'pidevus',
      'puutuja',
      'ekstreemum',
      'maksimum',
      'miinimum',
      'statsionaarne punkt',
      'ahelreegel',
      'osatuletis',
      'gradient',
      'koonduvus',
      'rida',
      'taylor',
      'maclaurin',
      'diferentsiaalvõrrand',
      'funktsioon',
      'muutumiskiirus',
      'kumerus',
      'käänupunkt',
      'derivative',
      'differentiation',
      'integral',
      'limit',
      'continuity',
      'tangent line',
      'chain rule',
      'product rule',
      'quotient rule',
      'critical point',
      'local extremum',
      'partial derivative',
      'differential equation'
    ],
    canonicalConceptsET: [
      {
        term: 'Funktsiooni tuletis f\'(x)',
        definition:
          'Funktsiooni muudu ja argumendi muudu suhte piirväärtus f\'(x) = lim(Δx→0) [f(x+Δx) − f(x)] / Δx, mis väljendab hetkelist muutumiskiirust.'
      },
      {
        term: 'Graafiku puutuja tõus',
        definition:
          'Joone y = f(x) puutuja tõus punktis x₀ võrdub tuletise väärtusega k = f\'(x₀) ning puutuja võrrand on y − f(x₀) = f\'(x₀)(x − x₀).'
      },
      {
        term: 'Statsionaarne punkt ja ekstreemum',
        definition:
          'Punkt x₀, kus f\'(x₀) = 0. Kui tuletise märk muutub plussist miinuseks, on tegu lokaalse maksimumiga; miinusest plussiks lokaalse miinimumiga.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Derivative f\'(x)',
        definition:
          'The limit of the difference quotient f\'(x) = lim(Δx→0) [f(x+Δx) − f(x)] / Δx, representing the instantaneous rate of change.'
      },
      {
        term: 'Tangent Line Equation',
        definition:
          'The line tangent to y = f(x) at x₀ has slope k = f\'(x₀) and equation y − f(x₀) = f\'(x₀)(x − x₀).'
      }
    ]
  },
  {
    id: 'linear_algebra',
    subjectET: 'Lineaaralgebra ja geomeetria',
    subjectEN: 'Linear Algebra & Analytic Geometry',
    textbooksET: [
      'G. Strang „Introduction to Linear Algebra“',
      'D. C. Lay „Linear Algebra and Its Applications“',
      'Ü. Lumiste „Lineaaralgebra ja analüütiline geomeetria“'
    ],
    textbooksEN: [
      'G. Strang "Introduction to Linear Algebra"',
      'D. C. Lay "Linear Algebra and Its Applications"',
      'S. Axler "Linear Algebra Done Right"'
    ],
    keywords: [
      'maatriks',
      'determinant',
      'vektor',
      'vektorruum',
      'lineaarvõrrandisüsteem',
      'gauss',
      'pöördmaatriks',
      'omaväärtus',
      'omavektor',
      'skalaarkorrutis',
      'vektorkorrutis',
      'segakorrutis',
      'astak',
      'baas',
      'ortogonaalne',
      'matrix',
      'eigenvalue',
      'eigenvector',
      'determinant',
      'vector space',
      'dot product',
      'cross product',
      'linear transformation',
      'rank'
    ],
    canonicalConceptsET: [
      {
        term: 'Maatriksi determinant det(A)',
        definition:
          'Ruutmaatriksile vastav skalaarne suurus; maatriks A on pööratav parajasti siis, kui det(A) ≠ 0.'
      },
      {
        term: 'Omaväärtus ja omavektor',
        definition:
          'Nullist erinev vektor v on maatriksi A omavektor omaväärtusega λ, kui kehtib võrdus A·v = λ·v ehk det(A − λI) = 0.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Determinant and Invertibility',
        definition:
          'A square matrix A is invertible if and only if its determinant is non-zero: det(A) ≠ 0.'
      },
      {
        term: 'Eigenvalues and Eigenvectors',
        definition:
          'A non-zero vector v satisfies A·v = λ·v, where λ is a root of the characteristic polynomial det(A − λI) = 0.'
      }
    ]
  },
  {
    id: 'physics',
    subjectET: 'Füüsika',
    subjectEN: 'Physics',
    textbooksET: [
      'D. Halliday, R. Resnick, J. Walker „Füüsika põhikursus“',
      'I. Saveljev „Füüsika üldkursus I–III“',
      'H. Young, R. Freedman „University Physics“'
    ],
    textbooksEN: [
      'Halliday, Resnick, Walker "Fundamentals of Physics"',
      'Young & Freedman "University Physics"',
      'Tipler & Mosca "Physics for Scientists and Engineers"'
    ],
    keywords: [
      'kiirus',
      'kiirendus',
      'newtoni',
      'impulss',
      'kineetiline energia',
      'potentsiaalne energia',
      'jõumoment',
      'inerts',
      'gravitatsioon',
      'võnkumine',
      'sagedus',
      'lainepikkus',
      'termodünaamika',
      'entroopia',
      'ideaalne gaas',
      'elektriväli',
      'magnetväli',
      'induktsioon',
      'ohmi seadus',
      'maxwell',
      'optika',
      'murdumisnäitaja',
      'kvant',
      'footon',
      'velocity',
      'acceleration',
      'momentum',
      'kinetic energy',
      'potential energy',
      'thermodynamics',
      'entropy',
      'electric field',
      'magnetic field',
      'wavelength'
    ],
    canonicalConceptsET: [
      {
        term: 'Newtoni II seadus',
        definition:
          'Kehale mõjuv resultantjõud võrdub keha impulsi muutumise kiirusega: F = dp/dt = m·a.'
      },
      {
        term: 'Mehaanilise energia jäävuse seadus',
        definition:
          'Konservatiivsete jõudude süsteemis püsib kineetilise (E_k = mv²/2) ja potentsiaalse energia (E_p) kogusumma muutumatuna.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Newton’s Second Law',
        definition:
          'The net force acting on a body equals the rate of change of its momentum: F = dp/dt = m·a.'
      },
      {
        term: 'Conservation of Mechanical Energy',
        definition:
          'In an isolated system with conservative forces, total mechanical energy E = K + U remains constant.'
      }
    ]
  },
  {
    id: 'maritime_navigation',
    subjectET: 'Merendus, laevateooria ja navigatsioon',
    subjectEN: 'Maritime Engineering, Ship Theory & Navigation',
    textbooksET: [
      'N. Bowditch „The American Practical Navigator“',
      'K. J. Rawson, E. C. Tupper „Basic Ship Theory“',
      'V. Barrass, D. R. Derrett „Ship Stability for Masters and Mates“'
    ],
    textbooksEN: [
      'N. Bowditch "The American Practical Navigator"',
      'Rawson & Tupper "Basic Ship Theory"',
      'Derrett & Barrass "Ship Stability for Masters and Mates"'
    ],
    keywords: [
      'laev',
      'laeva',
      'püstuvus',
      'metatsenter',
      'metatsentriline kõrgus',
      'veeväljasurve',
      'süvis',
      'kreen',
      'diferent',
      'ujuvus',
      'navigatsioon',
      'peiling',
      'kurss',
      'meremiil',
      'sõlm',
      'colreg',
      'solas',
      'marpol',
      'ballast',
      'lastimine',
      'ankur',
      'rool',
      'sõukruvi',
      'radar',
      'ecdis',
      'ship stability',
      'metacentric height',
      'buoyancy',
      'draft',
      'displacement',
      'heeling',
      'trim',
      'navigation'
    ],
    canonicalConceptsET: [
      {
        term: 'Algpüstuvus ja metatsentriline kõrgus (GM)',
        definition:
          'Kaugus laeva raskuskeskme (G) ja metatsentri (M) vahel; positiivse algpüstuvuse tingimus on GM = KM − KG > 0.'
      },
      {
        term: 'Archimedese seadus ja ujuvus',
        definition:
          'Ujuvale laevale mõjuv üleslükkejõud võrdub laeva poolt välja tõrjutud vee kaaluga: Δ = ρ · g · V.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Metacentric Height (GM)',
        definition:
          'The distance between the center of gravity (G) and the metacenter (M); positive initial stability requires GM = KM − KG > 0.'
      }
    ]
  },
  {
    id: 'chemistry_materials',
    subjectET: 'Keemia ja materjaliõpetus',
    subjectEN: 'Chemistry & Materials Science',
    textbooksET: [
      'P. Atkins, J. de Paula „Physical Chemistry“',
      'W. D. Callister „Materials Science and Engineering“',
      'R. Ott, A. Piksarv, E. Talts „Üldine ja anorgaaniline keemia“',
      'P. Kulu „Materjalitehnika“'
    ],
    textbooksEN: [
      'P. Atkins "Physical Chemistry"',
      'S. Zumdahl "Chemistry"',
      'W. D. Callister "Materials Science and Engineering"'
    ],
    keywords: [
      'keemia',
      'molekul',
      'aatom',
      'elektron',
      'ioonne',
      'kovalentne',
      'mool',
      'molaarmass',
      'kontsentratsioon',
      'reaktsioon',
      'tasakaalukonstant',
      'oksüdatsioon',
      'redoks',
      'hape',
      'alus',
      ' katalüsaator',
      'entalpia',
      'gibbsi',
      'kristallvõre',
      'sulam',
      'teras',
      'malm',
      'faasidiagramm',
      'termotöötlus',
      'korrosioon',
      'polümeer',
      'molarity',
      'stoichiometry',
      'enthalpy',
      'chemical equilibrium',
      'crystal lattice',
      'alloy',
      'phase diagram'
    ],
    canonicalConceptsET: [
      {
        term: 'Keemiline tasakaal ja Le Chatelier’ printsiip',
        definition:
          'Kui tasakaalus olevale süsteemile avaldatakse välismõju (temperatuur, rõhk, kontsentratsioon), nihkub tasakaal suunas, mis seda mõju vähendab.'
      },
      {
        term: 'Ainehulk ja molaarmass',
        definition:
          'Ainehulk n (moolides) on aine massi m ja molaarmassi M suhe: n = m / M = N / N_A.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Le Chatelier’s Principle',
        definition:
          'If a dynamic equilibrium is disturbed by changing conditions, the position of equilibrium shifts to counteract the change.'
      }
    ]
  },
  {
    id: 'programming_cs',
    subjectET: 'Programmeerimine ja tarkvaratehnika',
    subjectEN: 'Programming & Software Engineering',
    textbooksET: [
      'R. C. Martin „Clean Code“',
      'I. Sommerville „Software Engineering“',
      'A. Allen Downey „Think Python“'
    ],
    textbooksEN: [
      'R. C. Martin "Clean Code"',
      'I. Sommerville "Software Engineering"',
      'M. Haverbeke "Eloquent JavaScript"'
    ],
    keywords: [
      'programmeerimine',
      'muutuja',
      'funktsioon',
      'tsükkel',
      'massiiv',
      'objektorienteeritud',
      'klass',
      'pärilus',
      'polümorfism',
      'andmebaas',
      'sql',
      'kompilaator',
      'rekursioon',
      'erind',
      'liides',
      'arhitektuur',
      'versioonihaldus',
      'python',
      'javascript',
      'java',
      'c++',
      'variable',
      'inheritance',
      'polymorphism',
      'encapsulation',
      'recursion',
      'compiler',
      'database'
    ],
    canonicalConceptsET: [
      {
        term: 'Objektorienteeritud programmeerimine (OOP)',
        definition:
          'Programmeerimisparadigma, mis koondab andmed (atribuudid) ja nendega seotud käitumise (meetodid) objektidesse ja klassidesse.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Object-Oriented Programming (OOP)',
        definition:
          'A programming paradigm based on objects encapsulating state (fields) and behavior (methods), supporting inheritance and polymorphism.'
      }
    ]
  },
  {
    id: 'algorithms_ds',
    subjectET: 'Andmestruktuurid ja algoritmid',
    subjectEN: 'Data Structures & Algorithms',
    textbooksET: [
      'T. H. Cormen et al. „Introduction to Algorithms (CLRS)“',
      'R. Sedgewick, K. Wayne „Algorithms“',
      'J. Kiho „Algoritmid ja andmestruktuurid“'
    ],
    textbooksEN: [
      'Cormen, Leiserson, Rivest, Stein "Introduction to Algorithms (CLRS)"',
      'Sedgewick & Wayne "Algorithms"'
    ],
    keywords: [
      'algoritm',
      'andmestruktuur',
      'ajaline keerukus',
      'mahuline keerukus',
      'kahendpuu',
      'otsingupuu',
      'räsitabel',
      'graaf',
      'laiuti otsing',
      'sügavuti otsing',
      'dijkstra',
      'sorteerimine',
      'kiirsorteerimine',
      'mestimissorteerimine',
      'pinu',
      'järjekord',
      'ahel',
      'dünaamiline programmeerimine',
      'time complexity',
      'binary search tree',
      'hash table',
      'shortest path',
      'quicksort',
      'mergesort',
      'dynamic programming'
    ],
    canonicalConceptsET: [
      {
        term: 'Algoritmi asümptootiline keerukus O(f(n))',
        definition:
          'Kirjeldab algoritmi tööaja või mälukasutuse ülempiiri kasvu sõltuvalt sisendi mahust n.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Asymptotic Time Complexity O(f(n))',
        definition:
          'Characterizes the upper bound on the growth rate of an algorithm’s running time as input size n increases.'
      }
    ]
  },
  {
    id: 'statistics_prob',
    subjectET: 'Statistika ja tõenäosusteooria',
    subjectEN: 'Statistics & Probability Theory',
    textbooksET: [
      'S. Ross „A First Course in Probability“',
      'L. Wasserman „All of Statistics“',
      'E.-M. Tiit, T. Möls „Tõenäosusteooria ja matemaatiline statistika“'
    ],
    textbooksEN: [
      'S. Ross "A First Course in Probability"',
      'L. Wasserman "All of Statistics"',
      'Casella & Berger "Statistical Inference"'
    ],
    keywords: [
      'tõenäosus',
      'juhuslik suurus',
      'keskväärtus',
      'dispersioon',
      'standardhälve',
      'normaaljaotus',
      'binoomjaotus',
      'poissoni',
      'bayesi',
      'korrelatsioon',
      'regressioon',
      'hüpotees',
      'olulisuse nivoo',
      'p-väärtus',
      'usaldusvahemik',
      'valim',
      'üldkogum',
      'mediaan',
      'kvartiil',
      'probability',
      'random variable',
      'variance',
      'standard deviation',
      'normal distribution',
      'confidence interval',
      'hypothesis testing',
      'linear regression'
    ],
    canonicalConceptsET: [
      {
        term: 'Keskväärtus E(X) ja dispersioon D(X)',
        definition:
          'Keskväärtus E(X) iseloomustab juhusliku suuruse keskmist asukohta, dispersioon D(X) = E[(X − E(X))²] aga väärtuste hajuvust.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Expected Value E(X) & Variance Var(X)',
        definition:
          'Expected value E(X) measures the center of a distribution, while variance Var(X) = E[(X − E(X))²] measures spread.'
      }
    ]
  },
  {
    id: 'economics_finance',
    subjectET: 'Majandusteooria ja rahandus',
    subjectEN: 'Economics & Corporate Finance',
    textbooksET: [
      'N. G. Mankiw „Principles of Economics“',
      'H. R. Varian „Intermediate Microeconomics“',
      'R. Brealey, S. Myers „Principles of Corporate Finance“'
    ],
    textbooksEN: [
      'N. G. Mankiw "Principles of Economics"',
      'H. R. Varian "Intermediate Microeconomics"',
      'Brealey, Myers, Allen "Principles of Corporate Finance"'
    ],
    keywords: [
      'nõudlus',
      'pakkumine',
      'turutasakaal',
      'hinnaelastsus',
      'piirkulu',
      'piirtulu',
      'alternatiivkulu',
      'inflatsioon',
      'sisemajanduse koguprodukt',
      'skp',
      'intressimäär',
      'keskpank',
      'rahapoliitika',
      'eelarve',
      'bilanss',
      'kasumiaruanne',
      'rahavoog',
      'nüüdisväärtus',
      'npv',
      'monopol',
      'oligopol',
      'supply and demand',
      'elasticity',
      'marginal cost',
      'marginal revenue',
      'gross domestic product',
      'inflation',
      'net present value',
      'balance sheet'
    ],
    canonicalConceptsET: [
      {
        term: 'Turutasakaal ning nõudluse ja pakkumise seadus',
        definition:
          'Tasakaaluhind kujuneb punktis, kus nõutav kogus võrdub pakutava kogusega: Q_D(P) = Q_S(P).'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Market Equilibrium',
        definition:
          'The price-quantity pair where quantity demanded equals quantity supplied: Q_D(P) = Q_S(P).'
      }
    ]
  },
  {
    id: 'electrical_eng',
    subjectET: 'Elektrotehnika ja elektroonika',
    subjectEN: 'Electrical Engineering & Electronics',
    textbooksET: [
      'J. W. Nilsson, S. A. Riedel „Electric Circuits“',
      'A. Sedra, K. Smith „Microelectronic Circuits“',
      'R. Lahtmets „Elektrotehnika I–II“'
    ],
    textbooksEN: [
      'Nilsson & Riedel "Electric Circuits"',
      'Sedra & Smith "Microelectronic Circuits"'
    ],
    keywords: [
      'alalisvool',
      'vahelduvvool',
      'kirchhoffi',
      'takistus',
      'mahtuvus',
      'induktiivsus',
      'reaktiivtakistus',
      'impedants',
      'kondensaator',
      'diood',
      'transistor',
      'operatsioonvõimendi',
      'võimsustegur',
      'kolmefaasiline',
      'trafo',
      'transformaator',
      'kirchhoff',
      'impedance',
      'capacitance',
      'inductance',
      'operational amplifier',
      'diode',
      'transistor'
    ],
    canonicalConceptsET: [
      {
        term: 'Kirchhoffi voolu- ja pingeseadus',
        definition:
          'I seadus: sõlme koonduvate voolude algebraline summa on null (∑I = 0). II seadus: kinnise kontuuri pingelangude summa võrdub elektromotoorjõudude summaga.'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Kirchhoff’s Current and Voltage Laws (KCL & KVL)',
        definition:
          'KCL states that the algebraic sum of currents entering a node is zero; KVL states that the sum of voltages around any closed loop is zero.'
      }
    ]
  },
  {
    id: 'biology_medicine',
    subjectET: 'Bioloogia, anatoomia ja meditsiin',
    subjectEN: 'Biology, Anatomy & Life Sciences',
    textbooksET: [
      'N. A. Campbell, J. B. Reece „Bioloogia“',
      'B. Alberts et al. „Molecular Biology of the Cell“',
      'A. Guyton, J. Hall „Textbook of Medical Physiology“'
    ],
    textbooksEN: [
      'Urry et al. "Campbell Biology"',
      'Alberts et al. "Molecular Biology of the Cell"',
      'Guyton & Hall "Textbook of Medical Physiology"'
    ],
    keywords: [
      'rakk',
      'rakumembraan',
      'mitokonder',
      'ribosoom',
      'dna',
      'rna',
      'valgusüntees',
      'transkriptsioon',
      'translatsioon',
      'mitoos',
      'meioos',
      'kromosoom',
      'geen',
      'alleel',
      'ensüüm',
      'ainevahetus',
      'atp',
      'fotosüntees',
      'hingamine',
      'närvisüsteem',
      'neuroni',
      'sünaps',
      'homöostaas',
      'immuunsüsteem',
      'cell membrane',
      'mitochondria',
      'transcription',
      'translation',
      'mitosis',
      'meiosis',
      'enzyme',
      'metabolism',
      'homeostasis'
    ],
    canonicalConceptsET: [
      {
        term: 'Molekulaarbioloogia põhidogma',
        definition:
          'Geneetilise info ülekandumise suund rakus: DNA → RNA (transkriptsioon) → valk (translatsioon).'
      }
    ],
    canonicalConceptsEN: [
      {
        term: 'Central Dogma of Molecular Biology',
        definition:
          'Describes the flow of genetic information within a biological system: DNA → RNA (transcription) → Protein (translation).'
      }
    ]
  }
];

/**
 * Checks whether a line or fragment is a URL, YouTube link, email, file path,
 * slide footer, timestamp, or meaningless metadata that should NEVER become a flashcard or topic title.
 */
export function isNoiseOrUrlLine(str) {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (trimmed.length < 3) return true;

  // Contains URLs, protocols, domain names, YouTube links, or file extensions
  if (
    /\b(?:https?:\/\/|ftp:\/\/|www\.|youtu\.be|youtube\.com|watch\?v=|moodle\.|ois\.|taltech\.ee|ut\.ee|tlu\.ee|emu\.ee|doi\.org|wikipedia\.org)\b/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // Standalone protocol or URL fragment like "https", "http", "//www..."
  if (/^(?:https?|ftp|mailto|file|www)\b/i.test(trimmed) || trimmed.includes('://')) {
    return true;
  }

  // Email addresses
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(trimmed)) {
    return true;
  }

  // Pure page/slide counters, dates, timestamps (e.g. "12:30", "14.11.2025", "Lk 3 / 15")
  if (
    /^(?:slaid|slide|lk|page|lehekülg|osa|section)?\s*\d+(?:\s*[/|-]\s*\d+)?$/i.test(
      trimmed
    )
  ) {
    return true;
  }
  if (/^\d{1,2}[:.]\d{2}(?:\s*-\s*\d{1,2}[:.]\d{2})?$/.test(trimmed)) {
    return true;
  }
  if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(trimmed)) {
    return true;
  }

  // Lecturer / course code boilerplate headers
  if (
    /^(?:koostas|autor|lektor|õppejõud|allikas|viide|copyright|©|kõik õigused)/i.test(
      trimmed
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Removes inline URLs, email addresses, and noisy artifacts from a text line while preserving scientific text & formulas.
 */
export function stripUrlsAndNoise(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/https?:\/\/[^\s)]+/gi, '')
    .replace(/www\.[^\s)]+/gi, '')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Compares the full text of the uploaded PDF/PPTX/TXT against our scientific textbook knowledge base
 * to understand what subject/topic it is about, and returns a non-binding subject recommendation + matched textbook context.
 */
export function analyzeDocumentWithTextbooks(pages = [], fileName = '', contentLang = 'et') {
  const isEN = contentLang === 'en';
  const fullText = [
    (fileName || '').replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
    ...pages.map((p) => `${p.title || ''}\n${p.content || ''}`)
  ]
    .join('\n')
    .toLowerCase();

  const scoredDomains = ACADEMIC_DOMAINS.map((domain) => {
    let score = 0;
    const matchedKeywords = [];

    for (const kw of domain.keywords) {
      const kwLower = kw.toLowerCase();
      // Count occurrences in full text
      const escaped = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}`, 'gi');
      const matches = fullText.match(regex);
      if (matches && matches.length > 0) {
        score += Math.min(8, matches.length * 2) + (kwLower.length > 8 ? 2 : 1);
        if (!matchedKeywords.includes(kw)) {
          matchedKeywords.push(kw);
        }
      }
    }

    return {
      domain,
      score,
      matchedKeywords: matchedKeywords.slice(0, 6)
    };
  }).sort((a, b) => b.score - a.score);

  const best = scoredDomains[0];
  const alternatives = scoredDomains
    .slice(1, 4)
    .filter((d) => d.score > 0)
    .map((d) => (isEN ? d.domain.subjectEN : d.domain.subjectET));

  if (!best || best.score === 0) {
    return {
      hasMatch: false,
      recommendedSubject: isEN ? 'General Course Material' : 'Matemaatiline analüüs',
      alternativeSubjects: isEN
        ? ['Physics', 'Chemistry & Materials Science', 'Programming & Software Engineering']
        : ['Füüsika', 'Tugevusõpetus ja tehniline mehaanika', 'Keemia ja materjaliõpetus'],
      confidence: 'low',
      matchedKeywords: [],
      matchedTextbooks: [],
      domain: null
    };
  }

  return {
    hasMatch: true,
    recommendedSubject: isEN ? best.domain.subjectEN : best.domain.subjectET,
    alternativeSubjects: alternatives,
    confidence: best.score >= 12 ? 'high' : best.score >= 5 ? 'medium' : 'low',
    matchedKeywords: best.matchedKeywords,
    matchedTextbooks: isEN ? best.domain.textbooksEN : best.domain.textbooksET,
    domain: best.domain
  };
}
