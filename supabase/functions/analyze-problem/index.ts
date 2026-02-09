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
        text: `You are an expert OCR system for math problems. Extract the COMPLETE and EXACT text from this image.

CRITICAL RULES:
1. Extract EVERY word and number - do not skip or summarize anything
2. Preserve the FULL question exactly as written
3. Include all parts: question text, numbers, equations, answer choices if any
4. For handwritten text, do your best to read it accurately

Return ONLY a valid JSON object (no markdown, no code blocks, no explanation):
{
  "extractedText": "THE COMPLETE EXACT TEXT FROM THE IMAGE - every single word",
  "confidence": 0.0 to 1.0,
  "topics": ["topic1", "topic2"],
  "concepts": ["concept1"],
  "gradeEstimate": "Grade X-Y",
  "safeRephrase": "clear restatement of the problem",
  "problemType": "algebra|arithmetic|geometry|word-problem|percentage|ratio|pattern|other"
}

Remember: extractedText must contain the ENTIRE question, not a summary.`
      });
    } else if (textInput) {
      userContent.push({
        type: "text",
        text: `Analyze this math problem (do NOT solve it). Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "extractedText": "${textInput.replace(/"/g, '\\"')}",
  "confidence": 1.0,
  "topics": ["topic1", "topic2"],
  "concepts": ["concept1", "concept2"],
  "gradeEstimate": "Grade X-Y",
  "safeRephrase": "clear restatement",
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
        max_tokens: 2000, // Increased to handle longer problems
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
    
    console.log("Raw AI response:", content.substring(0, 500));
    
    // Parse JSON from response - try multiple extraction methods
    let jsonStr = content.trim();
    
    // Method 1: Check for markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // Method 2: Find JSON object directly
    if (!jsonStr.startsWith('{')) {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = content.substring(jsonStart, jsonEnd + 1);
      }
    }
    
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Validate that extractedText exists and is not empty
      if (!parsed.extractedText || parsed.extractedText.trim() === '') {
        throw new Error("No extracted text found");
      }
      
      // Clean up the response - never expose raw JSON to user
      return new Response(JSON.stringify({
        extractedText: parsed.extractedText,
        confidence: parsed.confidence || 0.8,
        topics: Array.isArray(parsed.topics) ? parsed.topics : ["Mathematics"],
        concepts: Array.isArray(parsed.concepts) ? parsed.concepts : ["Problem Solving"],
        gradeEstimate: parsed.gradeEstimate || "Unknown",
        safeRephrase: parsed.safeRephrase || parsed.extractedText,
        problemType: parsed.problemType || "other"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", jsonStr.substring(0, 200));
      
      // Fallback: Clean any visible JSON from the content for display
      let cleanText = content
        .replace(/```(?:json)?[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\{[\s\S]*?\}/g, '') // Remove JSON objects
        .replace(/["{}[\]]/g, '') // Remove JSON characters
        .trim();
      
      // If still empty, try to extract meaningful text
      if (!cleanText) {
        cleanText = "Could not extract text from image. Please try again or type the problem manually.";
      }
      
      return new Response(JSON.stringify({
        extractedText: cleanText,
        confidence: 0.5,
        topics: ["Mathematics"],
        concepts: ["Problem Solving"],
        gradeEstimate: "Unknown",
        safeRephrase: cleanText,
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
