import { ConfidenceBar } from "./Bar";

export function SingleResult({ result }) {
  if (!result) return null;
  const scores = result.all_scores || {};
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 px-5 py-4">
        <p className="mb-1 text-xs font-semibold tracking-wide text-blue-500 uppercase">
          Hasil Klasifikasi
        </p>
        <p className="text-2xl font-bold text-blue-800">
          {result.predicted_label}
        </p>
        <p className="mt-0.5 text-sm text-blue-500">
          Confidence:{" "}
          {result.confidence !== null
            ? `${(result.confidence * 100).toFixed(1)}%`
            : "—"}
        </p>
      </div>

      {/* Skor semua kelas */}
      {entries.length > 1 && (
        <div className="space-y-2 border-t px-5 py-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Skor Per Kelas
          </p>
          {entries.map(([label, score]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4"
            >
              <span
                className={`min-w-[80px] text-sm font-medium ${
                  label === result.predicted_label
                    ? "text-blue-700"
                    : "text-gray-600"
                }`}
              >
                {label}
              </span>
              <ConfidenceBar value={score} />
            </div>
          ))}
        </div>
      )}

      {/* Teks input */}
      <div className="border-t bg-gray-50 px-5 py-3">
        <p className="mb-1 text-xs text-gray-400">Teks input</p>
        <p className="line-clamp-3 text-xs text-gray-600">
          {result.input_text}
        </p>
      </div>
    </div>
  );
}

export function BatchResults({ results, errors, csvTexts }) {
  if (results.length === 0 && errors.length === 0) return null;

  // Hitung distribusi
  const dist = {};
  results.forEach((r) => {
    dist[r.predicted_label] = (dist[r.predicted_label] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Total Input</p>
          <p className="text-xl font-bold text-gray-800">{csvTexts.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Berhasil</p>
          <p className="text-xl font-bold text-green-600">{results.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Error</p>
          <p className="text-xl font-bold text-red-500">{errors.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Kelas Unik</p>
          <p className="text-xl font-bold text-blue-600">
            {Object.keys(dist).length}
          </p>
        </div>
      </div>

      {/* Distribusi */}
      {Object.keys(dist).length > 0 && (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Distribusi Prediksi
          </p>
          {Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .map(([label, count]) => {
              const pct = ((count / results.length) * 100).toFixed(1);
              return (
                <div key={label}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-gray-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-blue-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Tabel hasil */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-h-96 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 border-b bg-gray-50">
              <tr>
                {["#", "Teks", "Prediksi", "Confidence"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="max-w-[300px] px-3 py-2">
                    <span className="line-clamp-2 text-gray-700">
                      {r.input_text}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {r.predicted_label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <ConfidenceBar value={r.confidence} />
                  </td>
                </tr>
              ))}
              {errors.map((e, i) => (
                <tr key={`err-${i}`} className="bg-red-50">
                  <td className="px-3 py-2 text-gray-400">{e.index + 1}</td>
                  <td className="px-3 py-2 text-gray-500 italic">
                    {e.text ?? "—"}
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-xs text-red-500">
                    {e.error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
