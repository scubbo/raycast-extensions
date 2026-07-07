import { open, showHUD, LaunchProps } from "@raycast/api";
import { resolve, OpenConfig } from "./resolve";

// Edit these to taste. `npm run dev` hot-reloads on save.
const config: OpenConfig = {
  repos: {
    vi: "vercel/infra",
    va: "vercel/api",
    vg: "vercel/goatfarm",
  },
  linearWorkspace: "vercel",
  farmRunsBase: "https://<your-farm-host>/runs",
};

export default async function Command(props: LaunchProps<{ arguments: { query: string } }>) {
  const result = resolve(props.arguments.query, config);
  if ("url" in result) {
    await open(result.url);
  } else {
    await showHUD(result.error);
  }
}
