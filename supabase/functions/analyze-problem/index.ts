import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, textInput } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the message content - either image or text
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      });
      userContent.push({
        type: "text",
        text: `Extract the math problem from this image. Return ONLY a JSON object with these fields:
{
  "extractedText": "the exact math problem text extracted from the image",
  "confidence": 0.0 to 1.0 indicating how confident you are in the extraction,
  "topics": ["topic1", "topic2"] - mathematical topics this problem covers,
  "concepts": ["concept1", "concept2"] - key concepts needed to solve this,
  "gradeEstimate": "estimated grade level (e.g., 'Grade 5-6')",
  "safeRephrase": "restate the problem clearly without solving it",
  "problemType": "algebra|arithmetic|geometry|word-problem|percentage|ratio|pattern|other"
}

Be precise with mathematical notation. Use ^ for exponents, * for multiplication, / for division.
For fractions, use format like "3/4" or write them out.
Do NOT solve the problem. Only extract and analyze it.`
      });
    } else if (textInput) {
      userContent.push({
        type: "text",
        text: `Analyze this math problem (do NOT solve it). Return ONLY a JSON object:
{
  "extractedText": "${textInput}",
  "confidence": 1.0,
  "topics": ["topic1", "topic2"] - mathematical topics this problem covers,
  "concepts": ["concept1", "concept2"] - key concepts needed to solve this,
  "gradeEstimate": "estimated grade level (e.g., 'Grade 5-6')",
  "safeRephrase": "restate the problem clearly without solving it",
  "problemType": "algebra|arithmetic|geometry|word-problem|percentage|ratio|pattern|other"
}

Problem: ${textInput}`
      });
    } else {
      throw new Error("Either imageBase64 or textInput is required");
    }

    // Use Gemini 2.5 Pro for vision - best for image+text understanding
    const model = imageBase64 ? "google/gemini-2.5-pro" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: userContent
          }
        ],
        max_tokens: 1000,
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
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    try {
      const parsed = JSON.parse(jsonStr);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      // If JSON parsing fails, return raw extracted text
      return new Response(JSON.stringify({
        extractedText: content,
        confidence: 0.7,
        topics: ["Mathematics"],
        concepts: ["Problem Solving"],
        gradeEstimate: "Unknown",
        safeRephrase: content,
        problemType: "other"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("analyze-problem error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
