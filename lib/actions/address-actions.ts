"use server"

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  return await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function addAddress(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized Identity");

  const { name, phone, street, city, state, zipCode, isDefault } = formData;

  // If setting as default, reset others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      name,
      phone,
      street,
      city,
      state,
      zipCode,
      isDefault: isDefault || false,
    },
  });

  revalidatePath("/profile/addresses");
  return address;
}

export async function updateAddress(id: string, formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized Identity");

  const { name, phone, street, city, state, zipCode, isDefault } = formData;

  // If setting as default, reset others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id, userId: user.id },
    data: {
      name,
      phone,
      street,
      city,
      state,
      zipCode,
      isDefault,
    },
  });

  revalidatePath("/profile/addresses");
  return address;
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized Identity");

  await prisma.address.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/profile/addresses");
}

export async function setDefaultAddress(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized Identity");

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id, userId: user.id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/profile/addresses");
}
