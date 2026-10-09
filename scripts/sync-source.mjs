import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { root } from "./export-site.mjs";
import { api, git } from "./github.mjs";
import { pushSourceViaApi } from "./github-api.mjs";

export async function syncSource(config, revision) {
  const repo = `${config.owner}/${config.sourceRepository}`;
  const remote = (await git(["remote", "get-url", "origin"], root)).trim();
  if (![`https://github.com/${repo}.git`, `git@github.com:${repo}.git`].includes(remote)) {
    throw new Error("源码仓库地址与发布设置不一致，已停止同步。");
  }
  if ((await git(["branch", "--show-current"], root)).trim() !== config.branch) {
    throw new Error("请切回 main 分支后再发布。");
  }
  const source = await api(`repos/${repo}`);
  if (!source.private) throw new Error("源码仓库必须保持私有，请先检查 GitHub 仓库设置。");
  const raw = await fs.readFile(path.join(root, "src/content/site.json"), "utf8");
  if (createHash("sha256").update(raw).digest("hex") !== revision) {
    throw new Error("发布期间内容发生了变化，请重新发布。");
  }
  const paths = new Set(["src/content/site.json"]);
  const collect = (value) => {
    if (
      typeof value === "string" &&
      /^\/images\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp|gif)$/i.test(value)
    )
      paths.add(`public${value}`);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(JSON.parse(raw));
  const files = [...paths];
  if ((await git(["status", "--porcelain", "--", ...files], root)).trim()) {
    await git(["add", "--", ...files], root);
    // --only keeps any unrelated staged work out of the content commit.
    await git(
      [
        "-c",
        "user.name=Homepage Publisher",
        "-c",
        `user.email=${config.owner}@users.noreply.github.com`,
        "commit",
        "--only",
        "-m",
        `Update homepage content ${revision.slice(0, 12)}`,
        "--",
        ...files,
      ],
      root,
    );
  }
  await pushSourceViaApi(repo, config.branch, root);
  return (await git(["rev-parse", "HEAD"], root)).trim();
}
