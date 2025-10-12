import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  addLabelToIssue,
  fetchGithubIssues,
  formatEstimateLabel,
  parseRepoUrl,
  truncateDescription,
  validateGithubToken,
} from "./githubhelpers";

// Internal query to get room for GitHub integration
export const getRoomForGithubIntegration = internalQuery({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

// Internal mutation to save GitHub integration data
export const saveGithubIntegrationData = internalMutation({
  args: {
    roomId: v.id("rooms"),
    personalAccessToken: v.string(),
    repositoryUrl: v.string(),
    repositoryOwner: v.string(),
    repositoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("githubIntegration")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (existing) {
      // Update existing integration
      await ctx.db.patch(existing._id, {
        personalAccessToken: args.personalAccessToken,
        repositoryUrl: args.repositoryUrl,
        repositoryOwner: args.repositoryOwner,
        repositoryName: args.repositoryName,
        connectedAt: Date.now(),
      });
    } else {
      // Create new integration
      await ctx.db.insert("githubIntegration", {
        roomId: args.roomId,
        personalAccessToken: args.personalAccessToken,
        repositoryUrl: args.repositoryUrl,
        repositoryOwner: args.repositoryOwner,
        repositoryName: args.repositoryName,
        connectedAt: Date.now(),
      });
    }
  },
});

// Internal query to get user and integration for fetching issues
export const getUserAndIntegration = internalQuery({
  args: {
    userId: v.id("users"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const integration = await ctx.db
      .query("githubIntegration")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    return { user, integration };
  },
});

// Internal query to get node and integration for export
export const getNodeAndIntegration = internalQuery({
  args: {
    roomId: v.id("rooms"),
    nodeId: v.string(),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_node", (q) =>
        q.eq("roomId", args.roomId).eq("nodeId", args.nodeId)
      )
      .first();

    const integration = await ctx.db
      .query("githubIntegration")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    return { node, integration };
  },
});

// Internal mutation to update node after estimate export
export const updateNodeAfterExport = internalMutation({
  args: {
    nodeId: v.id("canvasNodes"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nodeId, {
      data: args.data,
    });
  },
});

// Internal query to get all data for bulk export
export const getDataForBulkExport = internalQuery({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("githubIntegration")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    const room = await ctx.db.get(args.roomId);

    const storyNodes = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_type", (q) =>
        q.eq("roomId", args.roomId).eq("type", "story")
      )
      .collect();

    return { integration, room, storyNodes };
  },
});

// Save GitHub integration for a room
export const saveGithubIntegration = action({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    personalAccessToken: v.string(),
    repositoryUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is room owner (read operation)
    const room = await ctx.runQuery(
      internal.github.getRoomForGithubIntegration,
      {
        roomId: args.roomId,
      }
    );

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.ownerId !== args.userId) {
      throw new Error("Only room owner can configure GitHub integration");
    }

    // Parse repository URL
    const parsed = parseRepoUrl(args.repositoryUrl);
    if (!parsed) {
      throw new Error(
        "Invalid repository URL. Use format: https://github.com/owner/repo or owner/repo"
      );
    }

    // Validate token (external API call - this is why we need an action)
    const validation = await validateGithubToken(
      args.personalAccessToken,
      parsed.owner,
      parsed.name
    );

    if (!validation.valid) {
      throw new Error(validation.error || "Failed to validate GitHub token");
    }

    // Check if integration already exists and save (database operations)
    await ctx.runMutation(internal.github.saveGithubIntegrationData, {
      roomId: args.roomId,
      personalAccessToken: args.personalAccessToken,
      repositoryUrl: args.repositoryUrl,
      repositoryOwner: parsed.owner,
      repositoryName: parsed.name,
    });

    return { success: true, owner: parsed.owner, name: parsed.name };
  },
});

// Remove GitHub integration
export const removeGithubIntegration = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify user is room owner
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.ownerId !== args.userId) {
      throw new Error("Only room owner can remove GitHub integration");
    }

    // Find and delete integration
    const integration = await ctx.db
      .query("githubIntegration")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (integration) {
      await ctx.db.delete(integration._id);
    }

    return { success: true };
  },
});

// Get GitHub integration (sanitized, no PAT)
export const getGithubIntegration = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("githubIntegration")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!integration) {
      return null;
    }

    // Return sanitized data (no token)
    return {
      repositoryUrl: integration.repositoryUrl,
      repositoryOwner: integration.repositoryOwner,
      repositoryName: integration.repositoryName,
      connectedAt: integration.connectedAt,
    };
  },
});

// Get already imported GitHub issue numbers for a room
export const getImportedIssueNumbers = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const storyNodes = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_type", (q) =>
        q.eq("roomId", args.roomId).eq("type", "story")
      )
      .collect();

    // Extract GitHub issue numbers from story nodes
    const issueNumbers = storyNodes
      .filter((node) => node.data?.githubIssueNumber)
      .map((node) => node.data.githubIssueNumber as number);

    return issueNumbers;
  },
});

// Fetch issues from GitHub
export const fetchIssues = action({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    state: v.optional(
      v.union(v.literal("open"), v.literal("closed"), v.literal("all"))
    ),
  },
  handler: async (ctx, args) => {
    // Verify user is in the room and get integration
    const { user, integration } = await ctx.runQuery(
      internal.github.getUserAndIntegration,
      {
        userId: args.userId,
        roomId: args.roomId,
      }
    );

    if (!user || user.roomId !== args.roomId) {
      throw new Error("User not in room");
    }

    if (!integration) {
      throw new Error("GitHub integration not configured");
    }

    // Fetch issues (external API call - this is why we need an action)
    const result = await fetchGithubIssues(
      integration.personalAccessToken,
      integration.repositoryOwner,
      integration.repositoryName,
      args.state || "open"
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch issues");
    }

    // Format issues with truncated descriptions
    const formattedIssues = result.issues!.map((issue) => ({
      number: issue.number,
      title: issue.title,
      body: truncateDescription(issue.body),
      url: issue.html_url,
      state: issue.state,
      labels: issue.labels.map((label) => ({
        name: label.name,
        color: label.color,
      })),
    }));

    return formattedIssues;
  },
});

// Import GitHub issue as a story node
export const importIssue = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    issueNumber: v.number(),
    title: v.string(),
    description: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is room owner
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.ownerId !== args.userId) {
      throw new Error("Only room owner can import issues");
    }

    // Generate unique node ID
    const nodeId = `story-github-${args.issueNumber}-${Date.now()}`;

    // Check if issue already imported
    const existingNode = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_type", (q) =>
        q.eq("roomId", args.roomId).eq("type", "story")
      )
      .filter((q) => q.eq(q.field("data.githubIssueNumber"), args.issueNumber))
      .first();

    if (existingNode) {
      throw new Error("This issue has already been imported");
    }

    // Create story node at a fixed position (all stories share the same position)
    await ctx.db.insert("canvasNodes", {
      roomId: args.roomId,
      nodeId,
      type: "story",
      position: { x: -140, y: -500 }, // Fixed position above session node
      data: {
        title: args.title,
        description: args.description,
        githubIssueNumber: args.issueNumber,
        githubIssueUrl: args.url,
        estimateExported: false,
      },
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: args.userId,
      isLocked: true, // Lock position so users can't move it
    });

    // If this is the first story, make it active
    if (!room.activeStoryNodeId) {
      await ctx.db.patch(args.roomId, {
        activeStoryNodeId: nodeId,
      });
    }

    return { success: true, nodeId };
  },
});

// Export estimate to GitHub (internal action - can be called from mutations via scheduler)
export const exportEstimateInternal = action({
  args: {
    roomId: v.id("rooms"),
    nodeId: v.string(),
    estimate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the node and integration (read operations)
    const { node, integration } = await ctx.runQuery(
      internal.github.getNodeAndIntegration,
      {
        roomId: args.roomId,
        nodeId: args.nodeId,
      }
    );

    if (!node) {
      return { success: false, error: "Node not found" };
    }

    if (node.type !== "story") {
      return { success: false, error: "Only story nodes can export estimates" };
    }

    const githubIssueNumber = node.data?.githubIssueNumber;
    if (!githubIssueNumber) {
      return { success: false, error: "Node is not linked to a GitHub issue" };
    }

    if (!integration) {
      return { success: false, error: "GitHub integration not configured" };
    }

    // Format and add label (external API call)
    const labelName = formatEstimateLabel(args.estimate);
    const result = await addLabelToIssue(
      integration.personalAccessToken,
      integration.repositoryOwner,
      integration.repositoryName,
      githubIssueNumber,
      labelName
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to export estimate",
      };
    }

    // Update node to mark as exported (database operation)
    await ctx.runMutation(internal.github.updateNodeAfterExport, {
      nodeId: node._id,
      data: {
        ...node.data,
        estimateExported: true,
        lastExportedEstimate: args.estimate,
        lastExportedAt: Date.now(),
      },
    });

    return { success: true };
  },
});

// Export estimate to GitHub (public action - can be called from frontend)
export const exportEstimate = action({
  args: {
    roomId: v.id("rooms"),
    nodeId: v.string(),
    estimate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the node and integration (read operations)
    const { node, integration } = await ctx.runQuery(
      internal.github.getNodeAndIntegration,
      {
        roomId: args.roomId,
        nodeId: args.nodeId,
      }
    );

    if (!node) {
      throw new Error("Node not found");
    }

    if (node.type !== "story") {
      throw new Error("Only story nodes can export estimates");
    }

    const githubIssueNumber = node.data?.githubIssueNumber;
    if (!githubIssueNumber) {
      throw new Error("Node is not linked to a GitHub issue");
    }

    if (!integration) {
      throw new Error("GitHub integration not configured");
    }

    // Format and add label (external API call)
    const labelName = formatEstimateLabel(args.estimate);
    const result = await addLabelToIssue(
      integration.personalAccessToken,
      integration.repositoryOwner,
      integration.repositoryName,
      githubIssueNumber,
      labelName
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to export estimate");
    }

    // Update node to mark as exported (database operation)
    await ctx.runMutation(internal.github.updateNodeAfterExport, {
      nodeId: node._id,
      data: {
        ...node.data,
        estimateExported: true,
        lastExportedEstimate: args.estimate,
        lastExportedAt: Date.now(),
      },
    });

    return { success: true };
  },
});

// Export estimates for all GitHub-linked stories that haven't been exported
export const exportAllEstimates = action({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    // Get integration, room, and story nodes (read operations)
    const { integration, room, storyNodes } = await ctx.runQuery(
      internal.github.getDataForBulkExport,
      {
        roomId: args.roomId,
      }
    );

    if (!integration) {
      return { success: false, exported: 0, failed: 0 };
    }

    if (!room || !room.isGameOver) {
      return { success: false, exported: 0, failed: 0 };
    }

    const githubStories = storyNodes.filter(
      (node) =>
        node.data?.githubIssueNumber &&
        !node.data?.estimateExported &&
        node.data?.finalEstimate
    );

    let exported = 0;
    let failed = 0;

    for (const node of githubStories) {
      try {
        const labelName = formatEstimateLabel(node.data.finalEstimate);
        // External API call
        const result = await addLabelToIssue(
          integration.personalAccessToken,
          integration.repositoryOwner,
          integration.repositoryName,
          node.data.githubIssueNumber,
          labelName
        );

        if (result.success) {
          // Database update
          await ctx.runMutation(internal.github.updateNodeAfterExport, {
            nodeId: node._id,
            data: {
              ...node.data,
              estimateExported: true,
              lastExportedEstimate: node.data.finalEstimate,
              lastExportedAt: Date.now(),
            },
          });
          exported++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error("Failed to export estimate:", error);
        failed++;
      }
    }

    return { success: true, exported, failed };
  },
});
