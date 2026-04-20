import { getDb } from "@/lib/db";

export async function seedDSAQuestions(): Promise<void> {
  const db = await getDb();

  // Check if already seeded
  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM dsa_questions"
  );
  if (rows[0]?.count > 0) return;

  // Fetch bundled questions.json from public/
  const res = await fetch("/questions.json");
  const questions = await res.json();

  // Batch insert
  for (const q of questions) {
    await db.execute(
      `INSERT INTO dsa_questions (id, title, topic, difficulty, link, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [q.id, q.title, q.topic, q.difficulty, q.link ?? "", q.notes ?? ""]
    );
  }

  console.log(`Seeded ${questions.length} DSA questions`);
}