import { invoke } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import type { User, Session } from "@/types";

const SESSION_KEY = "devkit_session";
let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load("devkit.bin");
  }
  return store;
}

export async function signup(
  username: string,
  password: string
): Promise<User> {
  return invoke<User>("signup", { username, password });
}

export async function login(
  username: string,
  password: string
): Promise<User> {
  const user = await invoke<User>("login", { username, password });
  const session: Session = {
    user_id: user.id,
    username: user.username,
    token: crypto.randomUUID(),
  };
  const s = await getStore();
  await s.set(SESSION_KEY, session);
  await s.save();
  return user;
}

export async function logout(): Promise<void> {
  const s = await getStore();
  await s.delete(SESSION_KEY);
  await s.save();
}

export async function getSession(): Promise<Session | null> {
  try {
    const s = await getStore();
    const session = await s.get<Session>(SESSION_KEY);
    return session ?? null;
  } catch {
    return null;
  }
}