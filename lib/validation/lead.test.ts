import { describe, expect, it } from "vitest";
import {
  fieldErrorsFrom,
  leadFormSchema,
  parseLeadForm,
} from "@/lib/validation/lead";

const emergency = {
  kind: "emergency" as const,
  name: "Dana Reed",
  phone: "(214) 555-0100",
  zip: "75201",
  email: "",
  issue: "No cool air since morning",
  address: "",
  preferred_day: "",
  preferred_window: "",
  company: "",
  consent_email: false,
  consent_sms: false,
};

const repair = {
  ...emergency,
  kind: "repair" as const,
  email: "dana@example.com",
  address: "1200 Main St",
  preferred_day: "",
  preferred_window: "morning",
};

const futureDay = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
};

describe("leadFormSchema", () => {
  it("accepts the emergency short form", () => {
    const result = leadFormSchema.safeParse(emergency);
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = leadFormSchema.safeParse({ ...emergency, name: " " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).name).toBe("Name is required.");
    }
  });

  it("rejects a phone with too few digits", () => {
    const result = leadFormSchema.safeParse({ ...emergency, phone: "214555" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).phone).toMatch(/call you back/);
    }
  });

  it("rejects a four digit zip", () => {
    const result = leadFormSchema.safeParse({ ...emergency, zip: "7520" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).zip).toBe("ZIP must be 5 digits.");
    }
  });

  it("rejects an empty emergency issue", () => {
    const result = leadFormSchema.safeParse({ ...emergency, issue: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).issue).toBe(
        "Tell us what is going on.",
      );
    }
  });

  it("requires an address for the estimate variant", () => {
    const result = leadFormSchema.safeParse({
      ...repair,
      kind: "estimate",
      address: "",
      preferred_window: "afternoon",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).address).toBe(
        "Address is needed for an in-home estimate.",
      );
    }
  });

  it("requires a window for the estimate variant", () => {
    const result = leadFormSchema.safeParse({
      ...repair,
      kind: "estimate",
      address: "1200 Main St",
      preferred_window: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).preferred_window).toBe(
        "Pick a window.",
      );
    }
  });

  it("accepts repair with an empty address", () => {
    const result = leadFormSchema.safeParse({
      ...repair,
      address: "",
      preferred_day: futureDay(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts tune_up and membership_enquiry kinds", () => {
    for (const kind of ["tune_up", "membership_enquiry"] as const) {
      expect(leadFormSchema.safeParse({ ...repair, kind }).success).toBe(true);
    }
  });

  it("rejects an unknown kind", () => {
    const result = leadFormSchema.safeParse({ ...emergency, kind: "pool" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).kind).toBeDefined();
    }
  });

  it("rejects a preferred day in the past", () => {
    const result = leadFormSchema.safeParse({
      ...repair,
      preferred_day: "2020-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).preferred_day).toBe(
        "Pick today or a later day.",
      );
    }
  });

  it("rejects an invalid email on non emergency variants", () => {
    const result = leadFormSchema.safeParse({
      ...repair,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).email).toBe(
        "Enter a valid email address.",
      );
    }
  });

  it("accepts an empty optional email", () => {
    expect(leadFormSchema.safeParse({ ...repair, email: "" }).success).toBe(
      true,
    );
  });
});

describe("parseLeadForm", () => {
  it("maps checkbox presence to consent booleans", () => {
    const formData = new FormData();
    formData.set("kind", "emergency");
    formData.set("name", "Dana Reed");
    formData.set("phone", "2145550100");
    formData.set("zip", "75201");
    formData.set("issue", "No cool air");
    formData.set("consent_email", "on");

    const parsed = parseLeadForm(formData) as Record<string, unknown>;
    expect(parsed.consent_email).toBe(true);
    expect(parsed.consent_sms).toBe(false);
    expect(leadFormSchema.safeParse(parsed).success).toBe(true);
  });

  it("keeps missing optional fields as empty strings", () => {
    const formData = new FormData();
    formData.set("kind", "emergency");
    formData.set("name", "Dana Reed");
    formData.set("phone", "2145550100");
    formData.set("zip", "75201");
    formData.set("issue", "No cool air");

    const parsed = parseLeadForm(formData) as Record<string, unknown>;
    expect(parsed.email).toBe("");
    expect(parsed.preferred_window).toBe("");
    expect(parsed.company).toBe("");
  });
});

describe("fieldErrorsFrom", () => {
  it("keeps the first message per field", () => {
    const formData = new FormData();
    formData.set("kind", "emergency");
    formData.set("name", " ");
    formData.set("phone", "1");
    const result = leadFormSchema.safeParse(parseLeadForm(formData));
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsFrom(result.error);
      expect(errors.name).toBe("Name is required.");
      expect(errors.phone).toMatch(/call you back/);
      expect(Object.keys(errors).sort()).toEqual([
        "issue",
        "name",
        "phone",
        "zip",
      ]);
    }
  });
});
