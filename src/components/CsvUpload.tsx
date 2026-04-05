"use client";
import { useState, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface CsvUploadProps {
  accountId: string;
  onSuccess?: (recordCount: number) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export default function CsvUpload({ accountId, onSuccess }: CsvUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string>("");
  const [recordCount, setRecordCount] = useState(0);

  const upload = async (file: File) => {
    setState("uploading");
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/accounts/${accountId}/sync`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setState("success");
        setRecordCount(data.records_inserted ?? 0);
        setMessage(`Imported ${data.records_inserted} cost records successfully.`);
        onSuccess?.(data.records_inserted ?? 0);
      } else {
        setState("error");
        setMessage(data.error ?? "Upload failed");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) upload(file);
    else { setState("error"); setMessage("Please drop a CSV file."); }
  }, [accountId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
      onDragLeave={() => setState("idle")}
      onDrop={handleDrop}
      className={clsx(
        "border-2 border-dashed rounded-xl p-8 text-center transition-all",
        state === "dragging" ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
        state === "success" ? "border-green-400 bg-green-50" : "",
        state === "error" ? "border-red-400 bg-red-50" : ""
      )}>
      <input type="file" accept=".csv" className="hidden" id={`csv-${accountId}`} onChange={handleChange} />
      <label htmlFor={`csv-${accountId}`} className="cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          {state === "uploading" && <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />}
          {state === "success" && <CheckCircle className="w-10 h-10 text-green-500" />}
          {state === "error" && <AlertCircle className="w-10 h-10 text-red-500" />}
          {(state === "idle" || state === "dragging") && <Upload className={clsx("w-10 h-10", state === "dragging" ? "text-blue-500" : "text-gray-400")} />}

          {state === "uploading" && <p className="text-sm font-medium text-blue-700">Importing CSV...</p>}
          {state === "success" && <p className="text-sm font-medium text-green-700">{message}</p>}
          {state === "error" && <p className="text-sm font-medium text-red-700">{message}</p>}
          {(state === "idle" || state === "dragging") && (
            <>
              <p className="text-sm font-medium text-gray-700">Drop your CSV here or <span className="text-blue-600 underline">browse</span></p>
              <p className="text-xs text-gray-500">Supports AWS Cost Explorer, GCP Billing, and Azure Cost Management CSVs</p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}