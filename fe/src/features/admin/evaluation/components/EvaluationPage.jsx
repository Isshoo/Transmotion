"use client";

import { useEffect } from "react";
import { BarChart2, Loader2 } from "lucide-react";
import useEvaluationStore from "../store";
import DatasetSection from "./sub/DatasetSection";

export default function EvaluationPage() {
  const {
    datasets,
    isLoadingDatasets,
    selectedDatasetId,
    compareData,
    isLoadingCompare,
    fetchDatasets,
    fetchCompare,
    setSelectedDataset,
  } = useEvaluationStore();

  useEffect(() => {
    fetchDatasets();
    fetchCompare("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = compareData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <BarChart2 size={20} className="text-blue-600" />
          Evaluasi Performa
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Komparasi XLM-R vs mBERT berdasarkan dataset dan split ratio
        </p>
      </div>

      {/* Filter dataset */}
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Filter Dataset
        </p>
        {isLoadingDatasets ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Memuat dataset...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDataset("")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedDatasetId === ""
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua Dataset
            </button>
            {datasets.map((ds) => (
              <button
                key={ds.id}
                onClick={() => setSelectedDataset(ds.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  selectedDatasetId === ds.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ds.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoadingCompare && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="mr-2 animate-spin text-blue-500" />
          <span className="text-sm text-gray-500">Memuat data evaluasi...</span>
        </div>
      )}

      {/* Tidak ada data */}
      {!isLoadingCompare && !hasData && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20 text-center">
          <BarChart2 size={48} className="mb-4 text-gray-300" />
          <p className="mb-1 text-base font-semibold text-gray-500">
            Belum ada data komparasi
          </p>
          <p className="max-w-sm text-sm text-gray-400">
            Latih model XLM-R dan mBERT dengan dataset yang sama untuk melihat
            perbandingan performa.
          </p>
        </div>
      )}

      {/* Data per dataset */}
      {!isLoadingCompare &&
        compareData.map((group) => (
          <div key={group.dataset_id} className="space-y-5">
            {/* Header dataset */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                {group.dataset_name}
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <DatasetSection group={group} />
          </div>
        ))}
    </div>
  );
}
