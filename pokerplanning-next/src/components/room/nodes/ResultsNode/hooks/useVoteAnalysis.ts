import { useMemo } from "react";

interface VoteStats {
  average: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  range: number;
  outliers: number[];
}

interface AgreementQuality {
  consensusStrength: number;
  agreementLevel: "high" | "medium" | "low";
  hasSplit: boolean;
  splitGroups?: Array<{
    values: number[];
    count: number;
  }>;
}

interface VoteCluster {
  value: number;
  count: number;
  percentage: number;
  users: string[];
}

export function useVoteAnalysis(votes: any[], users: any[]) {
  const stats = useMemo<VoteStats>(() => {
    const numericVotes = votes
      .filter((v) => v.hasVoted && v.cardLabel !== "?")
      .map((v) => parseInt(v.cardLabel) || 0)
      .filter((v) => !isNaN(v));

    if (numericVotes.length === 0) {
      return {
        average: 0,
        median: 0,
        mode: [],
        standardDeviation: 0,
        range: 0,
        outliers: [],
      };
    }

    // Sort for median calculation
    const sorted = [...numericVotes].sort((a, b) => a - b);

    // Average
    const average = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;

    // Median
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Mode
    const frequency: Record<number, number> = {};
    numericVotes.forEach((v) => {
      frequency[v] = (frequency[v] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.entries(frequency)
      .filter(([, freq]) => freq === maxFreq)
      .map(([value]) => parseInt(value));

    // Standard deviation
    const variance = numericVotes.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / numericVotes.length;
    const standardDeviation = Math.sqrt(variance);

    // Range
    const range = sorted[sorted.length - 1] - sorted[0];

    // Simple outlier detection (values beyond 1.5 * IQR)
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const outliers = numericVotes.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);

    return {
      average,
      median,
      mode,
      standardDeviation,
      range,
      outliers,
    };
  }, [votes]);

  const participationRate = useMemo(() => {
    const votedCount = votes.filter((v) => v.hasVoted).length;
    return users.length > 0 ? (votedCount / users.length) * 100 : 0;
  }, [votes, users]);

  const voteClusters = useMemo<VoteCluster[]>(() => {
    const clusters: Record<string, VoteCluster> = {};
    
    votes
      .filter((v) => v.hasVoted)
      .forEach((vote) => {
        const value = vote.cardLabel;
        if (!clusters[value]) {
          clusters[value] = {
            value: parseInt(value) || 0,
            count: 0,
            percentage: 0,
            users: [],
          };
        }
        clusters[value].count++;
        const user = users.find((u) => u._id === vote.userId);
        if (user) {
          clusters[value].users.push(user.name);
        }
      });

    const totalVotes = votes.filter((v) => v.hasVoted).length;
    Object.values(clusters).forEach((cluster) => {
      cluster.percentage = totalVotes > 0 ? (cluster.count / totalVotes) * 100 : 0;
    });

    return Object.values(clusters).sort((a, b) => b.count - a.count);
  }, [votes, users]);

  const agreementQuality = useMemo<AgreementQuality>(() => {
    if (stats.standardDeviation === 0) {
      return {
        consensusStrength: 100,
        agreementLevel: "high",
        hasSplit: false,
      };
    }

    // Calculate consensus strength based on standard deviation relative to range
    const normalizedStdDev = stats.range > 0 ? stats.standardDeviation / stats.range : 0;
    const consensusStrength = Math.max(0, Math.min(100, (1 - normalizedStdDev) * 100));

    // Determine agreement level
    const agreementLevel = consensusStrength > 80 ? "high" : consensusStrength > 60 ? "medium" : "low";

    // Check for split groups (if there are distinct clusters)
    const hasSplit = voteClusters.length >= 2 && 
      voteClusters[0].percentage > 30 && 
      voteClusters[1].percentage > 30;

    return {
      consensusStrength,
      agreementLevel,
      hasSplit,
      splitGroups: hasSplit ? voteClusters.slice(0, 2).map(c => ({
        values: [c.value],
        count: c.count,
      })) : undefined,
    };
  }, [stats, voteClusters]);

  const insights = useMemo<string[]>(() => {
    const insights: string[] = [];

    if (participationRate === 100) {
      insights.push("Full team participation achieved");
    } else if (participationRate < 50) {
      insights.push("Low participation rate may affect estimate reliability");
    }

    if (agreementQuality.hasSplit) {
      insights.push("Team opinion is split between different estimates");
    }

    if (stats.outliers.length > 0) {
      insights.push("Some estimates significantly differ from the team consensus");
    }

    if (agreementQuality.consensusStrength > 90) {
      insights.push("Strong team alignment on this estimate");
    }

    return insights;
  }, [participationRate, agreementQuality, stats]);

  const recommendations = useMemo<string[]>(() => {
    const recommendations: string[] = [];

    if (agreementQuality.hasSplit) {
      recommendations.push("Consider discussing the different perspectives before finalizing");
    }

    if (stats.outliers.length > 0) {
      recommendations.push("Review outlier estimates to understand different viewpoints");
    }

    if (participationRate < 100) {
      recommendations.push("Encourage all team members to participate for better estimates");
    }

    if (stats.range > 8) {
      recommendations.push("Wide range of estimates suggests need for more discussion");
    }

    return recommendations;
  }, [agreementQuality, stats, participationRate]);

  return {
    stats,
    participationRate,
    voteClusters,
    agreementQuality,
    insights,
    recommendations,
  };
}