/**
 * Deep File Content Extraction Utility
 * Parses uploaded deliverable files (Excel, Jupyter, Power BI, PDF, DOCX, Python)
 * and extracts structured text content for Gemini AI evaluation.
 *
 * All parsers are individually wrapped in try-catch — if any file fails to parse,
 * the system gracefully falls back to current keyword-based scoring.
 */

import { readFile } from "fs/promises";
import path from "path";

// ── Interfaces ──────────────────────────────────────────────────

export interface FileExtractionResult {
  success: boolean;
  fileType: string;
  extractedContent: string;
  metadata: {
    sheets?: string[];
    formulaCount?: number;
    cellCount?: number;
    codeBlocks?: number;
    outputBlocks?: number;
    daxMeasures?: string[];
    tables?: string[];
    pageCount?: number;
    wordCount?: number;
  };
  error?: string;
}

// Max chars to extract per file — prevents Gemini token overflow
const MAX_EXTRACTION_CHARS = 8000;

// ── Master Dispatcher ───────────────────────────────────────────

/**
 * Extract content from an uploaded file.
 * @param fileUrl - The URL path of the uploaded file (e.g. "/uploads/1234_file.xlsx")
 */
export async function extractFileContent(fileUrl: string): Promise<FileExtractionResult> {
  try {
    // Resolve file path from URL (files are stored in public/uploads/)
    const fileName = fileUrl.replace(/^\/uploads\//, "");
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case ".xlsx":
      case ".xls":
        return await parseExcelFile(filePath);
      case ".csv":
        return await parseCsvFile(filePath);
      case ".ipynb":
        return await parseNotebookFile(filePath);
      case ".py":
        return await parsePythonFile(filePath);
      case ".pbix":
        return await parsePbixFile(filePath);
      case ".pdf":
        return await parsePdfFile(filePath);
      case ".docx":
        return await parseDocxFile(filePath);
      case ".sql":
        return await parseSqlFile(filePath);
      case ".json":
        return await parseJsonFile(filePath);
      default:
        return {
          success: false,
          fileType: ext,
          extractedContent: "",
          metadata: {},
          error: `Unsupported file type for content extraction: ${ext}`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      fileType: "unknown",
      extractedContent: "",
      metadata: {},
      error: `File extraction failed: ${err.message}`,
    };
  }
}

/**
 * Extract content from multiple uploaded files and combine.
 */
export async function extractAllFileContents(fileUrls: string[]): Promise<string> {
  const results: string[] = [];

  for (const url of fileUrls) {
    try {
      const result = await extractFileContent(url);
      if (result.success && result.extractedContent.trim().length > 0) {
        results.push(
          `\n═══ Extracted from: ${path.basename(url)} (${result.fileType}) ═══\n${result.extractedContent}`
        );
      }
    } catch (err) {
      // Silent skip — don't block evaluation for one failed file
    }
  }

  const combined = results.join("\n");
  // Truncate to prevent Gemini token overflow
  if (combined.length > MAX_EXTRACTION_CHARS) {
    return combined.substring(0, MAX_EXTRACTION_CHARS) + "\n\n[... Content truncated to 8000 chars for evaluation ...]";
  }
  return combined;
}

// ── Excel Parser (.xlsx / .xls) ─────────────────────────────────

async function parseExcelFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const excelModule: any = await import("exceljs");
    const ExcelJS = excelModule.default || excelModule;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheetNames: string[] = [];
    let formulaCount = 0;
    let cellCount = 0;
    let extracted = "## Excel Workbook Analysis\n\n";

    for (const sheet of workbook.worksheets) {
      sheetNames.push(sheet.name);
      extracted += `### Sheet: "${sheet.name}" (${sheet.rowCount} rows × ${sheet.columnCount} columns)\n\n`;

      // Extract column headers (first row)
      const headerRow = sheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell((cell: any, colNum: number) => {
        headers.push(String(cell.value || `Col${colNum}`));
      });
      if (headers.length > 0) {
        extracted += `**Column Headers**: ${headers.join(" | ")}\n\n`;
      }

      // Extract formulas from entire sheet
      const formulas: string[] = [];
      sheet.eachRow({ includeEmpty: false }, (row: any) => {
        row.eachCell({ includeEmpty: false }, (cell: any) => {
          cellCount++;
          if (cell.formula) {
            formulaCount++;
            formulas.push(`  Cell ${cell.address}: =${cell.formula}`);
          }
        });
      });

      if (formulas.length > 0) {
        // Cap at 30 formulas per sheet to prevent bloat
        const displayFormulas = formulas.slice(0, 30);
        extracted += `**Formulas Found (${formulas.length} total)**:\n${displayFormulas.join("\n")}\n`;
        if (formulas.length > 30) {
          extracted += `  ... and ${formulas.length - 30} more formulas\n`;
        }
        extracted += "\n";
      }

      // Sample data rows (first 5 data rows after header)
      extracted += "**Sample Data (first 5 rows)**:\n";
      let dataRowCount = 0;
      sheet.eachRow({ includeEmpty: false }, (row: any, rowNum: number) => {
        if (rowNum === 1) return; // Skip header
        if (dataRowCount >= 5) return;
        dataRowCount++;
        const values: string[] = [];
        row.eachCell({ includeEmpty: false }, (cell: any) => {
          values.push(String(cell.value ?? ""));
        });
        extracted += `  Row ${rowNum}: ${values.join(" | ")}\n`;
      });
      extracted += "\n";
    }

    // Summary stats
    extracted += `\n**Workbook Summary**: ${sheetNames.length} sheets, ${formulaCount} formulas, ${cellCount} cells with data\n`;

    return {
      success: true,
      fileType: "excel",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        sheets: sheetNames,
        formulaCount,
        cellCount,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "excel",
      extractedContent: "",
      metadata: {},
      error: `Excel parsing failed: ${err.message}`,
    };
  }
}

// ── CSV Parser (.csv) ───────────────────────────────────────────

async function parseCsvFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);

    let extracted = "## CSV File Analysis\n\n";
    extracted += `**Total Rows**: ${lines.length}\n\n`;

    if (lines.length > 0) {
      extracted += `**Headers**: ${lines[0]}\n\n`;
      extracted += "**Sample Data (first 10 rows)**:\n";
      for (let i = 1; i < Math.min(11, lines.length); i++) {
        extracted += `  Row ${i}: ${lines[i]}\n`;
      }
    }

    return {
      success: true,
      fileType: "csv",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        cellCount: lines.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "csv",
      extractedContent: "",
      metadata: {},
      error: `CSV parsing failed: ${err.message}`,
    };
  }
}

// ── Jupyter Notebook Parser (.ipynb) ────────────────────────────

async function parseNotebookFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const nb = JSON.parse(raw);

    const cells = nb.cells || [];
    let codeBlocks = 0;
    let outputBlocks = 0;
    let extracted = "## Jupyter Notebook Analysis\n\n";
    extracted += `**Kernel**: ${nb.metadata?.kernelspec?.display_name || "Python"}\n`;
    extracted += `**Total Cells**: ${cells.length}\n\n`;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const source = Array.isArray(cell.source) ? cell.source.join("") : (cell.source || "");

      if (cell.cell_type === "code") {
        codeBlocks++;
        extracted += `### Code Cell ${codeBlocks}:\n\`\`\`python\n${source}\n\`\`\`\n`;

        // Extract outputs
        if (cell.outputs && cell.outputs.length > 0) {
          for (const output of cell.outputs) {
            outputBlocks++;
            if (output.text) {
              const text = Array.isArray(output.text) ? output.text.join("") : output.text;
              extracted += `**Output**: \`\`\`\n${text.substring(0, 500)}\n\`\`\`\n`;
            } else if (output.data?.["text/plain"]) {
              const text = Array.isArray(output.data["text/plain"])
                ? output.data["text/plain"].join("")
                : output.data["text/plain"];
              extracted += `**Output**: \`\`\`\n${text.substring(0, 500)}\n\`\`\`\n`;
            }
          }
        }
        extracted += "\n";
      } else if (cell.cell_type === "markdown") {
        extracted += `### Markdown Cell:\n${source}\n\n`;
      }

      // Cap extraction at 30 cells
      if (i >= 29) {
        extracted += `\n... and ${cells.length - 30} more cells (truncated)\n`;
        break;
      }
    }

    return {
      success: true,
      fileType: "notebook",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        codeBlocks,
        outputBlocks,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "notebook",
      extractedContent: "",
      metadata: {},
      error: `Notebook parsing failed: ${err.message}`,
    };
  }
}

// ── Python File Parser (.py) ────────────────────────────────────

async function parsePythonFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const raw = await readFile(filePath, "utf-8");

    let extracted = "## Python Script Analysis\n\n";
    extracted += `**Total Lines**: ${raw.split("\n").length}\n\n`;

    // Detect imports
    const imports = raw.match(/^(?:import|from)\s+.+$/gm) || [];
    if (imports.length > 0) {
      extracted += `**Imports** (${imports.length}):\n${imports.join("\n")}\n\n`;
    }

    // Detect function definitions
    const functions = raw.match(/^def\s+\w+\(.*\).*:/gm) || [];
    if (functions.length > 0) {
      extracted += `**Functions** (${functions.length}):\n${functions.join("\n")}\n\n`;
    }

    // Detect class definitions
    const classes = raw.match(/^class\s+\w+.*:/gm) || [];
    if (classes.length > 0) {
      extracted += `**Classes** (${classes.length}):\n${classes.join("\n")}\n\n`;
    }

    extracted += `**Full Source Code**:\n\`\`\`python\n${raw}\n\`\`\`\n`;

    return {
      success: true,
      fileType: "python",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        wordCount: raw.split(/\s+/).length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "python",
      extractedContent: "",
      metadata: {},
      error: `Python file parsing failed: ${err.message}`,
    };
  }
}

// ── Power BI Parser (.pbix) ────────────────────────────────────

async function parsePbixFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const jszipModule: any = await import("jszip");
    const JSZip = jszipModule.default || jszipModule;
    const data = await readFile(filePath);
    const zip = await JSZip.loadAsync(data);

    let extracted = "## Power BI Data Model Analysis\n\n";
    const daxMeasures: string[] = [];
    const tableNames: string[] = [];

    // Try to extract DataModelSchema (main model definition)
    const schemaFile = zip.file("DataModelSchema");
    if (schemaFile) {
      try {
        const schemaText = await schemaFile.async("text");
        const schema = JSON.parse(schemaText);

        const tables = schema.model?.tables || [];
        for (const table of tables) {
          tableNames.push(table.name);
          extracted += `### Table: "${table.name}"\n`;

          // Columns
          if (table.columns && table.columns.length > 0) {
            const cols = table.columns.map((c: any) => `${c.name} (${c.dataType || "unknown"})`);
            extracted += `**Columns**: ${cols.join(", ")}\n`;
          }

          // DAX Measures
          if (table.measures && table.measures.length > 0) {
            for (const measure of table.measures) {
              daxMeasures.push(measure.name);
              extracted += `**DAX Measure**: \`${measure.name}\` = \`${measure.expression || "N/A"}\`\n`;
            }
          }
          extracted += "\n";
        }

        // Relationships
        const relationships = schema.model?.relationships || [];
        if (relationships.length > 0) {
          extracted += "### Relationships\n";
          for (const rel of relationships) {
            extracted += `  ${rel.fromTable}.${rel.fromColumn} → ${rel.toTable}.${rel.toColumn} (${rel.crossFilteringBehavior || "single"})\n`;
          }
          extracted += "\n";
        }

        extracted += `**Model Summary**: ${tableNames.length} tables, ${daxMeasures.length} DAX measures, ${relationships.length} relationships\n`;
      } catch (parseErr) {
        extracted += "DataModelSchema found but could not be parsed as JSON.\n";
      }
    } else {
      // List all files in the .pbix ZIP for diagnostic
      const fileList = Object.keys(zip.files).join(", ");
      extracted += `**PBIX contents**: ${fileList}\n`;
      extracted += "Note: DataModelSchema not found in standard location.\n";
    }

    // Try to extract DiagramLayout for visual info
    const layoutFile = zip.file("Report/Layout");
    if (layoutFile) {
      try {
        const layoutText = await layoutFile.async("text");
        const layout = JSON.parse(layoutText);
        const sections = layout.sections || [];
        extracted += `\n### Report Pages: ${sections.length}\n`;
        for (const section of sections) {
          const visualCount = section.visualContainers?.length || 0;
          extracted += `  Page: "${section.displayName || "Untitled"}" — ${visualCount} visuals\n`;
        }
      } catch {
        // Layout parsing is optional
      }
    }

    return {
      success: true,
      fileType: "pbix",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        daxMeasures,
        tables: tableNames,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "pbix",
      extractedContent: "",
      metadata: {},
      error: `PBIX parsing failed: ${err.message}`,
    };
  }
}

// ── PDF Parser (.pdf) ───────────────────────────────────────────

async function parsePdfFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const pdfModule: any = await import("pdf-parse");
    const buffer = await readFile(filePath);
    let extractedText = "";
    let pageCount = 1;

    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      extractedText = textResult.text || "";
      pageCount = textResult.pages?.length || 1;
      await parser.destroy().catch(() => {});
    } else {
      const pdfParse = pdfModule.default || pdfModule;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
      pageCount = pdfData.numpages || 1;
    }

    const words = extractedText.split(/\s+/).filter(Boolean);
    let extracted = "## PDF Document Analysis\n\n";
    extracted += `**Pages**: ${pageCount}\n`;
    extracted += `**Word Count**: ~${words.length}\n\n`;
    extracted += `**Extracted Text**:\n${extractedText}\n`;

    return {
      success: true,
      fileType: "pdf",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        pageCount,
        wordCount: words.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "pdf",
      extractedContent: "",
      metadata: {},
      error: `PDF parsing failed: ${err.message}`,
    };
  }
}

// ── DOCX Parser (.docx) ────────────────────────────────────────

async function parseDocxFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const mammothModule: any = await import("mammoth");
    const mammoth = mammothModule.default || mammothModule;
    const buffer = await readFile(filePath);
    const result = await mammoth.convertToHtml({ buffer });

    // Strip HTML tags to get plain text, but preserve structure
    const text = result.value
      .replace(/<h[1-6][^>]*>/gi, "\n### ")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .trim();

    let extracted = "## DOCX Document Analysis\n\n";
    extracted += `**Word Count**: ~${text.split(/\s+/).length}\n\n`;
    extracted += `**Extracted Content**:\n${text}\n`;

    return {
      success: true,
      fileType: "docx",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "docx",
      extractedContent: "",
      metadata: {},
      error: `DOCX parsing failed: ${err.message}`,
    };
  }
}

// ── SQL File Parser (.sql) ──────────────────────────────────────

async function parseSqlFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const raw = await readFile(filePath, "utf-8");

    let extracted = "## SQL Script Analysis\n\n";
    extracted += `**Total Lines**: ${raw.split("\n").length}\n\n`;
    extracted += `**Full SQL**:\n\`\`\`sql\n${raw}\n\`\`\`\n`;

    return {
      success: true,
      fileType: "sql",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {
        wordCount: raw.split(/\s+/).length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "sql",
      extractedContent: "",
      metadata: {},
      error: `SQL file parsing failed: ${err.message}`,
    };
  }
}

// ── JSON File Parser (.json) ────────────────────────────────────

async function parseJsonFile(filePath: string): Promise<FileExtractionResult> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const pretty = JSON.stringify(parsed, null, 2);

    let extracted = "## JSON File Analysis\n\n";
    extracted += `**Structure**: ${Array.isArray(parsed) ? `Array with ${parsed.length} items` : `Object with keys: ${Object.keys(parsed).join(", ")}`}\n\n`;
    extracted += `**Content**:\n\`\`\`json\n${pretty}\n\`\`\`\n`;

    return {
      success: true,
      fileType: "json",
      extractedContent: extracted.substring(0, MAX_EXTRACTION_CHARS),
      metadata: {},
    };
  } catch (err: any) {
    return {
      success: false,
      fileType: "json",
      extractedContent: "",
      metadata: {},
      error: `JSON parsing failed: ${err.message}`,
    };
  }
}
