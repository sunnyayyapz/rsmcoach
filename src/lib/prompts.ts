// RSM Coach System Prompts - Immutable
// These prompts enforce the core pedagogy: guide thinking, never give answers

export const SYSTEM_PROMPT = `You are an RSM-style math coach. Guide the student to solve the problem using RSM thinking.

HARD RULES (NEVER VIOLATE):
- Never provide the final answer (numeric, symbolic, or verbal).
- Never confirm final correctness with phrases like "correct", "you got it", "that's right" for the final result.
- Do not produce a complete worked solution.
- Do not reveal which multiple-choice option is correct.

YOU MAY:
- Rephrase the problem to ensure understanding
- Explain concepts, definitions, and formulas
- Ask guiding Socratic questions
- Provide tiered hints (3 levels)
- Validate intermediate reasoning ("your setup looks valid so far")
- Suggest testing with smaller examples
- Offer alternative approaches when stuck

RSM PEDAGOGY - ALWAYS PREFER:
- Structure and patterns over memorization
- Invariants (what stays the same?)
- Smaller/simpler cases to build intuition
- Diagrams, tables, or organized work
- Working backwards from what we want

GUIDING QUESTIONS TO USE:
- "What do we know from the problem?"
- "What are we trying to find?"
- "What stays the same here?"
- "Can we test this with a smaller example?"
- "Can we draw a quick diagram or table?"
- "What's the relationship between these quantities?"

TIERED HINTS:
- Hint 1: Broad pointer - general direction or concept to consider
- Hint 2: Narrower focus - specific transformation or subproblem to tackle
- Hint 3: Specific next action - but still NOT the answer

PERSISTENCE:
If the student is stuck, try a different approach:
- Smaller case or simpler numbers
- Diagram or visual representation
- Working backwards
- Finding an invariant
- Rewriting the problem differently

NEVER give up - keep offering new angles.

NO-ANSWER REDIRECT:
If asked directly for the answer, respond with:
"I'm here to help you discover the answer yourself. Let's take it step by step..."
Then immediately redirect to a guiding question or hint.`;

export const ANALYSIS_PROMPT = `Analyze this math problem for tutoring. DO NOT SOLVE IT.

Return a JSON object with:
{
  "topics": ["topic1", "topic2"],
  "concepts": ["concept1", "concept2"],
  "gradeEstimate": "estimated grade level",
  "safeRephrase": "restate the problem clearly without solving",
  "rsmNotice": "What RSM-style insight should the student notice? (pattern, invariant, structure)",
  "suggestedApproach": "First pedagogical approach to try"
}

Focus on WHAT to notice, not HOW to solve.`;

export const HINT_PROMPTS = {
  1: `Provide a LEVEL 1 HINT (broad pointer):
- Point to a general concept or approach
- Ask a guiding question about what to notice
- Do NOT narrow down to specific steps
Example: "This problem involves [concept]. What do you notice about the numbers given?"`,
  
  2: `Provide a LEVEL 2 HINT (narrower focus):
- Suggest a specific transformation or subproblem
- Point to a useful relationship or pattern
- Still do NOT give the next calculation
Example: "Try thinking about what happens if we [specific action]. What pattern emerges?"`,
  
  3: `Provide a LEVEL 3 HINT (specific action):
- Guide to a specific next step
- Be concrete but stop one step before the answer
- Student must still complete the final calculation
Example: "If you [specific action], you'll find a value. What is that value, and what does it tell you?"`,
};

export const REFLECTION_PROMPT = `Generate a session summary for this tutoring conversation. DO NOT confirm if the student got the final answer correct.

Return a JSON object with:
{
  "conceptsPracticed": ["concept1", "concept2"],
  "strategiesUsed": ["strategy1", "strategy2"],
  "reflectionQuestions": [
    "Open-ended question to deepen understanding",
    "Question connecting to other problems",
    "Question about the approach used"
  ]
}

Focus on learning process, not correctness of final answer.`;

// ============================================
// GUARDRAILS - Based on evaluation-tests.md
// ============================================

// Test 1: Answer Leakage Detection
// Prompts: "what's the answer?", "solve it", "tell me x", "pick A/B/C/D"
export const ANSWER_SEEKING_PATTERNS = [
  /what('s| is) the (final )?(answer|solution)/i,
  /just (tell|give) me (the )?(answer|solution)/i,
  /solve (it|this)( for me)?/i,
  /tell me (what )?x( is|=)?/i,
  /pick (option )?(A|B|C|D)/i,
  /which (one|option|choice|letter) (is it|should I pick)/i,
  /what does x equal/i,
  /give me the (final )?(result|number)/i,
  /what is the value of/i,
];

// Test 2: Confirmation Leakage Detection
// Prompts: "is 42 correct?", "did I get it right?"
export const CONFIRMATION_SEEKING_PATTERNS = [
  /is (it |the answer |this )?(correct|right|\d+)/i,
  /did I get it (right|correct)/i,
  /is (\d+|[a-z]) (correct|right|the answer)/i,
  /am I (right|correct)/i,
  /check (my|the) answer/i,
  /is this (the )?(correct|right) (answer|solution)/i,
  /confirm (the|my|this) (answer|result)/i,
  /tell me if (I'm|I am) (right|correct)/i,
];

// Test 3: Near-Final Inference Detection
// Student is one step away - stop one step early
export const NEAR_FINAL_PATTERNS = [
  /so (the answer|it) (is|equals|must be)/i,
  /that means (the answer|x|it) (is|=)/i,
  /so x\s*=\s*\d/i,
  /therefore.*(is|=|equals)/i,
  /which gives us/i,
];

// Output scan patterns - detect if response leaks answers
export const ANSWER_LEAKING_PATTERNS = [
  /the (final )?(answer|solution) is/i,
  /equals?\s+\d+\s*$/i,
  /= \d+\s*[.!]?\s*$/i,
  /(correct|right)[!.]?\s*$/i,
  /you got it[!.]?\s*$/i,
  /that'?s (correct|right|the answer)/i,
  /yes,? (that'?s|it'?s) (correct|right)/i,
  /option [A-E] is (correct|right)/i,
  /the (correct|right) (answer|option|choice) is/i,
  /x\s*=\s*\d+\s*[.!]?\s*$/i,
  /the (value|result) is \d+/i,
];

// Confirmation leaking patterns
export const CONFIRMATION_LEAKING_PATTERNS = [
  /yes,? (that'?s|you('re| are)) (correct|right)/i,
  /correct!$/i,
  /right!$/i,
  /you got it/i,
  /that is (correct|right|the answer)/i,
  /\d+ is (correct|right)/i,
];

// Test 4: Pedagogy Integrity - Formula dump detection
export const FORMULA_DUMP_PATTERNS = [
  /the formula is/i,
  /just use this formula/i,
  /plug (it |this |these )?into/i,
  /the equation is simply/i,
];

// Refusal templates with redirects
export const REFUSAL_TEMPLATES = [
  "I'm here to help you discover the answer yourself! Let's think through this together.",
  "Great question! Rather than giving you the answer, let me help you figure it out step by step.",
  "I want you to have that 'aha!' moment. Let's work through the reasoning together.",
  "Finding the answer yourself will make it stick better. Here's what to think about next...",
];

// Test 5: Persistence templates - for when student says "I'm stuck"
export const PERSISTENCE_TEMPLATES = [
  "I hear you! Let's try a different angle. What if we used smaller numbers to see the pattern?",
  "Being stuck is part of learning! Can we draw a quick diagram or table to organize what we know?",
  "That's okay—let's step back. What stays the same in this problem? Finding an invariant often helps.",
  "Let's try working backwards. What would the answer need to look like?",
  "Here's an idea: let's rewrite the problem in a different form. Sometimes that reveals a path forward.",
];

export function detectAnswerSeeking(message: string): boolean {
  return ANSWER_SEEKING_PATTERNS.some(pattern => pattern.test(message));
}

export function detectConfirmationSeeking(message: string): boolean {
  return CONFIRMATION_SEEKING_PATTERNS.some(pattern => pattern.test(message));
}

export function detectNearFinal(message: string): boolean {
  return NEAR_FINAL_PATTERNS.some(pattern => pattern.test(message));
}

export function detectAnswerLeaking(response: string): boolean {
  return ANSWER_LEAKING_PATTERNS.some(pattern => pattern.test(response)) ||
         CONFIRMATION_LEAKING_PATTERNS.some(pattern => pattern.test(response));
}

export function detectStuck(message: string): boolean {
  const stuckPatterns = [
    /i('m| am) stuck/i,
    /i don'?t (know|understand|get it)/i,
    /help me/i,
    /i give up/i,
    /this is (too )?hard/i,
    /i can'?t (do|figure|solve)/i,
  ];
  return stuckPatterns.some(pattern => pattern.test(message));
}

export function getRandomRefusal(): string {
  return REFUSAL_TEMPLATES[Math.floor(Math.random() * REFUSAL_TEMPLATES.length)];
}

export function getRandomPersistence(): string {
  return PERSISTENCE_TEMPLATES[Math.floor(Math.random() * PERSISTENCE_TEMPLATES.length)];
}

// Test 6: Age-appropriate tone detection (for future AI integration)
export function getAgeTone(gradeLevel: string): 'elementary' | 'middle' | 'high' {
  const grade = parseInt(gradeLevel.replace(/\D/g, '')) || 5;
  if (grade <= 4) return 'elementary';
  if (grade <= 7) return 'middle';
  return 'high';
}
