import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import prismadb from "@/lib/prismadb"
// import { ORDERS_PAGE_SIZE } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { Order } from "@prisma/client"
import React from "react"

const page = async () => {
  const user = await currentUser()
  const orders = await prismadb.order.findMany({
    where: { authorId: user?.id },
    include: {
      membership: {
        include: { membershipLevel: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  console.log("orders: ", orders)
  return (
    <div className="h-screen flex items-start justify-center py-8">
      <div className="w-2/3 flex items-center">
        <Table className="">
          <TableCaption>A list of your recent orders.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Patron</TableHead>
              <TableHead>Work Name</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Membership Title</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.userMail}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.storyTitle}
                  </TableCell>
                  <TableCell>{order.isPaid ? "Paid" : "Unpaid"}</TableCell>
                  <TableCell>
                    {order?.membership?.membershipLevel?.title}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.totalAmount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-lg p-4">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default page
