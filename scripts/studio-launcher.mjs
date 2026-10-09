import { createHash } from "node:crypto";
import { createConnection } from "node:net";

export const studioUrl = "http://127.0.0.1:3307/studio";
export const workspaceId = (directory) => createHash("sha256").update(directory).digest("hex");

export function portIsListening(port = 3307) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    const finish = (listening) => { socket.destroy(); resolve(listening); };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.setTimeout(1500, () => finish(false));
  });
}

export function browserCommand(platform) {
  if (platform === "win32") return ["rundll32.exe", ["url.dll,FileProtocolHandler", studioUrl]];
  if (platform === "darwin") return ["open", [studioUrl]];
  return ["xdg-open", [studioUrl]];
}

export async function probeStudio(directory, url = "http://127.0.0.1:3307/api/studio/content") {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return "other";
    if (response.headers.get("x-homepage-workspace") !== workspaceId(directory)) return "other";
    const data = await response.json();
    return data?.content?.site && typeof data.revision === "string" ? "ready" : "other";
  } catch {
    return "unavailable";
  }
}
