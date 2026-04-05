import { NextRequest } from "next/server";

const mockAnomalies = [
  { id: "a1", account_id: "acc1", service: "EC2", date: "2024-01-15", cost_usd: "500.00", baseline_usd: "100.00", anomaly_score: 4.2, severity: "high", status: "open", explanation: "Cost spike detected" },
];

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user1" } }, error: null }) },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { org_id: "org1" }, error: null }),
    order: jest.fn().mockResolvedValue({ data: mockAnomalies, error: null }),
  })),
}));

jest.mock("@/lib/rate-limit", () => ({ rateLimit: jest.fn().mockResolvedValue({ success: true }) }));

describe("GET /api/anomalies", () => {
  it("returns anomalies list", async () => {
    const { GET } = await import("@/app/api/anomalies/route");
    const req = new NextRequest("http://localhost:3000/api/anomalies");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("severity");
    expect(data[0].severity).toBe("high");
  });

  it("returns anomalies filtered by status", async () => {
    const { GET } = await import("@/app/api/anomalies/route");
    const req = new NextRequest("http://localhost:3000/api/anomalies?status=open");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});