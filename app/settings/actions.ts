"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveAdminName(formData: FormData) {
  const name = formData.get("name");
  if (typeof name !== "string") return;
  const clean = name.trim().slice(0, 40);
  const store = await cookies();
  if (clean) store.set("admin_name", clean, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  else store.delete("admin_name");
  revalidatePath("/", "layout");
}

/**
 * The invite message used by the WhatsApp deep link (and seeded into the SMS
 * composer). Tokens {name}/{event} fill in per contact. Cookie-backed until the
 * outreach API stores it per event.
 */
export async function saveInviteTemplate(formData: FormData) {
  const template = formData.get("template");
  if (typeof template !== "string") return;
  const clean = template.trim().slice(0, 500);
  const store = await cookies();
  if (clean) store.set("invite_template", clean, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  else store.delete("invite_template");
  revalidatePath("/", "layout");
}
