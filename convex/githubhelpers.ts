/**
 * GitHub integration helper functions
 */

export interface ParsedRepo {
  owner: string;
  name: string;
}

/**
 * Parse GitHub repository URL to extract owner and repo name
 * Supports various URL formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - owner/repo
 */
export function parseRepoUrl(url: string): ParsedRepo | null {
  const trimmed = url.trim();

  // Handle owner/repo format
  const simpleMatch = trimmed.match(/^([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (simpleMatch) {
    return {
      owner: simpleMatch[1],
      name: simpleMatch[2],
    };
  }

  // Handle HTTPS URLs
  const httpsMatch = trimmed.match(
    /https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/
  );
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      name: httpsMatch[2],
    };
  }

  // Handle SSH URLs
  const sshMatch = trimmed.match(
    /git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/
  );
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      name: sshMatch[2],
    };
  }

  return null;
}

/**
 * Validate GitHub personal access token by making a test API call
 */
export async function validateGithubToken(
  token: string,
  owner: string,
  repo: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401) {
      return {
        valid: false,
        error: "Invalid token or insufficient permissions",
      };
    }

    if (response.status === 404) {
      return { valid: false, error: "Repository not found or access denied" };
    }

    return {
      valid: false,
      error: `Unexpected error: ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Truncate description to specified length with ellipsis
 */
export function truncateDescription(
  description: string | null | undefined,
  maxLength = 500
): string {
  if (!description) {
    return "";
  }

  if (description.length <= maxLength) {
    return description;
  }

  return description.substring(0, maxLength).trim() + "... (view on GitHub)";
}

/**
 * Format estimate value as GitHub label
 * Examples: "estimate: 5", "estimate: XL", "estimate: 13"
 */
export function formatEstimateLabel(estimate: string | number): string {
  return `estimate: ${estimate}`;
}

/**
 * Create a label on GitHub if it doesn't exist
 */
export async function ensureGithubLabel(
  token: string,
  owner: string,
  repo: string,
  labelName: string,
  color = "0E8A16" // Green color
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, check if label exists
    const checkResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/labels/${encodeURIComponent(labelName)}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (checkResponse.ok) {
      return { success: true }; // Label already exists
    }

    // If not found, create it
    if (checkResponse.status === 404) {
      const createResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/labels`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: labelName,
            color: color,
            description: "Estimate from poker planning",
          }),
        }
      );

      if (createResponse.ok) {
        return { success: true };
      }

      return {
        success: false,
        error: `Failed to create label: ${createResponse.status}`,
      };
    }

    return {
      success: false,
      error: `Failed to check label: ${checkResponse.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Add a label to a GitHub issue
 */
export async function addLabelToIssue(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  labelName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First ensure the label exists
    const labelResult = await ensureGithubLabel(token, owner, repo, labelName);
    if (!labelResult.success) {
      return labelResult;
    }

    // Get current labels
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!getResponse.ok) {
      return {
        success: false,
        error: `Failed to get issue labels: ${getResponse.status}`,
      };
    }

    const currentLabels = await getResponse.json();
    const labelNames = currentLabels.map(
      (label: { name: string }) => label.name
    );

    // Remove any existing estimate labels
    const filteredLabels = labelNames.filter(
      (name: string) => !name.startsWith("estimate:")
    );

    // Add the new estimate label
    filteredLabels.push(labelName);

    // Update labels
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ labels: filteredLabels }),
      }
    );

    if (updateResponse.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: `Failed to update labels: ${updateResponse.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export interface GithubIssue {
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  labels: Array<{ name: string; color: string }>;
}

/**
 * Fetch issues from GitHub repository
 */
export async function fetchGithubIssues(
  token: string,
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
): Promise<{ success: boolean; issues?: GithubIssue[]; error?: string }> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=100`;

    // GitHub supports both "token" (classic PAT) and "Bearer" (fine-grained) formats
    // Try with "token" prefix first (more common for classic Personal Access Tokens)
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid token or insufficient permissions",
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: "Repository not found or access denied",
        };
      }
      return {
        success: false,
        error: `GitHub API error: ${response.status} ${response.statusText}`,
      };
    }

    const issues = await response.json();

    // Filter out pull requests (they're returned as issues by the API)
    const filteredIssues = issues.filter(
      (issue: { pull_request?: unknown }) => !issue.pull_request
    );

    return { success: true, issues: filteredIssues };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
