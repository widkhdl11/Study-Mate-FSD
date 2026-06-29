import AccountForm from "../../../components/account/account-form";
import { createClient } from "@/shared/api/supabase/server";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AccountForm user={user} />;
}
