import * as XLSX from "xlsx";

// ── Client-side Data Parser ──────────────────────────────────

/**
 * Membaca preview file (CSV, TSV, TXT, XLS, XLSX)
 * Menggunakan library xlsx (SheetJS) untuk mendukung berbagai format dan auto-detect delimiter.
 */
export async function parseFilePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        // XLSX.read secara otomatis mendeteksi format (Excel atau Text/CSV)
        // Untuk CSV/Text, ia juga mencoba mendeteksi delimiter secara otomatis.
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames.length) {
          resolve({
            columns: [],
            columnCount: 0,
            rowCount: 0,
            previewRows: [],
          });
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Ambil data sebagai array of arrays
        // header: 1 memastikan baris pertama tidak langsung dianggap kunci objek agar kita bisa olah manual
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length === 0) {
          resolve({
            columns: [],
            columnCount: 0,
            rowCount: 0,
            previewRows: [],
          });
          return;
        }

        // Baris pertama sebagai header
        const headers = rows[0]
          .map((h) => String(h || "").trim())
          .filter(Boolean);
        const dataRows = rows.slice(1);

        // Filter baris kosong (SheetJS kadang menyertakan baris yang terlihat kosong tapi punya metadata)
        const cleanDataRows = dataRows.filter(
          (row) =>
            Array.isArray(row) &&
            row.some(
              (cell) =>
                cell !== null &&
                cell !== undefined &&
                String(cell).trim() !== ""
            )
        );

        // Buat preview untuk 5 baris pertama
        const previewRows = cleanDataRows.slice(0, 5).map((row) => {
          return headers.reduce((obj, h, i) => {
            obj[h] =
              row[i] !== undefined && row[i] !== null ? String(row[i]) : "";
            return obj;
          }, {});
        });

        resolve({
          columns: headers,
          columnCount: headers.length,
          rowCount: cleanDataRows.length,
          previewRows,
        });
      } catch (err) {
        console.error("Parse error:", err);
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
