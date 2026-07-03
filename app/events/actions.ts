"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EVENTS } from "@/lib/events";

export async function setActiveEvent(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !EVENTS.some((e) => e.id === id)) return;
  const store = await cookies();
  store.set("active_event", id, { path: "/", maxAge: 60 * 60 * 24 * 90 });
  revalidatePath("/", "layout");
  redirect("/");
}
