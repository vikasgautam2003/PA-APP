import { useSettingsStore } from "@/store/settingsStore";
import type {
  FdeChatSources, FdeWebResult, FdeImageResult, FdeVideoResult,
} from "@/types";

const SERP_URL = "https://serpapi.com/search.json";

interface SerpRaw {
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  answer_box?: { title?: string; snippet?: string; link?: string; answer?: string };
  image_results?: Array<{
    title?: string; link?: string; thumbnail?: string; original?: string; source?: string;
  }>;
  video_results?: Array<{
    title?: string; link?: string; thumbnail?: string; duration?: string;
    date?: string; snippet?: string; displayed_link?: string;
    rich_snippet?: { top?: { detected_extensions?: { channel?: string } } };
  }>;
  error?: string;
}

async function fetchSerp(params: Record<string, string>): Promise<SerpRaw> {
  const key = useSettingsStore.getState().serpapiKey;
  if (!key) throw new Error("SerpAPI key not set. Add it in Settings.");
  const qs = new URLSearchParams({ ...params, api_key: key });
  const res = await fetch(`${SERP_URL}?${qs.toString()}`);
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  const data: SerpRaw = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function searchAll(query: string): Promise<FdeChatSources> {
  // Run the three engines in parallel; tolerate partial failures.
  const [webR, imagesR, videosR] = await Promise.allSettled([
    fetchSerp({ engine: "google", q: query, num: "6" }),
    fetchSerp({ engine: "google_images", q: query, num: "8" }),
    fetchSerp({ engine: "google_videos", q: query, num: "5" }),
  ]);

  const out: FdeChatSources = { web: [], images: [], videos: [] };

  if (webR.status === "fulfilled") {
    const w = webR.value;
    if (w.answer_box) {
      const ab = w.answer_box;
      out.answerBox = {
        title: ab.title,
        snippet: ab.snippet ?? ab.answer ?? "",
        link: ab.link,
      };
    }
    out.web = (w.organic_results ?? [])
      .filter((r): r is { title: string; link: string; snippet?: string } =>
        !!r.title && !!r.link)
      .map<FdeWebResult>((r) => ({
        title: r.title, link: r.link, snippet: r.snippet ?? "",
      }))
      .slice(0, 6);
  }

  if (imagesR.status === "fulfilled") {
    out.images = (imagesR.value.image_results ?? [])
      .filter((r): r is { thumbnail: string; link: string; title?: string; original?: string; source?: string } =>
        !!r.thumbnail && !!r.link)
      .map<FdeImageResult>((r) => ({
        title: r.title ?? "",
        link: r.link,
        thumbnail: r.thumbnail,
        original: r.original ?? r.thumbnail,
        source: r.source ?? "",
      }))
      .slice(0, 8);
  }

  if (videosR.status === "fulfilled") {
    const vids: FdeVideoResult[] = [];
    for (const r of videosR.value.video_results ?? []) {
      if (!r.title || !r.link) continue;
      vids.push({
        title: r.title,
        link: r.link,
        thumbnail: r.thumbnail ?? "",
        duration: r.duration ?? "",
        date: r.date ?? "",
        channel: r.rich_snippet?.top?.detected_extensions?.channel ?? r.displayed_link ?? "",
        snippet: r.snippet ?? "",
      });
      if (vids.length >= 5) break;
    }
    out.videos = vids;
  }

  return out;
}

export function formatSourcesForPrompt(s: FdeChatSources): string {
  const parts: string[] = [];

  if (s.answerBox?.snippet) {
    parts.push(`Featured answer:\n${s.answerBox.title ?? ""}\n${s.answerBox.snippet}${s.answerBox.link ? `\n${s.answerBox.link}` : ""}`);
  }

  if (s.web.length > 0) {
    const lines = s.web.map((r, i) => `[W${i + 1}] ${r.title}\n${r.link}\n${r.snippet}`);
    parts.push(`Web results (cite as [W1], [W2]…):\n\n${lines.join("\n\n")}`);
  }

  if (s.videos.length > 0) {
    const lines = s.videos.map((v, i) =>
      `[V${i + 1}] ${v.title}${v.duration ? ` · ${v.duration}` : ""}${v.channel ? ` · ${v.channel}` : ""}\n${v.link}\n${v.snippet}`
    );
    parts.push(`Video results — recommend the most relevant 1–2 inline as Markdown links (cite as [V1]):\n\n${lines.join("\n\n")}`);
  }

  if (s.images.length > 0) {
    parts.push(`${s.images.length} image results are also available; the UI will render them — you may briefly mention what visuals are shown.`);
  }

  return parts.length ? `Search context:\n\n${parts.join("\n\n---\n\n")}` : "";
}

export function emptySources(): FdeChatSources {
  return { web: [], images: [], videos: [] };
}
