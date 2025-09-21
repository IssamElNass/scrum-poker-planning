import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check - you can add more sophisticated checks here
    // like database connectivity, external service status, etc.

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    };

    // Optional: Check if Convex URL is configured
    const convexConfigured = !!process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexConfigured) {
      return NextResponse.json(
        {
          ...healthStatus,
          status: "degraded",
          message: "Convex URL not configured",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

// Support HEAD requests for basic health checks
export async function HEAD() {
  const response = await GET();
  return new Response(null, { status: response.status });
}
