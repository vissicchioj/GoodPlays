// Server-only helper for talking to IGDB. IGDB uses Twitch for authentication:
// we exchange our Twitch client ID + secret for an access token, then send that
// token with every IGDB request.

let accessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET is not set");
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  // Previously a failed token request was ignored, and the app went on to call
  // IGDB with "Bearer undefined". Now it fails clearly here instead.
  if (!res.ok) {
    throw new Error(`Twitch token request failed with status ${res.status}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  accessToken = data.access_token;
  // Renew a minute early so a token never expires in the middle of a request.
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken;
}

export async function igdbFetch<T>(query: string): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
    body: query,
  });

  // Previously any IGDB error body was returned as if it were data, so callers
  // received an error object where they expected an array of games.
  if (!res.ok) {
    // A 401 means the cached token is no longer valid; forget it so the next
    // request fetches a fresh one.
    if (res.status === 401) {
      accessToken = null;
    }

    const detail = await res.text();
    throw new Error(`IGDB request failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}
