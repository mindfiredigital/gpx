import { execSync } from 'node:child_process';
import fs from "node:fs";

if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
}

const targets = [
    { target: "bun-windows-x64", name: "gpx-windows-x64.exe" },
    { target: "bun-windows-arm64", name: "gpx-windows-arm64.exe" },
    { target: "bun-linux-x64", name: "gpx-linux-x64" },
    { target: "bun-linux-arm64", name: "gpx-linux-arm64" },
    { target: "bun-darwin-arm64", name: "gpx-darwin-arm64" }, // M1/M2/M3
    { target: "bun-darwin-x64", name: "gpx-darwin-x64" }, // Intel
];

for (const { name, target } of targets) {
    console.log(`Building ${name}...`);
    try {
        execSync(`bun build ./src/cli.ts --compile --target=${target} --outfile dist/${name}`,
            { stdio: "inherit" });
        console.log(`✓ Done! dist/${name}`);
    } catch (error) {
        console.error(`✗ Failed: ${name}`);
        process.exit(1);
    }
}

console.log("\n✅All binaries built in ./dist/");