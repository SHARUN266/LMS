/**
 * Upload utility functions for client-side file submissions.
 * Handles uploading files to /api/upload and determining accepted MIME/file extensions by modality.
 */

export interface UploadResult {
  url: string;
  filename: string;
  storedName: string;
  size: number;
  type: string;
  success: boolean;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = "Upload failed";
    try {
      const err = await res.json();
      errorMsg = err.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

/**
 * Returns allowed file extensions formatted for HTML <input type="file" accept="...">
 */
export function getAcceptedFileTypes(modality: string): string {
  const upper = (modality || "").toUpperCase();
  switch (upper) {
    case "EXCEL":
      return ".xlsx,.xls,.csv";
    case "POWER_BI":
      return ".pbix,.pdf,.png,.jpg,.jpeg";
    case "PYTHON":
      return ".ipynb,.py,.pdf";
    case "DBT_GIT":
      return ".zip,.pdf,.png,.jpg,.jpeg,.sql";
    case "CLOUD_ARCHITECTURE":
    case "AUTOMATION":
      return ".pdf,.png,.jpg,.jpeg,.zip";
    case "BRD":
    case "PRODUCT_ANALYTICS":
    case "INTERVIEW_PREP":
      return ".pdf,.docx,.xlsx,.png,.jpg,.jpeg";
    default:
      return ".pdf,.png,.jpg,.jpeg,.xlsx,.pbix,.ipynb,.zip,.csv,.sql,.py";
  }
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
