// 12 LPA Industry-Grade Curriculum Definition for AI Masai-Style LMS
// 11 Modules across 28 Weeks with 66 Intensive Production Days
// Dynamic Just-In-Time Assignment & Capstone Generation Architecture

export const TRACK_INFO = {
  slug: "business-analyst-career-track",
  title: "Business Analyst & Analytics Engineering (12 LPA Track)",
  description:
    "Rigorous 28-week, 11-module industry career path mastering Production SQL, Python/Pandas, System APIs, Enterprise Power BI/DAX, Agile BRD/BPMN, AI-Augmented Workflows, GenAI PRDs, DPDP Governance, Change Leadership, Unit Economics, and McKinsey Consulting Frameworks.",
};

export const MODULES_DATA = [
  // =========================================================================
  // MODULE 1: PRODUCTION SQL & ANALYTICAL DATA MODELING (WEEKS 1-3)
  // =========================================================================
  {
    order: 1,
    title: "Module 1: Production SQL & Analytical Data Modeling",
    weeks: "Weeks 1–3",
    description: "Master relational joins, analytical window functions, window framing, recursive CTEs, cohort retention matrices, and query execution plans under enterprise data scale.",
    icon: "database",
    capstoneTheme: "E-Commerce Analytics Mart & Cohort Retention Lakehouse",
    capstoneBrief: "Design an enterprise analytics lakehouse mart for a high-growth D2C marketplace. Build multi-touch attribution models, 30-day cohort retention matrices, and query execution optimization pipelines.",
    days: [
      {
        dayNumber: 1,
        title: "Day 1: Multi-Table Joins, Fan-Out Traps & Financial Aggregation",
        objective: "Master INNER, LEFT, FULL OUTER joins, aggregate mechanics, and prevent fan-out row duplication in financial queries.",
        youtubeQuery: "Ankit Bansal SQL Joins Interview Questions",
        youtubeUrl: "https://www.youtube.com/results?search_query=Ankit+Bansal+SQL+Joins+Interview+Questions",
        videos: [
          { title: "SQL Joins Masterclass: Solving Complex Multi-Table Queries", channel: "Ankit Bansal", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Ankit+Bansal+SQL+Joins+Interview+Questions" },
          { title: "Intermediate SQL Joins and Aggregations", channel: "Alex The Analyst", duration: "18 mins", url: "https://www.youtube.com/results?search_query=Alex+The+Analyst+SQL+Joins" }
        ],
        checklist: [
          "Task 1: Calculate lifetime spend per customer without row multiplication using pre-aggregated CTEs.",
          "Task 2: Identify zero-order dormant accounts using LEFT JOIN with IS NULL check.",
          "Task 3: Compute average order value (AOV) by customer acquisition city."
        ],
        practiceProblem: "At Swiggy, calculate total GMV, completed order count, and average order value per customer city. Ensure cancelled orders do not inflate revenue.",
        practiceStarter: "SELECT c.city, COUNT(o.id) as total_orders, SUM(o.total_amount) as gmv\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.status = 'COMPLETED'\nGROUP BY c.city\nORDER BY gmv DESC;",
        practiceSolution: "SELECT c.city, COUNT(o.id) as total_orders, SUM(o.total_amount) as gmv, AVG(o.total_amount) as aov FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.status = 'COMPLETED' GROUP BY c.city ORDER BY gmv DESC;"
      },
      {
        dayNumber: 2,
        title: "Day 2: Analytical Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD)",
        objective: "Master partitioned calculations, running totals, customer retention intervals, and cumulative metrics without row collapse.",
        youtubeQuery: "Ankit Bansal Window Functions SQL",
        youtubeUrl: "https://www.youtube.com/results?search_query=Ankit+Bansal+Window+Functions+SQL",
        videos: [
          { title: "SQL Window Functions Tutorial | ROW_NUMBER, RANK, DENSE_RANK", channel: "Ankit Bansal", duration: "28 mins", url: "https://www.youtube.com/results?search_query=Ankit+Bansal+Window+Functions+SQL" },
          { title: "LEAD and LAG SQL Window Functions", channel: "Ankit Bansal", duration: "22 mins", url: "https://www.youtube.com/results?search_query=Ankit+Bansal+LEAD+and+LAG+SQL" }
        ],
        checklist: [
          "Task 1: Calculate cumulative running total of revenue per customer using SUM() OVER.",
          "Task 2: Identify Top 2 highest-value orders per customer using DENSE_RANK().",
          "Task 3: Compute days elapsed since previous purchase using LAG(order_date, 1)."
        ],
        practiceProblem: "At Zepto, track dark-store customer order cadence. Compute each customer's consecutive order gap using LAG() and calculate a running revenue total.",
        practiceStarter: "SELECT id, customer_id, order_date, total_amount,\n  SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as running_total,\n  LAG(order_date, 1) OVER (PARTITION BY customer_id ORDER BY order_date) as prev_order_date\nFROM orders;",
        practiceSolution: "SELECT id, customer_id, order_date, total_amount, SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as running_total, LAG(order_date, 1) OVER (PARTITION BY customer_id ORDER BY order_date) as prev_order_date FROM orders;"
      },
      {
        dayNumber: 3,
        title: "Day 3: Common Table Expressions (CTEs) & Modular Business Pipelines",
        objective: "Structure complex analytical pipelines into readable, maintainable Common Table Expressions (WITH clauses) avoiding messy subquery nesting.",
        youtubeQuery: "Alex The Analyst CTEs in SQL",
        youtubeUrl: "https://www.youtube.com/results?search_query=Alex+The+Analyst+CTEs+in+SQL",
        videos: [
          { title: "CTEs (Common Table Expressions) in SQL", channel: "Alex The Analyst", duration: "16 mins", url: "https://www.youtube.com/results?search_query=Alex+The+Analyst+CTEs+in+SQL" },
          { title: "Subqueries vs CTEs: Which is Better and Why?", channel: "Ankit Bansal", duration: "21 mins", url: "https://www.youtube.com/results?search_query=Ankit+Bansal+CTEs+vs+Subqueries" }
        ],
        checklist: [
          "Task 1: Refactor deeply nested subqueries into clean modular WITH blocks.",
          "Task 2: Build a customer summary CTE and join it with product dimension metrics.",
          "Task 3: Calculate percentage contribution of each order to the customer's lifetime spend."
        ],
        practiceProblem: "At Razorpay, build a modular CTE pipeline calculating gross processed volume (GPV) and merchant fee revenue grouped by merchant tier.",
        practiceStarter: "WITH MerchantSpend AS (\n  SELECT customer_id, SUM(total_amount) as total_gpv\n  FROM orders\n  WHERE status = 'COMPLETED'\n  GROUP BY customer_id\n)\nSELECT c.name, c.segment, COALESCE(ms.total_gpv, 0) as total_gpv\nFROM customers c\nLEFT JOIN MerchantSpend ms ON c.id = ms.customer_id;",
        practiceSolution: "WITH MerchantSpend AS (SELECT customer_id, SUM(total_amount) as total_gpv FROM orders WHERE status = 'COMPLETED' GROUP BY customer_id) SELECT c.name, c.segment, COALESCE(ms.total_gpv, 0) as total_gpv FROM customers c LEFT JOIN MerchantSpend ms ON c.id = ms.customer_id;"
      },
      {
        dayNumber: 4,
        title: "Day 4: Conditional Aggregations, Pivot Reports & NULL Coalescing",
        objective: "Design matrix reports using CASE WHEN aggregations, pivot tabular metrics, and guarantee NULL-safety with COALESCE.",
        youtubeQuery: "Ankit Bansal CASE WHEN Aggregations SQL",
        youtubeUrl: "https://www.youtube.com/results?search_query=Ankit+Bansal+CASE+WHEN+Aggregations+SQL",
        videos: [
          { title: "Conditional Aggregations & Pivot Queries in SQL", channel: "Ankit Bansal", duration: "24 mins", url: "https://www.youtube.com/results?search_query=Ankit+Bansal+CASE+WHEN+Aggregations+SQL" }
        ],
        checklist: [
          "Task 1: Pivot monthly order revenue into individual Q1, Q2, Q3, Q4 columns using SUM(CASE WHEN...).",
          "Task 2: Replace NULL values in customer spend with 0.0 using COALESCE().",
          "Task 3: Classify orders into Small (<$50), Medium ($50-$200), and Enterprise (>$200) buckets."
        ],
        practiceProblem: "Pivot order counts by status (COMPLETED, PENDING, CANCELLED) for each customer city into three distinct summary columns.",
        practiceStarter: "SELECT c.city,\n  SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,\n  SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) as pending_orders,\n  SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_orders\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.city;",
        practiceSolution: "SELECT c.city, SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders, SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) as pending_orders, SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_orders FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.city;"
      },
      {
        dayNumber: 5,
        title: "Day 5: 30-Day Cohort Retention & Churn Curve Modeling",
        objective: "Build customer acquisition cohorts by signup date, track 30-60-90 day activity retention, and model churn rates.",
        youtubeQuery: "Cohort Analysis SQL Luke Barousse",
        youtubeUrl: "https://www.youtube.com/results?search_query=Cohort+Analysis+SQL+Luke+Barousse",
        videos: [
          { title: "Cohort Analysis in SQL: Customer Retention Step-by-Step", channel: "Luke Barousse", duration: "26 mins", url: "https://www.youtube.com/results?search_query=Cohort+Analysis+SQL" }
        ],
        checklist: [
          "Task 1: Group customers into signup month cohorts.",
          "Task 2: Calculate repeat purchase retention rate at Month 1, Month 2, and Month 3.",
          "Task 3: Compute customer churn percentages across cohort lifecycles."
        ],
        practiceProblem: "Calculate the total customer count per signup month cohort and their aggregate spend within 30 days of registration.",
        practiceStarter: "SELECT strftime('%Y-%m', c.signup_date) as cohort_month, COUNT(DISTINCT c.id) as cohort_size, SUM(o.total_amount) as initial_spend\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY cohort_month;",
        practiceSolution: "SELECT strftime('%Y-%m', c.signup_date) as cohort_month, COUNT(DISTINCT c.id) as cohort_size, SUM(o.total_amount) as initial_spend FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY cohort_month;"
      },
      {
        dayNumber: 6,
        title: "Day 6: Query Execution Plans, Partition Pruning & Performance Tuning",
        objective: "Inspect execution plans with EXPLAIN QUERY PLAN, eliminate full table scans, design covering indexes, and optimize query latency.",
        youtubeQuery: "SQL Query Optimization Indexing Ankit Bansal",
        youtubeUrl: "https://www.youtube.com/results?search_query=SQL+Query+Optimization+Indexing+Ankit+Bansal",
        videos: [
          { title: "SQL Query Performance Tuning & EXPLAIN Analysis", channel: "Ankit Bansal", duration: "32 mins", url: "https://www.youtube.com/results?search_query=SQL+Query+Performance+Tuning" }
        ],
        checklist: [
          "Task 1: Execute EXPLAIN QUERY PLAN to identify full table scans vs index lookups.",
          "Task 2: Refactor non-SARGable WHERE predicates (e.g. YEAR(date) = 2024) to indexable range scans.",
          "Task 3: Benchmark execution times before and after creating composite indexes."
        ],
        practiceProblem: "Optimize a slow report filtering orders by status and date range. Write an optimized query using indexable predicates.",
        practiceStarter: "EXPLAIN QUERY PLAN\nSELECT id, customer_id, order_date, total_amount\nFROM orders\nWHERE status = 'COMPLETED' AND order_date >= '2024-01-01';",
        practiceSolution: "EXPLAIN QUERY PLAN SELECT id, customer_id, order_date, total_amount FROM orders WHERE status = 'COMPLETED' AND order_date >= '2024-01-01';"
      }
    ]
  },

  // =========================================================================
  // MODULE 2: PYTHON FOR DATA ANALYSIS & PIPELINE AUTOMATION (WEEKS 4-6)
  // =========================================================================
  {
    order: 2,
    title: "Module 2: Python for Data Analysis & Pipeline Automation",
    weeks: "Weeks 4–6",
    description: "Automate repetitive reporting and data wrangling using Python, Pandas, NumPy, and CSV/Parquet data pipelines.",
    icon: "code",
    capstoneTheme: "Automated Multi-Source Ingestion & Reconciliation Pipeline",
    capstoneBrief: "Build an automated Python analytical ingestion pipeline that ingests daily transactional CSV dumps, validates schema integrity, cleans anomalies, computes executive KPIs, and exports clean Parquet marts.",
    days: [
      {
        dayNumber: 7,
        title: "Day 7: Python Data Structures & Vectorized NumPy Foundations",
        objective: "Master lists, dictionaries, list comprehensions, and vectorized NumPy array operations for high-speed data calculations.",
        youtubeQuery: "Keith Galli Python for Data Science Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Keith+Galli+Python+for+Data+Science+Tutorial",
        videos: [
          { title: "Python for Data Science - Full Course for Beginners", channel: "Keith Galli", duration: "45 mins", url: "https://www.youtube.com/results?search_query=Keith+Galli+Python" }
        ],
        checklist: ["Task 1: Transform raw transaction lists into structured dictionary records.", "Task 2: Perform vectorized price arithmetic with NumPy arrays.", "Task 3: Filter outlier prices using boolean masking."],
        practiceProblem: "Write Python logic to filter a list of order amounts, remove negative or zero refund transactions, and compute the average ticket size.",
        practiceStarter: "orders = [120.5, -45.0, 310.0, 0.0, 89.9, 450.0]\nvalid_orders = [o for o in orders if o > 0]\navg_spend = sum(valid_orders) / len(valid_orders)\nprint(f'Average Ticket: {avg_spend:.2f}')",
        practiceSolution: "orders = [120.5, -45.0, 310.0, 0.0, 89.9, 450.0]\nvalid_orders = [o for o in orders if o > 0]\navg_spend = sum(valid_orders) / len(valid_orders)\nprint(f'Average Ticket: {avg_spend:.2f}')"
      },
      {
        dayNumber: 8,
        title: "Day 8: Pandas DataFrames: Ingestion, Filtering, Slicing & Types",
        objective: "Load CSV/JSON data into Pandas DataFrames, inspect dtypes, cast memory-efficient types, and slice multi-column subsets.",
        youtubeQuery: "Corey Schafer Pandas Tutorial DataFrames",
        youtubeUrl: "https://www.youtube.com/results?search_query=Corey+Schafer+Pandas+Tutorial+DataFrames",
        videos: [
          { title: "Pandas DataFrame Tutorial: Loading & Inspecting Data", channel: "Corey Schafer", duration: "30 mins", url: "https://www.youtube.com/results?search_query=Corey+Schafer+Pandas" }
        ],
        checklist: ["Task 1: Load CSV files and set appropriate index columns.", "Task 2: Convert date strings into datetime64 objects.", "Task 3: Filter rows with compound boolean conditions."],
        practiceProblem: "Inspect a DataFrame of customer orders, convert order_date to datetime, and filter for high-value orders above $200.",
        practiceStarter: "import pandas as pd\ndf = pd.DataFrame({'id': [1,2,3], 'amount': [150, 250, 320]})\nhigh_val = df[df['amount'] > 200]\nprint(high_val)",
        practiceSolution: "import pandas as pd\ndf = pd.DataFrame({'id': [1,2,3], 'amount': [150, 250, 320]})\nhigh_val = df[df['amount'] > 200]\nprint(high_val)"
      },
      {
        dayNumber: 9,
        title: "Day 9: Data Cleaning, Missing Value Imputation & Outlier Detection",
        objective: "Handle NaNs with fillna/dropna, standardize dirty text strings, detect z-score outliers, and ensure clean analytical records.",
        youtubeQuery: "Alex The Analyst Data Cleaning in Python Pandas",
        youtubeUrl: "https://www.youtube.com/results?search_query=Alex+The+Analyst+Data+Cleaning+in+Python+Pandas",
        videos: [
          { title: "Data Cleaning in Python: Real World Guide", channel: "Alex The Analyst", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Alex+The+Analyst+Data+Cleaning" }
        ],
        checklist: ["Task 1: Audit missing values across columns with isna().sum().", "Task 2: Impute missing numerical fields with median.", "Task 3: Strip whitespace and lowercase customer email strings."],
        practiceProblem: "Clean customer records containing missing cities and unformatted emails using Pandas string methods.",
        practiceStarter: "import pandas as pd\ndf = pd.DataFrame({'name': ['Alice ', 'Bob'], 'email': ['ALICE@GMAIL.COM ', None]})\ndf['email'] = df['email'].fillna('unknown').str.strip().str.lower()\nprint(df)",
        practiceSolution: "import pandas as pd\ndf = pd.DataFrame({'name': ['Alice ', 'Bob'], 'email': ['ALICE@GMAIL.COM ', None]})\ndf['email'] = df['email'].fillna('unknown').str.strip().str.lower()\nprint(df)"
      },
      {
        dayNumber: 10,
        title: "Day 10: Advanced GroupBy, Pivot Tables, Aggregations & Reshaping",
        objective: "Master groupby agg dictionaries, pivot_table multi-indexes, melt unpivoting, and window transforms in Pandas.",
        youtubeQuery: "Corey Schafer GroupBy Pandas Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Corey+Schafer+GroupBy+Pandas+Tutorial",
        videos: [
          { title: "Pandas GroupBy & Aggregation Mastery", channel: "Corey Schafer", duration: "28 mins", url: "https://www.youtube.com/results?search_query=Corey+Schafer+GroupBy" }
        ],
        checklist: ["Task 1: Compute sum, mean, and count per category in a single groupby().agg() call.", "Task 2: Build a monthly pivot table of revenue across product lines.", "Task 3: Reset multi-level index to a flat tabular mart."],
        practiceProblem: "Group transaction records by category and city, calculating total revenue and average order size.",
        practiceStarter: "import pandas as pd\ndf = pd.DataFrame({'cat': ['Electronics', 'Electronics', 'Grocery'], 'rev': [500, 300, 50]})\nsummary = df.groupby('cat')['rev'].agg(['sum', 'mean']).reset_index()\nprint(summary)",
        practiceSolution: "import pandas as pd\ndf = pd.DataFrame({'cat': ['Electronics', 'Electronics', 'Grocery'], 'rev': [500, 300, 50]})\nsummary = df.groupby('cat')['rev'].agg(['sum', 'mean']).reset_index()\nprint(summary)"
      },
      {
        dayNumber: 11,
        title: "Day 11: Multi-Source Joins, Merging & Reconciliation Automation",
        objective: "Perform merge inner, left, and indicator joins between transaction logs and customer master tables, identifying discrepancies.",
        youtubeQuery: "Pandas Merge Join and Concatenate Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Pandas+Merge+Join+and+Concatenate+Tutorial",
        videos: [
          { title: "Merging and Joining DataFrames with Pandas", channel: "Keith Galli", duration: "22 mins", url: "https://www.youtube.com/results?search_query=Keith+Galli+Pandas+Merge" }
        ],
        checklist: ["Task 1: Merge transactions with customer dimensions on customer_id.", "Task 2: Use indicator=True to find unmapped transaction records.", "Task 3: Reconcile external payment gateway totals against internal DB totals."],
        practiceProblem: "Merge orders DataFrame with customers DataFrame, ensuring no orphaned transaction IDs exist.",
        practiceStarter: "import pandas as pd\no = pd.DataFrame({'order_id': [1,2], 'cust_id': [10, 20], 'amt': [100, 200]})\nc = pd.DataFrame({'cust_id': [10], 'name': ['Acme']})\nm = pd.merge(o, c, on='cust_id', how='left')\nprint(m)",
        practiceSolution: "import pandas as pd\no = pd.DataFrame({'order_id': [1,2], 'cust_id': [10, 20], 'amt': [100, 200]})\nc = pd.DataFrame({'cust_id': [10], 'name': ['Acme']})\nm = pd.merge(o, c, on='cust_id', how='left')\nprint(m)"
      },
      {
        dayNumber: 12,
        title: "Day 12: End-to-End Automated Financial ETL & Reporting Pipeline",
        objective: "Author an automated Python script that ingests raw transaction files, performs data cleaning, calculates KPIs, and exports clean Parquet reports.",
        youtubeQuery: "Automate Excel with Python Pandas Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Automate+Excel+with+Python+Pandas+Tutorial",
        videos: [
          { title: "Building an Automated ETL Pipeline in Python", channel: "Luke Barousse", duration: "35 mins", url: "https://www.youtube.com/results?search_query=Automated+ETL+Pipeline+Python" }
        ],
        checklist: ["Task 1: Construct modular Python functions for Extract, Transform, and Load.", "Task 2: Write summary statistics to an output file.", "Task 3: Add logging and try/except error recovery blocks."],
        practiceProblem: "Build a complete ETL function that reads transactional inputs, filters valid records, and calculates GMV.",
        practiceStarter: "def run_etl(data):\n    clean = [x for x in data if x > 0]\n    return {'gmv': sum(clean), 'count': len(clean)}\nprint(run_etl([100, 250, -20, 400]))",
        practiceSolution: "def run_etl(data):\n    clean = [x for x in data if x > 0]\n    return {'gmv': sum(clean), 'count': len(clean)}\nprint(run_etl([100, 250, -20, 400]))"
      }
    ]
  },

  // =========================================================================
  // MODULE 3: SYSTEM ARCHITECTURE, APIS & INTEGRATION LITERACY (WEEKS 7-8)
  // =========================================================================
  {
    order: 3,
    title: "Module 3: System Architecture, APIs & Integration Literacy",
    weeks: "Weeks 7–8",
    description: "Understand client-server architecture, REST APIs, JSON payload data contracts, Postman testing, and ER diagrams to translate business goals into developer specifications.",
    icon: "network",
    capstoneTheme: "Enterprise API Gateway Specification & Microservices ERD",
    capstoneBrief: "Design the technical systems integration architecture for an enterprise FinTech payment gateway. Specify REST API contracts, JSON request/response schemas, error handling codes, and a 3NF relational ER diagram.",
    days: [
      {
        dayNumber: 13,
        title: "Day 13: Client-Server Architecture, Microservices & Data Flow Design",
        objective: "Understand 3-tier architecture (Client, App Server, Database), synchronous vs asynchronous communication, and microservices data flow.",
        youtubeQuery: "Client Server Architecture Explained Hussein Nasser",
        youtubeUrl: "https://www.youtube.com/results?search_query=Client+Server+Architecture+Explained+Hussein+Nasser",
        videos: [
          { title: "Client-Server Architecture Fundamentals", channel: "Hussein Nasser", duration: "24 mins", url: "https://www.youtube.com/results?search_query=Client+Server+Architecture" }
        ],
        checklist: ["Task 1: Trace an end-to-end user checkout request across client, API gateway, and database.", "Task 2: Differentiate synchronous HTTP calls from async message queues (Kafka/RabbitMQ).", "Task 3: Document stateful vs stateless server design."],
        practiceProblem: "Draft the sequence diagram flow for a payment transaction between Mobile Client, Backend API, Payment Gateway, and Database.",
        practiceStarter: "// Sequence steps:\n1. Client POST /orders\n2. Server verifies inventory\n3. Server calls Payment Gateway\n4. DB records transaction status",
        practiceSolution: "// Verified 4-step sequence flow: Client -> Server -> Gateway -> DB with ACK."
      },
      {
        dayNumber: 14,
        title: "Day 14: RESTful API Principles, HTTP Methods, Headers & Status Codes",
        objective: "Master REST conventions, resource URI naming, HTTP verbs (GET, POST, PUT, PATCH, DELETE), headers, and status code categories (2xx, 4xx, 5xx).",
        youtubeQuery: "REST API Concepts and Examples Postman Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=REST+API+Concepts+and+Examples+Postman+Tutorial",
        videos: [
          { title: "REST APIs Explained for Beginners", channel: "Fireship", duration: "12 mins", url: "https://www.youtube.com/results?search_query=REST+APIs+Explained" }
        ],
        checklist: ["Task 1: Map CRUD operations to correct HTTP verbs.", "Task 2: Define appropriate status codes for Success (200), Created (201), Bad Request (400), Unauthorized (401), and Not Found (404).", "Task 3: Specify authorization headers with Bearer tokens."],
        practiceProblem: "Design REST endpoint paths and HTTP verbs for managing customer address books.",
        practiceStarter: "GET /api/v1/customers/{id}/addresses\nPOST /api/v1/customers/{id}/addresses\nDELETE /api/v1/customers/{id}/addresses/{address_id}",
        practiceSolution: "GET /api/v1/customers/{id}/addresses\nPOST /api/v1/customers/{id}/addresses\nDELETE /api/v1/customers/{id}/addresses/{address_id}"
      },
      {
        dayNumber: 15,
        title: "Day 15: JSON Schema Validation & API Payload Data Contracts",
        objective: "Define structured JSON request/response contracts, data types, required fields, and schema validation rules for developer handoffs.",
        youtubeQuery: "JSON Schema Validation Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=JSON+Schema+Validation+Tutorial",
        videos: [
          { title: "Understanding JSON and JSON Schemas", channel: "Traversy Media", duration: "18 mins", url: "https://www.youtube.com/results?search_query=JSON+Schema+Tutorial" }
        ],
        checklist: ["Task 1: Define a JSON payload structure for an order creation event.", "Task 2: Specify data types, constraints (min, max), and required field lists.", "Task 3: Document standard error response envelopes with error code, message, and timestamp."],
        practiceProblem: "Create a JSON schema contract for an employee profile update endpoint.",
        practiceStarter: "{\n  \"name\": \"Jane Doe\",\n  \"department\": \"Analytics\",\n  \"salary\": 120000\n}",
        practiceSolution: "{\n  \"name\": \"Jane Doe\",\n  \"department\": \"Analytics\",\n  \"salary\": 120000\n}"
      },
      {
        dayNumber: 16,
        title: "Day 16: Postman, cURL & API Integration Testing Workflows",
        objective: "Execute API calls using Postman and cURL, inspect headers, test response payloads, and validate authentication flows.",
        youtubeQuery: "Postman Beginner's Course - API Testing Valentin Despa",
        youtubeUrl: "https://www.youtube.com/results?search_query=Postman+Beginners+Course+API+Testing+Valentin+Despa",
        videos: [
          { title: "Postman API Testing Complete Guide", channel: "Valentin Despa", duration: "30 mins", url: "https://www.youtube.com/results?search_query=Postman+API+Testing" }
        ],
        checklist: ["Task 1: Construct a cURL command to send a POST request with JSON body.", "Task 2: Inspect response latency, headers, and payload attributes in Postman.", "Task 3: Write basic Postman test assertions checking pm.response.to.have.status(200)."],
        practiceProblem: "Write a cURL command to authenticate against a mock auth endpoint and retrieve a bearer token.",
        practiceStarter: "curl -X POST https://api.example.com/v1/auth/token \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"client_id\":\"app_123\",\"secret\":\"sec_456\"}'",
        practiceSolution: "curl -X POST https://api.example.com/v1/auth/token \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"client_id\":\"app_123\",\"secret\":\"sec_456\"}'"
      },
      {
        dayNumber: 17,
        title: "Day 17: Relational Database Modeling & Entity Relationship Diagrams (ERDs)",
        objective: "Design 3NF relational schemas, primary/foreign key cardinalities (1:1, 1:N, M:N), and render Mermaid ER diagrams.",
        youtubeQuery: "Database Design Course Learn Database Modeling freeCodeCamp",
        youtubeUrl: "https://www.youtube.com/results?search_query=Database+Design+Course+Learn+Database+Modeling+freeCodeCamp",
        videos: [
          { title: "Database Modeling & Entity Relationship Diagrams", channel: "freeCodeCamp", duration: "40 mins", url: "https://www.youtube.com/results?search_query=Database+Design+Course" }
        ],
        checklist: ["Task 1: Identify entities, attributes, and relationships for an e-commerce platform.", "Task 2: Resolve M:N relationships using an associative junction entity.", "Task 3: Render an ERD using Mermaid syntax with proper PK/FK indicators."],
        practiceProblem: "Define the entity relationship between Customers, Orders, and OrderItems in Mermaid ERD syntax.",
        practiceStarter: "erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ ORDER_ITEM : contains",
        practiceSolution: "erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ ORDER_ITEM : contains"
      },
      {
        dayNumber: 18,
        title: "Day 18: System Integration Architecture, Webhooks & Event-Driven Pipelines",
        objective: "Understand webhooks, event subscriptions, payload delivery retries, idempotency keys, and asynchronous message brokers.",
        youtubeQuery: "What are Webhooks and How They Work Hussein Nasser",
        youtubeUrl: "https://www.youtube.com/results?search_query=What+are+Webhooks+and+How+They+Work+Hussein+Nasser",
        videos: [
          { title: "Webhooks vs APIs: Event Driven Architecture", channel: "Hussein Nasser", duration: "20 mins", url: "https://www.youtube.com/results?search_query=Webhooks+Explained" }
        ],
        checklist: ["Task 1: Design a webhook notification payload for payment status changes.", "Task 2: Implement idempotency key tracking to prevent double charges on retries.", "Task 3: Document dead-letter queue (DLQ) retry policies."],
        practiceProblem: "Specify an idempotent webhook event contract sent by Razorpay when a customer payment succeeds.",
        practiceStarter: "{\n  \"event\": \"payment.captured\",\n  \"event_id\": \"evt_789\",\n  \"idempotency_key\": \"order_ref_991\",\n  \"payload\": { \"amount\": 1500, \"status\": \"success\" }\n}",
        practiceSolution: "{\n  \"event\": \"payment.captured\",\n  \"event_id\": \"evt_789\",\n  \"idempotency_key\": \"order_ref_991\",\n  \"payload\": { \"amount\": 1500, \"status\": \"success\" }\n}"
      }
    ]
  },

  // =========================================================================
  // MODULE 4: ENTERPRISE BI, STAR SCHEMAS & ADVANCED DAX (WEEKS 9-11)
  // =========================================================================
  {
    order: 4,
    title: "Module 4: Enterprise BI, Star Schemas & Advanced DAX",
    weeks: "Weeks 9–11",
    description: "Design enterprise Power BI and Tableau dashboards, star schema dimensional models, advanced DAX filter contexts, and natural-language AI-copilot features.",
    icon: "line-chart",
    capstoneTheme: "C-Suite Operational KPI Dashboard with Power BI / NovyPro",
    capstoneBrief: "Build an executive-ready enterprise Power BI dashboard with star schema data modeling, dynamic DAX measures, time-intelligence YoY growth rates, drill-through pages, and publish to a live NovyPro/portfolio URL.",
    days: [
      {
        dayNumber: 19,
        title: "Day 19: Star Schema Dimensional Modeling & Fact-Dimension Architecture",
        objective: "Design Kimball-method star schemas, centralizing transactional metrics in Fact tables linked to 1:N Conformed Dimensions.",
        youtubeQuery: "Star Schema vs Snowflake Schema Guy in a Cube",
        youtubeUrl: "https://www.youtube.com/results?search_query=Star+Schema+vs+Snowflake+Schema+Guy+in+a+Cube",
        videos: [
          { title: "Star Schema Dimensional Modeling in Power BI", channel: "Guy in a Cube", duration: "20 mins", url: "https://www.youtube.com/results?search_query=Star+Schema+Guy+in+a+Cube" }
        ],
        checklist: ["Task 1: Separate transactional numeric measurements into Fact tables.", "Task 2: Build conformed Customer, Date, Product, and Geography dimension tables.", "Task 3: Eliminate bidirectional relationship cross-filters to ensure deterministic query performance."],
        practiceProblem: "Structure an e-commerce data model into FactSales, DimCustomer, DimProduct, and DimDate with 1:* single-direction relationships.",
        practiceStarter: "-- Kimball Star Schema Schema Map:\nFactSales (order_id, date_key, customer_key, product_key, quantity, amount)\nDimCustomer (customer_key, name, segment, city)\nDimProduct (product_key, product_name, category, price)",
        practiceSolution: "-- Kimball Star Schema Schema Map Verified: FactSales linked to DimCustomer, DimProduct, DimDate via 1:* single-direction filters."
      },
      {
        dayNumber: 20,
        title: "Day 20: DAX Fundamentals: Calculated Columns vs Measures & Evaluation Context",
        objective: "Understand row context vs filter context, write basic aggregation measures (SUM, COUNTROWS, DIVIDE), and avoid calculated column memory bloat.",
        youtubeQuery: "Row Context vs Filter Context in DAX SQLBI",
        youtubeUrl: "https://www.youtube.com/results?search_query=Row+Context+vs+Filter+Context+in+DAX+SQLBI",
        videos: [
          { title: "Row Context and Filter Context in DAX", channel: "SQLBI", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Row+Context+Filter+Context+SQLBI" }
        ],
        checklist: ["Task 1: Differentiate in-memory storage of calculated columns from dynamic CPU compute of measures.", "Task 2: Write clean DAX measures using DIVIDE() with alternate fallback zero.", "Task 3: Inspect active filter context applied by visual rows, columns, and slicers."],
        practiceProblem: "Write DAX measures for Total Revenue, Total Cost, and Gross Profit Margin percentage.",
        practiceStarter: "Total Revenue = SUM(FactSales[amount])\nTotal Cost = SUM(FactSales[cost])\nProfit Margin = DIVIDE([Total Revenue] - [Total Cost], [Total Revenue], 0)",
        practiceSolution: "Total Revenue = SUM(FactSales[amount])\nTotal Cost = SUM(FactSales[cost])\nProfit Margin = DIVIDE([Total Revenue] - [Total Cost], [Total Revenue], 0)"
      },
      {
        dayNumber: 21,
        title: "Day 21: The CALCULATE Function & Advanced Filter Context Manipulation",
        objective: "Master CALCULATE, filter modification with ALL, ALLEXCEPT, KEEPFILTERS, and context transition with row-by-row iteration.",
        youtubeQuery: "The CALCULATE Function in DAX Explained SQLBI",
        youtubeUrl: "https://www.youtube.com/results?search_query=The+CALCULATE+Function+in+DAX+Explained+SQLBI",
        videos: [
          { title: "Understanding CALCULATE in DAX", channel: "SQLBI", duration: "30 mins", url: "https://www.youtube.com/results?search_query=Understanding+CALCULATE+SQLBI" }
        ],
        checklist: ["Task 1: Use CALCULATE to override existing filter context on product categories.", "Task 2: Compute percentage share of total revenue using ALL(DimProduct).", "Task 3: Apply multiple filter parameters inside CALCULATE boolean clauses."],
        practiceProblem: "Write a DAX measure computing the percentage contribution of selected products to company-wide total revenue.",
        practiceStarter: "Revenue Share % = \nVAR CurrentRev = [Total Revenue]\nVAR AllRev = CALCULATE([Total Revenue], ALL(DimProduct))\nRETURN DIVIDE(CurrentRev, AllRev, 0)",
        practiceSolution: "Revenue Share % = \nVAR CurrentRev = [Total Revenue]\nVAR AllRev = CALCULATE([Total Revenue], ALL(DimProduct))\nRETURN DIVIDE(CurrentRev, AllRev, 0)"
      },
      {
        dayNumber: 22,
        title: "Day 22: Time Intelligence Modeling (YTD, QTD, MoM, YoY Growth Metrics)",
        objective: "Design contiguous DimDate tables and implement DAX time intelligence functions (TOTALYTD, SAMEPERIODLASTYEAR, DATEADD).",
        youtubeQuery: "Power BI Time Intelligence Functions DAX Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Power+BI+Time+Intelligence+Functions+DAX+Tutorial",
        videos: [
          { title: "Time Intelligence in Power BI Masterclass", channel: "Curibal", duration: "24 mins", url: "https://www.youtube.com/results?search_query=Time+Intelligence+Power+BI" }
        ],
        checklist: ["Task 1: Generate a contiguous Date Dimension using CALENDARAUTO().", "Task 2: Compute Year-to-Date (YTD) cumulative revenue with TOTALYTD.", "Task 3: Compute Year-over-Year (YoY) percentage revenue growth comparing to SAMEPERIODLASTYEAR."],
        practiceProblem: "Write DAX measures for Revenue YTD and Year-over-Year (YoY) Growth %.",
        practiceStarter: "Revenue YTD = TOTALYTD([Total Revenue], DimDate[Date])\nRevenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(DimDate[Date]))\nYoY Growth % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY], 0)",
        practiceSolution: "Revenue YTD = TOTALYTD([Total Revenue], DimDate[Date])\nRevenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(DimDate[Date]))\nYoY Growth % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY], 0)"
      },
      {
        dayNumber: 23,
        title: "Day 23: Semi-Additive Measures & Parent-Child Hierarchy Aggregations",
        objective: "Handle inventory balances and opening/closing cash balances using semi-additive DAX (LASTDATE, CLOSINGBALANCEMONTH).",
        youtubeQuery: "Semi Additive Measures in DAX SQLBI",
        youtubeUrl: "https://www.youtube.com/results?search_query=Semi+Additive+Measures+in+DAX+SQLBI",
        videos: [
          { title: "Handling Semi-Additive Measures in Power BI", channel: "SQLBI", duration: "22 mins", url: "https://www.youtube.com/results?search_query=Semi+Additive+Measures+DAX" }
        ],
        checklist: ["Task 1: Differentiate additive metrics (revenue) from non-additive metrics (closing stock).", "Task 2: Use LASTDATE to query end-of-period inventory without summing across dates.", "Task 3: Build parent-child organizational hierarchy reporting with PATH and PATHITEM."],
        practiceProblem: "Write a DAX measure computing the closing inventory balance for the selected period.",
        practiceStarter: "Closing Inventory = \nCALCULATE(\n  SUM(FactInventory[units_on_hand]),\n  LASTDATE(DimDate[Date])\n)",
        practiceSolution: "Closing Inventory = \nCALCULATE(\n  SUM(FactInventory[units_on_hand]),\n  LASTDATE(DimDate[Date])\n)"
      },
      {
        dayNumber: 24,
        title: "Day 24: Executive Storyboarding, Drill-Throughs & Power BI Copilot",
        objective: "Structure C-suite reports using the 5-Second Rule, drill-through detail pages, bookmark navigation, and natural language Copilot queries.",
        youtubeQuery: "Power BI Dashboard Design Best Practices Guy in a Cube",
        youtubeUrl: "https://www.youtube.com/results?search_query=Power+BI+Dashboard+Design+Best+Practices+Guy+in+a+Cube",
        videos: [
          { title: "Executive Dashboard Design Principles", channel: "Guy in a Cube", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Power+BI+Dashboard+Design" }
        ],
        checklist: ["Task 1: Organize visual hierarchy with top-level KPI cards, trend sparklines, and breakdown tables.", "Task 2: Configure drill-through filter pages for deep root-cause inspection.", "Task 3: Publish report to web and test dynamic filter slicers."],
        practiceProblem: "Draft an executive dashboard wireframe layout with KPI summary cards, time series revenue trends, and customer segment drill-downs.",
        practiceStarter: "// Dashboard Wireframe Blueprint:\nHeader: Date Slicer, Segment Slicer\nTop Row: 4 KPI Cards (GMV, AOV, YoY Growth, Active Customers)\nMiddle Row: Monthly Revenue Trend + Category Revenue Share Donut\nBottom Row: Customer Drill-through Matrix Table",
        practiceSolution: "// Dashboard Wireframe Blueprint Verified with 5-Second Rule visual hierarchy."
      }
    ]
  },

  // =========================================================================
  // MODULE 5: BUSINESS SYSTEMS ANALYSIS, BRD/FRD & AGILE SCRUM (WEEKS 12-14)
  // =========================================================================
  {
    order: 5,
    title: "Module 5: Business Systems Analysis, BRD/FRD & Agile Scrum",
    weeks: "Weeks 12–14",
    description: "Master requirement elicitation, author professional BRD/FRD documents, model business processes with BPMN 2.0, and lead Agile Scrum sprint rituals.",
    icon: "file-text",
    capstoneTheme: "Production FinTech BRD, User Story Epics & BPMN Workflow",
    capstoneBrief: "Author an industry-standard Business Requirements Document (BRD) and Functional Requirements Document (FRD) for a FinTech digital lending platform, including BPMN 2.0 process swimlanes, Jira user story epics, and traceability matrices.",
    days: [
      {
        dayNumber: 25,
        title: "Day 25: Stakeholder Requirement Elicitation & Gap Analysis Frameworks",
        objective: "Master elicitation techniques (Interviews, JAD sessions, Observation) and conduct As-Is vs To-Be business gap analysis.",
        youtubeQuery: "Business Analysis Requirement Elicitation Techniques",
        youtubeUrl: "https://www.youtube.com/results?search_query=Business+Analysis+Requirement+Elicitation+Techniques",
        videos: [
          { title: "Requirement Elicitation Techniques for Business Analysts", channel: "The Business Analysis Doctor", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Requirement+Elicitation+BA" }
        ],
        checklist: ["Task 1: Draft targeted stakeholder interview questionnaires for Ops and Finance leaders.", "Task 2: Map the current 'As-Is' business workflow identifying bottlenecks and manual friction.", "Task 3: Formulate the desired 'To-Be' future state with measurable efficiency targets."],
        practiceProblem: "Conduct a gap analysis on a manual invoice reconciliation process and define 3 high-impact automation objectives.",
        practiceStarter: "// Gap Analysis Matrix:\nAs-Is: Manual Excel matching takes 4 days per cycle, 8% error rate.\nTo-Be: Automated OCR and 3-way matching in under 2 hours, <0.5% error rate.\nGap to Bridge: Ingestion API, rule-based matching engine, exception review queue.",
        practiceSolution: "// Verified Gap Analysis Matrix with quantifiable business success criteria."
      },
      {
        dayNumber: 26,
        title: "Day 26: Business Requirements Document (BRD) Architecture & Authoring",
        objective: "Structure and write an enterprise-grade BRD covering Executive Summary, Project Scope (In/Out), Business Rules, and Constraints.",
        youtubeQuery: "How to Write a BRD Business Requirements Document",
        youtubeUrl: "https://www.youtube.com/results?search_query=How+to+Write+a+BRD+Business+Requirements+Document",
        videos: [
          { title: "How to Write a Business Requirements Document (BRD)", channel: "Angelo Kalevela", duration: "28 mins", url: "https://www.youtube.com/results?search_query=How+to+Write+a+BRD" }
        ],
        checklist: ["Task 1: Author Section 1: Business Problem Statement & Proposed Solution Value.", "Task 2: Formulate explicit Scope Boundaries (In-Scope vs Out-of-Scope).", "Task 3: Document non-negotiable Business Rules (e.g. KYC verification before loan disbursement)."],
        practiceProblem: "Write Section 2 (Project Scope & Business Rules) of a BRD for a Quick-Commerce 10-minute grocery delivery refund module.",
        practiceStarter: "# BRD: Automated Refund Engine\n## 1. In-Scope:\n- Instant wallet refund for spoiled/missing items under $20\n## 2. Out-of-Scope:\n- Offline courier pickup\n## 3. Business Rules:\n- Maximum 2 automated refunds per customer per week",
        practiceSolution: "# BRD Verified: Comprehensive In/Out scope definition with explicit business rule guards."
      },
      {
        dayNumber: 27,
        title: "Day 27: Functional Requirements Document (FRD) & System Specifications",
        objective: "Translate high-level BRDs into detailed Functional Requirements (FRD) specifying system inputs, processing logic, outputs, and NFRs.",
        youtubeQuery: "BRD vs FRD Business Analyst Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=BRD+vs+FRD+Business+Analyst+Tutorial",
        videos: [
          { title: "Difference Between BRD and FRD with Real Examples", channel: "Bridging the Gap", duration: "20 mins", url: "https://www.youtube.com/results?search_query=BRD+vs+FRD" }
        ],
        checklist: ["Task 1: Deconstruct a business requirement into step-by-step system functional specifications.", "Task 2: Define Non-Functional Requirements (NFRs) for performance, latency, and availability (99.9%).", "Task 3: Document field-level data validation rules and error messaging behavior."],
        practiceProblem: "Write functional system specifications for an OTP verification screen including resend throttle and lockout logic.",
        practiceStarter: "FR-01: System shall send a 6-digit numeric OTP via SMS within 5 seconds.\nFR-02: OTP shall expire in 180 seconds.\nFR-03: System shall lock account for 15 minutes after 3 consecutive failed attempts.",
        practiceSolution: "FR-01 to FR-03 Verified: Complete functional requirement specification with edge-case security controls."
      },
      {
        dayNumber: 28,
        title: "Day 28: BPMN 2.0 Process Modeling & Cross-Functional Swimlanes",
        objective: "Model end-to-end business workflows using BPMN 2.0 standards: Start/End events, tasks, exclusive (XOR) gateways, and cross-functional swimlanes.",
        youtubeQuery: "BPMN 2.0 Business Process Model and Notation Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=BPMN+2.0+Business+Process+Model+and+Notation+Tutorial",
        videos: [
          { title: "BPMN 2.0 for Beginners Step by Step", channel: "Lucidchart", duration: "22 mins", url: "https://www.youtube.com/results?search_query=BPMN+2.0+Tutorial" }
        ],
        checklist: ["Task 1: Differentiate pools (organizations) from swimlanes (internal roles/systems).", "Task 2: Use exclusive gateways (XOR) for conditional routing decisions.", "Task 3: Render an end-to-end loan approval workflow diagram."],
        practiceProblem: "Model a customer dispute resolution workflow across Customer, Support Agent, and Automated Risk Engine in Mermaid flowchart syntax.",
        practiceStarter: "graph TD\n  Start([Customer Files Dispute]) --> AgentReview[Agent Reviews Proof]\n  AgentReview --> Decision{Claim < $50?}\n  Decision -->|Yes| AutoRefund[Trigger Wallet Credit]\n  Decision -->|No| Escalation[Escalate to Fraud Team]",
        practiceSolution: "graph TD Verified: Clean cross-functional swimlane logic with decision gateways."
      },
      {
        dayNumber: 29,
        title: "Day 29: User Story Mapping, Acceptance Criteria & Gherkin BDD",
        objective: "Author INVEST-compliant Agile user stories with testable Given-When-Then (Gherkin BDD) acceptance criteria.",
        youtubeQuery: "How to Write User Stories and Acceptance Criteria Agile",
        youtubeUrl: "https://www.youtube.com/results?search_query=How+to+Write+User+Stories+and+Acceptance+Criteria+Agile",
        videos: [
          { title: "Writing User Stories with Gherkin BDD Acceptance Criteria", channel: "Continuous Delivery", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Gherkin+User+Stories" }
        ],
        checklist: ["Task 1: Follow the standard persona user story template: As a [role], I want to [action], So that [value].", "Task 2: Verify user stories satisfy INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable).", "Task 3: Author Gherkin acceptance criteria with Given-When-Then statements covering happy and edge-case paths."],
        practiceProblem: "Write an Agile user story and 2 Gherkin BDD scenarios for an instant bank account balance refresh feature.",
        practiceStarter: "User Story:\nAs an account holder,\nI want to swipe down on my dashboard,\nSo that I can see my updated real-time bank balance.\n\nScenario 1: Happy Path\nGiven user is logged in\nWhen user swipes down\nThen balance updates within 1 second",
        practiceSolution: "User Story & Gherkin Scenarios Verified: Complete happy-path and network error edge-case coverage."
      },
      {
        dayNumber: 30,
        title: "Day 30: Agile Scrum Rituals, Sprint Planning, Jira Epics & Backlog Grooming",
        objective: "Lead Sprint Planning, Daily Standups, Sprint Reviews, Retrospectives, Story Point estimation (Fibonacci), and Jira epic decomposition.",
        youtubeQuery: "Agile Scrum Masterclass Sprint Planning Jira",
        youtubeUrl: "https://www.youtube.com/results?search_query=Agile+Scrum+Masterclass+Sprint+Planning+Jira",
        videos: [
          { title: "Agile Scrum Framework & Jira Management", channel: "freeCodeCamp", duration: "35 mins", url: "https://www.youtube.com/results?search_query=Agile+Scrum+Jira" }
        ],
        checklist: ["Task 1: Decompose a high-level Initiative into Epics, Stories, and Subtasks.", "Task 2: Conduct backlog refinement and assign story points using planning poker.", "Task 3: Facilitate sprint retrospectives using the Start-Stop-Continue framework."],
        practiceProblem: "Break down an 'Omnichannel Cart Checkout' feature into an Epic with 3 prioritized user stories and story point estimates.",
        practiceStarter: "Epic: Seamless Omnichannel Cart\nStory 1: Persist guest cart across devices via phone auth (5 pts)\nStory 2: Apply dynamic promo code discounts at checkout (3 pts)\nStory 3: Fallback payment method selection upon gateway timeout (5 pts)",
        practiceSolution: "Epic & Story Decomposition Verified with estimation logic and backlog priorities."
      }
    ]
  },

  // =========================================================================
  // MODULE 6: AI-AUGMENTED BA WORKFLOWS (WEEKS 15-16)
  // =========================================================================
  {
    order: 6,
    title: "Module 6: AI-Augmented BA Workflows",
    weeks: "Weeks 15–16",
    description: "Leverage generative AI (ChatGPT, Claude, Copilot) to accelerate requirement elicitation, draft BRDs from messy meeting transcripts, generate test cases, and automate documentation governance.",
    icon: "sparkles",
    capstoneTheme: "End-to-End AI-Accelerated Requirements & Traceability Matrix",
    capstoneBrief: "Build an automated prompt-driven BA workflow pipeline that ingests a 45-minute raw stakeholder meeting transcript, synthesizes a complete structured BRD, extracts Gherkin acceptance criteria, generates Jira ticket epics, and creates a requirements traceability matrix (RTM).",
    days: [
      {
        dayNumber: 31,
        title: "Day 31: Prompt Engineering for BAs: Few-Shot, Persona & Role Structuring",
        objective: "Design enterprise system prompts using role-based prompting, few-shot examples, and strict JSON output schemas for BA document generation.",
        youtubeQuery: "Prompt Engineering for Business Analysts Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Prompt+Engineering+for+Business+Analysts+Tutorial",
        videos: [
          { title: "Advanced Prompt Engineering for Business Workflows", channel: "Dave Ebbelaar", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Prompt+Engineering+Business" }
        ],
        checklist: ["Task 1: Construct a system persona prompt establishing Senior Business Systems Analyst context.", "Task 2: Incorporate 2 few-shot input/output examples to constrain hallucination.", "Task 3: Enforce strict markdown heading structures and output formats."],
        practiceProblem: "Write a high-performance LLM prompt instructing an AI to extract non-functional requirements from an architecture brief.",
        practiceStarter: "System: You are an enterprise Business Analyst.\nTask: Extract all Performance, Security, and Availability NFRs from the input text.\nFormat: Markdown table with columns: ID, Category, Requirement, Acceptance Metric.\nInput text: {text}",
        practiceSolution: "System Prompt Verified with role, task, few-shot schema, and markdown table constraints."
      },
      {
        dayNumber: 32,
        title: "Day 32: Meeting Transcripts to Structured BRD & Action Item Extraction",
        objective: "Ingest messy, conversational meeting audio transcripts, extract underlying business intent, filter small talk, and synthesize structured BRD sections.",
        youtubeQuery: "Summarize Meeting Notes using ChatGPT AI",
        youtubeUrl: "https://www.youtube.com/results?search_query=Summarize+Meeting+Notes+using+ChatGPT+AI",
        videos: [
          { title: "How to Turn Meeting Transcripts into Business Requirements", channel: "Prompt Engineering Institute", duration: "20 mins", url: "https://www.youtube.com/results?search_query=Meeting+Transcripts+into+BRD" }
        ],
        checklist: ["Task 1: Filter conversational banter and irrelevant digressions from transcripts.", "Task 2: Extract explicit stakeholder decisions, open questions, and action items with owners.", "Task 3: Synthesize Section 1 of a BRD directly from executive dialogue."],
        practiceProblem: "Process an excerpt of a stakeholder discussion about a delivery partner payout delay into a structured problem statement.",
        practiceStarter: "Raw notes: 'Ramesh said riders are angry because tips show up 2 days late. Priya agreed, says Stripe webhook fails on weekend.'\nOutput:\nBusiness Problem: Rider tip payouts delayed up to 48 hours due to unhandled weekend gateway webhook events.",
        practiceSolution: "Structured Problem Statement & Action Matrix Verified from raw transcript input."
      },
      {
        dayNumber: 33,
        title: "Day 33: AI-Powered User Story & Gherkin Acceptance Criteria Generation",
        objective: "Prompt AI to generate comprehensive Agile user stories, boundary conditions, edge cases, and testable Gherkin BDD scenarios.",
        youtubeQuery: "Generate User Stories with AI ChatGPT",
        youtubeUrl: "https://www.youtube.com/results?search_query=Generate+User+Stories+with+AI+ChatGPT",
        videos: [
          { title: "Using AI to Write Production-Ready User Stories", channel: "Agile with AI", duration: "18 mins", url: "https://www.youtube.com/results?search_query=AI+User+Stories" }
        ],
        checklist: ["Task 1: Generate 5 INVEST-compliant user stories from a feature description.", "Task 2: Probe the AI to generate negative test case scenarios (e.g. expired session, invalid input).", "Task 3: Validate generated Gherkin syntax for BDD automated testing suites."],
        practiceProblem: "Prompt AI to break down a 'One-Click Buy Now' feature into 3 user stories with Gherkin acceptance criteria.",
        practiceStarter: "Prompt: 'Generate 3 user stories for an e-commerce 1-click buy feature with Gherkin scenarios for: (1) Default card charged, (2) Card expired, (3) Out-of-stock collision.'",
        practiceSolution: "User Story Suite Verified: Complete happy path and negative collision scenarios."
      },
      {
        dayNumber: 34,
        title: "Day 34: Reverse-Engineering Legacy Code & SQL into Business Requirement Docs",
        objective: "Feed complex legacy SQL stored procedures or backend code into AI to reverse-engineer business rules and data calculations into plain English.",
        youtubeQuery: "Explain Code and SQL using ChatGPT",
        youtubeUrl: "https://www.youtube.com/results?search_query=Explain+Code+and+SQL+using+ChatGPT",
        videos: [
          { title: "Reverse Engineering Legacy Code with AI", channel: "Modern Software Engineer", duration: "22 mins", url: "https://www.youtube.com/results?search_query=Reverse+Engineering+Code+AI" }
        ],
        checklist: ["Task 1: Extract business calculation formulas from nested SQL CASE WHEN statements.", "Task 2: Translate cryptic column abbreviations into documented data dictionary attributes.", "Task 3: Generate an As-Is functional specification from legacy stored procedures."],
        practiceProblem: "Explain a 50-line nested SQL commission calculation query and document the exact tiered commission rules in plain business English.",
        practiceStarter: "// Legacy Logic Extracted:\nRule 1: If sales > $100k and margin > 20%, commission = 12%\nRule 2: If sales > $50k, commission = 8%\nRule 3: Else baseline commission = 4%",
        practiceSolution: "Business Rules Document Verified: Accurate mathematical translation of legacy SQL logic."
      },
      {
        dayNumber: 35,
        title: "Day 35: AI Automated Test Case Synthesis & Edge-Case Vulnerability Probing",
        objective: "Generate comprehensive User Acceptance Testing (UAT) test cases, boundary value analyses, and security edge cases using AI.",
        youtubeQuery: "Generate QA Test Cases using ChatGPT",
        youtubeUrl: "https://www.youtube.com/results?search_query=Generate+QA+Test+Cases+using+ChatGPT",
        videos: [
          { title: "AI-Assisted UAT and QA Test Case Generation", channel: "Software Testing Mentor", duration: "20 mins", url: "https://www.youtube.com/results?search_query=AI+QA+Testing" }
        ],
        checklist: ["Task 1: Generate a UAT test matrix with Preconditions, Steps, Expected Results, and Pass/Fail flags.", "Task 2: Prompt for edge cases including zero values, character limit overflows, and concurrency races.", "Task 3: Format output into importable Jira/Xray CSV format."],
        practiceProblem: "Create a 5-scenario UAT test plan for an international currency conversion checkout widget.",
        practiceStarter: "| Test ID | Scenario | Preconditions | Steps | Expected Result |\n| TC-01 | USD to INR conversion | Logged in user | Select INR from dropdown | Total updates with real-time rate |",
        practiceSolution: "UAT Test Matrix Verified: Comprehensive international currency conversion test cases."
      },
      {
        dayNumber: 36,
        title: "Day 36: AI Diffing, Document Governance & Traceability Matrix Automation",
        objective: "Use AI to diff versions of BRDs, detect requirement drift, and maintain automated Requirements Traceability Matrices (RTM).",
        youtubeQuery: "Requirements Traceability Matrix RTM Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Requirements+Traceability+Matrix+RTM+Tutorial",
        videos: [
          { title: "Building and Maintaining an RTM with AI", channel: "BA Professional", duration: "18 mins", url: "https://www.youtube.com/results?search_query=Requirements+Traceability+Matrix" }
        ],
        checklist: ["Task 1: Compare v1.0 and v2.0 of a requirements doc to identify scope additions, modifications, and deletions.", "Task 2: Build an RTM mapping Business Requirements (BR) -> Functional Specs (FR) -> Test Cases (TC).", "Task 3: Establish an automated changelog summary for stakeholder sign-off."],
        practiceProblem: "Map 3 business requirements to their corresponding functional requirements and UAT test IDs in an RTM table.",
        practiceStarter: "| BR ID | Business Requirement | FR ID | Test Case ID |\n| BR-01 | Instant rider tipping | FR-101 | TC-501 |\n| BR-02 | Tip refund on cancellation | FR-102 | TC-502 |",
        practiceSolution: "Requirements Traceability Matrix (RTM) Verified with end-to-end bidirectional tracking."
      }
    ]
  },

  // =========================================================================
  // MODULE 7: AI/ML FUNDAMENTALS & GENAI USE-CASE DESIGN (WEEKS 17-18)
  // =========================================================================
  {
    order: 7,
    title: "Module 7: AI/ML Fundamentals & GenAI Use-Case Design",
    weeks: "Weeks 17–18",
    description: "Understand Machine Learning concepts (supervised vs unsupervised), GenAI/LLM architectures, RAG systems, and how to write business PRDs translating real problems into high-ROI AI solutions.",
    icon: "brain",
    capstoneTheme: "Enterprise GenAI Knowledge-Bot PRD & Financial ROI Business Case",
    capstoneBrief: "Design a comprehensive Product Requirements Document (PRD) for an enterprise GenAI customer service co-pilot using Retrieval-Augmented Generation (RAG). Include architecture diagrams, prompt flows, latency/cost SLAs, and financial ROI models.",
    days: [
      {
        dayNumber: 37,
        title: "Day 37: Machine Learning Fundamentals for BAs: Supervised vs Unsupervised",
        objective: "Understand core ML paradigms: Supervised (Regression, Classification), Unsupervised (Clustering, Dimensionality Reduction), and Reinforcement Learning.",
        youtubeQuery: "Machine Learning for Business Analysts Explained",
        youtubeUrl: "https://www.youtube.com/results?search_query=Machine+Learning+for+Business+Analysts+Explained",
        videos: [
          { title: "Machine Learning Basics for Product and Business Leaders", channel: "Ken Jee", duration: "24 mins", url: "https://www.youtube.com/results?search_query=Ken+Jee+Machine+Learning" }
        ],
        checklist: ["Task 1: Classify business problems into Regression (predicting price) vs Classification (predicting churn).", "Task 2: Identify unsupervised clustering use cases for customer segmentation.", "Task 3: Differentiate deterministic rule-based algorithms from probabilistic ML models."],
        practiceProblem: "Determine whether the following 3 business problems require Regression, Classification, or Clustering: (1) Estimating delivery time in minutes, (2) Flagging credit card fraud, (3) Grouping shoppers by aesthetic preference.",
        practiceStarter: "// Classification:\n1. Delivery time: Regression (continuous value)\n2. Fraud detection: Classification (binary: fraud / legit)\n3. Shopper grouping: Clustering (unsupervised K-Means)",
        practiceSolution: "Problem Classification Verified with appropriate ML model family mapping."
      },
      {
        dayNumber: 38,
        title: "Day 38: Model Evaluation Metrics: Precision, Recall, ROC-AUC & Confusion Matrix",
        objective: "Interpret Confusion Matrices, Precision, Recall, F1-Score, and ROC-AUC in terms of actual business cost and trade-offs.",
        youtubeQuery: "Confusion Matrix Precision Recall ROC AUC StatQuest",
        youtubeUrl: "https://www.youtube.com/results?search_query=Confusion+Matrix+Precision+Recall+ROC+AUC+StatQuest",
        videos: [
          { title: "StatQuest: Precision, Recall, and the Confusion Matrix", channel: "StatQuest with Josh Starmer", duration: "22 mins", url: "https://www.youtube.com/results?search_query=StatQuest+Confusion+Matrix" }
        ],
        checklist: ["Task 1: Calculate Precision and Recall from a 2x2 confusion matrix.", "Task 2: Evaluate the financial cost of False Positives vs False Negatives in a fraud detection scenario.", "Task 3: Choose the optimal decision threshold based on business loss tolerance."],
        practiceProblem: "A cancer screening model has 98% Recall but 60% Precision. Explain to a C-suite hospital board what this means for patients and operational costs.",
        practiceStarter: "// Executive Synthesis:\nHigh Recall (98%) ensures nearly all true cases are caught (minimal false negatives).\nLower Precision (60%) means 40% of flagged positive alerts require secondary confirmatory tests, incurring diagnostic cost but saving lives.",
        practiceSolution: "Confusion Matrix Business Translation Verified with executive cost-benefit trade-offs."
      },
      {
        dayNumber: 39,
        title: "Day 39: Translating Business Problems into Machine Learning Framing",
        objective: "Formulate business challenges into machine learning problem statements with target variables, feature inputs, and baseline benchmarks.",
        youtubeQuery: "Problem Formulation in Machine Learning Google Course",
        youtubeUrl: "https://www.youtube.com/results?search_query=Problem+Formulation+in+Machine+Learning+Google+Course",
        videos: [
          { title: "How to Frame Business Problems as ML Problems", channel: "Google Cloud Tech", duration: "20 mins", url: "https://www.youtube.com/results?search_query=ML+Problem+Framing" }
        ],
        checklist: ["Task 1: Define the target variable (label) with zero data leakage.", "Task 2: Identify available feature dimensions across historical user, product, and transaction tables.", "Task 3: Establish the minimum heuristic baseline the ML model must beat to justify engineering cost."],
        practiceProblem: "Frame a 'Customer Churn Prevention' initiative into an ML classification model with input features, label window, and ROI threshold.",
        practiceStarter: "// ML Framing:\nTarget Label: Churn = 1 if zero orders in subsequent 30 days, else 0.\nFeatures: Days since last order, 90-day order frequency, customer support ticket count, average discount usage %.\nBaseline: Simple heuristic (no orders in 45 days). Target ML uplift: +15% F1-score.",
        practiceSolution: "ML Problem Framing Canvas Verified with clear label definition and zero feature leakage."
      },
      {
        dayNumber: 40,
        title: "Day 40: Large Language Models (LLMs) & Retrieval-Augmented Generation (RAG)",
        objective: "Understand LLM tokenization, context windows, hallucinations, vector databases, embeddings, and RAG architecture.",
        youtubeQuery: "Retrieval Augmented Generation RAG Explained IBM Technology",
        youtubeUrl: "https://www.youtube.com/results?search_query=Retrieval+Augmented+Generation+RAG+Explained+IBM+Technology",
        videos: [
          { title: "RAG Explained: Retrieval-Augmented Generation", channel: "IBM Technology", duration: "15 mins", url: "https://www.youtube.com/results?search_query=RAG+IBM+Technology" }
        ],
        checklist: ["Task 1: Explain the flow: Document Ingestion -> Chunking -> Vector Embedding -> Semantic Search -> Augmented Prompt -> LLM Response.", "Task 2: Identify why RAG prevents hallucination by grounding answers in enterprise private documents.", "Task 3: Specify chunking strategies and vector similarity thresholds (cosine similarity)."],
        practiceProblem: "Draw the architecture diagram for an HR Employee Policy AI Assistant using RAG in Mermaid flowchart syntax.",
        practiceStarter: "graph LR\n  User([Employee Question]) --> VectorDB[(Company Policy Vector Store)]\n  VectorDB -->|Relevant Chunks| LLM[LLM Foundation Model]\n  LLM --> Answer([Accurate Policy Answer])",
        practiceSolution: "RAG Architecture Flowchart Verified with embedding pipeline and vector retrieval context."
      },
      {
        dayNumber: 41,
        title: "Day 41: GenAI Product Requirements Document (PRD) & Prompt Architecture",
        objective: "Author a comprehensive GenAI PRD detailing system guardrails, fallback behaviors, human-in-the-loop triggers, and prompt templates.",
        youtubeQuery: "How to Write a GenAI PRD Product Management",
        youtubeUrl: "https://www.youtube.com/results?search_query=How+to+Write+a+GenAI+PRD+Product+Management",
        videos: [
          { title: "Writing Product Requirements for AI Features", channel: "Lenny's Podcast Clips", duration: "20 mins", url: "https://www.youtube.com/results?search_query=AI+PRD+Product+Management" }
        ],
        checklist: ["Task 1: Define system safety guardrails and jailbreak prevention policies.", "Task 2: Establish clear Human-in-the-Loop (HITL) escalation criteria when confidence < 80%.", "Task 3: Document prompt templates with dynamic variables and output format constraints."],
        practiceProblem: "Write the guardrails and fallback section of a GenAI Banking Assistant PRD.",
        practiceStarter: "# GenAI PRD Section: Guardrails & Fallbacks\n1. Security: Never output full account numbers or passwords.\n2. Fallback: If intent confidence < 75%, route immediately to human banking agent.\n3. Hallucination Check: Refuse answering questions outside authenticated bank policies.",
        practiceSolution: "GenAI PRD Guardrail Specifications Verified with strict enterprise security criteria."
      },
      {
        dayNumber: 42,
        title: "Day 42: GenAI Cost Modeling, Latency Benchmarks, ROI & Feasibility Sizing",
        objective: "Model API token economics (input/output cost per million tokens), latency tradeoffs (TTFT), and calculate 3-year net ROI.",
        youtubeQuery: "LLM Economics Token Cost Optimization",
        youtubeUrl: "https://www.youtube.com/results?search_query=LLM+Economics+Token+Cost+Optimization",
        videos: [
          { title: "Understanding LLM Costs and Economics", channel: "AI Financials", duration: "18 mins", url: "https://www.youtube.com/results?search_query=LLM+Economics" }
        ],
        checklist: ["Task 1: Calculate daily token consumption: (daily users * avg queries * tokens per query * cost per token).", "Task 2: Compare cost and latency of Gemini 2.5 Flash vs Gemini Pro vs Claude 3.5 Sonnet.", "Task 3: Model labor cost savings against LLM API operational expenses to produce net ROI."],
        practiceProblem: "Calculate annual LLM API costs for 50,000 daily customer support queries (avg 1000 input tokens, 200 output tokens) using Gemini 2.5 Flash pricing.",
        practiceStarter: "// Financial Calculation:\nDaily Queries: 50,000\nDaily Input Tokens: 50,000 * 1,000 = 50M tokens\nDaily Output Tokens: 50,000 * 200 = 10M tokens\nAt $0.075/1M input & $0.30/1M output: Daily Cost = $3.75 + $3.00 = $6.75/day -> $2,463/year.",
        practiceSolution: "Token Economics & Financial Model Verified: Highly profitable automation case study."
      }
    ]
  },

  // =========================================================================
  // MODULE 8: DATA GOVERNANCE, PRIVACY & AI COMPLIANCE (WEEKS 19-20)
  // =========================================================================
  {
    order: 8,
    title: "Module 8: Data Governance, Privacy & AI Compliance",
    weeks: "Weeks 19–20",
    description: "Navigate India's Digital Personal Data Protection (DPDP) Act 2023, EU AI Act, global privacy standards, data lineage, PII masking, and ethical AI auditing.",
    icon: "shield-check",
    capstoneTheme: "Enterprise DPDP & EU AI Act Compliance Governance Framework",
    capstoneBrief: "Develop a complete regulatory compliance and data governance framework for a multi-national tech enterprise operating in India and Europe. Map PII data flows, draft consent notice architectures, classify AI system risk tiers, and formulate audit defense protocols.",
    days: [
      {
        dayNumber: 43,
        title: "Day 43: Enterprise Data Governance Frameworks, Data Catalogs & Quality",
        objective: "Master DAMA-DMBOK principles, data stewardship, metadata management, data cataloging (Collibra, Atlan), and data quality dimensions.",
        youtubeQuery: "What is Data Governance Explained Simply",
        youtubeUrl: "https://www.youtube.com/results?search_query=What+is+Data+Governance+Explained+Simply",
        videos: [
          { title: "Data Governance Masterclass: Principles and Practice", channel: "LightsOnData", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Data+Governance+LightsOnData" }
        ],
        checklist: ["Task 1: Audit 6 core data quality dimensions: Accuracy, Completeness, Consistency, Timeliness, Validity, Uniqueness.", "Task 2: Define roles: Data Owner, Data Steward, and Data Custodian.", "Task 3: Structure a business glossary reconciling conflicting metric definitions."],
        practiceProblem: "Establish the data governance charter and data quality scorecard for an enterprise customer database.",
        practiceStarter: "| Dimension | Metric Definition | Target SLA | Remediation Action |\n| Completeness | % records with valid email | >= 99% | Block checkout if email missing |\n| Uniqueness | Duplicate customer accounts | < 0.1% | Automated de-duplication script |",
        practiceSolution: "Data Governance Charter & Scorecard Verified with SLA enforcement rules."
      },
      {
        dayNumber: 44,
        title: "Day 44: Personally Identifiable Information (PII) Discovery & Data Lineage",
        objective: "Identify direct and indirect PII, construct end-to-end data lineage maps, and design automated masking, hashing, and tokenization policies.",
        youtubeQuery: "PII Data Masking Tokenization Explained",
        youtubeUrl: "https://www.youtube.com/results?search_query=PII+Data+Masking+Tokenization+Explained",
        videos: [
          { title: "Data Privacy & PII Protection in Modern Analytics", channel: "DataCamp", duration: "20 mins", url: "https://www.youtube.com/results?search_query=PII+Protection+Data" }
        ],
        checklist: ["Task 1: Audit tables for PII attributes: Aadhaar, PAN, Phone, Email, Location Coordinates, IP Addresses.", "Task 2: Map upstream data source ingestion through analytical transformations to downstream BI reports.", "Task 3: Apply dynamic column-level masking (e.g. masking all but last 4 digits of phone number)."],
        practiceProblem: "Write SQL or policy logic to mask email and phone number columns for non-admin analytical queries.",
        practiceStarter: "SELECT id, name,\n  SUBSTR(email, 1, 2) || '****@' || SUBSTR(email, INSTR(email, '@') + 1) as masked_email,\n  'XXXXXX' || SUBSTR(phone, -4) as masked_phone\nFROM customers;",
        practiceSolution: "SELECT id, name, SUBSTR(email, 1, 2) || '****@' || SUBSTR(email, INSTR(email, '@') + 1) as masked_email, 'XXXXXX' || SUBSTR(phone, -4) as masked_phone FROM customers;"
      },
      {
        dayNumber: 45,
        title: "Day 45: India Digital Personal Data Protection (DPDP) Act 2023 Deep-Dive",
        objective: "Understand India's landmark DPDP Act 2023: Data Principal rights, Data Fiduciary obligations, consent managers, penalties (up to ₹250 Cr), and child data protections.",
        youtubeQuery: "India DPDP Act 2023 Explained for Tech Professionals",
        youtubeUrl: "https://www.youtube.com/results?search_query=India+DPDP+Act+2023+Explained+for+Tech+Professionals",
        videos: [
          { title: "Digital Personal Data Protection Act 2023 Full Breakdown", channel: "FinTech Legal Guide", duration: "30 mins", url: "https://www.youtube.com/results?search_query=DPDP+Act+2023" }
        ],
        checklist: ["Task 1: Map the 4 statutory rights of Data Principals (Access, Correction, Erasure, Grievance Redressal).", "Task 2: Design an explicit, unconditional, multi-lingual Consent Notice blueprint.", "Task 3: Outline breach reporting procedures to the Data Protection Board of India within statutory timeframes."],
        practiceProblem: "Design an explicit Consent Management notice architecture for an Indian D2C mobile application compliant with Section 5 of DPDP Act 2023.",
        practiceStarter: "# DPDP Act 2023 Compliant Consent Notice:\n1. Purpose Specification: Only data necessary for order delivery (Name, Address, Phone).\n2. Language: Rendered in English + 22 Scheduled Indian Languages.\n3. Withdrawal: 1-click consent revocation option in profile settings.",
        practiceSolution: "DPDP Act 2023 Consent Architecture Verified according to statutory provisions."
      },
      {
        dayNumber: 46,
        title: "Day 46: Global Privacy Regulations: GDPR, CCPA & Cross-Border Data Flows",
        objective: "Compare GDPR, CCPA, and DPDP, understand cross-border data transfer restrictions, and design Data Subject Access Request (DSAR) workflows.",
        youtubeQuery: "GDPR vs CCPA Privacy Regulations Comparison",
        youtubeUrl: "https://www.youtube.com/results?search_query=GDPR+vs+CCPA+Privacy+Regulations+Comparison",
        videos: [
          { title: "Global Data Privacy Regulations Compared", channel: "IAPP Official", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Global+Data+Privacy+Regulations" }
        ],
        checklist: ["Task 1: Compare legal bases for processing: Consent vs Legitimate Interest vs Contractual Necessity.", "Task 2: Build a 30-day automated Right-to-be-Forgotten (RTBF) cascading deletion script.", "Task 3: Document cross-border transfer requirements (Standard Contractual Clauses)."],
        practiceProblem: "Draft the technical workflow for an automated Right-to-be-Forgotten (data erasure) request across transactional DBs, backups, and analytical lakes.",
        practiceStarter: "1. User submits erasure request via portal.\n2. Service verifies identity and flags active loan/fraud checks.\n3. If eligible, soft-delete PII immediately and trigger batch anonymization across analytical replicas.\n4. Confirmation certificate returned to user within 30 days.",
        practiceSolution: "Automated DSAR Erasure Pipeline Verified with regulatory exception handling."
      },
      {
        dayNumber: 47,
        title: "Day 47: The EU AI Act, Risk Classification & AI Compliance Mandates",
        objective: "Master the EU AI Act risk pyramid (Unacceptable, High-Risk, Specific Transparency, Minimal Risk) and technical compliance requirements for AI systems.",
        youtubeQuery: "EU AI Act Explained Simply Legal Tech",
        youtubeUrl: "https://www.youtube.com/results?search_query=EU+AI+Act+Explained+Simply+Legal+Tech",
        videos: [
          { title: "The EU AI Act: What Developers and BAs Need to Know", channel: "Lexxic Tech Law", duration: "25 mins", url: "https://www.youtube.com/results?search_query=EU+AI+Act+Explained" }
        ],
        checklist: ["Task 1: Classify company AI initiatives into Unacceptable, High-Risk, or Limited Risk tiers.", "Task 2: Formulate compliance documentation for High-Risk systems (credit scoring, hiring algorithms, biometric identification).", "Task 3: Implement mandatory transparency notifications for customer-facing AI agents."],
        practiceProblem: "Classify an AI-powered automated resume screening and candidate ranking tool under the EU AI Act and list 3 mandatory compliance requirements.",
        practiceStarter: "// Classification: High-Risk AI System (Employment & Worker Management Category).\nMandatory Requirements:\n1. High-quality training datasets free from demographic bias.\n2. Continuous logging of all automated decisions for auditability.\n3. Human-in-the-loop oversight with power to override recommendations.",
        practiceSolution: "EU AI Act Risk Classification & Compliance Checklist Verified."
      },
      {
        dayNumber: 48,
        title: "Day 48: Enterprise AI Governance, Bias Mitigation & Ethical AI Auditing",
        objective: "Detect demographic bias in training data, implement disparate impact ratios, and build an ethical AI governance board charter.",
        youtubeQuery: "AI Fairness and Bias Detection Explained",
        youtubeUrl: "https://www.youtube.com/results?search_query=AI+Fairness+and+Bias+Detection+Explained",
        videos: [
          { title: "Fairness and Bias in Machine Learning Systems", channel: "Google Cloud Tech", duration: "22 mins", url: "https://www.youtube.com/results?search_query=AI+Fairness+Bias" }
        ],
        checklist: ["Task 1: Calculate the Disparate Impact Ratio (Four-Fifths Rule) across demographic subgroups.", "Task 2: Implement post-processing threshold adjustments to eliminate algorithmic bias.", "Task 3: Draft an Enterprise AI Ethics Review Board charter and pre-deployment sign-off checklist."],
        practiceProblem: "Calculate whether a credit approval algorithm passes the 80% (Four-Fifths) rule comparing female approval rate (45%) against male approval rate (60%).",
        practiceStarter: "// Calculation:\nRatio = Female Approval Rate / Male Approval Rate = 45% / 60% = 0.75 (75%).\nConclusion: 75% is less than 80%, indicating adverse impact/bias under the Four-Fifths rule. Re-calibration required.",
        practiceSolution: "Algorithmic Bias Audit Verified: Failed Four-Fifths rule with remediation recommendations."
      }
    ]
  },

  // =========================================================================
  // MODULE 9: CHANGE MANAGEMENT & DIGITAL TRANSFORMATION LEADERSHIP (WEEKS 21-22)
  // =========================================================================
  {
    order: 9,
    title: "Module 9: Change Management & Digital Transformation Leadership",
    weeks: "Weeks 21–22",
    description: "Lead enterprise technology and AI adoption using the ADKAR framework, manage stakeholder resistance, craft executive communication strategies, and guarantee high system utilization.",
    icon: "users",
    capstoneTheme: "Org-Wide Enterprise ERP/AI Migration Change Management Plan",
    capstoneBrief: "Formulate a comprehensive Change Management & Stakeholder Alignment Strategy for a 2,000-employee enterprise migrating from legacy spreadsheets to an AI-driven ERP. Include ADKAR stage roadmaps, stakeholder resistance mitigation playbooks, communication cascades, and adoption KPI scorecards.",
    days: [
      {
        dayNumber: 49,
        title: "Day 49: The ADKAR Framework for Enterprise Digital Transformation",
        objective: "Master the Prosci ADKAR model (Awareness, Desire, Knowledge, Ability, Reinforcement) to drive individual and organizational technology adoption.",
        youtubeQuery: "ADKAR Model of Change Management Explained Prosci",
        youtubeUrl: "https://www.youtube.com/results?search_query=ADKAR+Model+of+Change+Management+Explained+Prosci",
        videos: [
          { title: "ADKAR Change Management Model Explained", channel: "Prosci Official", duration: "20 mins", url: "https://www.youtube.com/results?search_query=ADKAR+Change+Management" }
        ],
        checklist: ["Task 1: Diagnose change barriers across Awareness, Desire, Knowledge, Ability, and Reinforcement.", "Task 2: Build targeted interventions for each ADKAR stage.", "Task 3: Identify the primary 'barrier point' stalling adoption in a real corporate case study."],
        practiceProblem: "An organization launches an AI copilot, but employees revert to manual Excel after 2 weeks. Diagnose the ADKAR barrier point and design an intervention.",
        practiceStarter: "// ADKAR Diagnosis:\nAwareness: High (knew about tool).\nDesire: Moderate.\nKnowledge: Moderate.\nBarrier Point: Ability & Reinforcement (lack of hands-on coaching and legacy performance reviews still reward old processes).\nIntervention: Departmental office hours + update KPIs to mandate tool usage.",
        practiceSolution: "ADKAR Diagnostic & Strategic Intervention Plan Verified."
      },
      {
        dayNumber: 50,
        title: "Day 50: Stakeholder Power-Interest Matrix & Change Impact Assessments",
        objective: "Map corporate stakeholders using Mendelow's Power-Interest Matrix (Key Players, Keep Satisfied, Keep Informed, Minimal Effort) and conduct Change Impact Assessments.",
        youtubeQuery: "Stakeholder Analysis Power Interest Matrix Tutorial",
        youtubeUrl: "https://www.youtube.com/results?search_query=Stakeholder+Analysis+Power+Interest+Matrix+Tutorial",
        videos: [
          { title: "Stakeholder Management & Power-Interest Matrix", channel: "David McLachlan", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Power+Interest+Matrix" }
        ],
        checklist: ["Task 1: Plot 8 key enterprise personas onto the 2x2 Power vs Interest grid.", "Task 2: Formulate tailored engagement strategies for high-power, low-interest executives.", "Task 3: Conduct a Change Impact Assessment rating Severity (Low, Medium, High) across business units."],
        practiceProblem: "Categorize the CFO, Head of Operations, Field Sales Agents, and Data Team for an automated billing migration on the Power-Interest Matrix.",
        practiceStarter: "| Stakeholder | Power | Interest | Strategy |\n| CFO | High | High | Manage Closely (Key Player) |\n| Head of Ops | High | Medium | Keep Satisfied |\n| Field Agents | Low | High | Keep Informed & Train |\n| Data Team | High | High | Core Implementation Partner |",
        practiceSolution: "Stakeholder Power-Interest Classification & Strategy Verified."
      },
      {
        dayNumber: 51,
        title: "Day 51: Diagnosing & Overcoming Employee & Executive System Resistance",
        objective: "Identify the root causes of resistance (fear of redundancy, loss of control, cognitive overload) and deploy proven change mitigation strategies.",
        youtubeQuery: "Overcoming Resistance to Change Management Harvard Business",
        youtubeUrl: "https://www.youtube.com/results?search_query=Overcoming+Resistance+to+Change+Management+Harvard+Business",
        videos: [
          { title: "How to Overcome Resistance to Change in Organizations", channel: "Harvard Business Publishing", duration: "18 mins", url: "https://www.youtube.com/results?search_query=Overcoming+Resistance+Change" }
        ],
        checklist: ["Task 1: Separate rational resistance (system bugs, missing features) from emotional resistance (job loss fears).", "Task 2: Deploy champion networks ('Change Champions') to drive peer-to-peer advocacy.", "Task 3: Create psychological safety and feedback feedback loops."],
        practiceProblem: "Write a mitigation script for a resistant VP of Supply Chain who claims an AI demand forecasting model 'cannot match his 20 years of gut instinct'.",
        practiceStarter: "// Objection Handling Script:\n1. Acknowledge & Validate: Respect their deep domain intuition.\n2. Reframe as Co-Pilot: AI handles the baseline 80% computational load, empowering the VP to focus on volatile edge cases.\n3. Sandbox Pilot: Run AI forecast in parallel with their team for 30 days without overriding decisions.",
        practiceSolution: "Executive Resistance Handling Script Verified with collaborative validation strategy."
      },
      {
        dayNumber: 52,
        title: "Day 52: Strategic Communication Architecture & Phased Rollout Strategy",
        objective: "Design multi-channel communication cascades (Town Halls, 1-on-1s, Slack AMAs) and plan phased canary rollouts vs big-bang cutovers.",
        youtubeQuery: "Change Management Communication Plan Strategy",
        youtubeUrl: "https://www.youtube.com/results?search_query=Change+Management+Communication+Plan+Strategy",
        videos: [
          { title: "Creating an Effective Change Communication Plan", channel: "Prosci Official", duration: "20 mins", url: "https://www.youtube.com/results?search_query=Change+Communication+Plan" }
        ],
        checklist: ["Task 1: Structure a 60-day communication roadmap: Why change, What changes, What it means for me, How to prepare.", "Task 2: Design executive town hall talking points focusing on 'What's In It For Me' (WIIFM).", "Task 3: Compare Risk Profile of Canary (pilot cohort) vs Big-Bang cutovers."],
        practiceProblem: "Draft a corporate announcement email from the Chief Operating Officer explaining why the company is adopting a new AI ERP system.",
        practiceStarter: "Subject: Elevating Our Daily Operations: Introducing Project Catalyst\nTeam,\nOver the next 60 days, we are streamlining our manual reporting by transitioning to Project Catalyst...\nWhat this means for you: Less late-night spreadsheet reconciliation, more strategic decision making...",
        practiceSolution: "Executive All-Hands Communication Memo Verified with compelling WIIFM narrative."
      },
      {
        dayNumber: 53,
        title: "Day 53: User Enablement, Standard Operating Procedures (SOPs) & Training",
        objective: "Design role-based training curriculums, bite-sized Loom video SOPs, quick-reference user cheat sheets, and interactive sandbox simulations.",
        youtubeQuery: "How to Write Standard Operating Procedures SOPs",
        youtubeUrl: "https://www.youtube.com/results?search_query=How+to+Write+Standard+Operating+Procedures+SOPs",
        videos: [
          { title: "Writing Effective SOPs for Business Teams", channel: "Process Street", duration: "16 mins", url: "https://www.youtube.com/results?search_query=How+to+Write+SOPs" }
        ],
        checklist: ["Task 1: Author a 1-page visual SOP with annotated screenshots and step-by-step instructions.", "Task 2: Design a 3-tier training program: Fundamentals (All Staff), Advanced (Power Users), Admin.", "Task 3: Create quick-reference troubleshooting cards for common system errors."],
        practiceProblem: "Write a 5-step Standard Operating Procedure (SOP) for an operations associate to approve high-risk customer orders in the new admin portal.",
        practiceStarter: "# SOP: High-Risk Order Verification\n1. Navigate to Admin Portal -> Fraud Review Queue.\n2. Filter orders with Risk Score >= 75.\n3. Cross-reference shipping address against billing IP location.\n4. If matching, click 'Approve & Release'.\n5. If mismatch, click 'Hold & Request Identity Verification'.",
        practiceSolution: "Standard Operating Procedure (SOP) Document Verified with deterministic decision steps."
      },
      {
        dayNumber: 54,
        title: "Day 54: Post-Go-Live Adoption Tracking, Change Metrics & Value Realization",
        objective: "Track Daily Active Users (DAU), feature adoption rates, help-desk ticket velocity, and measure post-launch business value realization.",
        youtubeQuery: "Measuring Change Management Success KPIs Metrics",
        youtubeUrl: "https://www.youtube.com/results?search_query=Measuring+Change+Management+Success+KPIs+Metrics",
        videos: [
          { title: "Key Metrics to Measure Digital Transformation Success", channel: "Gartner Insights", duration: "22 mins", url: "https://www.youtube.com/results?search_query=Digital+Transformation+Metrics" }
        ],
        checklist: ["Task 1: Track the 4 Core Change KPIs: Adoption Rate (%), Proficiency Time (days), Helpdesk Velocity, Reversion Rate.", "Task 2: Build a weekly Value Realization dashboard comparing actual cost savings against business case projections.", "Task 3: Conduct post-implementation reviews to celebrate early wins and reinforce adoption."],
        practiceProblem: "Create a 30-day Post-Go-Live Adoption Dashboard metric specification for an AI analytics rollout.",
        practiceStarter: "| Metric | Target (Day 30) | Measurement Method |\n| System Adoption | >= 85% of target staff logged in weekly | Telemetry analytics |\n| Workflow Cycle Time | Reduced from 4h to <45 mins | Time tracking logs |\n| User Satisfaction | CSAT >= 4.2 / 5.0 | Post-task survey |",
        practiceSolution: "Value Realization & Adoption Metric Dashboard Verified."
      }
    ]
  },

  // =========================================================================
  // MODULE 10: PRODUCT & COMMERCIAL ANALYTICS, A/B TESTING & UNIT ECONOMICS (WEEKS 23-25)
  // =========================================================================
  {
    order: 10,
    title: "Module 10: Product & Commercial Analytics, A/B Testing & Unit Economics",
    weeks: "Weeks 23–25",
    description: "Master product growth metrics (AARRR), A/B testing statistical rigor, sample size sizing, p-values, customer lifetime value (LTV), CAC, and unit economics.",
    icon: "trending-up",
    capstoneTheme: "D2C Marketplace Growth Experimentation & Unit Economics Deck",
    capstoneBrief: "Design an end-to-end product experimentation and commercial analytics strategy for a multi-category marketplace. Calculate customer acquisition cost (CAC), lifetime value (LTV), payback periods, design an A/B test with sample sizing calculations, and model unit economics margins.",
    days: [
      {
        dayNumber: 55,
        title: "Day 55: AARRR Pirate Funnel & Product North Star Metric Architecture",
        objective: "Master the AARRR funnel (Acquisition, Activation, Retention, Referral, Revenue), define leading vs lagging indicators, and construct a North Star metric tree.",
        youtubeQuery: "AARRR Pirate Metrics Framework Product School",
        youtubeUrl: "https://www.youtube.com/results?search_query=AARRR+Pirate+Metrics+Framework+Product+School",
        videos: [
          { title: "The AARRR Pirate Metrics Framework Explained", channel: "Product School", duration: "24 mins", url: "https://www.youtube.com/results?search_query=AARRR+Pirate+Metrics" }
        ],
        checklist: ["Task 1: Map the user journey stages from ad click to recurring subscription.", "Task 2: Define an actionable 'Activation' milestone (e.g. user plays first song within 24h).", "Task 3: Build a KPI tree connecting day-to-day feature metrics to the executive North Star metric."],
        practiceProblem: "Design the AARRR funnel metrics for a B2B SaaS analytics platform, identifying the single metric for each stage.",
        practiceStarter: "Acquisition: Unique website signups\nActivation: Connect first database within 24 hours\nRetention: % active users running >=3 queries per week in Month 2\nReferral: NPS >= 50 + coworker invites sent\nRevenue: Net Monthly Recurring Revenue (MRR)",
        practiceSolution: "AARRR Metric Tree Verified with clear leading and lagging growth drivers."
      },
      {
        dayNumber: 56,
        title: "Day 56: Unit Economics: Customer Acquisition Cost (CAC) & Payback Periods",
        objective: "Calculate Blended vs Paid Customer Acquisition Cost (CAC), payback period in months, and evaluate marketing channel efficiency.",
        youtubeQuery: "SaaS Unit Economics CAC Payback Period LTV",
        youtubeUrl: "https://www.youtube.com/results?search_query=SaaS+Unit+Economics+CAC+Payback+Period+LTV",
        videos: [
          { title: "Understanding CAC and Payback Period in High-Growth Startups", channel: "Y Combinator", duration: "22 mins", url: "https://www.youtube.com/results?search_query=CAC+Payback+Y+Combinator" }
        ],
        checklist: ["Task 1: Calculate Fully Loaded CAC: (Ad Spend + Sales Salaries + Tool Costs) / Acquired Customers.", "Task 2: Compute CAC Payback Period: CAC / (Monthly ARPU * Gross Margin %).", "Task 3: Identify channels operating with under 12-month healthy payback windows."],
        practiceProblem: "A startup spends $100,000 on Google Ads and $50,000 on sales salaries to acquire 500 customers. Customers pay $150/month with 70% gross margin. Calculate CAC and Payback Period.",
        practiceStarter: "// Calculation:\nTotal Acquisition Cost = $100k + $50k = $150,000.\nCAC = $150,000 / 500 = $300.\nMonthly Gross Profit per user = $150 * 70% = $105.\nCAC Payback Period = $300 / $105 = 2.85 months.",
        practiceSolution: "Unit Economics Calculation Verified: Healthy 2.85-month payback cycle."
      },
      {
        dayNumber: 57,
        title: "Day 57: Customer Lifetime Value (LTV), Churn Rates & LTV:CAC Ratios",
        objective: "Model Customer Lifetime Value (LTV), monthly vs annual churn, expansion revenue, and benchmark the gold-standard 3:1 LTV:CAC ratio.",
        youtubeQuery: "Customer Lifetime Value LTV Calculation Formula",
        youtubeUrl: "https://www.youtube.com/results?search_query=Customer+Lifetime+Value+LTV+Calculation+Formula",
        videos: [
          { title: "How to Calculate LTV and LTV:CAC Ratio", channel: "Slidebean", duration: "18 mins", url: "https://www.youtube.com/results?search_query=LTV+CAC+Ratio" }
        ],
        checklist: ["Task 1: Calculate LTV = (ARPU * Gross Margin %) / Churn Rate.", "Task 2: Analyze the impact of reducing churn by 1% on enterprise valuation.", "Task 3: Evaluate LTV:CAC ratios: <1x (Failing), 3x (Gold Standard), >5x (Underinvesting in growth)."],
        practiceProblem: "A subscription service has $80 monthly ARPU, 80% gross margin, and 4% monthly customer churn. If CAC is $400, calculate LTV and the LTV:CAC ratio.",
        practiceStarter: "// Calculation:\nMonthly Contribution = $80 * 80% = $64.\nCustomer Lifetime (months) = 1 / 0.04 = 25 months.\nLTV = $64 * 25 = $1,600.\nLTV:CAC Ratio = $1,600 / $400 = 4.0x (Strong unit economics).",
        practiceSolution: "LTV and LTV:CAC Ratio Verified: Exemplary 4.0x business model."
      },
      {
        dayNumber: 58,
        title: "Day 58: A/B Testing Fundamentals: Hypothesis Design, Sample Size & Power",
        objective: "Formulate testable scientific hypotheses, calculate required sample size per variant using statistical power (80%) and alpha (5%), and avoid MDE pitfalls.",
        youtubeQuery: "AB Testing Calculation Sample Size Statistical Significance",
        youtubeUrl: "https://www.youtube.com/results?search_query=AB+Testing+Calculation+Sample+Size+Statistical+Significance",
        videos: [
          { title: "A/B Testing Masterclass: From Hypothesis to Sample Size", channel: "Alex The Analyst", duration: "25 mins", url: "https://www.youtube.com/results?search_query=AB+Testing+Alex+The+Analyst" }
        ],
        checklist: ["Task 1: Structure hypotheses: If we [change], then [outcome], because [behavioral reason].", "Task 2: Calculate minimum detectable effect (MDE) and sample size per variation.", "Task 3: Guard against peeking bias and sample ratio mismatch (SRM)."],
        practiceProblem: "Baseline checkout conversion rate is 5.0%. We want to detect a 10% relative uplift (to 5.5%) with 80% statistical power and 5% alpha. Calculate minimum sample size per variant.",
        practiceStarter: "// Sample Size Formula:\nBaseline: 5%, MDE: 0.5% absolute (5.5%).\nUsing Evan Miller A/B formula: ~31,000 visitors required per variant (62,000 total across Control & Treatment).",
        practiceSolution: "A/B Experiment Sizing & Statistical Power Protocol Verified."
      },
      {
        dayNumber: 59,
        title: "Day 59: Statistical Significance, P-Values, T-Tests & Experiment Pitfalls",
        objective: "Evaluate A/B test results using Two-Sample Z-tests, interpret p-values (p < 0.05), calculate confidence intervals, and identify false positive traps.",
        youtubeQuery: "StatQuest P Values and Hypothesis Testing",
        youtubeUrl: "https://www.youtube.com/results?search_query=StatQuest+P+Values+and+Hypothesis+Testing",
        videos: [
          { title: "StatQuest: P Values and Statistical Significance", channel: "StatQuest with Josh Starmer", duration: "20 mins", url: "https://www.youtube.com/results?search_query=StatQuest+P+Values" }
        ],
        checklist: ["Task 1: Formulate the Null Hypothesis (H0: No difference) and Alternative Hypothesis (H1).", "Task 2: Calculate Z-score, p-value, and 95% confidence intervals on uplift.", "Task 3: Audit experiment logs for Sample Ratio Mismatch (SRM) using Chi-Square tests."],
        practiceProblem: "Variant A has 1,000 conversions out of 20,000 visitors (5.0%). Variant B has 1,200 conversions out of 20,000 visitors (6.0%). Determine if the uplift is statistically significant at p < 0.05.",
        practiceStarter: "// Statistical Z-Test:\nConversion A = 5.0%, Conversion B = 6.0% (+20% relative uplift).\nP-value = 0.00001 (far below 0.05).\nConfidence Interval: [0.55%, 1.45%].\nDecision: Reject Null Hypothesis; deploy Variant B to 100% production.",
        practiceSolution: "Statistical Significance Z-Test & Deployment Decision Verified."
      },
      {
        dayNumber: 60,
        title: "Day 60: RFM Segmentation & Cohort Profitability Optimization",
        objective: "Score customer bases using Recency, Frequency, and Monetary (RFM) modeling, and target high-value Champions, Loyalists, and At-Risk accounts.",
        youtubeQuery: "RFM Analysis Customer Segmentation Python SQL",
        youtubeUrl: "https://www.youtube.com/results?search_query=RFM+Analysis+Customer+Segmentation+Python+SQL",
        videos: [
          { title: "Customer Segmentation with RFM Analysis", channel: "Luke Barousse", duration: "22 mins", url: "https://www.youtube.com/results?search_query=RFM+Analysis+Luke+Barousse" }
        ],
        checklist: ["Task 1: Calculate R, F, M quintiles (1-5 score) for all active customers.", "Task 2: Segment into Champions (555), At Risk (155), and Dormant (111).", "Task 3: Develop targeted reactivation and VIP reward marketing playbooks for each quadrant."],
        practiceProblem: "Write SQL or Python to compute Recency (days since last order), Frequency (total orders), and Monetary (total spend) scores for customers.",
        practiceStarter: "SELECT customer_id,\n  NTILE(5) OVER (ORDER BY MAX(order_date) DESC) as r_score,\n  NTILE(5) OVER (ORDER BY COUNT(id) ASC) as f_score,\n  NTILE(5) OVER (ORDER BY SUM(total_amount) ASC) as m_score\nFROM orders GROUP BY customer_id;",
        practiceSolution: "SELECT customer_id, NTILE(5) OVER (ORDER BY MAX(order_date) DESC) as r_score, NTILE(5) OVER (ORDER BY COUNT(id) ASC) as f_score, NTILE(5) OVER (ORDER BY SUM(total_amount) ASC) as m_score FROM orders GROUP BY customer_id;"
      }
    ]
  },

  // =========================================================================
  // MODULE 11: C-SUITE CONSULTING CASE STUDIES & INTERVIEW GRILLING (WEEKS 26-28)
  // =========================================================================
  {
    order: 11,
    title: "Module 11: C-Suite Consulting Case Studies & Interview Grilling",
    weeks: "Weeks 26–28",
    description: "Master McKinsey Minto Pyramid communication, solve C-suite business case studies, prepare for PL-300 / ECBA certification drills, and defend your portfolio under rigorous 12 LPA mock interview grilling.",
    icon: "briefcase",
    capstoneTheme: "Final 12 LPA Portfolio Defense & Board-Level Strategy Case Study",
    capstoneBrief: "Defend your complete technical and strategic body of work before a mock C-suite executive panel. Present a comprehensive 15-slide consulting deck diagnosing a multi-million dollar business turnaround, supported by live SQL/DAX models and risk analysis.",
    days: [
      {
        dayNumber: 61,
        title: "Day 61: The McKinsey Minto Pyramid Principle & Executive Synthesis",
        objective: "Structure C-level presentations leading with the core recommendation first (Answer First / Top-Down), supported by MECE argument groupings.",
        youtubeQuery: "Minto Pyramid Principle Explained McKinsey",
        youtubeUrl: "https://www.youtube.com/results?search_query=Minto+Pyramid+Principle+Explained+McKinsey",
        videos: [
          { title: "The Minto Pyramid Principle: Executive Communication", channel: "Strategy Consulting Philosophy", duration: "25 mins", url: "https://www.youtube.com/results?search_query=Minto+Pyramid+Principle" }
        ],
        checklist: ["Task 1: Structure an executive memo using the SCQA framework (Situation, Complication, Question, Answer).", "Task 2: Ensure supporting bullet points satisfy MECE (Mutually Exclusive, Collectively Exhaustive).", "Task 3: Strip technical implementation details from the C-suite summary slide."],
        practiceProblem: "Re-write a 3-page technical database crash report into a 3-bullet Minto Pyramid executive briefing for the CEO.",
        practiceStarter: "// Minto Executive Synthesis:\nCore Recommendation: Invest $80k in a multi-region database replica to eliminate customer checkout downtime.\n1. Root Cause: Single-point-of-failure database overload during flash sales.\n2. Business Impact: $340k in lost GMV across 4 hours of downtime.\n3. Implementation: 3-week rollout with zero customer interruption.",
        practiceSolution: "Minto Pyramid SCQA Executive Synthesis Verified with MECE supporting pillars."
      },
      {
        dayNumber: 62,
        title: "Day 62: Market Sizing, TAM/SAM/SOM & Cost-Benefit Analysis (CBA)",
        objective: "Perform top-down and bottom-up market sizing calculations (TAM, SAM, SOM) and build formal Cost-Benefit Analysis (CBA) financial models.",
        youtubeQuery: "Market Sizing TAM SAM SOM Consulting Case Interview",
        youtubeUrl: "https://www.youtube.com/results?search_query=Market+Sizing+TAM+SAM+SOM+Consulting+Case+Interview",
        videos: [
          { title: "TAM, SAM, SOM Market Sizing Case Interview Framework", channel: "Case Interview Prep", duration: "20 mins", url: "https://www.youtube.com/results?search_query=TAM+SAM+SOM+Case+Interview" }
        ],
        checklist: ["Task 1: Calculate Total Addressable Market (TAM) using top-down demographic filtering.", "Task 2: Calculate Serviceable Obtainable Market (SOM) based on current go-to-market channels.", "Task 3: Compute Net Present Value (NPV) and Internal Rate of Return (IRR) in an executive CBA model."],
        practiceProblem: "Calculate the TAM and SAM for an electric two-wheeler delivery subscription service in Tier-1 Indian cities.",
        practiceStarter: "// Market Sizing:\nTotal Tier-1 Delivery Riders: 2.5 Million riders.\nEV Adoption Target (TAM): 2.5M * $1,200 annual subscription = $3.0 Billion.\nServiceable Addressable Market (SAM): Top 4 cities (60% of volume) = $1.8 Billion.",
        practiceSolution: "TAM/SAM/SOM Bottom-Up Sizing Model Verified with defensible assumptions."
      },
      {
        dayNumber: 63,
        title: "Day 63: Profitability Diagnostics, Root-Cause Fishbone & Decision Trees",
        objective: "Deconstruct multi-million dollar corporate margin declines using Profit Trees (Revenue vs Cost branches) and Ishikawa Fishbone root-cause diagrams.",
        youtubeQuery: "Profitability Framework Case Interview Victor Cheng",
        youtubeUrl: "https://www.youtube.com/results?search_query=Profitability+Framework+Case+Interview+Victor+Cheng",
        videos: [
          { title: "Cracking Profitability Cases: The Ultimate Consulting Framework", channel: "CaseCoach", duration: "28 mins", url: "https://www.youtube.com/results?search_query=Profitability+Framework+Case+Interview" }
        ],
        checklist: ["Task 1: Decompose Profit = (Price * Volume) - (Fixed Costs + Variable Costs).", "Task 2: Build a MECE issue tree to isolate whether a margin drop is a Price, Volume, or Cost driver.", "Task 3: Formulate a 3-part turnaround action plan with risk mitigation."],
        practiceProblem: "A ride-hailing company's net margin dropped by 15% despite a 20% increase in completed rides. Construct the diagnostic issue tree to locate the profit leak.",
        practiceStarter: "// Diagnostic Profit Tree:\nProfit = (Rides * Price) - (Driver Incentives + Customer Discounts + Ops Cost)\nFinding: Completed rides increased by 20%, but Driver Incentives surged by 55% due to competitor price wars, eroding unit margin.\nTurnaround: Target incentives to off-peak slots and introduce loyalty tiers.",
        practiceSolution: "Profitability Issue Tree & Margin Leak Diagnostics Verified."
      },
      {
        dayNumber: 64,
        title: "Day 64: Executive Deck Creation, Boardroom Storyboarding & C-Suite Memos",
        objective: "Design 10-slide boardroom consulting presentations with action titles, ghost decks, data callout boxes, and zero clutter.",
        youtubeQuery: "Consulting Slide Design Best Practices McKinsey BCG",
        youtubeUrl: "https://www.youtube.com/results?search_query=Consulting+Slide+Design+Best+Practices+McKinsey+BCG",
        videos: [
          { title: "How Consultants Design Board-Level Presentation Slides", channel: "Firm Learning", duration: "24 mins", url: "https://www.youtube.com/results?search_query=Firm+Learning+Slide+Design" }
        ],
        checklist: ["Task 1: Write action titles that tell the story even if the audience only reads the headlines.", "Task 2: Structure slide bodies into 3 distinct vertical takeaway columns.", "Task 3: Anchor every claim with a specific quantitative data metric callout."],
        practiceProblem: "Create a 3-slide storyboarding outline for presenting an AI automation initiative to the Board of Directors.",
        practiceStarter: "Slide 1 Headline: Manual invoice processing costs $1.2M annually with a 9-day cycle time.\nSlide 2 Headline: AI-powered 3-way matching reduces processing latency by 85% with an initial $250k investment.\nSlide 3 Headline: Projected net 3-year savings reach $2.8M with a payback period of 4.2 months.",
        practiceSolution: "C-Suite Presentation Storyboard Verified with compelling action titles."
      },
      {
        dayNumber: 65,
        title: "Day 65: Socratic Technical & Behavioral Interview Grilling Drills",
        objective: "Master STAR behavioral storytelling, handle adversarial technical grilling on trade-offs, and defend analytical models under pressure.",
        youtubeQuery: "Business Analyst Mock Interview Grilling Questions",
        youtubeUrl: "https://www.youtube.com/results?search_query=Business+Analyst+Mock+Interview+Grilling+Questions",
        videos: [
          { title: "Senior Business Analyst Mock Interview with Feedback", channel: "The Career Force", duration: "35 mins", url: "https://www.youtube.com/results?search_query=BA+Mock+Interview" }
        ],
        checklist: ["Task 1: Structure behavioral answers using STAR (Situation, Task, Action, Result).", "Task 2: Answer the challenging question: 'Walk me through a time your data model was wrong and what you did.'", "Task 3: Defend architectural tradeoffs: When would you choose Python over SQL, or Power BI over custom web dashboards?"],
        practiceProblem: "Formulate a compelling STAR behavioral response to: 'Describe a project where stakeholders rejected your recommendation.'",
        practiceStarter: "Situation: Marketing VP wanted to double ad spend on influencer campaigns.\nTask: Evaluate incremental ROI from historical attribution logs.\nAction: Uncovered 45% coupon cannibalization using window joins and presented findings diplomatically.\nResult: Diverted $200k ad spend to high-intent search ads, increasing net GMV by 18%.",
        practiceSolution: "STAR Method Executive Interview Defense Verified."
      },
      {
        dayNumber: 66,
        title: "Day 66: Final 12 LPA Portfolio Defense, Capstone Showcase & Offer Strategy",
        objective: "Deliver a polished 12 LPA portfolio defense, navigate salary negotiations, and position yourself as a high-impact technical Business Analyst.",
        youtubeQuery: "Tech Salary Negotiation Strategies 12 LPA Career",
        youtubeUrl: "https://www.youtube.com/results?search_query=Tech+Salary+Negotiation+Strategies",
        videos: [
          { title: "How to Negotiate Your Tech Offer with Confidence", channel: "Jeff Su", duration: "20 mins", url: "https://www.youtube.com/results?search_query=Salary+Negotiation+Jeff+Su" }
        ],
        checklist: ["Task 1: Structure a 5-minute portfolio walkthrough showcasing your end-to-end GitHub projects and live Power BI dashboards.", "Task 2: Anchor salary negotiations at ₹12,00,000+ PA with documented evidence of business impact.", "Task 3: Formulate intelligent questions for hiring managers that demonstrate strategic business leadership."],
        practiceProblem: "Write your 60-second executive elevator pitch positioning your hybrid profile: technical data modeling (SQL/Python/DAX) combined with business systems leadership (BRD/Agile/AI).",
        practiceStarter: "Elevator Pitch: 'I operate at the intersection of technical analytics and business strategy. I write production SQL and Python pipelines, model dimensional star schemas in Power BI, and translate complex requirements into investor-grade BRDs. In past projects, I’ve automated financial reconciliation, cut processing latency by 85%, and identified $300k+ in profit leaks. I'm ready to drive measurable 12 LPA revenue impact from Day 1.'",
        practiceSolution: "Executive 60-Second Elevator Pitch Verified for 12 LPA offer positioning."
      }
    ]
  }
];
