import { describe, expect, it } from "vitest";
import { ownerAlert, visitorReceipt, type LeadEmailData } from "@/lib/email/templates";

const lead: LeadEmailData = {
  id: "7f6f4f4e-1111-2222-3333-444455556666",
  referenceCode: "APX-ABC234",
  kind: "emergency",
  name: "Dana Reed",
  phone: "(214) 555-0100",
  zip: "75201",
  email: "dana@example.com",
  address: null,
  issue: "No cool air since morning",
  preferredDay: null,
  preferredWindow: null,
  consentEmail: true,
  createdAt: "2026-10-15T15:00:00.000Z",
};

describe("ownerAlert", () => {
  it("prefixes URGENT for emergencies", () => {
    const { subject } = ownerAlert(lead, "https://demo.example");
    expect(subject).toBe("URGENT: New lead APX-ABC234 (emergency, 75201)");
  });

  it("drops the URGENT prefix for non emergencies", () => {
    const { subject } = ownerAlert({ ...lead, kind: "repair" }, "https://demo.example");
    expect(subject).toBe("New lead APX-ABC234 (repair, 75201)");
  });

  it("includes a tel: call link and the admin lead URL", () => {
    const { html, text } = ownerAlert(lead, "https://demo.example");
    expect(html).toContain("tel:2145550100");
    expect(html).toContain("https://demo.example/admin/leads/7f6f4f4e-1111-2222-3333-444455556666");
    expect(text).toContain("tel:2145550100");
  });

  it("warns when the zip sits outside the active areas", () => {
    const { html } = ownerAlert({ ...lead, outsideArea: true }, "https://demo.example");
    expect(html).toContain("outside the active service areas");
    const quiet = ownerAlert({ ...lead, outsideArea: false }, "https://demo.example");
    expect(quiet.html).not.toContain("outside the active service areas");
  });

  it("escapes user supplied text", () => {
    const { html } = ownerAlert(
      { ...lead, name: 'Dana <script>alert("x")</script>', issue: "<img src=x>" },
      "https://demo.example",
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("visitorReceipt", () => {
  it("carries the reference code and the demo notice", () => {
    const { subject, html, text } = visitorReceipt(lead, "https://demo.example");
    expect(subject).toContain("APX-ABC234");
    expect(html).toContain("APX-ABC234");
    expect(html).toContain("fictional demo company");
    expect(text).toContain("fictional demo company");
  });

  it("greets by first name", () => {
    const { html } = visitorReceipt(lead, "https://demo.example");
    expect(html).toContain("Thanks, Dana.");
  });
});
