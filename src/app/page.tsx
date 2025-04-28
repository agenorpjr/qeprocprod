import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const Page = async () => {

  const session = await auth();
  if (!session) redirect("/sign-in")
  
  if (session && session?.user?.role === "admin") {
    redirect("/admin/dashboard")
    
  }
  if (session && session?.user?.role === "user") {
    redirect("/user/dashboard")
  }

  if (session && session?.user?.role === "approver") {
    redirect("/user/dashboard")
  }

};

export default Page
