export type ModelTarget = "GPT" | "Gemini" | "Claude" | "Any";

export interface Prompt {
  id: number;
  user_id: number;
  title: string;
  body: string;
  tags: string;
  model_target: ModelTarget;
  created_at: string;
  updated_at: string;
}

export interface PromptFormData {
  title: string;
  body: string;
  tags: string;
  model_target: ModelTarget;
}