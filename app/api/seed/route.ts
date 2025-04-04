import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  // Check if Supabase is initialized
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Supabase client not initialized. Check your environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    // Insert sample orders
    const { error } = await supabase.from("orders").insert([
      {
        patient: "John Doe",
        destination: "Radiology",
        time: "10:30 AM",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        patient: "Jane Smith",
        destination: "Emergency",
        time: "11:15 AM",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        patient: "Robert Johnson",
        destination: "Cardiology",
        time: "12:00 PM",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    // Handle errors
    if (error) {
      console.error("Database error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
