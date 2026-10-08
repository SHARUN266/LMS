"use client";

import React, { useState, useRef } from "react";
import {
  FileCode,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  FileCheck2,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { ToolGuidance, SubmissionType } from "@/lib/dynamic-generator";
import { uploadFile, formatFileSize, getAcceptedFileTypes } from "@/lib/upload-utils";

export interface UploadedFileItem {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface SubmissionPanelProps {
  modality: string;
  guidance: ToolGuidance;
  activeCode: string;
  onCodeChange: (code: string) => void;
  langInfo: { lang: string; file: string; label: string };
  externalUrl: string;
  onExternalUrlChange: (url: string) => void;
  uploadedFiles: UploadedFileItem[];
  onAddFile: (file: UploadedFileItem) => void;
  onRemoveFile: (index: number) => void;
  uploadedScreenshots: UploadedFileItem[];
  onAddScreenshot: (file: UploadedFileItem) => void;
  onRemoveScreenshot: (index: number) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onRunPreCheck: () => void;
  isRunningTests: boolean;
  testResults: {
    tested: boolean;
    allPassed: boolean;
    cases: { name: string; description: string; passed: boolean; details: string }[];
  } | null;
}

export function SubmissionPanel({
  modality,
  guidance,
  activeCode,
  onCodeChange,
  langInfo,
  externalUrl,
  onExternalUrlChange,
  uploadedFiles,
  onAddFile,
  onRemoveFile,
  uploadedScreenshots,
  onAddScreenshot,
  onRemoveScreenshot,
  notes,
  onNotesChange,
  onRunPreCheck,
  isRunningTests,
  testResults,
}: SubmissionPanelProps) {
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const submissionTypes = guidance.submissionTypes || ["CODE_EDITOR"];
  const requiresFile = submissionTypes.includes("FILE_UPLOAD");
  const requiresUrl = submissionTypes.includes("URL_LINK");
  const requiresScreenshot = submissionTypes.includes("SCREENSHOT");
  const requiresCode = submissionTypes.includes("CODE_EDITOR");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setIsUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i]);
        onAddFile({
          url: res.url,
          filename: res.filename,
          size: res.size,
          type: res.type,
        });
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setIsUploadingScreenshot(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i]);
        onAddScreenshot({
          url: res.url,
          filename: res.filename,
          size: res.size,
          type: res.type,
        });
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload screenshot");
    } finally {
      setIsUploadingScreenshot(false);
      if (screenshotInputRef.current) screenshotInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {uploadError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* When worksInPlatform is false (Excel, Power BI, Python), show File & URL uploaders prominently first */}
      {!guidance.worksInPlatform && (
        <div className="space-y-4">
          {/* FILE UPLOAD ZONE */}
          {requiresFile && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Upload Deliverable Workbook / Notebook</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                    Mandatory
                  </span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Accepted: {getAcceptedFileTypes(modality)}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={getAcceptedFileTypes(modality)}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {isUploadingFile ? (
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading deliverable file...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      Click to upload or drag & drop deliverable file
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Max file size: 25MB (.xlsx, .pbix, .ipynb, .pdf, .zip)
                    </p>
                  </>
                )}
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {uploadedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-foreground truncate">{f.filename}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          ({formatFileSize(f.size)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => onRemoveFile(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL INPUT ZONE */}
          {requiresUrl && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Public Live Report or GitHub Repository URL</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold uppercase">
                  Verification URL
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => onExternalUrlChange(e.target.value)}
                  placeholder="https://app.powerbi.com/view?... or https://github.com/..."
                  className="flex-1 p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {externalUrl && (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                NovyPro, Power BI Service publish-to-web, Google Colab link, or public GitHub repo.
              </p>
            </div>
          )}

          {/* SCREENSHOT PROOF ZONE */}
          {requiresScreenshot && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Visual Evidence / Dashboard Screenshot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold uppercase">
                    Proof
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  disabled={isUploadingScreenshot}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  {isUploadingScreenshot ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span>Add Screenshot</span>
                </button>
              </div>

              <input
                ref={screenshotInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotUpload}
              />

              {uploadedScreenshots.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-border text-center">
                  Attach screenshots of your completed dashboard, matrix layout, or pipeline execution.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {uploadedScreenshots.map((shot, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-border bg-slate-900 aspect-video flex items-center justify-center"
                    >
                      <img
                        src={shot.url}
                        alt={`Screenshot ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveScreenshot(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-destructive rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CODE / FORMULA / SPECIFICATION EDITOR */}
      {requiresCode && (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-xs h-[480px]">
          <div className="h-10 px-4 bg-muted/60 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              <FileCode className="w-4 h-4" /> {langInfo.file} ({langInfo.label})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRunPreCheck}
                disabled={isRunningTests}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-500/20 transition-colors flex items-center gap-1"
              >
                {isRunningTests ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileCheck2 className="w-3 h-3" />}
                <span>Run Pre-Submission Check</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-slate-950">
            <CodeEditor
              height="100%"
              defaultLanguage={langInfo.lang}
              theme="vs-dark"
              value={activeCode}
              onChange={(val) => onCodeChange(val || "")}
            />
          </div>
        </div>
      )}

      {/* Pre-Check Test Runner Output */}
      {testResults && (
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  testResults.allPassed ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <h4 className="text-xs font-bold text-foreground">
                Pre-Submission Integrity Check ({testResults.cases.filter((c) => c.passed).length}/
                {testResults.cases.length} Checks Passed)
              </h4>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                testResults.allPassed
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
              }`}
            >
              {testResults.allPassed ? "Ready to Submit" : "Needs Attention"}
            </span>
          </div>

          <div className="space-y-2">
            {testResults.cases.map((tc, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs ${
                  tc.passed
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
                    : "bg-amber-500/5 border-amber-500/20 text-amber-950 dark:text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{tc.name}</span>
                  <span>{tc.passed ? "✅ Passed" : "⚠️ Warning"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{tc.description}</p>
                <p className="text-[11px] font-mono mt-1 pt-1 border-t border-border/50 text-foreground">
                  {tc.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARCHITECTURAL NOTES / METHODOLOGY EXPLANATION */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
        <label className="text-xs font-bold text-foreground block">
          Methodology & Edge Case Explanation (5% Weight)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Explain your approach, choices, formulas, and how edge cases/NULL values were handled..."
          className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <p className="text-[11px] text-muted-foreground">
          Clear stakeholder documentation elevates your score from standard to top 1% 12 LPA benchmark.
        </p>
      </div>
    </div>
  );
}
