import { describe, it, expect } from "vitest";
import { resolve, OpenConfig } from "../src/resolve";

const config: OpenConfig = {
  repos: { vi: "vercel/infra", va: "vercel/api" },
  linearWorkspace: "vercel",
  farmRunsBase: "https://farm.example.com/runs",
};

const url = (raw: string) => {
  const r = resolve(raw, config);
  if ("error" in r) throw new Error(`expected url, got error: ${r.error}`);
  return r.url;
};

const error = (raw: string) => {
  const r = resolve(raw, config);
  if ("url" in r) throw new Error(`expected error, got url: ${r.url}`);
  return r.error;
};

describe("resolve", () => {
  it("opens a PR for slug#n", () => {
    expect(url("vi#123")).toBe("https://github.com/vercel/infra/pull/123");
  });

  it("opens an issue for slug!n", () => {
    expect(url("vi!88")).toBe("https://github.com/vercel/infra/issues/88");
  });

  it("opens the PR list for a bare slug", () => {
    expect(url("vi")).toBe("https://github.com/vercel/infra/pulls");
  });

  it("tolerates whitespace and a space separator", () => {
    expect(url("  va 7 ")).toBe("https://github.com/vercel/api/pull/7");
  });

  it("opens a Linear issue for TEAM-n, upper-casing the key", () => {
    expect(url("eng-456")).toBe("https://linear.app/vercel/issue/ENG-456");
  });

  it("opens a Farm run for the run keyword", () => {
    expect(url("run abc123")).toBe("https://farm.example.com/runs/abc123");
  });

  it("accepts the r shorthand for runs", () => {
    expect(url("r abc123")).toBe("https://farm.example.com/runs/abc123");
  });

  it("errors on an unknown slug", () => {
    expect(error("zz#1")).toMatch(/unknown slug/i);
  });

  it("errors on unparseable input", () => {
    expect(error("???")).toMatch(/can't parse/i);
  });

  it("prefers the Linear hyphen pattern over the repo matcher", () => {
    // a hyphenated token is always Linear, never a repo lookup
    expect(url("va-12")).toBe("https://linear.app/vercel/issue/VA-12");
  });
});
