import { useState } from "react";
import { supabase } from "../Utils/supabaseClient";

export function useAdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setError(null);
    setLoading(true);

    const { data: userData, error: fetchError } = await supabase
      .from("admin_user")
      .select("*")
      .eq("username", username)
      .single();

    setLoading(false);

    if (fetchError || !userData || userData.password !== password) {
      setError("Invalid username or password");
      return { success: false };
    }

    return { success: true };
  };

  return { login, loading, error };
}
