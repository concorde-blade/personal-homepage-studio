import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export async function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || root,
      env: options.env || process.env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "",
      stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data;
      if (options.stream) process.stdout.write(data);
    });
    child.stderr.on("data", (data) => {
      stderr += data;
      if (options.stream) process.stderr.write(data);
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve(stdout)
        : reject(new Error(`${command} 执行失败：${(stderr || stdout).slice(-2500)}`)),
    );
    child.stdin.end(options.input || undefined);
  });
}
export async function exportSite({ onStage = () => {}, expectedRevision } = {}) {
  const config = JSON.parse(await fs.readFile(path.join(root, "publish-config.json"), "utf8"));
  const raw = await fs.readFile(path.join(root, "src/content/site.json"), "utf8");
  const revision = createHash("sha256").update(raw).digest("hex");
  if (expectedRevision && expectedRevision !== revision)
    throw new Error("内容版本已变化，请重新保存后发布。");
  const content = JSON.parse(raw);
  const stage = path.join(root, ".publish-build/site");
  await fs.mkdir(path.join(root, ".publish-build"), { recursive: true });
  await fs.rm(stage, { recursive: true, force: true });
  await fs.mkdir(stage, { recursive: true });
  for (const name of ["package.json", "package-lock.json", "tsconfig.json", "next.config.mjs"])
    await fs.copyFile(path.join(root, name), path.join(stage, name));
  await fs.writeFile(
    path.join(stage, "next-env.d.ts"),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n',
  );
  await fs.cp(path.join(root, "src"), path.join(stage, "src"), {
    recursive: true,
    filter: (src) =>
      ![/[/\\]app[/\\]api(?:[/\\]|$)/, /[/\\]app[/\\]studio(?:[/\\]|$)/].some((rule) =>
        rule.test(src),
      ),
  });
  // Freeze the content snapshot for this publication, including the version marker.
  await fs.writeFile(path.join(stage, "src/content/site.json"), raw);
  // Junctions work without Developer Mode or administrator privileges on Windows.
  await fs.symlink(
    path.join(root, "node_modules"),
    path.join(stage, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const images = new Set();
  const findImages = (value) => {
    if (typeof value === "string" && value.startsWith("/images/")) images.add(value);
    else if (value && typeof value === "object") Object.values(value).forEach(findImages);
  };
  findImages(content);
  for (const image of images) {
    if (!/^\/images\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp|gif)$/i.test(image))
      throw new Error("图片路径无效，请在编辑页重新上传。");
    const dest = path.join(stage, "public", image);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    try {
      await fs.copyFile(path.join(root, "public", image), dest);
    } catch {
      throw new Error(`找不到图片 ${image}，请在编辑页重新上传或更换。`);
    }
  }
  await onStage("正在生成可公开访问的网页…");
  await run(
    process.execPath,
    [path.join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
    {
      cwd: stage,
      stream: true,
      env: {
        ...process.env,
        NODE_ENV: "production",
        STATIC_EXPORT: "1",
        NEXT_PUBLIC_BASE_PATH: config.basePath,
        NEXT_PUBLIC_SITE_URL: config.url,
        NEXT_PUBLIC_CONTENT_REVISION: revision,
      },
    },
  );
  const output = path.join(stage, "out");
  await fs.writeFile(path.join(output, ".nojekyll"), "");
  await fs.writeFile(
    path.join(output, ".homepage-generated"),
    "Personal Homepage / generated publication files only\n",
  );
  await fs.writeFile(
    path.join(output, "README.md"),
    `# Personal homepage\n\nPublished website: ${config.url}/\n\nThis repository contains generated public website files. Content is managed in the owner's local content studio.\n\nBuilt with Magic Portfolio / Once UI. See LICENSE and THIRD_PARTY_NOTICES.md.\n`,
  );
  for (const name of ["LICENSE", "THIRD_PARTY_NOTICES.md"])
    await fs.copyFile(path.join(root, name), path.join(output, name));
  for (const forbidden of ["studio", "api", "src", ".content-backups", "publish-config.json"]) {
    try {
      await fs.access(path.join(output, forbidden));
      throw new Error(`发布文件中出现了不应公开的目录：${forbidden}`);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  return { output, config, revision };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  exportSite({ onStage: console.log })
    .then((result) => console.log(`Export ready: ${result.output}`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
