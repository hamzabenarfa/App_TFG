import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <div className="min-h-screen bg-background">{children}</div>
}

