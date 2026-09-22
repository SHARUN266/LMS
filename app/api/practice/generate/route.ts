import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";
import { getModuleModality, AssignmentModality } from "@/lib/dynamic-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dayId, difficulty } = body;

    if (!dayId) {
      return NextResponse.json({ error: "dayId is required" }, { status: 400 });
    }

    // 1. Fetch Day & Existing Practice
    let day = await db.day.findUnique({
      where: { id: dayId },
      include: { practice: true, week: { include: { module: true } } },
    });

    if (!day) {
      const match = dayId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      day = await db.day.findFirst({
        where: { dayNumber: dayNum },
        include: { practice: true, week: { include: { module: true } } },
      });
    }

    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    const nextOrder = (day.practice?.length || 0) + 1;
    const diffLevel = difficulty || (nextOrder === 2 ? "Intermediate" : nextOrder >= 3 ? "Hard" : "Easy");
    const moduleOrder = day.week?.module?.order || 1;
    const moduleName = day.week?.module?.title || "Analytics Engineering & SQL";
    const modality: AssignmentModality = getModuleModality(moduleOrder);

    // 2. Fetch past weak areas to personalise drill if available
    const recentEvals = await db.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    const weakList: string[] = [];
    recentEvals.forEach((e) => {
      try {
        const parsed = JSON.parse(e.weakAreas);
        if (Array.isArray(parsed)) weakList.push(...parsed);
      } catch {}
    });

    // 3. Modality-specific prompts and default templates
    let defaultDrill = {
      title: `Drill ${nextOrder}: ${day.title.replace(/^Day \d+:\s*/, "")} (${diffLevel})`,
      difficulty: diffLevel,
      problem: `Practice hands-on analysis for ${day.title}. Address the core business logic and requirements rigorously.`,
      starterCode: `-- Drill ${nextOrder} Starter\nSELECT * FROM orders LIMIT 5;`,
      solution: `SELECT c.city, COUNT(o.id) as total_orders, SUM(o.total_amount) as gmv\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.status = 'COMPLETED'\nGROUP BY c.city;`,
      hints: [
        "Break down the problem systematically into smaller steps.",
        "Check syntax and variable names before testing.",
        "Ensure edge cases and boundary conditions are handled."
      ],
    };

    let modalityContext = "";
    if (modality === "SQL") {
      modalityContext = `
Format: SQL Query.
Sandbox Tables: customers (id, name, email, city, segment), orders (id, customer_id, order_date, total_amount, status), order_items (id, order_id, product_id, quantity, unit_price), products (id, name, category, price, cost).
Starter Code: SQL template with comments.
Solution: Production-grade SQL query.`;
    } else if (modality === "PYTHON") {
      defaultDrill.starterCode = `# Python Drill ${nextOrder}\nimport pandas as pd\nimport numpy as np\n\ndef analyze_metrics(df: pd.DataFrame) -> pd.DataFrame:\n    # TODO: Implement transformation\n    pass\n`;
      defaultDrill.solution = `import pandas as pd\n\ndef analyze_metrics(df: pd.DataFrame) -> pd.DataFrame:\n    return df.groupby('city').agg(orders=('order_id', 'count'), gmv=('amount', 'sum')).reset_index()`;
      modalityContext = `
Format: Python 3 with Pandas.
Scenario: Production data engineering pipeline at an Indian unicorn (Zepto / Swiggy / Razorpay).
Starter Code: Python snippet with import pandas as pd, def solution_fn(...) signature.
Solution: Clean, vectorized pandas transformation.`;
    } else if (modality === "API") {
      defaultDrill.starterCode = `{\n  "endpoint": "/api/v1/orders",\n  "method": "POST",\n  "headers": {\n    "Authorization": "Bearer <TOKEN>",\n    "Content-Type": "application/json"\n  },\n  "body": {\n    "customerId": "cust_123",\n    "items": []\n  }\n}`;
      defaultDrill.solution = `{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "orderId": "ord_9941",\n    "status": "CONFIRMED",\n    "totalAmount": 1499.00,\n    "timestamp": "2026-09-21T10:30:00Z"\n  }\n}`;
      modalityContext = `
Format: REST API Specification / JSON Contract.
Scenario: Microservice communication or OpenAPI schema definition.
Starter Code: JSON contract template with endpoint, headers, and request/response structure.
Solution: Valid JSON schema payload handling authentication and error responses.`;
    } else if (modality === "POWER_BI") {
      defaultDrill.starterCode = `-- Power BI DAX Measure Drill\nTotal_Net_Revenue = \nVAR GrossSales = SUM(Orders[TotalAmount])\nVAR DiscountAmount = SUM(Orders[Discount])\nRETURN\n    -- Implement DAX logic here\n    BLANK()`;
      defaultDrill.solution = `Total_Net_Revenue = \nVAR GrossSales = SUM(Orders[TotalAmount])\nVAR DiscountAmount = SUM(Orders[Discount])\nRETURN\n    DIVIDE(GrossSales - DiscountAmount, GrossSales, 0)`;
      modalityContext = `
Format: Power BI DAX Formulas.
Scenario: Enterprise Star Schema data model (FactOrders, DimCustomer, DimDate).
Starter Code: DAX formula measure template with VAR / RETURN syntax.
Solution: Production DAX measure using CALCULATE, DIVIDE, or time intelligence functions.`;
    } else {
      // Document & Strategy Modalities (BRD, PROMPT_ENG, AI_PRD, COMPLIANCE, CHANGE_MGMT, CONSULTING_CASE)
      defaultDrill.starterCode = `# ${day.title} Executive Deliverable\n\n## 1. Problem Statement & Scope\n\n## 2. Key Stakeholder Requirements\n\n## 3. Measurable Acceptance Criteria & Metrics\n`;
      defaultDrill.solution = `# Strategic Specification\n\n## 1. Executive Summary\nClear, MECE problem definition with business context.\n\n## 2. Solution Architecture & Framework\nDetailed operational workflows and stakeholder alignments.\n\n## 3. Success Metrics & Risk Mitigation\nQuantified targets and governance boundaries.`;
      modalityContext = `
Format: Structured Markdown (${modality} Deliverable).
Scenario: Enterprise C-Suite consulting or Technical Product/BA deliverable for a 12 LPA role.
Starter Code: Markdown template with clear headings (Problem Statement, Scope, Framework).
Solution: Exemplary, structured business analysis specification.`;
    }

    const systemPrompt = `You are a Principal Technical Coach and Staff Analytics Engineer at a top tier tech academy.
Generate an elite, interview-standard hands-on drill.
Target Modality: ${modality}.
Output strictly in valid JSON matching this schema:
{
  "title": "<Short, catchy title, e.g. 'Zepto: Dark Store Order Batching'>",
  "difficulty": "${diffLevel}",
  "problem": "<2-3 paragraph realistic business scenario and clear technical objective>",
  "starterCode": "<Well-formatted starter code template with comments>",
  "solution": "<Production-grade clean solution adhering to ${modality} best practices>",
  "hints": ["<Hint 1: Socratic guiding question>", "<Hint 2: Relevant function/syntax pointer>", "<Hint 3: Edge case trap to avoid>"]
}`;

    const userPrompt = `Module: ${moduleName} (Track: ${modality})
Day ${day.dayNumber}: ${day.title}
Objective: ${day.objective}
Target Difficulty: ${diffLevel}
Learner Focus / Weak Areas: ${weakList.slice(0, 3).join(", ") || "General Best Practices"}

Modality Guidelines:
${modalityContext}

Generate a high-yield, 12 LPA interview-standard drill reinforcing today's lesson.`;

    let generatedDrill = { ...defaultDrill };

    try {
      const rawAi = await callGemini(userPrompt, systemPrompt, true);
      const parsed = JSON.parse(rawAi);
      if (parsed.title && parsed.problem && parsed.solution) {
        generatedDrill = {
          ...generatedDrill,
          ...parsed,
          hints: Array.isArray(parsed.hints) ? parsed.hints : generatedDrill.hints,
        };
      }
    } catch (err) {
      console.warn("AI drill generation fallback mode:", err);
    }

    // 4. Save the generated drill into the database under day.practice
    const newPractice = await db.practiceExercise.create({
      data: {
        dayId: day.id,
        order: nextOrder,
        title: generatedDrill.title,
        difficulty: generatedDrill.difficulty,
        problem: generatedDrill.problem,
        starterCode: generatedDrill.starterCode,
        solution: generatedDrill.solution,
        hints: JSON.stringify(generatedDrill.hints),
        sampleData: JSON.stringify({ modality, tables: ["customers", "orders", "order_items", "products"] }),
      },
    });

    return NextResponse.json({
      success: true,
      practice: newPractice,
      drill: newPractice,
      hints: generatedDrill.hints,
    });
  } catch (error: any) {
    console.error("Error generating practice drill:", error);
    return NextResponse.json(
      { error: "Failed to generate drill", details: error.message },
      { status: 500 }
    );
  }
}
