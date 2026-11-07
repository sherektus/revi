import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Volume2
} from 'lucide-react';
import MathFormula from './MathFormula';

// Curated concepts with evaluation points and follow-up questions
const CONCEPT_KNOWLEDGE_BASE = [
  {
    id: 'derivative-speed',
    nameET: 'Tuletis kui muutumiskiirus',
    nameEN: 'Derivative as rate of change',
    subject: 'Matemaatika',
    essentialKeywords: ['kiirus', 'muutus', 'suhe', 'piirväärtus', 'hetkeline', 'delta', 'dx', 'dt', 'graafik'],
    keyPointsET: [
      'Tuletis kirjeldab funktsiooni hetkelist muutumiskiirust antud punktis.',
      'See on funktsiooni muudu ja argumendi muudu suhte piirväärtus (Δy/Δx, kui Δx läheneb 0-le).',
      'Füüsikas on teepikkuse tuletis aja järgi hetkkiirus v(t) = s\'(t).'
    ],
    missingCriteriaET: [
      {
        test: (text) => !text.includes('piirväärtus') && !text.includes('lim') && !text.includes('lähene'),
        point: 'Mõiste range matemaatiline sisu: tuletis on piirväärtus (lim), kus argumendi muutus läheneb nullile.'
      },
      {
        test: (text) => !text.includes('hetk') && !text.includes('punkt') && !text.includes('kohal'),
        point: 'Täpsustus, et tegemist on just hetkelise muutusega konkreetsel kohal x₀, mitte keskmise kiirusega pika vahemiku jooksul.'
      },
      {
        test: (text) => !text.includes('tõus') && !text.includes('puutuja'),
        point: 'Geomeetriline seos: tuletis tähistab funktsiooni graafiku puutuja tõusu k.'
      }
    ],
    followUpQuestionET: 'Kui funktsiooni tuletis mingis punktis on võrdne nulliga (f\'(x) = 0), mida see graafiliselt puutuja ja funktsiooni kasvu/kahanemise kohta tähendab?',
    followUpAnswerET: 'Tuletis 0 tähendab, et puutuja on horisontaalne (tõus k = 0). Sageli viitab see funktsiooni lokaalsele ekstreemumile (maksimum või miinimum) või statsionaarsele punktile.'
  },
  {
    id: 'tangent-slope',
    nameET: 'Tuletise geomeetriline tähendus (puutuja tõus)',
    nameEN: 'Geometric meaning of derivative (tangent slope)',
    subject: 'Matemaatika',
    essentialKeywords: ['puutuja', 'tõus', 'graafik', 'sirge', 'k', 'nurk', 'punkt'],
    keyPointsET: [
      'Tuletis f\'(x₀) võrdub funktsiooni y = f(x) graafiku puutuja tõusuga k punktis x₀.',
      'Tõus k näitab sirge kallet ehk tõusunurga tangensit (k = tan α).',
      'Puutuja võrrandi saab kuju y - y₀ = f\'(x₀)(x - x₀).'
    ],
    missingCriteriaET: [
      {
        test: (text) => !text.includes('tõus') && !text.includes('kall'),
        point: 'Puutuja tõusu k otsene nimetamine.'
      },
      {
        test: (text) => !text.includes('puutepunkt') && !text.includes('kohal') && !text.includes('x₀'),
        point: 'Täpsustus, et tõus arvutatakse konkreetses puutepunktis (x₀, y₀).'
      }
    ],
    followUpQuestionET: 'Kui graafiku puutuja on punktis tõusev (k > 0), kas funktsioon selles punktis kasvab või kahaneb?',
    followUpAnswerET: 'Kui k = f\'(x₀) > 0, on funktsioon selles punktis rangelt kasvav.'
  },
  {
    id: 'inverse-matrix',
    nameET: 'Pöördmaatriks ja determinant',
    nameEN: 'Inverse matrix and determinant',
    subject: 'Kõrgem matemaatika',
    essentialKeywords: ['determinant', 'ühikmaatriks', 'korrutis', 'ruutmaatriks', 'ei võrdu nulliga', 'a⁻¹', 'i'],
    keyPointsET: [
      'Pöördmaatriks A⁻¹ rahuldab seost A · A⁻¹ = A⁻¹ · A = I (ühikmaatriks).',
      'Pöördmaatriks eksisteerib parajasti siis, kui maatriks on ruutmaatriks ja det(A) ≠ 0.',
      'Kui det(A) = 0, on tegu singulaarse maatriksiga ja pöördmaatriksit ei leidu.'
    ],
    missingCriteriaET: [
      {
        test: (text) => !text.includes('det') && !text.includes('null'),
        point: 'Oluline tingimus: determinandi väärtus ei tohi olla 0 (det(A) ≠ 0).'
      },
      {
        test: (text) => !text.includes('ühik') && !text.includes('i'),
        point: 'Tulemus: korrutis annab ühikmaatriksi I, kus peadiagonaalil on ühed ja mujal nullid.'
      }
    ],
    followUpQuestionET: 'Miks ei saa ristkülikmaatriksil (nt 2x3 mõõtmetega) tavapärast kahepoolset pöördmaatriksit eksisteerida?',
    followUpAnswerET: 'Pöördmaatriks nõuab mõlemapoolset korrutatavust samade mõõtmetega ruutmaatriksina, mistõttu tavapärane pöördmaatriks eksisteerib vaid ruutmaatriksitel (n x n).'
  }
];

export default function ExplainInOwnWordsModal({
  isOpen,
  onClose,
  initialConcept = null,
  initialSubject = null,
  t,
  isEN = false
}) {
  const [selectedConceptId, setSelectedConceptId] = useState(
    initialConcept || CONCEPT_KNOWLEDGE_BASE[0].id
  );
  const [customConceptTitle, setCustomConceptTitle] = useState('');
  const [explanationText, setExplanationText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userFollowUpAnswer, setUserFollowUpAnswer] = useState('');
  const [showFollowUpSolution, setShowFollowUpSolution] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isEN ? 'en-US' : 'et-EE';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setExplanationText((prev) => {
          const base = prev.trim();
          return base ? `${base} ${transcript.trim()}` : transcript.trim();
        });
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
        if (e.error !== 'no-speech') {
          setRecognitionError(
            isEN
              ? `Microphone error (${e.error}). You can type your explanation.`
              : `Mikrofoni viga (${e.error}). Selgituse saab sisestada ka tekstina.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isEN]);

  useEffect(() => {
    if (initialConcept) {
      const match = CONCEPT_KNOWLEDGE_BASE.find(
        (c) => c.id === initialConcept || c.nameET.toLowerCase().includes(initialConcept.toLowerCase())
      );
      if (match) {
        setSelectedConceptId(match.id);
      } else {
        setSelectedConceptId('custom');
        setCustomConceptTitle(initialConcept);
      }
    }
  }, [initialConcept]);

  if (!isOpen) return null;

  const currentConcept =
    CONCEPT_KNOWLEDGE_BASE.find((c) => c.id === selectedConceptId) || null;

  function toggleSpeech() {
    if (!speechSupported || !recognitionRef.current) {
      alert(
        isEN
          ? 'Voice input is supported in Chrome, Edge, and Safari.'
          : 'Kõnetuvastus on toetatud Google Chrome, Edge ja Safari brauserites.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      setRecognitionError(null);
      try {
        recognitionRef.current.lang = isEN ? 'en-US' : 'et-EE';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  }

  function handleEvaluate() {
    if (!explanationText.trim()) return;

    const lower = explanationText.toLowerCase();

    if (currentConcept) {
      // Evaluate against known concept
      const hits = [];
      const misses = [];

      currentConcept.keyPointsET.forEach((pt) => {
        // Simple heuristic: if any word match
        const words = pt.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
        const matchCount = words.filter((w) => lower.includes(w.slice(0, -1))).length;
        if (matchCount >= 2) {
          hits.push(pt);
        }
      });

      // Check missing criteria
      currentConcept.missingCriteriaET.forEach((crit) => {
        if (crit.test(lower)) {
          misses.push(crit.point);
        }
      });

      // If user wrote something detailed but hits are empty, add at least 1 positive
      if (hits.length === 0 && lower.length > 30) {
        hits.push(
          isEN
            ? 'Good initiative to formulate the concept in natural language!'
            : 'Väga hea algus! Püüdsid mõistet oma sõnadega ja vabas vormis lahti mõtestada.'
        );
      }

      setAnalysisResult({
        conceptName: isEN ? currentConcept.nameEN : currentConcept.nameET,
        hits: hits.length > 0 ? hits : [
          isEN ? 'You described general aspects of the concept.' : 'Kirjeldasid mõiste üldist olemust.'
        ],
        misses: misses.length > 0 ? misses : [
          isEN
            ? 'Excellent work! Almost all core nuances were accurately mentioned.'
            : 'Suurepärane töö! Selgitus kattis peaaegu kõik olulisemad nüansid.'
        ],
        followUpQuestion: isEN
          ? 'What happens to the derivative value when the function remains completely constant?'
          : currentConcept.followUpQuestionET,
        followUpAnswer: isEN
          ? 'The derivative of a constant function is 0, since the value does not change at all.'
          : currentConcept.followUpAnswerET
      });
    } else {
      // Custom concept evaluation
      const length = lower.length;
      setAnalysisResult({
        conceptName: customConceptTitle || (isEN ? 'Custom Concept' : 'Sinu valitud mõiste'),
        hits: [
          isEN
            ? 'Clear and concise phrasing used.'
            : 'Selge sõnastus ja mõtte struktureeritud esitus.',
          isEN
            ? 'Good attempt to explain the intuition behind the topic.'
            : 'Oma sõnadega sõnastamine kinnistab mõistet tunduvalt paremini kui passiivne lugemine.'
        ],
        misses: length < 60 ? [
          isEN
            ? 'Consider adding an explicit practical example or formula.'
            : 'Soovitus: lisa selgitusele üks konkreetne arvuline või eluline näide ja seotud põhivalem.'
        ] : [
          isEN
            ? 'Check that all boundary conditions or domain restrictions are satisfied.'
            : 'Kontrolli, kas kehtivad ka erandid või ääretingimused (nt väärtuste määramispiirkond).'
        ],
        followUpQuestion: isEN
          ? `How would you explain the importance of "${customConceptTitle || 'this concept'}" to someone encountering it for the first time?`
          : `Kuidas selgitaksid mõiste „${customConceptTitle || 'see teema'}“ praktilist vajadust inimesele, kes kuuleb sellest esimest korda?`,
        followUpAnswer: isEN
          ? 'A great explanation connects theory to an observable real-world phenomenon and demonstrates why the concept was invented.'
          : 'Hea selgitus seob teooria elulise vajadusega: miks see matemaatiline või füüsikaline tööriist üldse leiutati ja millist reaalset probleemi see lahendab.'
      });
    }

    setShowFollowUpSolution(false);
    setUserFollowUpAnswer('');
  }

  function handleReset() {
    setAnalysisResult(null);
    setExplanationText('');
    setUserFollowUpAnswer('');
    setShowFollowUpSolution(false);
    setRecognitionError(null);
  }

  return (
    <div
      className="modal-backdrop explain-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card explain-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="feynman-badge">
              <Sparkles size={16} />
              <span>{isEN ? 'Feynman Technique' : 'Feynmani meetod'}</span>
            </div>
            <h2 className="modal-title">
              {isEN ? '“Explain in Your Own Words”' : '„Selgita oma sõnadega”'}
            </h2>
            <p className="modal-subtitle">
              {isEN
                ? 'Explaining a concept naturally highlights what you have truly mastered versus where gaps remain.'
                : 'Mõiste selgitamine vabas vormis toob koheselt välja, mis on päriselt selge ja mis vajab veel kordamist.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon modal-close-btn"
            onClick={onClose}
            aria-label="Sulge"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body explain-modal-body">
          {/* Step 1: Select concept */}
          <div className="form-group mb-4">
            <label className="form-label font-bold">
              <BookOpen size={15} className="mr-1 inline accent-text" />
              {isEN ? 'Choose a concept to explain:' : 'Vali mõiste, mida soovid selgitada:'}
            </label>
            <div className="concept-chips-list">
              {CONCEPT_KNOWLEDGE_BASE.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`concept-chip ${selectedConceptId === c.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedConceptId(c.id);
                    setAnalysisResult(null);
                  }}
                >
                  <span className="chip-subject">{c.subject}</span>
                  <span className="chip-name">{isEN ? c.nameEN : c.nameET}</span>
                </button>
              ))}
              <button
                type="button"
                className={`concept-chip ${selectedConceptId === 'custom' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedConceptId('custom');
                  setAnalysisResult(null);
                }}
              >
                <span className="chip-subject">{isEN ? 'Custom' : 'Oma mõiste'}</span>
                <span className="chip-name">{isEN ? '+ Enter concept' : '+ Sisesta muu mõiste'}</span>
              </button>
            </div>

            {selectedConceptId === 'custom' && (
              <input
                type="text"
                className="input input-bordered mt-2 w-full"
                placeholder={isEN ? 'e.g. Photosynthesis, Chain Rule, Normal Distribution...' : 'nt Tuletise korrutise reegel, Pöördkeha ruumala, Oomi seadus...'}
                value={customConceptTitle}
                onChange={(e) => setCustomConceptTitle(e.target.value)}
              />
            )}
          </div>

          {/* Step 2: Explanation Input (Text + Speech) */}
          <div className="form-group mb-4">
            <div className="flex-between items-center mb-1">
              <label className="form-label font-bold">
                {isEN
                  ? 'Your explanation (text or speech):'
                  : 'Sinu selgitus (kirjuta või räägi mikrofoniga):'}
              </label>

              {speechSupported && (
                <button
                  type="button"
                  className={`btn btn-sm ${isListening ? 'btn-danger recording-pulse' : 'btn-secondary'}`}
                  onClick={toggleSpeech}
                  title={isListening ? 'Peata salvestus' : 'Alusta kõnetuvastust'}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  <span>
                    {isListening
                      ? (isEN ? 'Listening... Click to stop' : 'Kuulan... Klõpsa peatamiseks')
                      : (isEN ? 'Record with voice' : 'Räägi mikrofoni')}
                  </span>
                </button>
              )}
            </div>

            {recognitionError && (
              <div className="callout callout-warning mb-2 text-xs">
                <AlertTriangle size={14} />
                <span>{recognitionError}</span>
              </div>
            )}

            <div className="textarea-container">
              <textarea
                className="textarea input-bordered explain-textarea"
                rows={5}
                placeholder={
                  isEN
                    ? 'Explain this concept simply, as if teaching a classmate. What is it, why does it matter, and how does it work?'
                    : 'Selgita seda mõistet oma sõnadega, nagu selgitaksid seda klassikaaslasele. Mis see on, miks seda vaja läheb ja kuidas see töötab?'
                }
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
              />
              {isListening && (
                <div className="live-mic-indicator">
                  <span className="mic-dot" />
                  <span>{isEN ? 'Listening to speech...' : 'Kõne transkribeerimine...'}</span>
                </div>
              )}
            </div>

            <div className="flex-between items-center mt-2">
              <span className="text-xs text-muted">
                {explanationText.trim().split(/\s+/).filter(Boolean).length}{' '}
                {isEN ? 'words' : 'sõna'}
              </span>

              <div className="flex-actions gap-2">
                {explanationText && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleReset}
                  >
                    <RotateCcw size={14} />
                    <span>{isEN ? 'Clear' : 'Puhasta'}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!explanationText.trim()}
                  onClick={handleEvaluate}
                >
                  <Sparkles size={16} />
                  <span>
                    {isEN ? 'Compare with study material' : 'Võrdle õppematerjaliga'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Analysis Results */}
          {analysisResult && (
            <div className="explain-analysis-card mt-4">
              <div className="analysis-header">
                <div className="badge badge-primary">
                  <Sparkles size={13} />
                  <span>{isEN ? 'Revi Feedback' : 'Revi võrdlus ja analüüs'}</span>
                </div>
                <h3 className="analysis-title">{analysisResult.conceptName}</h3>
              </div>

              {/* Mis oli hästi tabatud */}
              <div className="analysis-section hits-section">
                <div className="section-title text-success flex items-center gap-1.5 font-bold mb-2">
                  <CheckCircle2 size={16} />
                  <span>{isEN ? 'Well captured points:' : 'Mis oli väga hästi tabatud:'}</span>
                </div>
                <ul className="analysis-bullets">
                  {analysisResult.hits.map((hit, idx) => (
                    <li key={idx} className="analysis-bullet-item hit-item">
                      <span className="bullet-dot bg-success" />
                      <span>{hit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Puuduvad olulised mõtted */}
              <div className="analysis-section misses-section mt-3">
                <div className="section-title text-warning flex items-center gap-1.5 font-bold mb-2">
                  <AlertTriangle size={16} />
                  <span>{isEN ? 'Missing key concepts:' : 'Puuduvad olulised mõtted:'}</span>
                </div>
                <ul className="analysis-bullets">
                  {analysisResult.misses.map((miss, idx) => (
                    <li key={idx} className="analysis-bullet-item miss-item">
                      <span className="bullet-dot bg-warning" />
                      <span>{miss}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Üks täpsustav küsimus */}
              <div className="analysis-section follow-up-section mt-3">
                <div className="section-title text-primary flex items-center gap-1.5 font-bold mb-2">
                  <HelpCircle size={16} />
                  <span>{isEN ? 'One probing follow-up question:' : 'Üks täpsustav küsimus:'}</span>
                </div>
                <div className="follow-up-box">
                  <p className="follow-up-question font-medium">
                    {analysisResult.followUpQuestion}
                  </p>

                  <div className="follow-up-input-row mt-3">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      placeholder={isEN ? 'Type your answer here...' : 'Kirjuta oma vastus siia...'}
                      value={userFollowUpAnswer}
                      onChange={(e) => setUserFollowUpAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setShowFollowUpSolution(true);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowFollowUpSolution((s) => !s)}
                    >
                      {showFollowUpSolution
                        ? (isEN ? 'Hide answer' : 'Peida vastus')
                        : (isEN ? 'Check answer' : 'Kontrolli vastust')}
                    </button>
                  </div>

                  {showFollowUpSolution && (
                    <div className="follow-up-solution-card mt-3">
                      <div className="solution-label font-bold text-xs uppercase tracking-wider text-muted mb-1">
                        {isEN ? 'Core answer:' : 'Põhiline mõte:'}
                      </div>
                      <p className="solution-text">{analysisResult.followUpAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {isEN ? 'Close' : 'Sulge'}
          </button>
        </div>
      </div>
    </div>
  );
}
