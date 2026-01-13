"use server"

import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function createTransaction(formData: FormData) {
  const session = await auth()
  
  // Security Check: No session, no entry.
  if (!session?.user?.id) {
    throw new Error("You must be logged in to record a transaction.")
  }

  const amount = parseFloat(formData.get("amount") as string)
  const description = formData.get("description") as string

  await prisma.transaction.create({
    data: {
      amount,
      description,
      status: "COMPLETED",
      userId: session.user.id, // Linking the transaction to the specific user
    },
  })

  // Refresh the page data without a full reload
  revalidatePath("/")
}