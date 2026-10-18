import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".next/static";
const pattern = /service_role|service-role|sb_secret_/;
const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (pattern.test(readFileSync(path, "utf8"))) {
      hits.push(path);
    }
  }
}

walk(root);

if (hits.length > 0) {
  console.error("service role key found in build output:");
  for (const hit of hits) {
    console.error(`  ${hit}`);
  }
  process.exit(1);
}

console.log(`clean: no service role key in ${root}`);
