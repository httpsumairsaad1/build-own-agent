import "server-only";

const REALTIME_ENDPOINT = "https://realtime.oxylabs.io/v1/queries";

type OxylabsResult = {
  content?: unknown;
  status_code?: unknown;
  url?: unknown;
};

type OxylabsResponse = { results?: OxylabsResult[] };

function getCredentials(): string {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing Oxylabs credentials. Set OXY_WSA_USERNAME and OXY_WSA_PASSWORD.");
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export async function fetchHtmlThroughOxylabs(url: string): Promise<string> {
  const response = await fetch(REALTIME_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: getCredentials(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source: "universal", url }),
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Oxylabs request failed with HTTP ${response.status}.`);
  }

  let payload: OxylabsResponse;
  try {
    payload = JSON.parse(raw) as OxylabsResponse;
  } catch {
    throw new Error("Oxylabs returned invalid JSON.");
  }

  const result = payload.results?.[0];
  if (!result || result.status_code !== 200 || typeof result.content !== "string" || !result.content.trim()) {
    throw new Error("Oxylabs returned no successful HTML result.");
  }

  return result.content;
}
