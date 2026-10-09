import { spawn, spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browserCommand, portIsListening, probeStudio, studioUrl } from "./studio-launcher.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Next and the health endpoint must identify the same project, even from a shortcut.
process.chdir(root);

function openBrowser() {
  console.log(`内容工作室已就绪：${studioUrl}`);
  if (process.argv.includes("--no-open")) return;
  const [command, args] = browserCommand(process.platform);
  const browser = spawn(command, args, { stdio: "ignore", windowsHide: true });
  browser.on("error", () => console.log("浏览器未自动打开，请复制上方网址。"));
  browser.unref();
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) < 22)
    throw new Error("请安装 Node.js 22 或 24 LTS，再重新打开启动器。");
  const next = path.join(root, "node_modules/next/dist/bin/next");
  await access(next).catch(() => { throw new Error("缺少依赖，请先运行 npm ci。"); });
  if (await portIsListening()) {
    // A running Next server may still be compiling its first API request.
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const existing = await probeStudio(root);
      if (existing === "ready") return openBrowser();
      if (existing === "other") break;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    throw new Error("3307 端口已被其他项目占用或服务没有响应，请先关闭那个项目的启动窗口。");
  }

  console.log("正在启动内容工作室；编辑期间请保持此窗口打开，结束时按 Ctrl+C。");
  const server = spawn(process.execPath, [next, "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "3307"], {
    cwd: root, stdio: "inherit", windowsHide: true,
  });
  let ended = false;
  let startupError;
  const done = new Promise((resolve) => {
    server.once("error", (error) => { startupError = error; ended = true; resolve(); });
    server.once("exit", (code) => { ended = true; process.exitCode = code || 0; resolve(); });
  });
  const stop = () => {
    if (ended || !server.pid) return;
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    } else server.kill("SIGTERM");
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    let ready = false;
    const deadline = Date.now() + 180_000;
    while (!ended && Date.now() < deadline) {
      const state = await probeStudio(root);
      if (ended) break;
      if (state === "ready") { ready = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    if (!ready) {
      stop();
      throw startupError || new Error("工作室未能启动，请查看上方错误；也可以在项目目录运行 npm run dev。");
    }
    openBrowser();
    await done;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
