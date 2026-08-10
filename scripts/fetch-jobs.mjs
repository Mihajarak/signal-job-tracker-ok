import { readFile, writeFile } from "fs/promises";
import Parser from "rss-parser";

const ROOT = new URL("..", import.meta.url);
const CONFIG_PATH = new URL("config.json", ROOT);
const JOBS_PATH = new URL("data/jobs.json", ROOT);
const NEW_JOBS_PATH = new URL("data/new-jobs.md", ROOT);

const parser = new Parser();

function normalize(text) {
  return (text || "").toLowerCase();
}

function matchesKeywords(text, keywords) {
  const t = normalize(text);
  return keywords.find((k) => t.includes(k.toLowerCase())) || null;
}

async function loadJson(url, fallback) {
  try {
    const raw = await readFile(url, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function fetchRssItems(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).map((item) => ({
      title: item.title || "",
      link: item.link || item.guid || "",
      description: item.contentSnippet || item.content || "",
      date: item.isoDate || item.pubDate || new Date().toISOString(),
      source: feed.title || feedUrl,
    }));
  } catch (err) {
    console.error(`Feed error (${feedUrl}):`, err.message);
    return [];
  }
}

async function fetchRemotive(apiUrl) {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    return (data.jobs || []).map((j) => ({
      title: j.title || "",
      link: j.url || "",
      description: `${j.category || ""} ${j.tags?.join(" ") || ""} ${j.description || ""}`,
      date: j.publication_date || new Date().toISOString(),
      source: "Remotive",
    }));
  } catch (err) {
    console.error("Remotive error:", err.message);
    return [];
  }
}

async function fetchRemoteOk(apiUrl) {
  try {
    const res = await fetch(apiUrl, { headers: { "User-Agent": "job-search-bot" } });
    const data = await res.json();
    return (Array.isArray(data) ? data : [])
      .filter((j) => j && j.id)
      .map((j) => ({
        title: j.position || j.title || "",
        link: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        description: `${(j.tags || []).join(" ")} ${j.description || ""}`,
        date: j.date || new Date().toISOString(),
        source: "RemoteOK",
      }));
  } catch (err) {
    console.error("RemoteOK error:", err.message);
    return [];
  }
}

async function main() {
  const config = JSON.parse(await readFile(CONFIG_PATH, "utf-8"));
  const existingJobs = await loadJson(JOBS_PATH, []);
  const existingLinks = new Set(existingJobs.map((j) => j.link));

  let candidates = [];

  for (const url of config.feeds?.upworkRss || []) {
    if (!url || url.startsWith("PASTE_")) continue;
    candidates.push(...(await fetchRssItems(url)));
  }
  for (const url of config.feeds?.weworkremotely || []) {
    candidates.push(...(await fetchRssItems(url)));
  }
  if (config.apis?.remotive) candidates.push(...(await fetchRemotive(config.apis.remotive)));
  if (config.apis?.remoteok) candidates.push(...(await fetchRemoteOk(config.apis.remoteok)));

  const newJobs = [];
  for (const c of candidates) {
    if (!c.link || existingLinks.has(c.link)) continue;
    const matchedKeyword = matchesKeywords(`${c.title} ${c.description}`, config.keywords);
    if (!matchedKeyword) continue;
    existingLinks.add(c.link);
    newJobs.push({
      title: c.title,
      link: c.link,
      source: c.source,
      date: c.date,
      matchedKeyword,
      foundAt: new Date().toISOString(),
    });
  }

  const merged = [...newJobs, ...existingJobs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, config.maxStoredJobs || 500);

  await writeFile(JOBS_PATH, JSON.stringify(merged, null, 2));

  if (newJobs.length > 0) {
    const md = newJobs
      .map((j) => `- **${j.title}** (${j.source}, mifanaraka amin'ny "${j.matchedKeyword}")\n  ${j.link}`)
      .join("\n\n");
    await writeFile(NEW_JOBS_PATH, `Nisy asa vaovao ${newJobs.length} hita:\n\n${md}\n`);
    console.log(`Found ${newJobs.length} new job(s).`);
  } else {
    await writeFile(NEW_JOBS_PATH, "");
    console.log("No new jobs this run.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
