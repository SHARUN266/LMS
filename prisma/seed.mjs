import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with full Masai-Style BI & Analytics Engineering Curriculum (Days 1 to 6 + Monday Exam)...");

  // Clear existing records
  await prisma.evaluation.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignmentQuestion.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.practiceExercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.projectEvaluation.deleteMany();
  await prisma.projectSubmission.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.day.deleteMany();
  await prisma.week.deleteMany();
  await prisma.module.deleteMany();
  await prisma.track.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.backlogItem.deleteMany();
  await prisma.remedialDrill.deleteMany();
  await prisma.mentorMessage.deleteMany();

  // 1. User Profile
  const user = await prisma.userProfile.create({
    data: {
      id: "user_default",
      name: "Aman Gupta",
      targetRole: "BI / Analytics Engineer",
      dailyStudyGoal: 6,
      currentStreak: 12,
      longestStreak: 15,
      totalStudyMins: 2840,
      xp: 1450,
      level: 3,
    },
  });

  // 2. Track
  const track = await prisma.track.create({
    data: {
      slug: "bi-analytics-engineer",
      title: "BI & Analytics Engineering (Career Transition Track)",
      description: "Complete 20-week rigorous bootcamp preparing career-switchers for Analytics Engineer, Data Analyst, and BI Developer roles.",
    },
  });

  // 3. Module 1
  const module1 = await prisma.module.create({
    data: {
      trackId: track.id,
      order: 1,
      title: "Module 1: Advanced SQL for Analytics Engineering",
      description: "Master relational modeling, complex multi-table joins, subqueries, CTEs, analytical window functions, performance optimization, and business metric calculations.",
      icon: "database",
    },
  });

  // 4. Week 1
  const week1 = await prisma.week.create({
    data: {
      moduleId: module1.id,
      weekNumber: 1,
      title: "Week 1: Foundations, Advanced Joins & Analytical Window Functions",
    },
  });

  // --- DAY 1 ---
  const day1 = await prisma.day.create({
    data: {
      weekId: week1.id,
      dayNumber: 1,
      title: "Day 1: Multi-Table Joins, Complex Aggregations & Business Metrics",
      objective: "Master INNER, LEFT, FULL OUTER joins, aggregate mechanics, and fan-out prevention in multi-table reporting.",
      estimatedMins: 240,
      isUnlocked: true,
      isCompleted: true,
      score: 88,
    },
  });

  await prisma.lesson.create({
    data: {
      dayId: day1.id,
      title: "Relational Data Modeling & Joins Architecture",
      content: `# Relational Data Modeling & Joins

In enterprise analytics, data is normalized across dimension (entities) and fact (events/transactions) tables.

## 1. Join Mechanics & Core Cardinalities
- **INNER JOIN**: Returns rows only when join predicates match in both tables.
- **LEFT JOIN**: Preserves all rows from the primary left table; fills non-matching right columns with \`NULL\`.
- **FULL OUTER JOIN**: Preserves all rows from both tables, pairing matching rows.
- **CROSS JOIN**: Produces the Cartesian product of two relations (critical for date scaffolding).

## 2. Preventing Data Duplication (Fan-Out)
> [!WARNING]
> Joining a 1-to-many relationship multiple times causes **Row Multiplication (Fan-out)** and artificially inflates financial metrics!

\`\`\`sql
-- Safe aggregation using pre-aggregated CTE
WITH CustomerSpend AS (
    SELECT customer_id, SUM(total_amount) AS total_spent, COUNT(id) AS order_count
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY customer_id
)
SELECT 
    c.name, 
    c.city, 
    COALESCE(cs.total_spent, 0) AS total_revenue,
    COALESCE(cs.order_count, 0) AS orders_placed
FROM customers c
LEFT JOIN CustomerSpend cs ON c.id = cs.customer_id;
\`\`\`
`,
      cheatSheet: `SELECT c.name, COUNT(o.id) as order_count, SUM(o.total_amount) as total_val\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING SUM(o.total_amount) > 1000;`,
      quickQuiz: JSON.stringify([
        {
          question: "What happens to sum aggregates if you join a customer to orders and support tickets without pre-aggregating?",
          options: ["Sums will double or triple due to fan-out Cartesian join", "PostgreSQL automatically removes duplicate sums", "The query fails with syntax error"],
          correctAnswer: "Sums will double or triple due to fan-out Cartesian join",
        },
        {
          question: "Which join type is best suited to find customers who have NEVER placed an order?",
          options: ["LEFT JOIN with WHERE orders.id IS NULL", "INNER JOIN with WHERE orders.id = 0", "CROSS JOIN with LIMIT 1"],
          correctAnswer: "LEFT JOIN with WHERE orders.id IS NULL",
        },
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day1.id,
      order: 1,
      title: "Drill 1: Customer Lifetime Spend by City",
      difficulty: "Beginner",
      problem: "Write a SQL query to calculate total revenue, number of completed orders, and average order value for each customer city. Filter for COMPLETED orders only and sort by total revenue descending.",
      starterCode: `SELECT 
  c.city,
  COUNT(o.id) AS total_orders,
  SUM(o.total_amount) AS total_revenue,
  AVG(o.total_amount) AS avg_order_value
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
GROUP BY c.city
ORDER BY total_revenue DESC;`,
      solution: "SELECT c.city, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_revenue, AVG(o.total_amount) AS avg_order_value FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.status = 'COMPLETED' GROUP BY c.city ORDER BY total_revenue DESC;",
      hints: JSON.stringify([
        "Filter for orders where status = 'COMPLETED'",
        "Aggregate using COUNT(o.id), SUM(o.total_amount), AVG(o.total_amount)",
        "Group by c.city and sort by total_revenue DESC",
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day1.id,
      order: 2,
      title: "Drill 2: Zero-Order Accounts Identification",
      difficulty: "Intermediate",
      problem: "Write a query to list all customer names and emails who have zero orders in the database. Use a LEFT JOIN and NULL check.",
      starterCode: `SELECT c.id, c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;`,
      solution: "SELECT c.id, c.name, c.email FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL;",
      hints: JSON.stringify([
        "LEFT JOIN customers on orders",
        "Add WHERE o.id IS NULL to isolate accounts with zero matching orders",
      ]),
    },
  });

  const assign1 = await prisma.assignment.create({
    data: {
      dayId: day1.id,
      title: "Daily Assignment 1: Enterprise Customer Cohorts",
      type: "SQL",
      description: "Analyze enterprise customer purchasing behavior and identify high-value accounts with repeat orders.",
      deadlineHours: 24,
    },
  });

  await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assign1.id,
      order: 1,
      category: "SQL",
      prompt: "Find all Enterprise segment customers who have placed at least 2 completed orders. Return customer name, email, completed order count, and total spend.",
      starterCode: `SELECT 
  c.name, 
  c.email, 
  COUNT(o.id) AS order_count, 
  SUM(o.total_amount) AS total_spend
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE c.segment = 'Enterprise' AND o.status = 'COMPLETED'
GROUP BY c.id, c.name, c.email
HAVING COUNT(o.id) >= 2
ORDER BY total_spend DESC;`,
      weight: 100,
    },
  });

  // --- DAY 2 ---
  const day2 = await prisma.day.create({
    data: {
      weekId: week1.id,
      dayNumber: 2,
      title: "Day 2: Analytical Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD)",
      objective: "Master partitioned calculations, running totals, customer retention intervals, and cumulative metrics without row collapse.",
      estimatedMins: 240,
      isUnlocked: true,
      isCompleted: false,
    },
  });

  await prisma.lesson.create({
    data: {
      dayId: day2.id,
      title: "Analytical Window Functions Deep Dive",
      content: `# Analytical Window Functions

Unlike \`GROUP BY\` which collapses rows into summary groups, **Window Functions** compute values over a defined slice (window) of rows while preserving each individual row!

## 1. Window Function Syntax
\`\`\`sql
FUNCTION() OVER (
    PARTITION BY partition_column
    ORDER BY sort_column
    ROWS/RANGE BETWEEN ...
)
\`\`\`

## 2. Key Ranking Functions
- \`ROW_NUMBER()\`: Assigns sequential integers (1, 2, 3, 4) - unique per partition.
- \`RANK()\`: Assigns ranks with gaps for ties (1, 2, 2, 4).
- \`DENSE_RANK()\`: Assigns ranks without gaps (1, 2, 2, 3).

## 3. Offset Functions for Retention & Velocity
- \`LAG(col, 1)\`: Pulls value from previous row in the partition.
- \`LEAD(col, 1)\`: Pulls value from subsequent row in the partition.
`,
      cheatSheet: `SELECT id, customer_id, total_amount,\n  SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as running_total,\n  DENSE_RANK() OVER (ORDER BY total_amount DESC) as spend_rank\nFROM orders;`,
      quickQuiz: JSON.stringify([
        {
          question: "What rank will DENSE_RANK() assign to the next item if two items tie for rank 1?",
          options: ["Rank 2 (no gaps)", "Rank 3 (skips a number)", "Rank 1 again"],
          correctAnswer: "Rank 2 (no gaps)",
        },
        {
          question: "Which window function allows you to calculate days between successive purchases for the same user?",
          options: ["LAG(order_date, 1) OVER (PARTITION BY user_id ORDER BY order_date)", "SUM(order_date) OVER ()", "NTILE(4) OVER ()"],
          correctAnswer: "LAG(order_date, 1) OVER (PARTITION BY user_id ORDER BY order_date)",
        },
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day2.id,
      order: 1,
      title: "Drill 1: Top 2 Most Expensive Products per Category",
      difficulty: "Intermediate",
      problem: "Write a query to find the top 2 highest priced products within each product category using DENSE_RANK(). Return category, product name, and price.",
      starterCode: `WITH RankedProducts AS (
  SELECT 
    category,
    name,
    price,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk
  FROM products
)
SELECT category, name, price, rnk
FROM RankedProducts
WHERE rnk <= 2
ORDER BY category, price DESC;`,
      solution: "WITH RankedProducts AS (SELECT category, name, price, DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk FROM products) SELECT category, name, price, rnk FROM RankedProducts WHERE rnk <= 2 ORDER BY category, price DESC;",
      hints: JSON.stringify([
        "Partition by category and order by price DESC",
        "Wrap the ranking query inside a CTE named RankedProducts",
        "Filter WHERE rnk <= 2 in the outer SELECT",
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day2.id,
      order: 2,
      title: "Drill 2: Cumulative Customer Revenue Stream",
      difficulty: "Intermediate",
      problem: "Write a query calculating the running total of completed orders for each customer ordered by order_date.",
      starterCode: `SELECT 
  customer_id,
  order_date,
  total_amount,
  SUM(total_amount) OVER (
    PARTITION BY customer_id 
    ORDER BY order_date
  ) AS running_total
FROM orders
WHERE status = 'COMPLETED'
ORDER BY customer_id, order_date;`,
      solution: "SELECT customer_id, order_date, total_amount, SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total FROM orders WHERE status = 'COMPLETED' ORDER BY customer_id, order_date;",
      hints: JSON.stringify([
        "Use SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date)",
        "Filter for status = 'COMPLETED'",
      ]),
    },
  });

  const assign2 = await prisma.assignment.create({
    data: {
      dayId: day2.id,
      title: "Daily Assignment 2: Running Totals & Customer Order Velocity",
      type: "SQL",
      description: "Compute cumulative revenue trends and days elapsed between consecutive orders for each customer.",
      deadlineHours: 24,
    },
  });

  await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assign2.id,
      order: 1,
      category: "SQL",
      prompt: "For each customer, calculate their running total spend across completed orders ordered chronologically. Also calculate the previous order amount using LAG().",
      starterCode: `SELECT 
  c.name AS customer_name,
  o.id AS order_id,
  o.order_date,
  o.total_amount,
  SUM(o.total_amount) OVER (
    PARTITION BY c.id 
    ORDER BY o.order_date
  ) AS running_total,
  LAG(o.total_amount, 1) OVER (
    PARTITION BY c.id 
    ORDER BY o.order_date
  ) AS prev_order_amount
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
ORDER BY c.name, o.order_date;`,
      weight: 100,
    },
  });

  // --- DAY 3 ---
  const day3 = await prisma.day.create({
    data: {
      weekId: week1.id,
      dayNumber: 3,
      title: "Day 3: Common Table Expressions (CTEs), Subqueries & Modular Pipelines",
      objective: "Build maintainable, modular SQL pipelines using WITH clauses, recursive hierarchies, and multi-stage transformations.",
      estimatedMins: 240,
      isUnlocked: true,
      isCompleted: false,
    },
  });

  await prisma.lesson.create({
    data: {
      dayId: day3.id,
      title: "Modular Analytics Pipelines with CTEs",
      content: `# Common Table Expressions (CTEs) & Modular SQL

In enterprise analytics engineering, monolithic queries are unmaintainable. **CTEs (Common Table Expressions)** allow you to write clean, self-documenting, multi-stage DAGs.

## 1. Multi-Stage CTE Architecture
\`\`\`sql
WITH RawOrders AS (
    SELECT customer_id, DATE(order_date) AS order_dt, total_amount
    FROM orders
    WHERE status = 'COMPLETED'
),
CustomerFirstOrder AS (
    SELECT customer_id, MIN(order_dt) AS cohort_date
    FROM RawOrders
    GROUP BY customer_id
)
SELECT 
    r.customer_id, 
    c.cohort_date, 
    r.order_dt, 
    r.total_amount
FROM RawOrders r
JOIN CustomerFirstOrder c ON r.customer_id = c.customer_id;
\`\`\`
`,
      cheatSheet: `WITH MonthlyAgg AS (\n  SELECT strftime('%Y-%m', order_date) AS month, SUM(total_amount) AS rev\n  FROM orders GROUP BY 1\n)\nSELECT month, rev, LAG(rev) OVER (ORDER BY month) AS prev_rev\nFROM MonthlyAgg;`,
      quickQuiz: JSON.stringify([
        {
          question: "Why are CTEs preferred over nested subqueries in analytics engineering?",
          options: ["They read top-to-bottom like modular functions and prevent redundant subquery scans", "They run 100x faster automatically in all databases", "Subqueries cannot use WHERE clauses"],
          correctAnswer: "They read top-to-bottom like modular functions and prevent redundant subquery scans",
        },
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day3.id,
      order: 1,
      title: "Drill 1: Multi-Stage Customer Spend Cohort CTE",
      difficulty: "Intermediate",
      problem: "Write a query with 2 CTEs: (1) calculate total spend per customer, (2) classify customers into 'High Value' (>$1000) or 'Standard'. Return customer name, city, total spend, and tier.",
      starterCode: `WITH SpendSummary AS (
  SELECT customer_id, SUM(total_amount) AS total_spend
  FROM orders
  WHERE status = 'COMPLETED'
  GROUP BY customer_id
),
CustomerTiers AS (
  SELECT 
    customer_id, 
    total_spend,
    CASE WHEN total_spend >= 1000 THEN 'High Value' ELSE 'Standard' END AS tier
  FROM SpendSummary
)
SELECT c.name, c.city, ct.total_spend, ct.tier
FROM customers c
JOIN CustomerTiers ct ON c.id = ct.customer_id
ORDER BY ct.total_spend DESC;`,
      solution: "WITH SpendSummary AS (SELECT customer_id, SUM(total_amount) AS total_spend FROM orders WHERE status = 'COMPLETED' GROUP BY customer_id), CustomerTiers AS (SELECT customer_id, total_spend, CASE WHEN total_spend >= 1000 THEN 'High Value' ELSE 'Standard' END AS tier FROM SpendSummary) SELECT c.name, c.city, ct.total_spend, ct.tier FROM customers c JOIN CustomerTiers ct ON c.id = ct.customer_id ORDER BY ct.total_spend DESC;",
      hints: JSON.stringify([
        "Create SpendSummary CTE aggregating SUM(total_amount) grouped by customer_id",
        "Create CustomerTiers CTE using CASE WHEN total_spend >= 1000",
        "Join back to customers table in the outer SELECT",
      ]),
    },
  });

  const assign3 = await prisma.assignment.create({
    data: {
      dayId: day3.id,
      title: "Daily Assignment 3: Month-over-Month Revenue Growth Pipeline",
      type: "SQL",
      description: "Build a multi-stage CTE pipeline calculating monthly revenue and percentage growth over the previous month.",
      deadlineHours: 24,
    },
  });

  await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assign3.id,
      order: 1,
      category: "SQL",
      prompt: "Construct a CTE named MonthlyRevenue that sums completed orders by month. In the outer query, use LAG() to compute previous month revenue and percentage change.",
      starterCode: `WITH MonthlyRevenue AS (
  SELECT 
    strftime('%Y-%m', order_date) AS order_month,
    SUM(total_amount) AS monthly_revenue
  FROM orders
  WHERE status = 'COMPLETED'
  GROUP BY strftime('%Y-%m', order_date)
)
SELECT 
  order_month,
  monthly_revenue,
  LAG(monthly_revenue, 1) OVER (ORDER BY order_month) AS prev_month_revenue,
  ROUND(((monthly_revenue - LAG(monthly_revenue, 1) OVER (ORDER BY order_month)) / LAG(monthly_revenue, 1) OVER (ORDER BY order_month)) * 100, 2) AS mom_growth_pct
FROM MonthlyRevenue
ORDER BY order_month;`,
      weight: 100,
    },
  });

  // --- DAY 4 ---
  const day4 = await prisma.day.create({
    data: {
      weekId: week1.id,
      dayNumber: 4,
      title: "Day 4: Conditional Aggregation, Pivot Reports & NULL Coalescing",
      objective: "Transform rows into column reports using CASE WHEN, aggregate pivots, and handle NULL values safely in mathematical models.",
      estimatedMins: 240,
      isUnlocked: false,
      isCompleted: false,
    },
  });

  await prisma.lesson.create({
    data: {
      dayId: day4.id,
      title: "Conditional Aggregation & Pivot Analytics",
      content: `# Conditional Aggregations & Pivot Reporting

Converting transactional rows into multi-dimensional matrix reports is a core Analytics Engineer responsibility.

## 1. Pivot Syntax with CASE WHEN
\`\`\`sql
SELECT 
    customer_id,
    SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END) AS completed_rev,
    SUM(CASE WHEN status = 'CANCELLED' THEN total_amount ELSE 0 END) AS cancelled_rev,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_orders
FROM orders
GROUP BY customer_id;
\`\`\`
`,
      cheatSheet: `SELECT category, SUM(CASE WHEN price > 100 THEN 1 ELSE 0 END) AS premium_count FROM products GROUP BY category;`,
      quickQuiz: JSON.stringify([
        {
          question: "Why should you use ELSE 0 in SUM(CASE WHEN...) instead of omitting ELSE?",
          options: ["Omitting ELSE yields NULL which makes the sum NULL if no rows match", "Omitting ELSE causes a database crash", "There is no difference"],
          correctAnswer: "Omitting ELSE yields NULL which makes the sum NULL if no rows match",
        },
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day4.id,
      order: 1,
      title: "Drill 1: Order Status Pivot Breakdown per Customer",
      difficulty: "Intermediate",
      problem: "Write a SQL query using conditional aggregation to return each customer's name, their total COMPLETED spend, and count of CANCELLED orders.",
      starterCode: `SELECT 
  c.name,
  SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END) AS completed_spend,
  COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) AS cancelled_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;`,
      solution: "SELECT c.name, SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END) AS completed_spend, COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) AS cancelled_count FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name;",
      hints: JSON.stringify([
        "Use SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END)",
        "Use COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END)",
      ]),
    },
  });

  const assign4 = await prisma.assignment.create({
    data: {
      dayId: day4.id,
      title: "Daily Assignment 4: Executive Matrix Pivot Report",
      type: "SQL",
      description: "Build a cross-tab pivot reporting revenue by product category across Enterprise vs Retail customer segments.",
      deadlineHours: 24,
    },
  });

  await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assign4.id,
      order: 1,
      category: "SQL",
      prompt: "Write a query aggregating orders by category with columns for Enterprise Revenue and Retail Revenue.",
      starterCode: `SELECT 
  p.category,
  SUM(CASE WHEN c.segment = 'Enterprise' THEN o.total_amount ELSE 0 END) AS enterprise_revenue,
  SUM(CASE WHEN c.segment = 'Retail' THEN o.total_amount ELSE 0 END) AS retail_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
WHERE o.status = 'COMPLETED'
GROUP BY p.category;`,
      weight: 100,
    },
  });

  // --- DAY 5 ---
  const day5 = await prisma.day.create({
    data: {
      weekId: week1.id,
      dayNumber: 5,
      title: "Day 5: Query Execution Plans, B-Tree Indexing & Performance Tuning",
      objective: "Profile queries with EXPLAIN ANALYZE, design composite indexes, and eliminate Sequential Table Scans.",
      estimatedMins: 240,
      isUnlocked: false,
      isCompleted: false,
    },
  });

  await prisma.lesson.create({
    data: {
      dayId: day5.id,
      title: "Query Profiling & Index Optimization",
      content: `# Query Plans, Indexing & Performance Optimization

When analyzing tables with 10M+ records, poorly indexed queries take minutes instead of milliseconds.

## 1. Anatomy of an EXPLAIN Plan
- **Seq Scan (Sequential Scan)**: Reads every page on disk. Costly on large tables.
- **Index Scan**: Traverses B-Tree directly to row pointers. Highly efficient.
- **Index Only Scan**: All required columns exist in the index (covering index); zero heap reads.

## 2. SARGable Queries (Search Argument Able)
> [!IMPORTANT]
> Wrapping indexed columns in functions (e.g. \`WHERE YEAR(order_date) = 2024\`) disables index usage! Always write SARGable range predicates:
\`\`\`sql
-- SARGable: Uses B-Tree index on order_date
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'
\`\`\`
`,
      cheatSheet: `CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);\nEXPLAIN SELECT * FROM orders WHERE customer_id = '123' AND order_date >= '2024-01-01';`,
      quickQuiz: JSON.stringify([
        {
          question: "Which WHERE clause is SARGable and properly utilizes an index on created_at?",
          options: [
            "created_at >= '2024-01-01' AND created_at < '2024-02-01'",
            "DATE(created_at) = '2024-01-01'",
            "strftime('%Y', created_at) = '2024'",
          ],
          correctAnswer: "created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        },
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day5.id,
      order: 1,
      title: "Drill 1: SARGable Range Optimization",
      difficulty: "Intermediate",
      problem: "Refactor a non-SARGable query to use explicit date bounds so it can leverage index scans.",
      starterCode: `SELECT id, customer_id, total_amount, order_date
FROM orders
WHERE order_date >= '2024-01-01' AND order_date < '2024-04-01'
  AND status = 'COMPLETED'
ORDER BY order_date DESC;`,
      solution: "SELECT id, customer_id, total_amount, order_date FROM orders WHERE order_date >= '2024-01-01' AND order_date < '2024-04-01' AND status = 'COMPLETED' ORDER BY order_date DESC;",
      hints: JSON.stringify([
        "Avoid using DATE(order_date) in WHERE clauses",
        "Use explicit >= and < string timestamp bounds",
      ]),
    },
  });

  const assign5 = await prisma.assignment.create({
    data: {
      dayId: day5.id,
      title: "Daily Assignment 5: High-Throughput Index Tuning",
      type: "SQL",
      description: "Write an optimized composite indexing strategy and filtered summary query for high-volume analytics.",
      deadlineHours: 24,
    },
  });

  await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assign5.id,
      order: 1,
      category: "SQL",
      prompt: "Write a high-performance query finding all completed orders for customer segments with average basket size > $500.",
      starterCode: `WITH HighBasketCustomers AS (
  SELECT customer_id, AVG(total_amount) AS avg_spend
  FROM orders
  WHERE status = 'COMPLETED'
  GROUP BY customer_id
  HAVING AVG(total_amount) > 500
)
SELECT c.name, c.email, h.avg_spend
FROM customers c
JOIN HighBasketCustomers h ON c.id = h.customer_id
ORDER BY h.avg_spend DESC;`,
      weight: 100,
    },
  });

  // --- DAY 6 ---
  const day6 = await prisma.day.create({
    data: {
      weekId: week1.id,
      dayNumber: 6,
      title: "Day 6: Synthesis, Edge Cases & Weekly Assessment Readiness",
      objective: "Synthesize joins, window functions, CTEs, and conditional aggregates in mock interview scenarios before Monday Exam Hall.",
      estimatedMins: 240,
      isUnlocked: false,
      isCompleted: false,
    },
  });

  await prisma.lesson.create({
    data: {
      dayId: day6.id,
      title: "Synthesis & Production Edge Cases",
      content: `# Synthesis, Edge Cases & Production Readiness

Before stepping into the Monday Weekly Exam Hall, you must synthesize every tool in your SQL arsenal:
1. Multi-table joins with fan-out safeguards.
2. Window functions (\`ROW_NUMBER\`, \`DENSE_RANK\`, \`LAG\`, \`LEAD\`, \`NTILE\`).
3. Multi-CTE architecture.
4. NULL safety and defensive casting.
`,
      cheatSheet: `WITH RankedSpend AS (\n  SELECT customer_id, SUM(total_amount) as spend,\n    DENSE_RANK() OVER (ORDER BY SUM(total_amount) DESC) as rnk\n  FROM orders WHERE status = 'COMPLETED' GROUP BY customer_id\n)\nSELECT * FROM RankedSpend WHERE rnk <= 5;`,
      quickQuiz: JSON.stringify([
        {
          question: "Which combination of SQL clauses allows you to compute customer lifetime spend, rank customers, and filter for top 10?",
          options: ["CTE + DENSE_RANK() OVER (...) + outer WHERE rnk <= 10", "HAVING DENSE_RANK() <= 10 directly in GROUP BY", "WHERE DENSE_RANK() <= 10"],
          correctAnswer: "CTE + DENSE_RANK() OVER (...) + outer WHERE rnk <= 10",
        },
      ]),
    },
  });

  await prisma.practiceExercise.create({
    data: {
      dayId: day6.id,
      order: 1,
      title: "Drill 1: Top Customer per City with Spend Threshold",
      difficulty: "Advanced",
      problem: "Write a query using CTEs and DENSE_RANK() to find the #1 highest spending customer in each city who has spent over $500 total.",
      starterCode: `WITH CityCustomerSpend AS (
  SELECT 
    c.city,
    c.name,
    SUM(o.total_amount) AS total_spend,
    DENSE_RANK() OVER (PARTITION BY c.city ORDER BY SUM(o.total_amount) DESC) AS rnk
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  WHERE o.status = 'COMPLETED'
  GROUP BY c.city, c.name
)
SELECT city, name, total_spend
FROM CityCustomerSpend
WHERE rnk = 1 AND total_spend > 500
ORDER BY total_spend DESC;`,
      solution: "WITH CityCustomerSpend AS (SELECT c.city, c.name, SUM(o.total_amount) AS total_spend, DENSE_RANK() OVER (PARTITION BY c.city ORDER BY SUM(o.total_amount) DESC) AS rnk FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.status = 'COMPLETED' GROUP BY c.city, c.name) SELECT city, name, total_spend FROM CityCustomerSpend WHERE rnk = 1 AND total_spend > 500 ORDER BY total_spend DESC;",
      hints: JSON.stringify([
        "Partition by city and order by SUM(total_amount) DESC",
        "Filter for rnk = 1 and total_spend > 500 in outer query",
      ]),
    },
  });

  const assign6 = await prisma.assignment.create({
    data: {
      dayId: day6.id,
      title: "Daily Assignment 6: Comprehensive Analytics Mart Pipeline",
      type: "SQL",
      description: "Build a multi-level analytics data mart query calculating customer LTV tiers and average velocity.",
      deadlineHours: 24,
    },
  });

  await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assign6.id,
      order: 1,
      category: "SQL",
      prompt: "Synthesize CTEs, window functions, and aggregation to generate an executive customer summary with running totals and rank.",
      starterCode: `WITH CustomerOrderAgg AS (
  SELECT 
    c.id AS customer_id,
    c.name,
    c.city,
    COUNT(o.id) AS completed_orders,
    SUM(o.total_amount) AS total_spent
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'COMPLETED'
  GROUP BY c.id, c.name, c.city
),
RankedCustomers AS (
  SELECT 
    customer_id,
    name,
    city,
    completed_orders,
    COALESCE(total_spent, 0) AS total_spent,
    DENSE_RANK() OVER (ORDER BY COALESCE(total_spent, 0) DESC) AS overall_spend_rank
  FROM CustomerOrderAgg
)
SELECT * FROM RankedCustomers
ORDER BY overall_spend_rank ASC;`,
      weight: 100,
    },
  });

  // Update active day on user profile
  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      activeModuleId: module1.id,
      activeDayId: day2.id,
    },
  });

  // 5. Monday Weekly Assessment (10 MCQs + 5 Code Problems)
  const assessment = await prisma.assessment.create({
    data: {
      weekId: week1.id,
      title: "Monday Weekly Assessment: SQL Mastery & Analytical Querying",
      durationMins: 90,
      passingScore: 70,
    },
  });

  // 10 MCQs
  const mcqs = [
    {
      order: 1,
      prompt: "What is the primary difference between RANK() and DENSE_RANK() when two rows tie for 1st place?",
      options: [
        "RANK() skips the next rank (assigns 1, 1, 3); DENSE_RANK() does not skip (assigns 1, 1, 2)",
        "DENSE_RANK() assigns sequential unique IDs while RANK() assigns randomized integers",
        "RANK() cannot be partitioned by columns; DENSE_RANK() must be partitioned",
        "There is no difference in modern SQL dialects",
      ],
      correctAnswer: "RANK() skips the next rank (assigns 1, 1, 3); DENSE_RANK() does not skip (assigns 1, 1, 2)",
      weight: 6,
    },
    {
      order: 2,
      prompt: "Which window function is used to fetch the total_amount from the previous chronological order of a customer?",
      options: [
        "LAG(total_amount, 1) OVER (PARTITION BY customer_id ORDER BY order_date)",
        "LEAD(total_amount, 1) OVER (PARTITION BY customer_id ORDER BY order_date)",
        "FIRST_VALUE(total_amount) OVER ()",
        "PREV_ROW(total_amount)",
      ],
      correctAnswer: "LAG(total_amount, 1) OVER (PARTITION BY customer_id ORDER BY order_date)",
      weight: 6,
    },
    {
      order: 3,
      prompt: "Why can joining two 1-to-many tables (e.g. Customers → Orders and Customers → SupportTickets) cause inaccurate revenue reports?",
      options: [
        "It generates a Cartesian fan-out, multiplying rows and doubling/tripling SUM(total_amount)",
        "SQL does not allow joining more than two tables",
        "Support tickets automatically subtract from order amounts",
        "NULL values turn integer columns into strings",
      ],
      correctAnswer: "It generates a Cartesian fan-out, multiplying rows and doubling/tripling SUM(total_amount)",
      weight: 6,
    },
    {
      order: 4,
      prompt: "What does the COALESCE(val, 0) function do?",
      options: [
        "Returns the first non-null value among its arguments, converting NULL to 0",
        "Deletes null rows from disk",
        "Converts 0 values into NULL",
        "Throws a runtime exception if val is NULL",
      ],
      correctAnswer: "Returns the first non-null value among its arguments, converting NULL to 0",
      weight: 6,
    },
    {
      order: 5,
      prompt: "In a CTE pipeline, what does the WITH clause define?",
      options: [
        "A temporary named result set (view) that exists for the duration of the query",
        "A permanent table stored on disk",
        "A database transaction lock",
        "An encrypted SSL connection",
      ],
      correctAnswer: "A temporary named result set (view) that exists for the duration of the query",
      weight: 6,
    },
    {
      order: 6,
      prompt: "Which of the following WHERE clauses is SARGable and leverages an index on order_date?",
      options: [
        "order_date >= '2024-01-01' AND order_date < '2024-02-01'",
        "DATE(order_date) = '2024-01-01'",
        "strftime('%Y-%m', order_date) = '2024-01'",
        "YEAR(order_date) = 2024",
      ],
      correctAnswer: "order_date >= '2024-01-01' AND order_date < '2024-02-01'",
      weight: 6,
    },
    {
      order: 7,
      prompt: "What is the effect of using NTILE(4) OVER (ORDER BY total_spend DESC)?",
      options: [
        "Divides the ordered rows into 4 approximately equal quartile buckets (1, 2, 3, 4)",
        "Multiplies total_spend by 4",
        "Returns only the top 4 rows",
        "Skips every 4th record",
      ],
      correctAnswer: "Divides the ordered rows into 4 approximately equal quartile buckets (1, 2, 3, 4)",
      weight: 6,
    },
    {
      order: 8,
      prompt: "When should you use HAVING instead of WHERE?",
      options: [
        "When filtering on aggregate values (e.g. HAVING COUNT(id) >= 2) after GROUP BY",
        "HAVING is used before joins, WHERE is used after joins",
        "HAVING can only filter string columns",
        "WHERE is deprecated in SQL-99",
      ],
      correctAnswer: "When filtering on aggregate values (e.g. HAVING COUNT(id) >= 2) after GROUP BY",
      weight: 6,
    },
    {
      order: 9,
      prompt: "What is a Covering Index in relational database optimization?",
      options: [
        "An index that contains all columns required by a query, allowing Index-Only Scans with zero heap lookups",
        "An index that covers all tables in the database automatically",
        "An encrypted index for password security",
        "A backup copy of the database schema",
      ],
      correctAnswer: "An index that contains all columns required by a query, allowing Index-Only Scans with zero heap lookups",
      weight: 6,
    },
    {
      order: 10,
      prompt: "In conditional aggregation, what is the best pattern to pivot row statuses into distinct columns?",
      options: [
        "SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END)",
        "SELECT status, total_amount GROUP BY ALL",
        "WHERE status = 'COMPLETED' OR status = 'CANCELLED'",
        "UNPIVOT(status)",
      ],
      correctAnswer: "SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END)",
      weight: 6,
    },
  ];

  for (const m of mcqs) {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        order: m.order,
        type: "MCQ",
        prompt: m.prompt,
        options: JSON.stringify(m.options),
        correctAnswer: m.correctAnswer,
        weight: m.weight,
      },
    });
  }

  // 5 Practical Code Problems
  const codeProblems = [
    {
      order: 11,
      prompt: "Problem 1: Write a query using CTEs and DENSE_RANK() to find the top revenue-generating customer in each city who has spent over $500 in completed orders.",
      starterCode: `WITH CustomerTotals AS (
  SELECT 
    c.city, 
    c.name, 
    SUM(o.total_amount) AS total_spend,
    DENSE_RANK() OVER (PARTITION BY c.city ORDER BY SUM(o.total_amount) DESC) AS rnk
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  WHERE o.status = 'COMPLETED'
  GROUP BY c.city, c.name
)
SELECT city, name, total_spend 
FROM CustomerTotals 
WHERE rnk = 1 AND total_spend > 500
ORDER BY total_spend DESC;`,
      weight: 8,
    },
    {
      order: 12,
      prompt: "Problem 2: Calculate a running total of revenue for each customer, and calculate the difference between the current order amount and the previous order amount using LAG().",
      starterCode: `SELECT 
  customer_id,
  order_date,
  total_amount,
  SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total,
  total_amount - COALESCE(LAG(total_amount, 1) OVER (PARTITION BY customer_id ORDER BY order_date), 0) AS delta_from_prev
FROM orders
WHERE status = 'COMPLETED'
ORDER BY customer_id, order_date;`,
      weight: 8,
    },
    {
      order: 13,
      prompt: "Problem 3: Write a conditional aggregation pivot query returning each customer's name, their total Completed revenue, and their total Refunded/Cancelled revenue.",
      starterCode: `SELECT 
  c.name,
  SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END) AS completed_revenue,
  SUM(CASE WHEN o.status IN ('CANCELLED', 'REFUNDED') THEN o.total_amount ELSE 0 END) AS refunded_revenue
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;`,
      weight: 8,
    },
    {
      order: 14,
      prompt: "Problem 4: Segment all products into 3 price tiers (Budget, Mid-Tier, Luxury) using NTILE(3) or CASE WHEN, and return the count of products and average price in each tier.",
      starterCode: `WITH ProductTiers AS (
  SELECT 
    id,
    name,
    price,
    NTILE(3) OVER (ORDER BY price ASC) AS tier_num
  FROM products
)
SELECT 
  tier_num,
  COUNT(id) AS product_count,
  AVG(price) AS avg_tier_price
FROM ProductTiers
GROUP BY tier_num
ORDER BY tier_num;`,
      weight: 8,
    },
    {
      order: 15,
      prompt: "Problem 5: Build a multi-stage CTE data mart calculating month-over-month revenue and percentage growth across all completed orders.",
      starterCode: `WITH MonthlyData AS (
  SELECT 
    strftime('%Y-%m', order_date) AS month,
    SUM(total_amount) AS rev
  FROM orders
  WHERE status = 'COMPLETED'
  GROUP BY strftime('%Y-%m', order_date)
)
SELECT 
  month,
  rev,
  LAG(rev, 1) OVER (ORDER BY month) AS prev_month_rev,
  ROUND(((rev - LAG(rev, 1) OVER (ORDER BY month)) / LAG(rev, 1) OVER (ORDER BY month)) * 100, 2) AS growth_pct
FROM MonthlyData
ORDER BY month;`,
      weight: 8,
    },
  ];

  for (const cp of codeProblems) {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        order: cp.order,
        type: "CODE",
        prompt: cp.prompt,
        starterCode: cp.starterCode,
        weight: cp.weight,
      },
    });
  }

  // 6. 7-Day Capstone Project
  const project = await prisma.project.create({
    data: {
      moduleId: module1.id,
      title: "E-Commerce Customer Retention & Revenue Analytics Lakehouse",
      businessBrief: "You are the Lead Analytics Engineer at a high-growth D2C retail enterprise. The VP of Growth needs a complete analytical data model and SQL reporting mart to track Customer Acquisition Cost (CAC), Monthly Retention Cohorts, Churn Rates, and Lifetime Value (LTV).",
      durationDays: 7,
    },
  });

  const milestoneTitles = [
    { day: 1, title: "Day 1: Schema Exploration, ERD Mapping & Data Quality Audit", del: "Document schema relationships, identify duplicate keys, and write NULL-check integrity scripts." },
    { day: 2, title: "Day 2: Customer Cohort Scaffolding & Monthly Active Users (MAU)", del: "Build SQL CTE pipeline generating monthly customer cohorts based on first purchase date." },
    { day: 3, title: "Day 3: Retention & Churn Matrix SQL Calculation", del: "Compute N-Month retention curves (Month 0, Month 1, Month 3, Month 6) using window functions." },
    { day: 4, title: "Day 4: Product Affinity & Market Basket Analysis", del: "Write self-join queries discovering top co-purchased item pairs." },
    { day: 5, title: "Day 5: Customer Lifetime Value (LTV) Segmentation", del: "Classify accounts into Gold, Silver, Bronze tiers using NTILE() and cumulative percentiles." },
    { day: 6, title: "Day 6: Executive SQL Summary Mart & Query Optimization", del: "Index keys, create materialized summary tables, and profile execution plans." },
    { day: 7, title: "Day 7: Final Deliverables, GitHub Repository & Presentation Dossier", del: "Package complete SQL repository, README documentation, and business insights executive deck." },
  ];

  for (const m of milestoneTitles) {
    await prisma.projectMilestone.create({
      data: {
        projectId: project.id,
        dayNumber: m.day,
        title: m.title,
        deliverable: m.del,
        isCompleted: m.day === 1,
      },
    });
  }

  // 7. Seed Initial Backlog & Remedial
  await prisma.backlogItem.create({
    data: {
      title: "NULL Value Edge Case Practice Drill",
      topic: "SQL NULL Handling",
      dueOriginal: new Date(Date.now() - 86400000),
      scheduledFor: new Date(),
    },
  });

  await prisma.remedialDrill.create({
    data: {
      topic: "Window Functions",
      title: "Partitioned Moving Average Drill",
      difficulty: "Hard",
      problem: "Calculate a 3-order moving average of total_amount for each customer ordered by order_date using ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.",
      solution: "SELECT customer_id, order_date, total_amount, AVG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg FROM orders;",
    },
  });

  // 8. Seed Initial Mentor Message
  await prisma.mentorMessage.create({
    data: {
      sender: "mentor",
      message: "Namaste Aman! Welcome to your disciplined Masai-Style Career BootCamp. I am your AI Technical Mentor powered by Qwen 2.5 Coder. Today we are tackling Day 2: Analytical Window Functions. Remember: discipline beats motivation. Let's conquer today's agenda!",
      context: "Day 2: Window Functions",
    },
  });

  console.log("✅ Database successfully seeded with 6 Days of Curriculum, 15 Exam Questions, and 7-Day Capstone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
