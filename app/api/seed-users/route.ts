import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Seed test users into the User table
// Call: POST http://localhost:3000/api/seed-users?secret=seed-users-dev
export async function POST(request: NextRequest) {
  try {
    // Security: require secret header
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const secret = request.headers.get("x-seed-secret");
    if (!secret || secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clear existing users (optional)
    await prisma.user.deleteMany({});

    // Create test users
    const testUsers = [
      {
        id: "test-user-1",
        email: "john@example.com",
        name: "John Doe",
      },
      {
        id: "test-user-2",
        email: "jane@example.com",
        name: "Jane Smith",
      },
      {
        id: "test-user-3",
        email: "bob@example.com",
        name: "Bob Wilson",
      },
      {
        id: "test-user-4",
        email: "alice@example.com",
        name: "Alice Johnson",
      },
      {
        id: "test-user-5",
        email: "charlie@example.com",
        name: "Charlie Brown",
      },
    ];

    const createdUsers = await prisma.user.createMany({
      data: testUsers,
    });

    return NextResponse.json({
      success: true,
      message: `Created ${createdUsers.count} test users`,
      users: testUsers,
    });
  } catch (error) {
    console.error("Error seeding users:", error);
    return NextResponse.json(
      { error: "Failed to seed users" },
      { status: 500 }
    );
  }
}
