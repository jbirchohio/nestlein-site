const fs = require("fs");
const path = require("path");

const inputDir = path.join("data", "locations");
const outputDir = path.join("src", "content", "locations");

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Sanitize keys and convert JS object to YAML-like frontmatter
function toFrontmatter(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  return Object.entries(obj)
    .map(([key, value]) => {
      const cleanKey = key.replace(/\*/g, "").replace(/[\s-]/g, "_");

      if (value === null || value === undefined) return `${pad}${cleanKey}: ""`;

      // ✅ Number as number
      if (typeof value === "number") {
        return `${pad}${cleanKey}: ${value}`;
      }

      // ✅ Convert numeric strings to actual numbers
      if (typeof value === "string" && !isNaN(value) && value.trim() !== "") {
        return `${pad}${cleanKey}: ${parseFloat(value)}`;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        return `${pad}${cleanKey}:\n${toFrontmatter(value, indent + 1)}`;
      }

      if (Array.isArray(value)) {
        const formattedList = value
          .map(item => `${pad}- "${String(item).replace(/"/g, '\\"')}"`)
          .join("\n");
        return `${pad}${cleanKey}:\n${formattedList}`;
      }

      const isMultiLine = typeof value === "string" && value.includes("\n");
      if (isMultiLine) {
        return `${pad}${cleanKey}: |\n${value
          .split("\n")
          .map(line => `${pad}  ${line}`)
          .join("\n")}`;
      }

      return `${pad}${cleanKey}: "${String(value).replace(/"/g, '\\"')}"`;
    })
    .join("\n");
}

// Convert all .json files to .md
fs.readdirSync(inputDir).forEach(file => {
  if (file.endsWith(".json")) {
    const jsonPath = path.join(inputDir, file);
    const rawData = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(rawData);

    const slug = data.slug || path.basename(file, ".json");
    const mdPath = path.join(outputDir, `${slug}.md`);

    const frontmatter = toFrontmatter(data);
    const markdown = `---\n${frontmatter}\n---\n\nA great place to work remotely. (You can customize this later.)`;

    fs.writeFileSync(mdPath, markdown);
    console.log(`✅ Converted: ${file}`);
  }
});

console.log("✅ All JSON files converted and copied to src/content/locations");
