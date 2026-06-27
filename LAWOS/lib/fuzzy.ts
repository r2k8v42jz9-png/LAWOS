/**
 * Tiny dependency-free fuzzy matcher. Returns a score (higher = better) and the
 * matched character indices for highlighting, or null when the query isn't a
 * subsequence of the text. Tuned to reward consecutive and word-start matches.
 */
export interface FuzzyResult {
  score: number;
  indices: number[];
}

export function fuzzyMatch(query: string, text: string): FuzzyResult | null {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return { score: 0, indices: [] };

  let qi = 0;
  let score = 0;
  let prev = -2;
  const indices: number[] = [];

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      const consecutive = ti === prev + 1 ? 6 : 0;
      const wordStart = ti === 0 || /[\s/_-]/.test(t[ti - 1]) ? 4 : 0;
      score += 1 + consecutive + wordStart;
      prev = ti;
      qi++;
    }
  }

  if (qi < q.length) return null;
  // Prefer earlier first-match and tighter overall coverage.
  score -= indices[0] * 0.2 + (t.length - q.length) * 0.02;
  return { score, indices };
}

/** Split text into [matched, unmatched] segments for highlight rendering. */
export function highlightSegments(text: string, indices: number[]): { text: string; hit: boolean }[] {
  if (!indices.length) return [{ text, hit: false }];
  const set = new Set(indices);
  const out: { text: string; hit: boolean }[] = [];
  let buf = "";
  let bufHit = set.has(0);
  for (let i = 0; i < text.length; i++) {
    const hit = set.has(i);
    if (hit === bufHit) {
      buf += text[i];
    } else {
      out.push({ text: buf, hit: bufHit });
      buf = text[i];
      bufHit = hit;
    }
  }
  if (buf) out.push({ text: buf, hit: bufHit });
  return out;
}
