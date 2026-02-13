import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createInterface } from "node:readline";

type ReleaseVersion = { major: number; minor: number };

const VERSION_PATH = "src/version.json";
const OUT_PATH = "src/_generated/buildVersion.ts";

function run(cmd: string): string {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
}

function safeRun(cmd: string): string | null {
  try {
    return run(cmd);
  } catch {
    return null;
  }
}

function askYesNo(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === "y" || a === "yes");
    });
  });
}

async function main() {
  const current = JSON.parse(readFileSync(VERSION_PATH, "utf8")) as ReleaseVersion;

  console.log(`Current release version: ${current.major}.${current.minor}`);

  let next = { ...current };

  const isMajor = await askYesNo("Is this a MAJOR version change? (y/N) ");
  if (isMajor) {
    next.major += 1;
    next.minor = 0;
  } else {
    const isMinor = await askYesNo("Is this a MINOR version change? (y/N) ");
    if (isMinor) {
      next.minor += 1;
    }
  }

  if (next.major !== current.major || next.minor !== current.minor) {
    writeFileSync(VERSION_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
    console.log(`Release version updated → ${next.major}.${next.minor}`);
  } else {
    console.log("Release version unchanged.");
  }

  const commitCount = safeRun("git rev-list --count HEAD") ?? "0";
  const shortHash = safeRun("git rev-parse --short HEAD") ?? "nogit";
  const isDirty = (safeRun("git status --porcelain") ?? "").length > 0;

  const versionString =
    `${next.major}.${next.minor}.${commitCount} (${shortHash}${isDirty ? "-dirty" : ""})`;

  mkdirSync(dirname(OUT_PATH), { recursive: true });

  writeFileSync(
    OUT_PATH,
    `// AUTO-GENERATED. DO NOT EDIT.
export const BUILD_VERSION = ${JSON.stringify(versionString)} as const;
`,
    "utf8"
  );

  console.log(`Generated ${OUT_PATH}: ${versionString}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
