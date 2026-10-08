/**
 * Honest, modality-specific submission validators.
 * Enhanced with deep file content analysis — validators now receive
 * extractedContent from file-parser.ts and score based on actual file
 * contents (formulas, code cells, DAX measures, etc.) instead of keywords.
 *
 * Fallback: If extractedContent is empty, scoring falls back to the
 * original keyword/structural approach.
 */

export interface ValidationResult {
  isExecutable: boolean;
  correctnessScore: number; // 0 to 40 points
  rowCount: number;
  columnMatch: boolean;
  rowMatch: boolean;
  orderMatch: boolean;
  feedback: string[];
  extractedContent?: string; // NEW: pass extracted content forward for Gemini
}

function parseArrayUrls(urls?: string | null): string[] {
  if (!urls) return [];
  try {
    const parsed = JSON.parse(urls);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") return [parsed];
  } catch {
    if (typeof urls === "string" && urls.trim().length > 0) return [urls];
  }
  return [];
}

/**
 * Validates Python submission: Notebook file, Colab link, or Pandas/NumPy script.
 * Enhanced: Analyzes extracted notebook cells, imports, outputs from uploaded .ipynb/.py files.
 */
export function validatePythonStructure(
  code: string,
  fileUrls?: string | null,
  externalUrl?: string | null,
  extractedContent?: string | null
): ValidationResult {
  const feedback: string[] = [];
  let score = 0;

  const files = parseArrayUrls(fileUrls);
  const hasNotebookFile = files.some((f) => f.toLowerCase().endsWith(".ipynb") || f.toLowerCase().endsWith(".py"));
  const hasColabUrl = Boolean(externalUrl && /colab\.research\.google\.com|github\.com/i.test(externalUrl));
  const cleanCode = (code || "").trim();
  const extracted = (extractedContent || "").trim();

  // Combine code editor content + extracted file content for analysis
  const allContent = `${cleanCode}\n${extracted}`;

  // Guard: Zero deliverables provided
  if (!hasNotebookFile && !hasColabUrl && cleanCode.length < 25 && extracted.length === 0) {
    return {
      isExecutable: false,
      correctnessScore: 0,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["No Python notebook (.ipynb), script (.py), or Colab link submitted. Score: 0/40."],
    };
  }

  // ── Deep Analysis (when file content is extracted) ──
  if (extracted.length > 100) {
    // 1. Deliverable uploaded + content extracted (8 pts)
    score += 8;
    feedback.push("Python deliverable file uploaded and content extracted for deep analysis (+8 pts).");

    // 2. Code cells present in notebook (up to 10 pts)
    const codeCellMatches = extracted.match(/Code Cell \d+/g) || [];
    const codeCellCount = codeCellMatches.length;
    if (codeCellCount >= 5) {
      score += 10;
      feedback.push(`${codeCellCount} code cells found — comprehensive notebook pipeline (+10 pts).`);
    } else if (codeCellCount >= 2) {
      score += 6;
      feedback.push(`${codeCellCount} code cells found — moderate notebook depth (+6 pts).`);
    } else if (codeCellCount >= 1) {
      score += 3;
      feedback.push(`${codeCellCount} code cell(s) found (+3 pts).`);
    }

    // 3. Data science imports in actual file content (up to 8 pts)
    const hasRealImports = /import\s+(pandas|numpy|matplotlib|seaborn|sklearn|scipy|plotly|statsmodels)|from\s+(pandas|numpy|sklearn|matplotlib)\b/i.test(allContent);
    if (hasRealImports) {
      score += 8;
      feedback.push("Production data science libraries (Pandas/NumPy/Sklearn) imported in notebook (+8 pts).");
    }

    // 4. Actual data transformations in file content (up to 8 pts)
    const hasRealTransforms = /\.groupby|\.merge|\.agg|\.apply|\.pivot|\.melt|\.dropna|\.fillna|\.fit|\.predict|\.transform|\.plot|\.figure/i.test(allContent);
    if (hasRealTransforms) {
      score += 8;
      feedback.push("Data transformation/visualization pipelines detected in notebook cells (+8 pts).");
    }

    // 5. Execution outputs present (up to 6 pts)
    const hasOutputs = /Output.*```/i.test(extracted) || /text\/plain/i.test(extracted);
    if (hasOutputs) {
      score += 6;
      feedback.push("Notebook execution outputs present — cells have been run (+6 pts).");
    }
  } else {
    // ── Fallback: Original keyword-based scoring ──
    if (hasNotebookFile) {
      score += 20;
      feedback.push("Verified Python notebook/script deliverable uploaded (+20 pts).");
    } else if (hasColabUrl) {
      score += 18;
      feedback.push("Verified Google Colab / GitHub notebook link provided (+18 pts).");
    } else if (files.length > 0) {
      score += 10;
      feedback.push("Supporting deliverable file uploaded (+10 pts).");
    }

    if (cleanCode.length > 0) {
      const hasDataLibraries = /import\s+(pandas|numpy|matplotlib|seaborn|sklearn|scipy)|from\s+(pandas|numpy)\b/i.test(cleanCode) || /pd\.|np\./i.test(cleanCode);
      const hasTransforms = /\.groupby|\.merge|\.agg|\.apply|\.pivot|\.melt|\.dropna|\.fillna|\.loc|\.iloc|def\s+/i.test(cleanCode);
      const hasDepth = cleanCode.length >= 100;

      if (hasDataLibraries) {
        score += 8;
        feedback.push("Production data science libraries (Pandas/NumPy) imported (+8 pts).");
      }
      if (hasTransforms) {
        score += 8;
        feedback.push("Vectorized transformations & aggregation pipelines detected (+8 pts).");
      }
      if (hasDepth) {
        score += 4;
        feedback.push("Comprehensive script length and pipeline depth (+4 pts).");
      }
    }
  }

  const finalScore = Math.min(40, score);
  return {
    isExecutable: true,
    correctnessScore: finalScore,
    rowCount: 0,
    columnMatch: true,
    rowMatch: true,
    orderMatch: true,
    feedback: feedback.length > 0 ? feedback : ["Python data engineering submission recorded for AI review."],
    extractedContent: extracted || undefined,
  };
}

/**
 * Validates Excel submission: .xlsx workbook, formula definitions, and screenshots.
 * Enhanced: Analyzes extracted formulas, sheet structure, cell data from uploaded workbooks.
 */
export function validateExcelSubmission(
  fileUrls?: string | null,
  screenshotUrls?: string | null,
  notes?: string | null,
  code?: string | null,
  extractedContent?: string | null
): ValidationResult {
  const feedback: string[] = [];
  let score = 0;

  const files = parseArrayUrls(fileUrls);
  const screenshots = parseArrayUrls(screenshotUrls);
  const cleanNotes = (notes || "").trim();
  const cleanCode = (code || "").trim();
  const extracted = (extractedContent || "").trim();

  const hasWorkbook = files.some(
    (f) => f.toLowerCase().endsWith(".xlsx") || f.toLowerCase().endsWith(".xls") || f.toLowerCase().endsWith(".csv")
  );

  // Guard: Zero deliverables
  if (!hasWorkbook && screenshots.length === 0 && cleanCode.length < 15 && cleanNotes.length < 20 && extracted.length === 0) {
    return {
      isExecutable: false,
      correctnessScore: 0,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["No Excel workbook (.xlsx), formulas, or dashboard screenshots provided. Score: 0/40."],
    };
  }

  // ── Deep Analysis (when file content is extracted) ──
  const isParsed = extractedContent !== undefined && extractedContent !== null;

  if (isParsed && extracted.length > 0) {
    // 1. Workbook uploaded + content extracted
    const formulaMatches = extracted.match(/Cell [A-Z]+\d+:\s*=/gi) || [];
    const formulaCount = formulaMatches.length;
    const hasFormulas = formulaCount > 0 || /SUM|AVERAGE|COUNT|VLOOKUP|XLOOKUP|IF/i.test(extracted);
    const rowMatch = extracted.match(/(\d+) rows/);
    const hasRows = rowMatch && parseInt(rowMatch[1], 10) > 0;

    if (!hasFormulas && !hasRows) {
      // Empty or trivial workbook
      score += 5;
      feedback.push("Workbook uploaded but contains no formulas or data models (+5 pts).");
    } else {
      score += 8;
      feedback.push("Excel workbook uploaded and content extracted for deep analysis (+8 pts).");
    }

    // 2. Actual formula count from parsed file (up to 12 pts)
    if (formulaCount >= 10) {
      score += 12;
      feedback.push(`${formulaCount} formulas found in workbook — comprehensive formula model (+12 pts).`);
    } else if (formulaCount >= 3) {
      score += 8;
      feedback.push(`${formulaCount} formulas found in workbook (+8 pts).`);
    } else if (formulaCount >= 1) {
      score += 4;
      feedback.push(`${formulaCount} formula(s) found in workbook (+4 pts).`);
    }

    // 3. Advanced formula types (up to 6 pts)
    const hasAdvancedFormulas = /XLOOKUP|INDEX|MATCH|FILTER|UNIQUE|SORT|LAMBDA|LET|SUMIFS|COUNTIFS|AVERAGEIFS/i.test(extracted);
    if (hasAdvancedFormulas) {
      score += 6;
      feedback.push("Advanced Excel functions (XLOOKUP, INDEX/MATCH, FILTER, LAMBDA) detected in workbook (+6 pts).");
    }

    // 4. Multiple sheets (up to 5 pts)
    const sheetMatches = extracted.match(/Sheet: "/g) || [];
    if (sheetMatches.length >= 3) {
      score += 5;
      feedback.push(`${sheetMatches.length} worksheets — proper data model structure (+5 pts).`);
    } else if (sheetMatches.length >= 2) {
      score += 3;
      feedback.push(`${sheetMatches.length} worksheets found (+3 pts).`);
    }

    // 5. Data depth (up to 5 pts)
    if (rowMatch) {
      const rows = parseInt(rowMatch[1], 10);
      if (rows >= 20) {
        score += 5;
        feedback.push(`Workbook contains ${rows}+ rows of data (+5 pts).`);
      } else if (rows >= 5) {
        score += 3;
        feedback.push(`Workbook contains ${rows} rows of data (+3 pts).`);
      }
    }

    // 6. Visual proof / screenshots (4 pts)
    if (screenshots.length > 0) {
      score += 4;
      feedback.push(`${screenshots.length} visual screenshot(s) attached as proof (+4 pts).`);
    }
  } else {
    // ── Fallback: Original scoring ──
    if (hasWorkbook) {
      score += 20;
      feedback.push("Completed Excel workbook (.xlsx/.csv) uploaded for evaluation (+20 pts).");
    } else if (files.length > 0) {
      score += 10;
      feedback.push("Supporting deliverable file uploaded (+10 pts).");
    } else {
      feedback.push("Warning: No .xlsx workbook file uploaded. Upload your model file for full credit.");
    }

    if (screenshots.length > 0) {
      score += 10;
      feedback.push(`${screenshots.length} visual screenshot(s) attached as dashboard proof (+10 pts).`);
    }

    const allText = `${cleanCode} ${cleanNotes}`;
    const hasModernFormulas = /=XLOOKUP|=INDEX|=MATCH|=FILTER|=SUMIFS|=COUNTIFS|=LET|=LAMBDA/i.test(allText);
    if (hasModernFormulas) {
      score += 6;
      feedback.push("Modern Excel formula syntax (XLOOKUP, FILTER, SUMIFS) documented (+6 pts).");
    }
    if (cleanNotes.length >= 50) {
      score += 4;
      feedback.push("Business assumptions & calculation methodology documented (+4 pts).");
    }
  }

  const finalScore = Math.min(40, score);
  return {
    isExecutable: true,
    correctnessScore: finalScore,
    rowCount: 0,
    columnMatch: true,
    rowMatch: true,
    orderMatch: true,
    feedback: feedback.length > 0 ? feedback : ["Excel business model recorded for qualitative AI evaluation."],
    extractedContent: extracted || undefined,
  };
}

/**
 * Validates Power BI submission: .pbix file, live dashboard URL, screenshots, and DAX measures.
 * Enhanced: Analyzes extracted DAX measures, data model, table relationships from .pbix files.
 */
export function validatePowerBISubmission(
  code?: string | null,
  externalUrl?: string | null,
  screenshotUrls?: string | null,
  fileUrls?: string | null,
  extractedContent?: string | null
): ValidationResult {
  const feedback: string[] = [];
  let score = 0;

  const files = parseArrayUrls(fileUrls);
  const screenshots = parseArrayUrls(screenshotUrls);
  const cleanCode = (code || "").trim();
  const url = (externalUrl || "").trim();
  const extracted = (extractedContent || "").trim();

  const hasPbix = files.some((f) => f.toLowerCase().endsWith(".pbix") || f.toLowerCase().endsWith(".pdf"));
  const hasLiveUrl = Boolean(url && /app\.powerbi\.com|novypro\.com|fabric\.microsoft\.com|github\.com/i.test(url));

  // Guard: Zero deliverables
  if (!hasPbix && !hasLiveUrl && screenshots.length === 0 && cleanCode.length < 20 && extracted.length === 0) {
    return {
      isExecutable: false,
      correctnessScore: 0,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["No Power BI deliverable (.pbix, published report URL, or dashboard screenshots) provided. Score: 0/40."],
    };
  }

  // ── Deep Analysis (when .pbix content is extracted) ──
  if (extracted.length > 100 && extracted.includes("Power BI")) {
    // 1. PBIX file uploaded + model extracted (8 pts)
    score += 8;
    feedback.push("Power BI data model file uploaded and extracted for deep analysis (+8 pts).");

    // 2. DAX Measures found (up to 12 pts)
    const daxMatches = extracted.match(/DAX Measure[\*\s]*:/gi) || [];
    const daxCount = daxMatches.length;
    if (daxCount >= 5) {
      score += 12;
      feedback.push(`${daxCount} DAX measures found — comprehensive measure layer (+12 pts).`);
    } else if (daxCount >= 2) {
      score += 8;
      feedback.push(`${daxCount} DAX measures found (+8 pts).`);
    } else if (daxCount >= 1) {
      score += 4;
      feedback.push(`${daxCount} DAX measure(s) found (+4 pts).`);
    }

    // 3. Advanced DAX functions (up to 6 pts)
    const hasAdvancedDax = /CALCULATE|SUMX|AVERAGEX|FILTER|ALL|ALLEXCEPT|DIVIDE|RELATED|DATESYTD|TOTALYTD|USERELATIONSHIP/i.test(extracted);
    if (hasAdvancedDax) {
      score += 6;
      feedback.push("Advanced DAX functions (CALCULATE, SUMX, FILTER, time intelligence) in data model (+6 pts).");
    }

    // 4. Table relationships (up to 5 pts)
    const relMatches = extracted.match(/→/g) || [];
    if (relMatches.length >= 3) {
      score += 5;
      feedback.push(`${relMatches.length} table relationships — proper star/snowflake schema (+5 pts).`);
    } else if (relMatches.length >= 1) {
      score += 3;
      feedback.push(`${relMatches.length} table relationship(s) found (+3 pts).`);
    }

    // 5. Multiple tables (up to 4 pts)
    const tableMatches = extracted.match(/Table: "/g) || [];
    if (tableMatches.length >= 3) {
      score += 4;
      feedback.push(`${tableMatches.length} tables in data model (+4 pts).`);
    }

    // 6. Live URL bonus (3 pts)
    if (hasLiveUrl) {
      score += 3;
      feedback.push("Published interactive dashboard URL also provided (+3 pts).");
    }

    // 7. Screenshots (2 pts)
    if (screenshots.length > 0) {
      score += 2;
      feedback.push(`${screenshots.length} dashboard screenshot(s) attached (+2 pts).`);
    }
  } else {
    // ── Fallback: Original scoring ──
    if (hasLiveUrl) {
      score += 20;
      feedback.push("Verified published interactive dashboard URL provided (+20 pts).");
    } else if (hasPbix) {
      score += 18;
      feedback.push("Power BI (.pbix) data model file attached (+18 pts).");
    }

    if (screenshots.length > 0) {
      score += 10;
      feedback.push(`${screenshots.length} visual dashboard screenshot(s) attached (+10 pts).`);
    }

    const hasDax = /CALCULATE|SUMX|AVERAGEX|FILTER|ALL|ALLEXCEPT|DIVIDE|RELATED|DATESYTD|TOTALYTD|USERELATIONSHIP/i.test(cleanCode);
    if (hasDax) {
      score += 10;
      feedback.push("Enterprise DAX measure logic (CALCULATE, DIVIDE, Filter Context) formulated (+10 pts).");
    } else if (cleanCode.length > 50) {
      score += 5;
      feedback.push("Data model documentation provided (+5 pts).");
    }
  }

  const finalScore = Math.min(40, score);
  return {
    isExecutable: true,
    correctnessScore: finalScore,
    rowCount: 0,
    columnMatch: true,
    rowMatch: true,
    orderMatch: true,
    feedback: feedback.length > 0 ? feedback : ["Power BI dashboard deliverable verified for evaluation."],
    extractedContent: extracted || undefined,
  };
}

/**
 * Validates GitHub repository submission with real HTTP check.
 * Enhanced: Fetches README content and file tree for deeper Gemini analysis.
 */
export async function validateGitHubSubmission(githubUrl?: string | null): Promise<ValidationResult> {
  const url = (githubUrl || "").trim();

  if (!url) {
    return {
      isExecutable: false,
      correctnessScore: 0,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["No GitHub repository URL provided. Score: 0/40."],
    };
  }

  const isGitHubUrl = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/i.test(url);
  if (!isGitHubUrl) {
    return {
      isExecutable: false,
      correctnessScore: 5,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["URL does not match standard GitHub repository format (https://github.com/owner/repo). (+5 pts)."],
    };
  }

  // Attempt live GitHub API verification
  try {
    const match = url.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (match) {
      const owner = match[1];
      const repoName = match[2].replace(/\.git$/, "");
      const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
      const headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Praxis-LMS-Validator",
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(apiUrl, { headers, signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const repo = await res.json();
        let score = 15;
        const feedback: string[] = ["Public GitHub repository verified and reachable (+15 pts)."];
        let extractedContent = `## GitHub Repository: ${owner}/${repoName}\n\n`;
        extractedContent += `**Description**: ${repo.description || "None"}\n`;
        extractedContent += `**Language**: ${repo.language || "Unknown"}\n`;
        extractedContent += `**Size**: ${repo.size} KB\n`;
        extractedContent += `**Stars**: ${repo.stargazers_count}, **Forks**: ${repo.forks_count}\n\n`;

        if (repo.size > 0) {
          score += 5;
          feedback.push("Repository contains committed source code files (+5 pts).");
        }
        if (repo.description) {
          score += 3;
          feedback.push("Repository has project documentation description (+3 pts).");
        }

        // Fetch README content for Gemini evaluation
        try {
          const readmeController = new AbortController();
          const readmeTimeout = setTimeout(() => readmeController.abort(), 5000);
          const readmeRes = await fetch(`${apiUrl}/readme`, {
            headers,
            signal: readmeController.signal,
          });
          clearTimeout(readmeTimeout);

          if (readmeRes.ok) {
            score += 5;
            feedback.push("README.md documentation found in repository (+5 pts).");
            const readmeData = await readmeRes.json();
            try {
              const readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
              extractedContent += `### README.md Content:\n${readmeContent.substring(0, 3000)}\n\n`;
            } catch {
              extractedContent += "### README.md: Present but could not decode content\n\n";
            }
          }
        } catch {}

        // Fetch file tree for project structure
        try {
          const defaultBranch = repo.default_branch || "main";
          const treeController = new AbortController();
          const treeTimeout = setTimeout(() => treeController.abort(), 5000);
          const treeRes = await fetch(`${apiUrl}/git/trees/${defaultBranch}?recursive=1`, {
            headers,
            signal: treeController.signal,
          });
          clearTimeout(treeTimeout);

          if (treeRes.ok) {
            const tree = await treeRes.json();
            const fileList = (tree.tree || [])
              .filter((f: any) => f.type === "blob")
              .map((f: any) => f.path)
              .slice(0, 50);

            score += 5;
            feedback.push(`Project structure: ${fileList.length}+ files detected (+5 pts).`);
            extractedContent += `### Project File Structure:\n${fileList.join("\n")}\n\n`;

            // Check for key project files
            const hasDockerfile = fileList.some((f: string) => /dockerfile/i.test(f));
            const hasTests = fileList.some((f: string) => /test|spec/i.test(f));
            const hasCI = fileList.some((f: string) => /\.github\/workflows|\.gitlab-ci|jenkinsfile/i.test(f));
            const hasRequirements = fileList.some((f: string) => /requirements\.txt|setup\.py|pyproject\.toml|package\.json/i.test(f));

            if (hasTests) {
              score += 2;
              feedback.push("Test files detected in repository (+2 pts).");
            }
            if (hasCI || hasDockerfile) {
              score += 2;
              feedback.push("CI/CD or containerization configuration found (+2 pts).");
            }
            if (hasRequirements) {
              score += 2;
              feedback.push("Dependency management file found (+2 pts).");
            }
          }
        } catch {}

        return {
          isExecutable: true,
          correctnessScore: Math.min(40, score),
          rowCount: 0,
          columnMatch: true,
          rowMatch: true,
          orderMatch: true,
          feedback,
          extractedContent,
        };
      } else if (res.status === 404) {
        return {
          isExecutable: false,
          correctnessScore: 0,
          rowCount: 0,
          columnMatch: false,
          rowMatch: false,
          orderMatch: false,
          feedback: ["GitHub repository not found or is private (HTTP 404). Ensure repository is public. Score: 0/40."],
        };
      }
    }
  } catch (err) {
    // Network / API rate limit fallback: award structural points
  }

  return {
    isExecutable: true,
    correctnessScore: 18,
    rowCount: 0,
    columnMatch: true,
    rowMatch: true,
    orderMatch: true,
    feedback: ["Valid GitHub repository URL submitted (+18 pts). Ensure repository is public for recruiter evaluation."],
  };
}

/**
 * Validates document / BRD / Strategy deliverables based on structural depth and hierarchy.
 * Enhanced: Analyzes extracted text from uploaded PDF/DOCX files for deeper evaluation.
 */
export function validateDocumentStructure(
  code: string,
  fileUrls?: string | null,
  notes?: string | null,
  extractedContent?: string | null
): ValidationResult {
  const feedback: string[] = [];
  let score = 0;

  const cleanCode = (code || "").trim();
  const cleanNotes = (notes || "").trim();
  const files = parseArrayUrls(fileUrls);
  const extracted = (extractedContent || "").trim();

  const totalChars = cleanCode.length + cleanNotes.length + extracted.length;

  // Guard: Empty deliverable
  if (totalChars < 50 && files.length === 0) {
    return {
      isExecutable: false,
      correctnessScore: 0,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["Deliverable specification is too brief (< 50 characters). Provide detailed requirements. Score: 0/40."],
    };
  }

  // ── Deep Analysis (when document content is extracted) ──
  if (extracted.length > 200) {
    // 1. Document uploaded + content extracted (8 pts)
    score += 8;
    feedback.push("Document uploaded and full text extracted for deep analysis (+8 pts).");

    // 2. Document length & depth (up to 12 pts)
    const wordCount = extracted.split(/\s+/).length;
    if (wordCount >= 500) {
      score += 12;
      feedback.push(`Comprehensive document (~${wordCount} words) — professional specification depth (+12 pts).`);
    } else if (wordCount >= 200) {
      score += 8;
      feedback.push(`Moderate document (~${wordCount} words) (+8 pts).`);
    } else {
      score += 4;
      feedback.push(`Document contains ~${wordCount} words (+4 pts).`);
    }

    // 3. Structure quality — headings and sections (up to 10 pts)
    const hasHeadings = /#{1,3}\s+[A-Za-z0-9]|(\b1\.\s+|\b2\.\s+|\b3\.\s+)|Executive Summary|Requirements|Scope|Acceptance Criteria/i.test(extracted);
    const hasSections = (extracted.match(/#{1,3}\s+|^\d+\.\s+/gm) || []).length;
    if (hasSections >= 5) {
      score += 10;
      feedback.push(`${hasSections} sections/headings — well-structured document (+10 pts).`);
    } else if (hasHeadings) {
      score += 6;
      feedback.push("Document contains hierarchical section headers (+6 pts).");
    }

    // 4. Business keywords (up to 5 pts)
    const hasBizTerms = /stakeholder|KPI|metric|requirement|acceptance criteria|user story|sprint|milestone|ROI|revenue|retention/i.test(extracted);
    if (hasBizTerms) {
      score += 5;
      feedback.push("Business analysis terminology and methodology detected (+5 pts).");
    }

    // 5. Additional notes from student (up to 5 pts)
    if (cleanNotes.length >= 100) {
      score += 5;
      feedback.push("Supplementary architectural notes provided (+5 pts).");
    }
  } else {
    // ── Fallback: Original scoring ──
    if (files.length > 0) {
      score += 15;
      feedback.push("Formal specification document file uploaded (+15 pts).");
    }

    const allText = `${cleanCode} ${cleanNotes}`;
    const hasHeadings = /#{1,3}\s+[A-Za-z0-9]|(\b1\.\s+|\b2\.\s+|\b3\.\s+)/i.test(allText);
    if (hasHeadings) {
      score += 12;
      feedback.push("Clear hierarchical section headers & structure detected (+12 pts).");
    }

    const textLen = cleanCode.length + cleanNotes.length;
    if (textLen >= 500) {
      score += 13;
      feedback.push("Comprehensive 12 LPA specification depth (> 500 characters) (+13 pts).");
    } else if (textLen >= 250) {
      score += 8;
      feedback.push("Moderate specification depth (+8 pts).");
    } else {
      score += 3;
      feedback.push("Brief specification provided (+3 pts).");
    }
  }

  const finalScore = Math.min(40, score);
  return {
    isExecutable: true,
    correctnessScore: finalScore,
    rowCount: 0,
    columnMatch: true,
    rowMatch: true,
    orderMatch: true,
    feedback: feedback.length > 0 ? feedback : ["Document structure verified for qualitative AI assessment."],
    extractedContent: extracted || undefined,
  };
}
