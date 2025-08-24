import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, checkDatabaseConnection } from '@/lib/init-database'

export async function POST(request: NextRequest) {
  try {
    // Check if database is connected
    const connectionCheck = await checkDatabaseConnection()
    if (!connectionCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          details: connectionCheck.error
        },
        { status: 500 }
      )
    }

    // Initialize database
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Database initialization failed',
          details: result.error
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Just check database connection for health check
    const connectionCheck = await checkDatabaseConnection()

    return NextResponse.json({
      success: connectionCheck.success,
      connected: connectionCheck.connected,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
