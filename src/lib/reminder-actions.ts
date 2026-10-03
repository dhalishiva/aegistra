"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "./workspace";

export async function updateReviewReminderSettings(formData: FormData) {
  const { supabase, user, workspace, membership } = await getSessionContext();

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Only workspace owners and admins can manage reminders.");
  }

  const enabled = formData.get("enabled") === "on";
  const includeOverdue = formData.get("include_overdue") === "on";
  const daysBefore = Number(formData.get("days_before") || 7);
  const overdueRepeatDays = Number(formData.get("overdue_repeat_days") || 7);

  if (!Number.isInteger(daysBefore) || daysBefore < 1 || daysBefore > 60) {
    throw new Error("Reminder lead time must be between 1 and 60 days.");
  }

  if (
    !Number.isInteger(overdueRepeatDays) ||
    overdueRepeatDays < 1 ||
    overdueRepeatDays > 30
  ) {
    throw new Error("Overdue repeat interval must be between 1 and 30 days.");
  }

  const { error } = await supabase
    .from("workspace_reminder_settings")
    .upsert(
      {
        workspace_id: workspace.id,
        enabled,
        days_before: daysBefore,
        include_overdue: includeOverdue,
        overdue_repeat_days: overdueRepeatDays,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" }
    );

  if (error) throw error;

  revalidatePath("/app/settings");
  revalidatePath("/app/activity");
}
