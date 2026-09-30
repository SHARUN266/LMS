// 12 LPA Industry-Grade Curriculum Blueprint for AI-Native Smart LMS
// 15 Comprehensive Modules across 90 Days
// Clean, Lean Blueprint: Day titles & objectives only.
// Real content, theory, practice sandbox & assignments are dynamically synthesized by AI.

export const TRACK_INFO = {
  slug: "data-analyst-career-track",
  title: "Data Analyst & Analytics Engineering (12 LPA GCC Track)",
  description: "Rigorous 15-module industry career path mastering Advanced Excel, Production SQL, Enterprise Power BI/DAX, Kimball Data Warehousing, Python Pipelines, dbt Analytics Engineering, Cloud Platforms, DPDP Governance, and Big 4 Consulting Case Studies for Tier-1 Global Capability Centers (GCCs)."
};

export const MODULES_DATA = [
  {
    order: 0,
    title: "Module 0: Excel + Business Productivity",
    weeks: "Week 1",
    description: "XLOOKUP, INDEX/MATCH, Dynamic Arrays, Multi-Dimensional Pivot Tables, 3-Statement Financial Modeling, Sensitivity Tables, Power Query M ETL & C-Suite Dashboards.",
    icon: "excel",
    capstoneTheme: "Executive Financial & Sales Operations Model",
    capstoneBrief: "Build an automated multi-sheet business model with dynamic lookups, Power Query ETL, and C-Suite summary cards.",
    days: [
      {
        dayNumber: 1,
        title: "Day 1: What is Analytics & Modern Lookups (XLOOKUP, INDEX/MATCH) & Data Hygiene",
        objective: "Understand the end-to-end data lifecycle from user click to C-Suite decision, master modern lookups (XLOOKUP, INDEX/MATCH), and eliminate brittle VLOOKUP column index errors."
      },
      {
        dayNumber: 2,
        title: "Day 2: Multi-Dimensional Pivot Tables, Slicers & Calculated Fields",
        objective: "Design automated reporting matrices, custom calculated fields, timeline slicers, grouping hierarchies (Year-Quarter-Month), and executive summary scorecards."
      },
      {
        dayNumber: 3,
        title: "Day 3: Business & Financial Literacy (Unit Economics, P&L, CAGR, DCF, LTV:CAC)",
        objective: "Master P&L financial statements, compound annual growth rate (CAGR), Discounted Cash Flow (DCF), Net Present Value (NPV), and SaaS unit economics (CAC, LTV, Payback)."
      },
      {
        dayNumber: 4,
        title: "Day 4: Scenario Planning, Sensitivity Tables & Goal Seek",
        objective: "Implement executive sensitivity analysis using What-If Analysis, 2-Variable Data Tables, Scenario Manager (Base/Best/Worst cases), and Goal Seek break-even solvers."
      },
      {
        dayNumber: 5,
        title: "Day 5: Power Query Transformations & Automated Data Cleaning (M Language ETL)",
        objective: "Automate multi-file folder ingestion, unpivoting cross-tabs (wide-to-tall data), string/date cleansing, and repeatable M-code data pipelines without VBA macros."
      },
      {
        dayNumber: 6,
        title: "Day 6: Executive C-Suite Dashboard Synthesis & Boardroom Presentation",
        objective: "Synthesize the 3-sheet architecture (Raw Data, Calculations, Dashboard), executive KPI cards with Unicode variance arrows, sparklines, and minimalist boardroom formatting."
      }
    ]
  },
  {
    order: 1,
    title: "Module 1: Production SQL & Analytical Problem Solving",
    weeks: "Week 2",
    description: "Joins, CTEs, Window Functions, CASE statements, Cohorts, Funnels, Query Execution Plans & Index Optimization.",
    icon: "database",
    capstoneTheme: "E-Commerce Analytics Mart & Cohort Retention Engine",
    capstoneBrief: "Design relational schemas, 30-day cohort retention matrices, and query execution optimization pipelines.",
    days: [
      {
        dayNumber: 7,
        title: "Day 7: Multi-Table Joins, Fan-Out Traps & Financial Aggregation",
        objective: "Master relational joins (INNER, LEFT, FULL OUTER), internalize row-multiplication mechanics in 1:N relations, and compute financial metrics without duplicate inflation."
      },
      {
        dayNumber: 8,
        title: "Day 8: Analytical Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD)",
        objective: "Master partitioned calculations, running totals, customer order cadence using LAG(), and rank-ordering metrics without row collapse."
      },
      {
        dayNumber: 9,
        title: "Day 9: Common Table Expressions (CTEs) & Modular Business Pipelines",
        objective: "Eliminate nested subquery spaghetti code by architecting modular, self-documenting analytical DAG pipelines with Common Table Expressions (WITH clauses)."
      },
      {
        dayNumber: 10,
        title: "Day 10: Conditional Aggregations, Pivot Reports & NULL Coalescing",
        objective: "Master conditional aggregation matrices with SUM(CASE WHEN...), construct cross-tabular reports, and ensure mathematical safety with SQL Three-Valued Logic."
      },
      {
        dayNumber: 11,
        title: "Day 11: 30-Day Cohort Retention & Churn Curve Modeling",
        objective: "Engineer customer acquisition cohorts by registration date, compute Month-over-Month retention heatmaps, calculate customer churn trajectories, and identify drop-off cliffs."
      },
      {
        dayNumber: 12,
        title: "Day 12: Query Execution Plans, B-Tree Indexing & Performance Optimization",
        objective: "Diagnose execution bottlenecks using EXPLAIN QUERY PLAN, eliminate costly sequential table scans, and structure SARGable WHERE predicates for high-velocity queries."
      }
    ]
  },
  {
    order: 2,
    title: "Module 2: Data Modeling & Data Warehousing",
    weeks: "Week 3",
    description: "Kimball Dimensional Modeling, Grain Definition, Fact vs Dimension, Star vs Snowflake, SCD Types, OLTP vs OLAP.",
    icon: "database",
    capstoneTheme: "Enterprise Data Warehouse Architecture & SCD Mart",
    capstoneBrief: "Architect an enterprise Kimball dimensional model with fact/dim tables, surrogate keys, and slowly changing dimensions.",
    days: [
      {
        dayNumber: 13,
        title: "Day 13: Kimball Dimensional Modeling, Grain Definition & Star Schema Design",
        objective: "Master Kimball four-step dimensional design: choose business process, declare grain, identify dimensions, and identify facts."
      },
      {
        dayNumber: 14,
        title: "Day 14: Slowly Changing Dimensions (SCD Type 1, 2, 3) & Historical Audit Lineage",
        objective: "Implement SCD Type 1 overwrite and SCD Type 2 row versioning with effective_start_date, effective_end_date, and is_current boolean flags."
      },
      {
        dayNumber: 15,
        title: "Day 15: Conformed Dimensions, Enterprise Bus Matrix & Bridge Tables",
        objective: "Design enterprise conformed dimensions across departments and model M:N multivalued hierarchies using dual-key bridge tables."
      },
      {
        dayNumber: 16,
        title: "Day 16: Fact Table Patterns: Transaction, Periodic Snapshot & Accumulating Snapshot",
        objective: "Distinguish between atomic transaction facts, monthly snapshot rollups, and multi-milestone accumulating lifecycle order funnels."
      },
      {
        dayNumber: 17,
        title: "Day 17: OLTP Relational Normalization vs OLAP Columnar Data Lakehouses",
        objective: "Analyze why 3NF write-optimized OLTP databases fail analytical reporting and how columnar storage compression powers modern lakehouses."
      },
      {
        dayNumber: 18,
        title: "Day 18: Enterprise Data Modeling Synthesis & Semantic Mart Capstone",
        objective: "Synthesize an end-to-end multi-fact dimensional data mart with documented grain declarations, surrogate keys, and conformed date dimensions."
      }
    ]
  },
  {
    order: 3,
    title: "Module 3: Enterprise Power BI + Advanced DAX",
    weeks: "Week 4",
    description: "Semantic Models, Star Schema Relationships, CALCULATE, Filter Context, Time Intelligence, RLS & Tuning.",
    icon: "line-chart",
    capstoneTheme: "C-Suite Executive Financial & Revenue BI Dashboard",
    capstoneBrief: "Design high-performance DAX semantic models with dynamic time intelligence, row-level security, and executive drill-throughs.",
    days: [
      {
        dayNumber: 19,
        title: "Day 19: Semantic Data Models, Star Schema Relationships & Cardinality Traps",
        objective: "Architect high-performance 1:N single-direction relationships, prevent bidirectional filtering ambiguity, and enforce Kimball schemas in Tabular."
      },
      {
        dayNumber: 20,
        title: "Day 20: DAX Evaluation Context: Row Context, Filter Context & CALCULATE",
        objective: "Master context transition, filter modification with CALCULATE, ALL, ALLEXCEPT, and KEEPFILTERS in multi-dimensional measure calculations."
      },
      {
        dayNumber: 21,
        title: "Day 21: DAX Time Intelligence: YTD, YoY Growth & Dynamic Fiscal Shifts",
        objective: "Build fiscal calendar date dimensions and calculate Year-to-Date (TOTALYTD), Same-Period-Last-Year, and custom rolling 90-day moving measures."
      },
      {
        dayNumber: 22,
        title: "Day 22: Row-Level Security (RLS), Object-Level Security & UserPrincipalName",
        objective: "Implement dynamic security models restricting regional sales managers to their respective territories using USERPRINCIPALNAME() and security tables."
      },
      {
        dayNumber: 23,
        title: "Day 23: Performance Analyzer, DAX Studio Query Profiling & VertiPaq Compression",
        objective: "Optimize slow visuals using Power BI Performance Analyzer, inspect server timings in DAX Studio, and minimize memory footprint via high-cardinality pruning."
      },
      {
        dayNumber: 24,
        title: "Day 24: Executive BI Storytelling, Drill-Throughs & Boardroom Synthesis",
        objective: "Design executive cockpit navigation with sync slicers, conditional drill-through pages, bookmarks, and mobile-optimized C-Suite views."
      }
    ]
  },
  {
    order: 4,
    title: "Module 4: Python for Analytics & Automation",
    weeks: "Week 5",
    description: "Python Core, Pandas, NumPy, REST APIs, JSON Flattening, Outlier Cleansing, Automated ETL Pipelines.",
    icon: "code",
    capstoneTheme: "Automated Python Ingestion & Reconciliation Engine",
    capstoneBrief: "Build an automated multi-source reconciliation pipeline fetching REST APIs and validating financial ledger consistency.",
    days: [
      {
        dayNumber: 25,
        title: "Day 25: Python Core, Vectorized Pandas DataFrames & NumPy Broadcasting",
        objective: "Master vectorization over Python for-loops, memory profiling of columnar series, and efficient boolean indexing on large datasets."
      },
      {
        dayNumber: 26,
        title: "Day 26: Data Cleaning, Imputation & Anomaly Detection (IQR, Z-Score)",
        objective: "Clean missing values defensibly, remove extreme statistical outliers using Interquartile Range (IQR), and enforce type coercion."
      },
      {
        dayNumber: 27,
        title: "Day 27: Reshaping, Aggregations, Multi-Index DataFrames & Pivot Tables",
        objective: "Master groupby-agg patterns, multi-level indexing, melt/unpivot operations, and dynamic crosstabulation in production scripts."
      },
      {
        dayNumber: 28,
        title: "Day 28: REST API Ingestion, Rate Limits, Pagination & JSON Flattening",
        objective: "Extract transactional records from external REST APIs using requests, handle cursor-based pagination, and normalize nested JSON trees."
      },
      {
        dayNumber: 29,
        title: "Day 29: Automated Multi-Source Reconciliation & Financial Ledger Validation",
        objective: "Build an automated reconciliation engine comparing payment gateway transaction exports against database ledgers to flag discrepancies."
      },
      {
        dayNumber: 30,
        title: "Day 30: End-to-End Automated Python Ingestion Pipeline Capstone",
        objective: "Deploy a production-grade Python ETL script with structured logging, defensive try/except error recovery, and automated Slack/Email alert webhooks."
      }
    ]
  },
  {
    order: 5,
    title: "Module 5: ETL/ELT & Data Pipelines",
    weeks: "Week 6",
    description: "Ingestion, Staging, Incremental Loads (Watermarking), Validation, Orchestration, Webhooks & Data Contracts.",
    icon: "workflow",
    capstoneTheme: "Fault-Tolerant Incremental ETL Pipeline",
    capstoneBrief: "Construct automated data ingestion pipelines with watermarking, circuit breakers, and schema validation.",
    days: [
      {
        dayNumber: 31,
        title: "Day 31: Data Ingestion Patterns: Batch vs Micro-Batch vs Event Streaming",
        objective: "Evaluate trade-offs between scheduled batch extract-load-transform (ELT) pipelines, micro-batching, and low-latency event queues."
      },
      {
        dayNumber: 32,
        title: "Day 32: Incremental Loading & Watermarking: High-Watermark Delta Queries",
        objective: "Implement stateful incremental ingestion tracking updated_at high-watermark timestamps to ingest only modified rows without full table re-scans."
      },
      {
        dayNumber: 33,
        title: "Day 33: Automated Data Validation, Schema Evolution & Circuit Breakers",
        objective: "Build automated pipeline health checks that halt downstream ingestion if row count variance exceeds 20% or null percentages breach SLA limits."
      },
      {
        dayNumber: 34,
        title: "Day 34: Pipeline Orchestration & DAG Dependencies",
        objective: "Structure directed acyclic graph (DAG) execution schedules, retry backoff algorithms, and dependency chaining."
      },
      {
        dayNumber: 35,
        title: "Day 35: System Webhooks, Dead-Letter Queues & Automated Incident Alerting",
        objective: "Route failed ingestion payloads into dead-letter storage and dispatch automated operational alert cards to engineering response channels."
      },
      {
        dayNumber: 36,
        title: "Day 36: Fault-Tolerant Production ETL Pipeline Synthesis",
        objective: "Assemble an end-to-end resilient incremental ingestion pipeline with automated quarantine staging, watermarking, and audit logging."
      }
    ]
  },
  {
    order: 6,
    title: "Module 6: Analytics Engineering with dbt",
    weeks: "Week 7",
    description: "dbt Core, Git Version Control, Testing (Unique/Not Null), Documentation, Lineage DAGs, Reusable SQL & CI/CD.",
    icon: "workflow",
    capstoneTheme: "Production dbt Analytics Mart & Automated CI/CD",
    capstoneBrief: "Transform staging schemas into analytics-ready dimensional models using dbt macros, schema tests, and GitHub Actions.",
    days: [
      {
        dayNumber: 37,
        title: "Day 37: Modern Data Stack (MDS) Foundations & dbt Core Architecture",
        objective: "Understand how dbt decouples transformation inside the data warehouse, executes ephemeral vs table vs view materializations, and builds lineage DAGs."
      },
      {
        dayNumber: 38,
        title: "Day 38: Staging Models, CTE Best Practices & Source Freshness Verification",
        objective: "Implement standardized staging layer models (stg_) with clean column renaming, type casting, and automated source freshness testing."
      },
      {
        dayNumber: 39,
        title: "Day 39: Jinja Templating, Reusable Macros & Cross-Database SQL Abstractions",
        objective: "Write reusable dbt macros using Jinja loops to dynamically pivot column categories and generate consistent financial metrics."
      },
      {
        dayNumber: 40,
        title: "Day 40: Automated Testing: Unique, Not Null, Accepted Values & Relationship Integrity",
        objective: "Configure declarative schema tests in YAML verifying primary key uniqueness, non-null guarantees, and foreign-key referential integrity."
      },
      {
        dayNumber: 41,
        title: "Day 41: Auto-Generated Documentation, Lineage DAGs & Exposure Tracking",
        objective: "Document models with markdown descriptions, generate browser-based interactive DAG lineage graphs, and map downstream BI dashboard exposures."
      },
      {
        dayNumber: 42,
        title: "Day 42: Git Version Control, Branching Strategy & GitHub Actions CI/CD for dbt",
        objective: "Implement pull request CI workflows that compile dbt models against slim dev environments and run automated schema validation on merge."
      }
    ]
  },
  {
    order: 7,
    title: "Module 7: Business & Product Analytics",
    weeks: "Week 8",
    description: "KPI North Stars, Root Cause Analysis, Funnel Conversion, Retention, Cohorts, RFM Segmentation, Unit Economics.",
    icon: "trending",
    capstoneTheme: "Product Growth & Commercial Funnel Diagnostic",
    capstoneBrief: "Analyze AARRR conversion funnels, calculate blended CAC vs LTV payback periods, and evaluate segment profitability.",
    days: [
      {
        dayNumber: 43,
        title: "Day 43: North Star Metrics, Driver Trees & Root Cause Decomposition",
        objective: "Deconstruct top-line revenue into mathematical MECE driver trees (Traffic * Conversion * AOV) to isolate operational performance bottlenecks."
      },
      {
        dayNumber: 44,
        title: "Day 44: AARRR Pirate Conversion Funnels & Step-over-Step Drop-off Diagnostics",
        objective: "Model user acquisition, activation, retention, referral, and revenue funnels; calculate step-by-step conversion rates and drop-off leakage."
      },
      {
        dayNumber: 45,
        title: "Day 45: Customer Retention Curves, L1/L7/L30 Cadence & Resurrected Cohorts",
        objective: "Compute active user ratios (DAU/MAU stickiness), model smiling vs flattening retention curves, and distinguish new vs resurrected users."
      },
      {
        dayNumber: 46,
        title: "Day 46: RFM (Recency, Frequency, Monetary) Customer Segmentation & Micro-Clustering",
        objective: "Segment customer databases into Champions, Loyal Customers, At-Risk, and Churned cohorts using quintile RFM scoring."
      },
      {
        dayNumber: 47,
        title: "Day 47: Unit Economics Modeling: Blended CAC vs Paid CAC & LTV Payback Periods",
        objective: "Calculate true customer acquisition cost factoring paid media + agency fees, and evaluate month-to-payback across organic and paid cohorts."
      },
      {
        dayNumber: 48,
        title: "Day 48: Commercial Product Growth & Revenue Diagnostic Capstone",
        objective: "Deliver an executive commercial growth report diagnosing retention cliff drop-offs and recommending capital reallocation."
      }
    ]
  },
  {
    order: 8,
    title: "Module 8: Power Platform & Workflow Automation",
    weeks: "Week 9",
    description: "Power Automate, Power Apps basics, BI Alerting, n8n, Webhook triggers, Automated Business Incident Workflows.",
    icon: "workflow",
    capstoneTheme: "Event-Driven Automated KPI Alerting & Action System",
    capstoneBrief: "Deploy automated anomaly detection webhooks triggering instant incident alerts and management summaries.",
    days: [
      {
        dayNumber: 49,
        title: "Day 49: Power Automate Cloud Flows & Event-Driven Triggers",
        objective: "Build automated cloud workflows triggered by data threshold exceptions in reporting marts to dispatch executive action cards."
      },
      {
        dayNumber: 50,
        title: "Day 50: Power Apps Fundamentals for Analytics Data Entry & Override Portals",
        objective: "Build lightweight writeback canvas applications allowing operations managers to input manual forecast overrides directly into the data store."
      },
      {
        dayNumber: 51,
        title: "Day 51: BI Anomaly Detection Webhooks & Real-Time Alert Escalations",
        objective: "Configure data-driven alert rules on Power BI service dashboards triggering immediate incident notifications when metrics breach tolerance."
      },
      {
        dayNumber: 52,
        title: "Day 52: n8n Workflow Orchestration & REST API Middleware Integration",
        objective: "Connect disparate analytical APIs using open-source n8n workflow nodes, transforming payloads and routing alerts without custom servers."
      },
      {
        dayNumber: 53,
        title: "Day 53: Incident Remediation Automation & Automated SLA Ticketing",
        objective: "Automate Jira and ServiceNow ticket creation when ETL pipeline validation flags data quality corruption."
      },
      {
        dayNumber: 54,
        title: "Day 54: Enterprise Automated KPI Monitoring & Incident Action Engine Capstone",
        objective: "Deploy a complete closed-loop alerting system detecting metric drops, dispatching notifications, and logging root-cause audit records."
      }
    ]
  },
  {
    order: 9,
    title: "Module 9: AI for Analytics",
    weeks: "Week 10",
    description: "LLM Foundations, AI-assisted SQL/Python, AI Query Agents, RAG Basics, Structured JSON, Evaluation & Latency.",
    icon: "sparkles",
    capstoneTheme: "AI Natural Language Query & Analytics Copilot",
    capstoneBrief: "Build an LLM-assisted tool allowing non-technical managers to query the warehouse in natural English with verified SQL.",
    days: [
      {
        dayNumber: 55,
        title: "Day 55: LLM Foundations, System Prompts & Structured JSON Outputs",
        objective: "Master prompt engineering, schema injection, temperature control, and enforcing strict JSON Schema validation for AI tools."
      },
      {
        dayNumber: 56,
        title: "Day 56: Text-to-SQL Architecture, Schema Pruning & Few-Shot In-Context Learning",
        objective: "Build an automated natural language to SQL translator using dynamic schema pruning and few-shot golden query example pairs."
      },
      {
        dayNumber: 57,
        title: "Day 57: AST Verification, Safe Read-Only SQL Sandboxing & Guardrails",
        objective: "Parse generated SQL with Abstract Syntax Trees (AST) to strictly block destructive statements (DROP, DELETE, UPDATE) before execution."
      },
      {
        dayNumber: 58,
        title: "Day 58: Retrieval-Augmented Generation (RAG) over Enterprise Business Glossaries",
        objective: "Embed enterprise metric definitions into vector stores to ensure AI copilots answer metric questions using official approved business formulas."
      },
      {
        dayNumber: 59,
        title: "Day 59: Autonomous Analytics Agents: Dynamic Query Planning & Auto-Chart Selection",
        objective: "Engineer tool-calling agents that decompose complex business questions into sub-queries, execute data pulls, and select the optimal visualization."
      },
      {
        dayNumber: 60,
        title: "Day 60: Enterprise AI Natural Language Analytics Copilot Capstone",
        objective: "Deploy a production-ready conversational copilot allowing non-technical stakeholders to ask questions and receive verified, safe SQL and charts."
      }
    ]
  },
  {
    order: 10,
    title: "Module 10: Cloud & Modern Data Platforms",
    weeks: "Week 11",
    description: "Cloud Architecture, Azure, Fabric, Synapse, Databricks, Snowflake, Medallion Lakehouse vs Enterprise Warehouse.",
    icon: "network",
    capstoneTheme: "Modern Cloud Lakehouse Migration & Architecture Plan",
    capstoneBrief: "Architect a cost-effective Snowflake/Fabric cloud lakehouse architecture separating storage and compute.",
    days: [
      {
        dayNumber: 61,
        title: "Day 61: Cloud Lakehouse vs Cloud Warehouse: Storage vs Compute Decoupling",
        objective: "Understand the economics of modern cloud architectures separating object storage costs from on-demand compute cluster scaling."
      },
      {
        dayNumber: 62,
        title: "Day 62: Snowflake Virtual Warehouses, Auto-Scaling & Micro-Partitioning",
        objective: "Master Snowflake sizing, multi-cluster concurrency scaling, zero-copy cloning, time travel, and micro-partition clustering keys."
      },
      {
        dayNumber: 63,
        title: "Day 63: Microsoft Fabric & Synapse: OneLake & DirectLake Analytics",
        objective: "Navigate the Microsoft Fabric unified SaaS data lakehouse, Delta Parquet storage, and high-performance DirectLake Power BI mode."
      },
      {
        dayNumber: 64,
        title: "Day 64: Databricks & Delta Lake: ACID Transactions & Time Travel on Object Storage",
        objective: "Explore Delta Lake ACID transaction logs, schema enforcement, compaction (OPTIMIZE/Z-ORDER), and time-travel query syntax."
      },
      {
        dayNumber: 65,
        title: "Day 65: Medallion Architecture: Raw Bronze ➔ Cleansed Silver ➔ Curated Gold Marts",
        objective: "Design enterprise data pipelines flowing through raw append-only Bronze, deduplicated/cleansed Silver, and aggregate business Gold marts."
      },
      {
        dayNumber: 66,
        title: "Day 66: Modern Cloud Lakehouse Architecture & Cost Optimization Capstone",
        objective: "Architect a cost-optimized cloud lakehouse migration blueprint outlining cluster sizing, auto-suspend policies, and storage tiers."
      }
    ]
  },
  {
    order: 11,
    title: "Module 11: Data Governance, Quality & Security",
    weeks: "Week 12",
    description: "Data Quality Frameworks, Data Lineage, Row-Level Security (RLS), PII Masking, DPDP Act 2023, GDPR, Responsible AI.",
    icon: "shield-check",
    capstoneTheme: "Enterprise Data Governance & Compliance Audit Matrix",
    capstoneBrief: "Audit enterprise pipelines for PII compliance, dynamic masking, and India DPDP 2023 regulatory adherence.",
    days: [
      {
        dayNumber: 67,
        title: "Day 67: Data Quality Frameworks: Completeness, Accuracy, Validity & Timeliness",
        objective: "Implement enterprise data quality scorecards measuring pipeline SLAs across the 6 core DAMA data quality dimensions."
      },
      {
        dayNumber: 68,
        title: "Day 68: Enterprise Data Lineage, Column-Level Provenance & Data Cataloging",
        objective: "Map upstream source-to-dashboard data lineage to conduct impact analysis before making breaking schema changes."
      },
      {
        dayNumber: 69,
        title: "Day 69: Personally Identifiable Information (PII) Detection, Tokenization & Hashing",
        objective: "Identify PII attributes (Aadhaar, PAN, Phone, Email) in staging tables and apply SHA-256 cryptographic one-way hashing."
      },
      {
        dayNumber: 70,
        title: "Day 70: Dynamic Data Masking & RBAC Access Control Policies",
        objective: "Configure role-based access control (RBAC) masks displaying partial customer identities (e.g. XXXX-XXXX-1234) for non-privileged analysts."
      },
      {
        dayNumber: 71,
        title: "Day 71: India DPDP Act 2023 & GDPR Regulatory Compliance for Analytics",
        objective: "Comply with India's Digital Personal Data Protection Act 2023: user consent records, purpose limitation, and Right to be Forgotten data purges."
      },
      {
        dayNumber: 72,
        title: "Day 72: Enterprise Data Governance & Regulatory Compliance Audit Capstone",
        objective: "Execute a mock regulatory compliance audit identifying unmasked PII, undocumented metric definitions, and orphaned access permissions."
      }
    ]
  },
  {
    order: 12,
    title: "Module 12: Business Analysis & Stakeholder Engineering",
    weeks: "Week 13",
    description: "Stakeholder Elicitation, BRD & FRD Authoring, BPMN Process Swimlanes, User Stories, Gherkin BDD, Agile Scrum & Jira.",
    icon: "file-text",
    capstoneTheme: "Complete Enterprise BRD/FRD Deliverable Pack",
    capstoneBrief: "Author an exhaustive Business & Functional Requirements Document with Gherkin acceptance criteria and Jira sprints.",
    days: [
      {
        dayNumber: 73,
        title: "Day 73: Stakeholder Discovery Interviews, Gap Analysis & RACI Matrices",
        objective: "Lead structured business discovery workshops with department heads, identify hidden requirements, and define governance RACI matrices."
      },
      {
        dayNumber: 74,
        title: "Day 74: Business Requirements Document (BRD) & Functional Specification (FRD) Authoring",
        objective: "Author comprehensive enterprise BRDs with executive summaries, scope boundaries, current vs future state architectures, and data requirements."
      },
      {
        dayNumber: 75,
        title: "Day 75: BPMN 2.0 Business Process Mapping & Operational Swimlanes",
        objective: "Diagram end-to-end operational workflows using standard BPMN 2.0 notation, identifying decision gateways and automated handoffs."
      },
      {
        dayNumber: 76,
        title: "Day 76: Agile Scrum, Jira Backlog Grooming, Epics & User Story Splitting",
        objective: "Translate high-level business goals into Jira Epics, estimate story points using Fibonacci sizing, and groom two-week sprint backlogs."
      },
      {
        dayNumber: 77,
        title: "Day 77: Behavior-Driven Development (BDD) & Gherkin Acceptance Criteria",
        objective: "Write unambiguous user stories with Given-When-Then Gherkin acceptance criteria ensuring alignment between business and engineering."
      },
      {
        dayNumber: 78,
        title: "Day 78: Complete Enterprise BRD/FRD Deliverable Pack Capstone",
        objective: "Publish an exhaustive C-Suite ready requirements package with BPMN diagrams, Gherkin criteria, and sprint release roadmap."
      }
    ]
  },
  {
    order: 13,
    title: "Module 13: Statistics, Experimentation & Commercial Analytics",
    weeks: "Week 14",
    description: "Hypothesis Testing, A/B Testing Sample Sizing, P-Values, Minimum Detectable Effect (MDE), Forecasting, LTV:CAC.",
    icon: "line-chart",
    capstoneTheme: "Rigorous A/B Testing & Statistical Experimentation Suite",
    capstoneBrief: "Design randomized controlled A/B test experiments, calculate sample size, and evaluate SRM test validity.",
    days: [
      {
        dayNumber: 79,
        title: "Day 79: Probability Foundations, Distributions & Central Limit Theorem",
        objective: "Master normal and binomial distributions, standard errors, confidence intervals, and the practical application of the Central Limit Theorem."
      },
      {
        dayNumber: 80,
        title: "Day 80: Hypothesis Testing: Z-Tests, T-Tests, Two-Tailed vs One-Tailed Scenarios",
        objective: "Formulate null vs alternative hypotheses, calculate p-values, and avoid Type I (false positive) and Type II (false negative) statistical errors."
      },
      {
        dayNumber: 81,
        title: "Day 81: A/B Testing Design: Sample Size Power Calculation & Minimum Detectable Effect",
        objective: "Calculate required test duration and sample sizes using statistical power (1-beta = 80%) and significance (alpha = 5%) before launching experiments."
      },
      {
        dayNumber: 82,
        title: "Day 82: Experiment Integrity: P-Hacking, Multiple Testing Corrections & SRM Detection",
        objective: "Detect Sample Ratio Mismatch (SRM) using Chi-Square tests to ensure traffic allocation was not compromised by tracking bugs."
      },
      {
        dayNumber: 83,
        title: "Day 83: Time-Series Forecasting: Moving Averages, Exponential Smoothing & Seasonality",
        objective: "Deconstruct historical revenue time-series into trend, seasonal, and residual components to model forward-looking 12-month forecasts."
      },
      {
        dayNumber: 84,
        title: "Day 84: Rigorous Commercial A/B Testing & Experimentation Capstone",
        objective: "Design and evaluate an end-to-end e-commerce checkout experiment with power analysis, SRM verification, and revenue lift confidence bounds."
      }
    ]
  },
  {
    order: 14,
    title: "Module 14: Big 4 Interview + Case Study + Job Engine",
    weeks: "Week 15",
    description: "Live SQL Coding Rounds, Power BI/DAX Defense, McKinsey Minto Pyramid Cases, ATS Resume, Naukri Strategy & Mocks.",
    icon: "briefcase",
    capstoneTheme: "12 LPA GCC & Big 4 Interview Portfolio Showcase",
    capstoneBrief: "Deliver a boardroom-ready C-Suite deck defending capstone architecture and execute live Socratic interview grilling.",
    days: [
      {
        dayNumber: 85,
        title: "Day 85: McKinsey Minto Pyramid Principle: Answer-First Executive Communication",
        objective: "Structure communication for executive interviews: lead with the core recommendation, supported by grouped MECE arguments and data evidence."
      },
      {
        dayNumber: 86,
        title: "Day 86: Live SQL Coding Rounds Grilling: Speed, Optimization & Defending Logic",
        objective: "Solve complex live SQL interview problems under pressure (consecutive logins, running totals, cohort matrices) while articulating trade-offs."
      },
      {
        dayNumber: 87,
        title: "Day 87: Power BI & Semantic Model Architecture Defense Under Technical Pressure",
        objective: "Defend semantic model design, DAX measure choices, filter propagation, and RLS implementations during technical architect grilling rounds."
      },
      {
        dayNumber: 88,
        title: "Day 88: Consulting Business Case Studies: Profitability, Market Sizing & Pricing",
        objective: "Decompose unstructured profitability drops and commercial market sizing problems using structured consulting frameworks."
      },
      {
        dayNumber: 89,
        title: "Day 89: 12 LPA ATS-Optimized Portfolio, GitHub Projects & Naukri Profile Optimization",
        objective: "Craft an ATS-optimized resume emphasizing business impact metrics (INR/USD saved, latency reduced), high-star GitHub portfolios, and recruiter keywords."
      },
      {
        dayNumber: 90,
        title: "Day 90: Live Socratic Interview Grilling Simulation & Graduation Capstone",
        objective: "Execute a comprehensive mock interview covering live SQL coding, business case resolution, and architectural defense to achieve 12 LPA certification."
      }
    ]
  }
];
