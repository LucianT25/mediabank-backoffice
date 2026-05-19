"use server"

import { revalidateTag } from "next/cache";

export const refreshData = async (tag: string) => {
    revalidateTag(tag)
}
