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
