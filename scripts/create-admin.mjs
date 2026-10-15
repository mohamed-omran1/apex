/**
 * Bootstrap an Apex admin.
 *
 * Creates or promotes a confirmed Supabase Auth user with the admin role in
 * app_metadata, and upserts the matching admin_users log row so the
 * lead_events.actor_user_id foreign key resolves.
 *
 * Idempotent: running it twice for the same email updates the role claim and
 * upserts the log row instead of failing. Running it for an existing non
 * admin user promotes that user.
 *
 * Usage (from the repo root):
 *   node --env-file=.env.local scripts/create-admin.mjs owner@apex.example
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local. The service key never leaves this process and is never
 * committed.
 */

import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Find an existing user by email (the admin API has no lookup by email;
//    list a page and filter client side).
const { data: list, error: listError } = await admin.auth.admin.listUsers(1000);
if (listError) {
  console.error("Could not list users:", listError.message);
  process.exit(1);
}
const existing = list.users.find((user) => user.email?.toLowerCase() === email);

let userId;

if (existing) {
  // 2a. Promote: set the role claim, make sure the email is confirmed.
  const { data: updated, error: updateError } =
    await admin.auth.admin.updateUserById(existing.id, {
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: "admin" },
    });
  if (updateError) {
    console.error("Could not promote existing user:", updateError.message);
    process.exit(1);
  }
  userId = updated.user.id;
  console.log(`Promoted existing user ${email} (${userId}).`);
} else {
  // 2b. Create: confirmed, with the role claim. The admin API bypasses the
  //     public signup switch, so this works even with signups off.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
    app_metadata: { role: "admin" },
  });
  if (createError) {
    console.error("Could not create user:", createError.message);
    process.exit(1);
  }
  userId = created.user.id;
  console.log(`Created admin user ${email} (${userId}).`);
}

// 3. Upsert the admin_users log row. The lead_events.actor_user_id foreign
//    key needs it; RLS no longer reads this table.
const { error: rowError } = await admin
  .from("admin_users")
  .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });
if (rowError) {
  console.error("Could not upsert admin_users row:", rowError.message);
  process.exit(1);
}

// 4. Confirm the claim stuck.
const { data: after } = await admin.auth.admin.getUserById(userId);
const role = after?.user?.app_metadata?.role;
if (role !== "admin") {
  console.error(`Claim did not stick; app_metadata.role is ${role}.`);
  process.exit(1);
}

console.log(`admin_users row upserted for ${userId}.`);
console.log(`Ready. Sign in at /admin/sign-in with ${email}.`);
