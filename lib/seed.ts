import { getDb } from "@/lib/db";

export async function seedDSAQuestions(): Promise<void> {
  const db = await getDb();

  const res = await fetch("/questions.json");
  const questions = await res.json();

  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM dsa_questions"
  );

  if (rows[0]?.count === 0) {
    // Fresh install — insert everything including companies
    for (const q of questions) {
      await db.execute(
        `INSERT INTO dsa_questions (id, title, topic, difficulty, link, notes, companies)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [q.id, q.title, q.topic, q.difficulty, q.link ?? "", q.notes ?? "", q.companies ?? ""]
      );
    }
    console.log(`Seeded ${questions.length} DSA questions`);
  } else {
    // Existing install — patch companies for rows that don't have it yet
    for (const q of questions) {
      await db.execute(
        `UPDATE dsa_questions SET companies = ? WHERE id = ? AND (companies IS NULL OR companies = '')`,
        [q.companies ?? "", q.id]
      );
    }
    console.log(`Patched companies for existing DSA questions`);
  }
}
