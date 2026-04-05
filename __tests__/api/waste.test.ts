import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { org_id: "org-123" }, error: null }),
      mockResolvedValue: jest.fn().mockResolvedValue({
        data: [
          {
            id: "wf-1",
            resource_type: "EC2 Instance",
            resource_id: "i-idle-123",
            waste_type: "idle_instance",
            estimated_monthly_waste_usd: 250,
            recommendation: "Stop or terminate this idle instance",
            confidence_score: 0.95,
            status: "open",
            found_at: "2024-01-15T00:00:00Z",
          },
        ],
        error: null,
      }),
    })),
  })),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true, remaining: 9, reset: 0 }),
  aiRateLimiter: {},
  rateLimiter: {},
}));

jest.mock("@/lib/openai/detect-waste", () => ({
  detectWaste: jest.fn().mockResolvedValue({
    findings: [
      {
        resource_id: "i-idle-123",
        resource_type: "EC2 Instance",
        waste_type: "idle_instance",
        estimated_monthly_waste_usd: 250,
        recommendation: "Stop or terminate this idle instance",
        confidence_score: 0.95,
      },
    ],
    total_estimated_monthly_waste_usd: 250,
    summary: "Found 1 idle instance",
  }),
}));

describe("GET /api/waste", () => {
  it("should return waste findings", async () => {
    const { GET } = await import("@/app/api/waste/route");
    const req = new NextRequest("http://localhost/api/waste?status=open");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should return 401 when not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as jest.Mock).mockReturnValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const { GET } = await import("@/app/api/waste/route");
    const req = new NextRequest("http://localhost/api/waste");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/waste/[id]", () => {
  it("should update finding status to resolved", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: "wf-1", status: "resolved" },
            error: null,
          }),
        }),
      }),
    });
    (createClient as jest.Mock).mockReturnValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: jest.fn(() => ({ update: mockUpdate })),
    });

    const { PATCH } = await import("@/app/api/waste/[id]/route");
    const req = new NextRequest("http://localhost/api/waste/wf-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "resolved" }),
    });
    const res = await PATCH(req, { params: { id: "wf-1" } });
    expect(res.status).toBe(200);
  });
});