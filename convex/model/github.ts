/**
 * GitHub integration model functions for automatic export
 */

import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
//mport { addLabelToIssue, formatEstimateLabel } from "../githubhelpers";

/**
 * Export estimates for all GitHub-linked stories after voting completes
 * This is called automatically when cards are revealed
 */
export async function exportEstimatesToGithub(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<{ exported: number; failed: number }> {
  // Check if GitHub integration exists
  const integration = await ctx.db
    .query("githubIntegration")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .first();

  if (!integration) {
    return { exported: 0, failed: 0 };
  }

  // Find all story nodes with GitHub links that haven't been exported yet
  const allNodes = await ctx.db
    .query("canvasNodes")
    .withIndex("by_room_type", (q) =>
      q.eq("roomId", roomId).eq("type", "story")
    )
    .collect();

  const githubStories = allNodes.filter(
    (node) => node.data?.githubIssueNumber && !node.data?.estimateExported
  );

  if (githubStories.length === 0) {
    return { exported: 0, failed: 0 };
  }

  // Get the results node to find the consensus estimate
  const resultsNode = await ctx.db
    .query("canvasNodes")
    .withIndex("by_room_type", (q) =>
      q.eq("roomId", roomId).eq("type", "results")
    )
    .first();

  // If no results yet, we can't export
  if (!resultsNode || !resultsNode.data?.votes) {
    return { exported: 0, failed: 0 };
  }

  // Calculate the most common estimate from votes
  const votes = resultsNode.data.votes;
  if (!votes || votes.length === 0) {
    return { exported: 0, failed: 0 };
  }

  // Count vote frequencies
  const voteCounts: Record<string, number> = {};
  votes.forEach((vote: { cardLabel?: string; cardValue?: number }) => {
    const label = vote.cardLabel || vote.cardValue?.toString() || "";
    if (label) {
      voteCounts[label] = (voteCounts[label] || 0) + 1;
    }
  });

  // Find the most common estimate (consensus)
  let consensusEstimate = "";
  let maxCount = 0;
  for (const [label, count] of Object.entries(voteCounts)) {
    if (count > maxCount) {
      maxCount = count;
      consensusEstimate = label;
    }
  }

  // If no consensus, don't export
  if (!consensusEstimate) {
    return { exported: 0, failed: 0 };
  }

  let exported = 0;
  let failed = 0;

  // Export to each GitHub issue
  for (const node of githubStories) {
    try {
      const labelName = formatEstimateLabel(consensusEstimate);
      const result = await addLabelToIssue(
        integration.personalAccessToken,
        integration.repositoryOwner,
        integration.repositoryName,
        node.data.githubIssueNumber,
        labelName
      );

      if (result.success) {
        // Update node to mark as exported
        await ctx.db.patch(node._id, {
          data: {
            ...node.data,
            estimateExported: true,
            lastExportedEstimate: consensusEstimate,
            lastExportedAt: Date.now(),
          },
        });
        exported++;
      } else {
        console.error(
          `Failed to export estimate for issue #${node.data.githubIssueNumber}:`,
          result.error
        );
        failed++;
      }
    } catch (error) {
      console.error(`Error exporting estimate for node ${node._id}:`, error);
      failed++;
    }
  }

  return { exported, failed };
}
