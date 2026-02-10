const DATA_URI_PREFIX = "data:application/json,";

export function parseAgentURI(uri: string): Record<string, string> | null {
  try {
    if (uri.startsWith(DATA_URI_PREFIX)) {
      return JSON.parse(decodeURIComponent(uri.slice(DATA_URI_PREFIX.length))) as Record<
        string,
        string
      >;
    }
    return null;
  } catch {
    return null;
  }
}
