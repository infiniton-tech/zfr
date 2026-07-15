import { unstable_noStore } from "next/cache";
import AdminDashboardClient from "./dashboard-client";

export default function AdminDashboardPage() {
  unstable_noStore();
  return <AdminDashboardClient />;
}
