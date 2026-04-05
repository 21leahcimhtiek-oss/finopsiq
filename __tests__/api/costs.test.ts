import { createMocks } from "node-mocks-http";
import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user1" } }, error: null }) },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { org_id: "org1" }, error: null }),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [
      { account_id: "acc1", service: "EC2", cost_usd: "100.50", date: "2024-01-01", region: "us-east-1" },
      { account_id: "acc1", service: "S3", cost_usd: "25.00", date: "2024-01-02", region: "us-east-1" },
    ], error: null }),
  })),
}));

jest.mock("@/lib/rate-limit", () => ({ rateLimit: jest.fn().mockResolvedValue({ success: true }) }));

describe("GET /api/costs", () => {
  it("returns cost records for authenticated user", async () => {
    const { GET } = await import("@/app/api/costs/route");
    const req = new NextRequest("http://localhost:3000/api/costs?start=2024-01-01&end=2024-01-31");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty("service");
  });

  it("returns 400 when date params missing", async () => {
    const { GET } = await import("@/app/api/costs/route");
    const req = new NextRequest("http://localhost:3000/api/costs");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});