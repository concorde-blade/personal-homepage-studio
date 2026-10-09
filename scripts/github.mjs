import { run } from "./export-site.mjs";

export async function api(endpoint, method = "GET", body) {
  const result = await run(
    "gh",
    [
      "api",
      endpoint,
      ...(method !== "GET" ? ["--method", method] : []),
      ...(body ? ["--input", "-"] : []),
    ],
    { input: body ? JSON.stringify(body) : undefined },
  );
  return result.trim() ? JSON.parse(result) : null;
}

export function git(args, cwd) {
  return run(
    "git",
    [
      "-c",
      "credential.helper=",
      "-c",
      "credential.helper=!gh auth git-credential",
      "-c",
      "http.lowSpeedLimit=1000",
      "-c",
      "http.lowSpeedTime=30",
      ...args,
    ],
    { cwd, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } },
  );
}
