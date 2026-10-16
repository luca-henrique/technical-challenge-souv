import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    servico: 'Clinica Bem Viver - BFF Gateway',
    status: 'online',
    timestamp: new Date().toISOString(),
  })
}
