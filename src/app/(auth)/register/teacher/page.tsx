import { redirect } from "next/navigation";

export default function RegisterTeacherRedirectPage() {
  redirect("/register?role=teacher");
}
