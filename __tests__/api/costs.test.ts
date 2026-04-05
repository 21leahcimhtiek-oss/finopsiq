import { NextRequest } from "next/server";

// Mock Supabase
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { org_id: "org-123" },
        error: null,
      }),
      mockResolvedValue: jest.fn().mockResolvedValue({
        data: [
          {
            id: "cr-1",
            org_id: "org-123",
            cloud_account_id: "acc-1",
            service: "Amazon EC2",
            resource_id: "i-123",
            region: "us-east-1",
            amount_usd: 120.5,
            currency: "USD",
            usage_date: "2024-01-15",
            tags: { env: "prod" },
            created_at: "2024-01-15T00:00:00Z",
          },
        ],
        count: 1,
        error: null,
      }),
    })),
  })),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true, remaining: 99, reset: 0 }),
  rateLimiter: {},
}));

describe("GET /api/costs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as jest.Mock).mockReturnValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const { GET } = await import("@/app/api/costs/route");
    const req = new NextRequest("http://localhost/api/costs");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return cost records for authenticated user", async () => {
    const { GET } = await import("@/app/api/costs/route");
    const req = new NextRequest("http://localhost/api/costs");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("data");
  });

  it("should accept filter parameters", async () => {
    const { GET } = await import("@/app/api/costs/route");
    const url = "http://localhost/api/costs?service=EC2&start_date=2024-01-01&end_date=2024-01-31&page=1&per_page=10";
    const req = new NextRequest(url);
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("should return 429 when rate limit exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    (checkRateLimit as jest.Mock).mockResolvedValueOnce({ success: false, remaining: 0, reset: 1000 });

    const { GET } = await import("@/app/api/costs/route");
    const req = new NextRequest("http://localhost/api/costs");
    const res = await GET(req);
    expect(res.status).toBe(429);
  });
});