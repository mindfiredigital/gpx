import { execSync } from 'node:child_process';
import fs from "node:fs";

if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
}

console.log("Building Windows binary...");

try {
    execSync("bun build ./src/cli.ts --compile --target=bun-windows-x64 --outfile dist/gpx-windows-x64.exe", { stdio: "inherit" });
    console.log("✓ Done! File saved to dist/gpx-windows-x64.exe");
} catch (error) {
    console.error("✗ Build failed");
    process.exit(1);
}