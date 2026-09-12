import { redirect } from "next/navigation";

export default function HallBookingPage() {
  redirect("/booking?type=hall");
}
