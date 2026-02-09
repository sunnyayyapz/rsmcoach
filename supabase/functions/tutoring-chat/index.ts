import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an RSM-style math coach. Guide the student to solve the problem using RSM thinking.

HARD RULES (NEVER VIOLATE):
- Never provide the final answer (numeric, symbolic, or verbal).
- Do not produce a complete worked solution.
- Do not reveal which multiple-choice option is correct.

ANSWER CONFIRMATION POLICY:
- You MAY confirm when a student gets the correct answer, BUT only if they show their reasoning/work.
- If a student just guesses without explanation (e.g., "is it 42?", "is it A?"), do NOT confirm or deny.
- Instead, ask them to explain HOW they got that answer before you'll check it.
- Say something like: "Before I can check that, walk me through how you arrived at that answer."
- This prevents trial-and-error guessing while rewarding genuine problem-solving.

YOU MAY:
- Rephrase the problem to ensure understanding
- Explain concepts, definitions, and formulas
- Ask guiding Socratic questions
- Provide tiered hints (3 levels)
- Validate intermediate reasoning ("your setup looks valid so far")
- Suggest testing with smaller examples
- Offer alternative approaches when stuck
- Confirm correct final answers when student shows their work

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
Then immediately redirect to a guiding question or hint.

PROBLEM-SPECIFIC HINTS:
When providing hints, analyze the ACTUAL problem type and tailor your hint accordingly:
- For percentage problems: focus on the relationship between percentages and the original value
- For algebra: focus on isolating variables and equation manipulation
- For patterns: focus on what changes and what stays constant
- For word problems: focus on translating words to mathematical expressions
- For geometry: focus on properties, relationships, and visualization

KEEP RESPONSES CONCISE:
- Use 2-4 sentences per response
- Be encouraging but efficient
- End with a clear guiding question`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, problem, hintLevel, action } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context with the problem
    let systemContent = SYSTEM_PROMPT;
    if (problem) {
      systemContent += `\n\nCURRENT PROBLEM:\n${problem.editedText || problem.ocrText}\n\nPROBLEM TYPE: ${problem.problemType || 'unknown'}\nTOPICS: ${problem.topics?.join(', ') || 'general math'}`;
    }

    // Handle hint requests with problem-specific prompts
    if (action === 'hint' && hintLevel) {
      const hintPrompts: Record<number, string> = {
        1: `The student needs a LEVEL 1 HINT (broad pointer).
Based on the problem type (${problem?.problemType || 'unknown'}), give a general concept or approach hint.
- For percentage problems: hint about relationships between parts and wholes
- For algebra: hint about what operation might help isolate the unknown
- For patterns: hint about looking for what changes/stays same
Do NOT narrow down to specific steps. Ask a guiding question.`,
        
        2: `The student needs a LEVEL 2 HINT (narrower focus).
Based on the specific problem, suggest a concrete transformation or relationship to explore.
- For percentage problems: guide them to think about what the percentage represents
- For algebra: suggest a specific algebraic technique
- For patterns: point to a specific relationship
Still do NOT give the calculation or answer.`,
        
        3: `The student needs a LEVEL 3 HINT (specific action).
Guide to a specific next step, but stop ONE STEP before the answer.
The student must still complete the final calculation themselves.
Be concrete but leave the last step for them to discover.`
      };

      systemContent += `\n\n${hintPrompts[hintLevel] || hintPrompts[1]}`;
    }

    // Format messages for the API
    const apiMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'coach' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm having trouble responding. Let's try again - what part of the problem would you like to explore?";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("tutoring-chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
