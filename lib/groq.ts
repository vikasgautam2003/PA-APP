import { useSettingsStore } from "@/store/settingsStore";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

export async function askGroq(prompt: string, systemPrompt?: string): Promise<string> {
  const key = useSettingsStore.getState().groqKey;
  if (!key) throw new Error("Groq API key not set. Add it in Settings.");

  const messages: { role: string; content: string }[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      messages,
      temperature: 0.7,
      max_tokens:  2048,
      response_format: { type: "json_object" }, // enforce JSON for plan generation
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response from Groq.";
}

// For chat — no JSON mode needed
export async function askGroqChat(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  const key = useSettingsStore.getState().groqKey;
  if (!key) throw new Error("Groq API key not set. Add it in Settings.");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      messages:    [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.55,
      max_tokens:  4096,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response.";
}
