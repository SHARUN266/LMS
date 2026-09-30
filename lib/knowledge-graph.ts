import { db } from "@/lib/db";
import { CORE_SKILL_GRAPH } from "@/prisma/skills-data.mjs";

export { CORE_SKILL_GRAPH };

export interface SkillNodeDef {
  slug: string;
  name: string;
  category: string;
  bloomLevel: number;
  dayNumber?: number;
  prerequisites: string[];
  description: string;
}

/**
 * Checks if all prerequisites for a given skill slug have been mastered (masteryScore >= 0.70)
 */
export async function checkPrerequisitesMet(skillSlug: string): Promise<{
  met: boolean;
  unmetPrerequisites: { slug: string; name: string; masteryScore: number }[];
}> {
  const nodeDef = CORE_SKILL_GRAPH.find((s) => s.slug === skillSlug);
  if (!nodeDef || nodeDef.prerequisites.length === 0) {
    return { met: true, unmetPrerequisites: [] };
  }

  const prereqSkills = await db.skill.findMany({
    where: {
      slug: { in: nodeDef.prerequisites },
    },
    select: {
      slug: true,
      name: true,
      masteryScore: true,
    },
  });

  const unmet: { slug: string; name: string; masteryScore: number }[] = [];

  for (const prereqSlug of nodeDef.prerequisites) {
    const existing = prereqSkills.find((p) => p.slug === prereqSlug);
    if (!existing || existing.masteryScore < 0.7) {
      const fallbackDef = CORE_SKILL_GRAPH.find((s) => s.slug === prereqSlug);
      unmet.push({
        slug: prereqSlug,
        name: existing?.name || fallbackDef?.name || prereqSlug,
        masteryScore: existing?.masteryScore || 0.0,
      });
    }
  }

  return {
    met: unmet.length === 0,
    unmetPrerequisites: unmet,
  };
}

/**
 * Returns optimal next skills to practice based on current mastery and DAG edges
 */
export async function getRecommendedNextSkills(limit: number = 3): Promise<any[]> {
  const allSkills = await db.skill.findMany({
    include: {
      prerequisites: {
        include: { fromSkill: true },
      },
    },
    orderBy: [{ masteryScore: "asc" }, { bloomLevel: "asc" }],
  });

  if (allSkills.length === 0) {
    return CORE_SKILL_GRAPH.slice(0, limit);
  }

  // Filter skills that are not yet mastered (< 0.85) AND whose prerequisites are satisfied (>= 0.70)
  const candidateSkills = allSkills.filter((skill) => {
    if (skill.masteryScore >= 0.85) return false;
    const prereqsSatisfied = skill.prerequisites.every(
      (edge) => edge.fromSkill.masteryScore >= 0.7
    );
    return prereqsSatisfied;
  });

  return candidateSkills.slice(0, limit);
}
