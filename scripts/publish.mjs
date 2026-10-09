import fs from "node:fs/promises";
import path from "node:path";
import { exportSite, root } from "./export-site.mjs";
import { api } from "./github.mjs";
import { publishDirectoryViaApi } from "./github-api.mjs";
import { syncSource } from "./sync-source.mjs";
import { validatePublishConfig } from "./publish-config.mjs";

const stateDir = path.join(root, ".publish-state");
const lock = path.join(stateDir, "lock");
const jobFile = path.join(stateDir, "job.json");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await fs.mkdir(stateDir, { recursive: true });
const ownsLock = process.argv.includes("--locked");
if (!ownsLock) {
  try {
    await fs.writeFile(lock, String(process.pid), { flag: "wx" });
  } catch {
    console.error("已有发布正在进行，请在编辑页查看进度。");
    process.exit(1);
  }
}
const update = async (status, message, extra = {}) => {
  const state = {
    status,
    message,
    updatedAt: new Date().toISOString(),
    pid: process.pid,
    ...extra,
  };
  const temporary = `${jobFile}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(state));
  await fs.rename(temporary, jobFile);
  console.log(message);
};
try {
  await update("running", "正在准备发布…");
  validatePublishConfig(JSON.parse(await fs.readFile(path.join(root, "publish-config.json"), "utf8")));
  const revisionArg = process.argv.find((arg) => arg.startsWith("--revision="))?.slice(11);
  const { output, config, revision } = await exportSite({
    expectedRevision: revisionArg,
    onStage: (message) => update("running", message),
  });
  const { owner, repository, branch } = config;
  validatePublishConfig(config);
  const repo = `${owner}/${repository}`;
  const login = await api("user");
  if (login.login.toLowerCase() !== owner.toLowerCase())
    throw new Error(`请使用 ${owner} 的 GitHub 账号登录 gh。`);
  await update("running", "正在备份文字和照片到私有源码仓库…");
  const sourceCommit = await syncSource(config, revision);
  let exists = true;
  try {
    await api(`repos/${repo}`);
  } catch (e) {
    if (e.message.includes("404")) exists = false;
    else throw e;
  }
  if (exists) {
    try {
      await api(`repos/${repo}/contents/.homepage-generated`);
    } catch {
      throw new Error("目标仓库不是这个编辑器生成的站点，已停止发布，避免覆盖其他项目。");
    }
  } else {
    await update("running", "正在创建用于托管网页的 GitHub 仓库…");
    await api("user/repos", "POST", {
      name: repository,
      description: "Personal homepage — published website files",
      private: false,
      auto_init: false,
    });
    await api(`repos/${repo}/contents/.homepage-generated`, "PUT", {
      message: "Initialize generated homepage repository",
      content: Buffer.from("Personal Homepage / generated publication files only\n").toString(
        "base64",
      ),
      branch,
    });
    exists = true;
  }
  await update("running", "正在上传网页与照片…");
  const commit = await publishDirectoryViaApi(
    repo,
    branch,
    output,
    `Publish homepage ${revision.slice(0, 12)}`,
  );
  let pages;
  try {
    pages = await api(`repos/${repo}/pages`);
  } catch (e) {
    if (!e.message.includes("404")) throw e;
    pages = await api(`repos/${repo}/pages`, "POST", {
      source: { branch, path: "/" },
      build_type: "legacy",
    });
  }
  const url = pages.html_url || `${config.url}/`;
  await update("running", "网页已上传，正在等待 GitHub Pages 完成发布…", { url, commit });
  let built = false;
  for (let attempt = 0; attempt < 48; attempt++) {
    try {
      const build = await api(`repos/${repo}/pages/builds/latest`);
      if (build.status === "errored" && build.commit === commit)
        throw new Error(
          `GitHub Pages 构建失败：${build.error?.message || "请查看仓库的 Pages 状态"}`,
        );
      if (build.status === "built" && build.commit === commit) {
        built = true;
        break;
      }
    } catch (e) {
      if (!e.message.includes("404")) throw e;
    }
    await sleep(5000);
  }
  if (!built) throw new Error("GitHub Pages 仍在处理发布，请稍后查看公网网址或重新发布。");
  await update("running", "正在验证公网网页已更新…", { url, commit });
  let verified = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const response = await fetch(`${url}?v=${revision.slice(0, 12)}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok && (await response.text()).includes(revision)) {
        verified = true;
        break;
      }
    } catch {}
    await sleep(5000);
  }
  if (!verified)
    throw new Error(
      "GitHub Pages 已发布，当前网络还未验证到最新版。请打开公网网址检查，或稍后重新发布。",
    );
  await update("success", "已发布，源码已备份，公网网页已验证为最新内容。", {
    url,
    commit,
    sourceCommit,
    revision,
    finishedAt: new Date().toISOString(),
  });
} catch (error) {
  await update("error", error instanceof Error ? error.message : "发布失败，请重试。");
  process.exitCode = 1;
} finally {
  await fs.unlink(lock).catch(() => {});
}
