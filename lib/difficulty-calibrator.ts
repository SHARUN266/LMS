import { db } from "@/lib/db";

export interface EloUpdateResult {
  previousElo: number;
  newElo: number;
  delta: number;
  expectedWinProb: number;
}

/**
 * Calculates updated Elo rating based on drill performance.
 *
 * @param learnerElo Current learner Elo (typically 1000 - 2200)
 * @param challengeElo Difficulty rating of the drill / assignment
 * @param success True if the learner passed with >= 75% or solved drill
 * @param kFactor Sensitivity factor (default: 32)
 */
export function calculateElo(
  learnerElo: number,
  challengeElo: number,
  success: boolean,
  kFactor: number = 32
): EloUpdateResult {
  // Expected probability of success for learner against challenge
  const expectedWinProb = 1 / (1 + Math.pow(10, (challengeElo - learnerElo) / 400));
  const actualScore = success ? 1 : 0;

  const delta = Math.round(kFactor * (actualScore - expectedWinProb));
  const newElo = Math.max(800, Math.min(2600, learnerElo + delta));

  return {
    previousElo: learnerElo,
    newElo,
    delta,
    expectedWinProb: Math.round(expectedWinProb * 100) / 100,
  };
}

/**
 * Updates learner's Elo rating in database after submitting an assignment or completing a drill
 */
export async function updateLearnerElo(
  challengeElo: number,
  success: boolean,
  userId: string = "user_default"
): Promise<EloUpdateResult> {
  const profile = (await db.userProfile.findFirst({
    where: { id: userId },
  })) || (await db.userProfile.findFirst());

  const currentElo = (profile as any)?.eloRating || 1200;
  const result = calculateElo(currentElo, challengeElo, success);

  if (profile) {
    await db.userProfile.update({
      where: { id: profile.id },
      data: {
        eloRating: result.newElo,
      } as any,
    });
  }

  return result;
}

/**
 * Returns the recommended target challenge Elo corresponding to the learner's
 * Zone of Proximal Development (ZPD).
 */
export async function getTargetChallengeElo(
  userId: string = "user_default"
): Promise<{ targetElo: number; tier: string }> {
  const profile = (await db.userProfile.findFirst({
    where: { id: userId },
  })) || (await db.userProfile.findFirst());

  const learnerElo = (profile as any)?.eloRating || 1200;

  let tier = "Intermediate Analyst";
  if (learnerElo < 1050) tier = "Foundational Trainee";
  else if (learnerElo >= 1500) tier = "Senior 12 LPA Analytics Engineer";
  else if (learnerElo >= 1350) tier = "Advanced Analyst";

  return {
    targetElo: learnerElo + 50, // Slight upward stretch for maximum skill acquisition
    tier,
  };
}
