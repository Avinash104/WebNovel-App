import AdminNavbar from "@/components/admin-navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  )
}
