import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch user's company
  const { data: profile } = await supabase.from('users').select('company').eq('id', user.id).single()
  if (!profile?.company) {
    return NextResponse.json({ error: 'No company found for user' }, { status: 400 })
  }
  const company = profile.company

  // Fetch CRM data for this company
  const [dealsRes, leadsRes, tasksRes] = await Promise.all([
    supabase.from('deals').select('*').eq('company', company),
    supabase.from('leads').select('*').eq('company', company),
    supabase.from('tasks').select('*').eq('company', company),
  ])
  const deals = dealsRes.data || []
  const leads = leadsRes.data || []
  const tasks = tasksRes.data || []

  // Build context for Groq
  const context = `You are an AI assistant for a CRM SaaS app. Only answer questions using the following data. If a question is not related to this data, politely refuse.\n\nDEALS:\n${JSON.stringify(deals, null, 2)}\n\nLEADS:\n${JSON.stringify(leads, null, 2)}\n\nTASKS:\n${JSON.stringify(tasks, null, 2)}\n`;

  // Compose prompt for Groq
  const prompt = `Context:\n${context}\n\nChat history:\n${history.map((h: any) => `${h.type === 'user' ? 'User' : 'Assistant'}: ${h.message}`).join('\n')}\n\nUser: ${message}\nAssistant:`

  // Call Groq API
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer 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`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: context },
        ...history.map((h: any) => ({ role: h.type === 'user' ? 'user' : 'assistant', content: h.message })),
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  })

  if (!groqRes.ok) {
    const error = await groqRes.text()
    console.error("Groq API error:", error)
    return NextResponse.json({ error }, { status: 500 })
  }
  const groqData = await groqRes.json()
  const aiMessage = groqData.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

  return NextResponse.json({ message: aiMessage })
} 