type JWKS = { keys: Record<string, any>[] };
const cache = new Map<string, JWKS>(); // issuer -> JWKS

export function getJWKS(iss: string): JWKS | undefined { 
  return cache.get(iss); 
}

export function setJWKS(iss: string, jwks: JWKS) { 
  cache.set(iss, jwks); 
}

export async function fetchJWKS(url: string): Promise<JWKS> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`JWKS fetch failed: ${r.status}`);
  return (await r.json()) as JWKS;
}
