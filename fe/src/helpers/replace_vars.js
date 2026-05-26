const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (
        !file.includes("node_modules") &&
        !file.includes(".next") &&
        !file.includes(".git")
      ) {
        results = results.concat(walk(file));
      }
    } else {
      if (
        file.endsWith(".jsx") ||
        file.endsWith(".js") ||
        file.endsWith(".tsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".css")
      ) {
        results.push(file);
      }
    }
  });
  return results;
}

const dir = "/Users/z./Algy/TA/App/transmotion/fe/src";
const files = walk(dir);
let updatedFilesCount = 0;
let totalReplacements = 0;

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  // Mencari pola seperti -[var(--nama-variabel)]
  // dan menggantinya menjadi -(--nama-variabel)
  let count = 0;
  const newContent = content.replace(
    /-\[var\((--[a-zA-Z0-9_-]+)\)\]/g,
    (match, p1) => {
      count++;
      return `-(${p1})`;
    }
  );

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, "utf8");
    updatedFilesCount++;
    totalReplacements += count;
  }
});

// eslint-disable-next-line no-console
console.log(
  `Berhasil memperbarui ${updatedFilesCount} file dengan total ${totalReplacements} penggantian.`
);
