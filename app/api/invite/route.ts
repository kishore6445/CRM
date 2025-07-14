import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import nodemailer from "nodemailer"
import { randomBytes } from "crypto"

export async function POST(req: NextRequest) {
  const { email, role } = await req.json()
  const supabase = await createClient()
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  // Get current user's company
  const { data: profile } = await supabase
    .from("users")
    .select("company")
    .eq("id", user.id)
    .single()
  if (!profile?.company) return NextResponse.json({ error: "No company found" }, { status: 400 })

  let companyId = profile.company;

  // If companyId is not a valid UUID (i.e., it's a name), look up the UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(companyId)) {
    // Look up company by name
    const { data: companyRow, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("name", companyId)
      .single();
    if (companyError || !companyRow) {
      return NextResponse.json({ error: "Company not found" }, { status: 400 });
    }
    companyId = companyRow.id;
  }

  // Generate invite token
  const token = randomBytes(32).toString("hex")

  // Store invite in DB
  const { error: insertError } = await supabase.from("invites").insert({
    email,
    company: companyId, // always a UUID now
    role,
    invited_by: user.id,
    token,
  })
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Send email using Nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "webservice2630@gmail.com",
      pass: "xilrrdnanpmelsgs",
    },
  })

  const inviteUrl = `http://localhost:3000/register?invite=${token}`

  try {
    await transporter.sendMail({
      from: '"CRM App" <webservice2630@gmail.com>',
      to: email,
      subject: "You're invited to join the CRM team!",
      html: `<p>You have been invited to join the CRM team. <a href="${inviteUrl}">Click here to register</a>.</p>`,
    })
  } catch (emailError) {
    return NextResponse.json({ error: "Failed to send email: " + (emailError as Error).message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
