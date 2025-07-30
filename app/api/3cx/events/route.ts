import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      const data = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`
      controller.enqueue(encoder.encode(data))

      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`
          controller.enqueue(encoder.encode(heartbeatData))
        } catch (error) {
          console.error('SSE heartbeat error:', error)
          clearInterval(heartbeat)
          controller.close()
        }
      }, 25000) // 25 seconds (less than typical 30s timeout)

      const cleanup = () => {
        clearInterval(heartbeat)
        try {
          controller.close()
        } catch (error) {
        }
      }

      request.signal.addEventListener('abort', cleanup)

      controller.error = (error: any) => {
        console.error('SSE controller error:', error)
        cleanup()
      }
    },
    
    cancel() {
      console.log('SSE connection cancelled by client')
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
