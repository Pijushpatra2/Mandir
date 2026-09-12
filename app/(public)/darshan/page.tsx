import { redirect } from "next/navigation";

export default function DarshanPage() {
  redirect("/booking?type=darshan");
}
