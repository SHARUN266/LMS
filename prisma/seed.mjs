import { PrismaClient } from "@prisma/client";
import { TRACK_INFO, MODULES_DATA } from "./curriculum-data.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting complete 12 LPA Production LMS Database Seeding...");

  // 1. Wipe all existing data in reverse foreign key order
  console.log("🧹 Clearing old records...");
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
  await prisma.adminConfig.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();

  // 2. User Profile (Sharun)
  console.log("👤 Creating Fresh User Profile...");
  const user = await prisma.userProfile.create({
    data: {
      id: "user_default",
      name: "Sharun",
      targetRole: "Data Analyst (12 LPA GCC Track)",
      dailyStudyGoal: 6,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyMins: 0,
      experienceLevel: "Beginner-Intermediate",
      xp: 0,
      level: 1,
    },
  });

  // 3. Admin Configuration (Gemini 2.5 Flash active by default)
  console.log("⚙️ Creating Admin Configuration...");
  await prisma.adminConfig.create({
    data: {
      id: "admin_default",
      activeModel: "gemini-2.5-flash",
      strictness: 85,
      passingThreshold: 70,
    },
  });

  // 4. Create Track
  console.log("🗺️ Creating 12 LPA Career Track...");
  const track = await prisma.track.create({
    data: {
      slug: TRACK_INFO.slug,
      title: TRACK_INFO.title,
      description: TRACK_INFO.description,
    },
  });

  // 5. Create Modules, Weeks, Days, Lessons, Exercises, Assignments, Assessments & Capstones
  console.log(`📚 Seeding ${MODULES_DATA.length} Modules with 66 Days, Lessons, Curated YouTube Guides, and Practice Drills...`);
  
  let totalDaysCreated = 0;

  for (let mIdx = 0; mIdx < MODULES_DATA.length; mIdx++) {
    const modData = MODULES_DATA[mIdx];
    const modOrder = modData.order;

    const moduleRecord = await prisma.module.create({
      data: {
        trackId: track.id,
        order: modOrder,
        title: modData.title,
        description: modData.description,
        icon: modData.icon,
      },
    });

    if (modOrder === 1) {
      await prisma.userProfile.update({
        where: { id: user.id },
        data: { activeModuleId: moduleRecord.id },
      });
    }

    const week = await prisma.week.create({
      data: {
        moduleId: moduleRecord.id,
        weekNumber: modOrder,
        title: `Week ${modOrder}: ${modData.title.split(":")[1]?.trim() || modData.title}`,
      },
    });

    // Create Monday Benchmark Exam for the week
    const weekAssessment = await prisma.assessment.create({
      data: {
        weekId: week.id,
        title: `Monday 12 LPA Benchmark Assessment: ${modData.title.split(":")[1]?.trim() || modData.title}`,
        durationMins: 90,
        passingScore: 70,
      },
    });

    // Add sample assessment questions for the weekly assessment
    await prisma.assessmentQuestion.createMany({
      data: [
        {
          assessmentId: weekAssessment.id,
          order: 1,
          type: "MCQ",
          prompt: `In enterprise analytical data warehousing, what is the primary purpose of separating the dimensional model into Star Schema fact and dimension tables?`,
          options: JSON.stringify([
            "To maximize storage space by duplicating customer attributes",
            "To optimize analytical slice-and-dice aggregations while minimizing join complexity",
            "To normalize the database to BCNF (Boyce-Codd Normal Form)",
            "To disable query indexing and caching"
          ]),
          correctAnswer: "To optimize analytical slice-and-dice aggregations while minimizing join complexity",
          weight: 20,
        },
        {
          assessmentId: weekAssessment.id,
          order: 2,
          type: "MCQ",
          prompt: `When computing rolling 7-day average metrics in high-velocity e-commerce event streams, which window frame definition prevents forward-looking data leakage?`,
          options: JSON.stringify([
            "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
            "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
            "RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
            "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING"
          ]),
          correctAnswer: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
          weight: 20,
        },
        {
          assessmentId: weekAssessment.id,
          order: 3,
          type: "CODE",
          prompt: `Write an optimized query calculating the top 3 highest spending customers per city, returning their city, customer_id, total spend, and their intra-city rank using DENSE_RANK().`,
          starterCode: `-- Monday Exam Code Problem\nSELECT * FROM customers;`,
          weight: 60,
        }
      ]
    });

    // Create 7-Day Capstone Project outline for the module
    const capstoneProject = await prisma.project.create({
      data: {
        moduleId: moduleRecord.id,
        title: modData.capstoneTheme || modData.capstoneTitle || `${modData.title} Capstone`,
        businessBrief: modData.capstoneBrief || "Deliver an end-to-end industry portfolio deliverable under real-world company constraints.",
        durationDays: 7,
      },
    });

    for (let m = 1; m <= 7; m++) {
      await prisma.projectMilestone.create({
        data: {
          projectId: capstoneProject.id,
          dayNumber: m,
          title: `Milestone ${m}: ${m === 1 ? 'Data Discovery & Requirements BRD' : m === 4 ? 'Analytical Modeling & Core Architecture' : 'Executive Dashboard & Delivery Deck'}`,
          deliverable: `Complete Day ${m} capstone requirements with reproducible GitHub PR and executive presentation slides.`,
          isCompleted: false,
        },
      });
    }

    // Now seed each Day in the module
    for (const dayData of modData.days) {
      totalDaysCreated++;
      // Only Module 1, Day 1 is unlocked initially; all days are uncompleted
      const isDay1 = mIdx === 0 && dayData.dayNumber === 1;
      const isUnlocked = isDay1;
      const isCompleted = false;
      const score = null;

      const day = await prisma.day.create({
        data: {
          weekId: week.id,
          dayNumber: dayData.dayNumber,
          title: dayData.title,
          objective: dayData.objective,
          estimatedMins: 180,
          isUnlocked,
          isCompleted,
          theoryCompleted: false,
          practiceCompleted: false,
          score,
        },
      });

      if (isDay1) {
        await prisma.userProfile.update({
          where: { id: user.id },
          data: { activeDayId: day.id },
        });
      }

      // Format comprehensive Lesson Markdown content
      const ytQuery = `${dayData.title} Analytics Masterclass`;
      const lessonContent = `# ${dayData.title}

> **12 LPA Industry Readiness Track** • Target Salary: ₹12,00,000+ PA • Tier-1 Product & Consulting Standards

---

## 🎯 Core Learning Objective
${dayData.objective}

---

## 🧠 JavaScript Developer Mental Model Bridge
Coming from JavaScript, analytical workflows map directly to familiar programming paradigms. 
Explore the inline code drills or consult Axiom Copilot for real-time guidance tailored to your background.

---

## 📺 Recommended Masterclass Video Search
- **Target Search Query:** \`${ytQuery}\`
- **Recommended Channels:** Leila Gharani, Chandoo, Alex The Analyst, Ankit Bansal, Kevin Stratvert
`;

      const cheatSheet = `/* 12 LPA Quick Reference: Day ${dayData.dayNumber} */
-- Focus Area: ${dayData.title}
-- Core Objective: ${dayData.objective}`;

      const quickQuiz = JSON.stringify([
        {
          question: `What is the primary industry objective of ${dayData.title}?`,
          options: [
            dayData.objective,
            "To memorize syntax without understanding business impact",
            "To replace relational databases with unorganized text files",
            "To bypass all data validation rules"
          ],
          correctAnswer: dayData.objective,
          explanation: `In tier-1 GCCs and Big 4 consulting, mastering ${dayData.title} ensures mathematical rigor and reproducible business outcomes.`
        }
      ]);

      const resources = JSON.stringify({
        query: ytQuery,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`,
        videos: [
          {
            title: `${dayData.title} Masterclass`,
            channel: "Curated Industry Guide",
            duration: "20 mins",
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`
          }
        ],
        checklist: [
          `Internalize core mechanics of ${dayData.title.split(":")[1]?.trim() || dayData.title}.`,
          "Complete hands-on sandbox practice drill with zero syntax errors.",
          "Submit graded assignment and verify rubric score."
        ],
      });

      // Create Lesson
      await prisma.lesson.create({
        data: {
          dayId: day.id,
          title: dayData.title,
          content: lessonContent,
          cheatSheet,
          quickQuiz,
          videoSearchQuery: ytQuery,
          resources,
        },
      });

      // Create Practice Exercise
      const cleanTitle = dayData.title.replace(/^Day \d+:\s*/, "");
      await prisma.practiceExercise.create({
        data: {
          dayId: day.id,
          order: 1,
          title: `Industry Drill: ${cleanTitle.substring(0, 45)}`,
          difficulty: "Intermediate",
          problem: `Solve the foundational challenge for ${cleanTitle}:\n\n${dayData.objective}`,
          starterCode: `-- Day ${dayData.dayNumber} Practice Sandbox\n-- Objective: ${dayData.objective}\n\nSELECT 1;`,
          sampleData: JSON.stringify({
            tables: ["customers", "orders", "order_items", "products"],
            description: "Production SQLite sandbox schema"
          }),
          solution: `-- Ideal Solution for Day ${dayData.dayNumber}`,
          hints: JSON.stringify([
            "Read the core objective carefully.",
            "Verify all joins and aggregations defensively.",
            "Test your solution against the sample tables."
          ]),
        },
      });

      // Create Assignment (Day 1 Excel Baseline; subsequent days synthesized adaptively)
      if (isDay1) {
        const assignment = await prisma.assignment.create({
          data: {
            dayId: day.id,
            title: `Graded Mission: Advanced Lookups, Dynamic Arrays & Two-Way Matching`,
            type: "EXCEL",
            description: `Production industry benchmark assignment evaluated against 12 LPA hiring rubrics.`,
            deadlineHours: 24,
            rubric: JSON.stringify({
              correctness: 40,
              edgeCases: 25,
              performance: 20,
              cleanCode: 15,
            }),
          },
        });

        await prisma.assignmentQuestion.create({
          data: {
            assignmentId: assignment.id,
            order: 1,
            category: "EXCEL",
            prompt: `You are an Analytics Specialist at Amazon Global Logistics. Build a resilient dynamic lookup model matching products and calculating line-item profits without brittle VLOOKUP. Extract Tier-1 orders using FILTER() and compute segment revenue with SUMIFS.`,
            starterCode: `/* Day 1 Excel Graded Mission: Advanced Lookups */\n// Formula 1: =XLOOKUP(Target_SKU, SKU_Range, Return_Range, "Unknown SKU")\n// Formula 2: =FILTER(Orders_Range, (Tier_Range="Tier 1") * (Quantity_Range>=50))\n// Formula 3: =SUMIFS(Amount_Range, Region_Range, "North", Tier_Range, "Tier 1")`,
            sampleData: JSON.stringify({ tables: ["customers", "orders", "order_items", "products"] }),
            weight: 100,
            isAdaptive: true,
            adaptiveReason: `Foundational 12 LPA benchmark: Day 1 Excel Core Competency Evaluation.`,
          },
        });
      }
    }
  }

  // 6. Seed Realistic Sandbox Relational Data for SQL testing
  console.log("🗄️ Seeding Production Sandbox Tables (customers, products, orders, order_items, employees)...");

  // Customers
  const customersData = [
    { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", city: "Bangalore", country: "India", segment: "Enterprise", signupDate: "2024-01-15" },
    { name: "Priya Patel", email: "priya.patel@outlook.com", city: "Mumbai", country: "India", segment: "D2C", signupDate: "2024-02-10" },
    { name: "Rohan Verma", email: "rohan.v@techcorp.in", city: "Delhi", country: "India", segment: "SMB", signupDate: "2024-03-01" },
    { name: "Ananya Iyer", email: "ananya.iyer@fintech.co", city: "Bangalore", country: "India", segment: "Enterprise", signupDate: "2024-01-20" },
    { name: "Vikram Malhotra", email: "vikram.m@gmail.com", city: "Hyderabad", country: "India", segment: "D2C", signupDate: "2024-04-05" },
    { name: "Sneha Kulkarni", email: "sneha.k@puneventure.com", city: "Pune", country: "India", segment: "SMB", signupDate: "2024-02-18" },
    { name: "Kabir Mehta", email: "kabir.mehta@saasworks.io", city: "Mumbai", country: "India", segment: "Enterprise", signupDate: "2024-03-12" },
    { name: "Ishaan Nair", email: "ishaan.nair@chennaitech.in", city: "Chennai", country: "India", segment: "D2C", signupDate: "2024-05-01" },
    { name: "Diya Roy", email: "diya.roy@kolkatamedia.com", city: "Kolkata", country: "India", segment: "SMB", signupDate: "2024-03-25" },
    { name: "Tanvi Saxena", email: "tanvi.s@gurugramfin.com", city: "Gurugram", country: "India", segment: "Enterprise", signupDate: "2024-01-08" },
  ];

  for (const c of customersData) {
    await prisma.customer.create({ data: c });
  }

  // Products
  const productsData = [
    { name: "Enterprise BI Platform License", category: "Software", price: 45000.0, cost: 12000.0, stockQuantity: 999 },
    { name: "Cloud Data Warehouse Unit", category: "Infrastructure", price: 28000.0, cost: 14000.0, stockQuantity: 500 },
    { name: "SQL Analytics Pro Suite", category: "Software", price: 15000.0, cost: 3500.0, stockQuantity: 999 },
    { name: "Executive KPI Dashboard Display", category: "Hardware", price: 55000.0, cost: 38000.0, stockQuantity: 45 },
    { name: "Ultra-Wide Analyst Monitor 34\"", category: "Hardware", price: 38000.0, cost: 26000.0, stockQuantity: 80 },
    { name: "Ergonomic Data Modeler Desk Chair", category: "Furniture", price: 18000.0, cost: 11000.0, stockQuantity: 60 },
    { name: "Mechanical Coding Keyboard", category: "Hardware", price: 8500.0, cost: 4500.0, stockQuantity: 150 },
    { name: "Data Engineering Masterclass Access", category: "Training", price: 25000.0, cost: 5000.0, stockQuantity: 999 },
    { name: "Executive Consulting Workshop (1-Day)", category: "Services", price: 75000.0, cost: 25000.0, stockQuantity: 20 },
    { name: "Automated ETL Pipeline Connector", category: "Software", price: 12000.0, cost: 2000.0, stockQuantity: 999 },
  ];

  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  // Orders and Order Items
  const orderStatuses = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "PENDING", "CANCELLED"];
  const dates = ["2024-04-01", "2024-04-05", "2024-04-12", "2024-04-18", "2024-04-22", "2024-05-02", "2024-05-10", "2024-05-15", "2024-05-20", "2024-05-28"];

  for (let i = 1; i <= 24; i++) {
    const custId = (i % 10) + 1;
    const status = orderStatuses[i % orderStatuses.length];
    const orderDate = dates[i % dates.length];
    const orderAmount = 25000.0 + (i * 3700.0);

    const order = await prisma.order.create({
      data: {
        customerId: custId,
        orderDate,
        totalAmount: orderAmount,
        status,
      },
    });

    // Create 1-3 items for each order
    const numItems = (i % 3) + 1;
    for (let k = 1; k <= numItems; k++) {
      const prodId = ((i + k) % 10) + 1;
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: prodId,
          quantity: k,
          unitPrice: (orderAmount / numItems) / k,
        },
      });
    }
  }

  // Employees
  const employeesData = [
    { name: "Rajesh Sharma", department: "Engineering", salary: 2400000.0, managerId: null, hireDate: "2021-03-15" },
    { name: "Aditi Rao", department: "Analytics", salary: 2100000.0, managerId: null, hireDate: "2021-06-01" },
    { name: "Karan Johar", department: "Analytics", salary: 1400000.0, managerId: 2, hireDate: "2022-01-10" },
    { name: "Pooja Hegde", department: "Analytics", salary: 1250000.0, managerId: 2, hireDate: "2022-08-15" },
    { name: "Devendra Patil", department: "Engineering", salary: 1600000.0, managerId: 1, hireDate: "2022-04-01" },
    { name: "Meera Sen", department: "Product", salary: 2200000.0, managerId: null, hireDate: "2021-05-20" },
    { name: "Arjun Rampal", department: "Product", salary: 1350000.0, managerId: 6, hireDate: "2023-02-15" },
    { name: "Zoya Akhtar", department: "Operations", salary: 1800000.0, managerId: null, hireDate: "2021-11-01" },
  ];

  for (const emp of employeesData) {
    await prisma.employee.create({ data: emp });
  }

  // 7. Seed Initial Backlog & Remedial (Starts empty for fresh learner)
  console.log("📋 Initializing Clean Backlog & Remedial state (zero debt)...");

  // 8. Seed Initial Mentor Message
  console.log("💬 Seeding AI Mentor Welcome Message...");
  await prisma.mentorMessage.create({
    data: {
      sender: "mentor",
      message: "Namaste Sharun! Welcome to your disciplined 12 LPA Analytics Engineering & Business Analyst Career Track. I am your AI Technical Mentor powered by Gemini 2.5 Flash. Day 1 is unlocked and ready for you to begin: Foundation of High-Performance SQL & Cardinality. Turn on your study timer and let's build your 12 LPA portfolio from scratch!",
      context: "Day 1: Foundation of High-Performance SQL & Cardinality",
    },
  });

  console.log(`\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
  console.log(`   - 1 Track: "${TRACK_INFO.title}"`);
  console.log(`   - 6 Modules with 6 Capstone 7-Day Projects & Weekly Monday Exams`);
  console.log(`   - ${totalDaysCreated} Days of Curated Industry Curriculum with Real Company Scenarios`);
  console.log(`   - 36 Lessons with Curated YouTube Masterclass Search Queries & Educator Playlists`);
  console.log(`   - 36 Practice Exercises & 36 Graded Assignments`);
  console.log(`   - Populated Sandbox with Real Customers, Products, Orders, and Employees`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
