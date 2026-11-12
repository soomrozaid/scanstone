import { getUser } from "@/lib/supabase/server";
import { NavBar } from "./NavBar";

export async function SiteNav() {
  let signedIn = false;
  try {
    signedIn = Boolean(await getUser());
  } catch {
    signedIn = false;
  }
  return <NavBar signedIn={signedIn} />;
}
