import { defineConfig } from "vite";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";

const projectRoot = dirname(fileURLToPath(import.meta.url));

function findHtmlFiles(directory, relativeDirectory = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "dist") {
      return findHtmlFiles(absolutePath, relativePath);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [relativePath] : [];
  });
}

const htmlInputs = Object.fromEntries(
  findHtmlFiles(projectRoot).map((file) => [file.replace(/\\/g, "/").replace(/\.html$/, ""), resolve(projectRoot, file)])
);

export default defineConfig({
  base: "/princebookdepot/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: htmlInputs,
    },
  },
});
