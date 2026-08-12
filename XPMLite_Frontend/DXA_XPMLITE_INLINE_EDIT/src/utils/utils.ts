export function findFieldValue<T = unknown>(data: Record<string, unknown> | null | undefined, targetField: string, targetIndex: number = 0): T | null {
  if (!data || typeof data !== "object") return null;

  let currentIndex = 0;

  const searchRecursive = (content: unknown): { found: boolean; value: unknown } => {
    if (!content || typeof content !== "object") return { found: false, value: null };

    if (Array.isArray(content)) {
      for (const item of content) {
        const res = searchRecursive(item);
        if (res.found) return res;
      }
      return { found: false, value: null };
    }

    const record = content as Record<string, unknown>;

    const matchingKey = Object.keys(record).find((k) => k.toLowerCase() === targetField.toLowerCase());
    if (matchingKey !== undefined) {
      if (currentIndex === targetIndex) {
        return { found: true, value: record[matchingKey] };
      }
      currentIndex++;
    }

    for (const key of Object.keys(record)) {
      if (typeof record[key] === "object" && record[key] !== null) {
        const res = searchRecursive(record[key]);
        if (res.found) return res;
      }
    }

    return { found: false, value: null };
  };

  return searchRecursive(data).value as T | null;
}

export function formatTcmId(tcmId: string | null | undefined): string {
  return tcmId ? tcmId.replace(/:/g, "_") : "";
}

export function safeJsonParse<T = unknown>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}
