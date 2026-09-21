import React from "react";
import { db } from "@/lib/db";
import { RoadmapClient } from "@/components/roadmap/RoadmapClient";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const user = await db.userProfile.findFirst().catch(() => null);
  const track = await db.track.findFirst().catch(() => null);

  return (
    <RoadmapClient
      initialTrackTitle={track?.title || "Business Analyst (BA) Career Track"}
      initialRole={user?.targetRole || "Business Analyst"}
    />
  );
}
