import { redirect } from "next/navigation";

/** `/admin` is not a screen — it is a shortcut to the overview. */
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
