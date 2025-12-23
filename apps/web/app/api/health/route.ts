import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'bizai-web',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  })
}
