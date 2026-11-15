import { redirect } from "next/navigation";

/**
 * Redirects legacy `/sportss` URL to the live `/sports` sportsbook page.
 */
export default function LegacySportsRedirect() {
  redirect("/sports");
}
