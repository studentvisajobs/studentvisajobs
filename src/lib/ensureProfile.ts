import { supabase } from "@/lib/supabase/client";

type UserRole = "student" | "employer";

export async function ensureProfile(roleOverride?: UserRole) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return null;
    }

    const user = session.user;

    const resolvedRole =
      roleOverride ||
      (user.user_metadata?.role as UserRole | undefined) ||
      "student";

    const profilePayload = {
      id: user.id,
      email: user.email ?? "",
      role: resolvedRole,
      full_name: user.user_metadata?.full_name || "",
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("ensureProfile failed:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("ensureProfile unexpected error:", error);
    return null;
  }
}
