// ── Client-side CSV/TSV parser ─────────────────────────────────

export function parseCSVLine(line, delimiter) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function parseFilePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const ext = file.name.split(".").pop().toLowerCase();
        const delimiter = ext === "tsv" ? "\t" : ";";
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length === 0) {
          resolve({
            columns: [],
            columnCount: 0,
            rowCount: 0,
            previewRows: [],
          });
          return;
        }

        const headers = parseCSVLine(lines[0], delimiter).filter(Boolean);
        const dataLines = lines.slice(1);
        const previewRows = dataLines.slice(0, 5).map((line) => {
          const vals = parseCSVLine(line, delimiter);
          return headers.reduce(
            (obj, h, i) => ({ ...obj, [h]: vals[i] ?? "" }),
            {}
          );
        });

        resolve({
          columns: headers,
          columnCount: headers.length,
          rowCount: dataLines.length,
          previewRows,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, "UTF-8");
  });
}

export function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
