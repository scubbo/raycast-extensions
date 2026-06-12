export interface OpenConfig {
  /** short slug -> "owner/repo" */
  repos: Record<string, string>;
  /** linear.app/<workspace>/issue/... */
  linearWorkspace: string;
  /** base URL for a Farm run, run id is appended as /<id> */
  farmRunsBase: string;
}

export type Resolution = { url: string } | { error: string };

/**
 * Maps a compact slug to a destination URL. Match order encodes precedence:
 * the `run` keyword and the hyphenated Linear key are checked before the repo
 * matcher so they aren't swallowed by it.
 */
export function resolve(raw: string, config: OpenConfig): Resolution {
  const q = raw.trim();

  // Farm run:  "run <id>"  or  "r <id>"
  const run = q.match(/^r(?:un)?\s+(\S+)$/i);
  if (run) {
    return { url: `${config.farmRunsBase}/${run[1]}` };
  }

  // Linear:  TEAM-123  (the hyphen is the discriminator vs. a repo slug)
  const lin = q.match(/^([a-z]+)-(\d+)$/i);
  if (lin) {
    const key = `${lin[1].toUpperCase()}-${lin[2]}`;
    return { url: `https://linear.app/${config.linearWorkspace}/issue/${key}` };
  }

  // Repo:  slug#123 (PR) | slug!123 (issue) | slug (PR list)
  const repo = q.match(/^(\w+?)\s*([#!])?\s*(\d+)?$/);
  if (repo) {
    const [, slug, sigil, num] = repo;
    const path = config.repos[slug];
    if (!path) {
      return { error: `Unknown slug: ${slug}` };
    }
    if (!num) {
      return { url: `https://github.com/${path}/pulls` };
    }
    return sigil === "!"
      ? { url: `https://github.com/${path}/issues/${num}` }
      : { url: `https://github.com/${path}/pull/${num}` };
  }

  return { error: `Can't parse: ${q}` };
}
