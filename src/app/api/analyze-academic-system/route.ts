import { NextRequest, NextResponse } from 'next/server'
import { analyzeAcademicSystem, checkDatabaseConnection } from '@/lib/init-database'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
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

    // Analyze the existing academic system
    const analysis = await analyzeAcademicSystem()

    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to analyze academic system'
        },
        { status: 500 }
      )
    }

    // Generate integration report
    const integrationReport = {
      status: 'success',
      analysis,
      recommendations: generateRecommendations(analysis),
      nextSteps: generateNextSteps(analysis)
    }

    return NextResponse.json({
      success: true,
      ...integrationReport,
      timestamp: new Date().toISOString()
    })
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

function generateRecommendations(analysis: Record<string, boolean | object>) {
  const recommendations = []

  if (analysis.hasCourses || analysis.hasPrograms || analysis.hasAcademicPrograms) {
    recommendations.push({
      type: 'integration',
      priority: 'high',
      title: 'Use Existing Program Data',
      description: 'Student Registration System will automatically read from your existing academic program tables.',
      action: 'No action required - integration is automatic'
    })
  } else {
    recommendations.push({
      type: 'setup',
      priority: 'medium',
      title: 'Initialize Sample Program Data',
      description: 'No existing program data found. Sample programs will be created for testing.',
      action: 'Click "Initialize Sample Data" to proceed'
    })
  }

  if (analysis.hasDepartments) {
    recommendations.push({
      type: 'integration',
      priority: 'medium',
      title: 'Link to Department Data',
      description: 'Consider linking student records to existing department structure.',
      action: 'Update student table foreign keys to reference departments'
    })
  }

  recommendations.push({
    type: 'security',
    priority: 'high',
    title: 'Configure Access Controls',
    description: 'Set up proper row-level security for student data.',
    action: 'Review and configure RLS policies in Supabase dashboard'
  })

  return recommendations
}

function generateNextSteps(analysis: Record<string, boolean | object>) {
  const steps = []

  if (analysis.hasCourses || analysis.hasPrograms) {
    steps.push({
      step: 1,
      title: 'Test Program Integration',
      description: 'Verify that the application form loads programs from your existing academic tables',
      estimated: '2 minutes'
    })
  } else {
    steps.push({
      step: 1,
      title: 'Initialize Sample Data',
      description: 'Create sample programs and intake periods for testing',
      estimated: '1 minute'
    })
  }

  steps.push({
    step: 2,
    title: 'Test Student Application',
    description: 'Submit a test application through the application form',
    estimated: '5 minutes'
  })

  steps.push({
    step: 3,
    title: 'Verify Student Portal',
    description: 'Login to student portal using the generated Student ID',
    estimated: '2 minutes'
  })

  steps.push({
    step: 4,
    title: 'Configure Production Settings',
    description: 'Set up proper authentication and access controls',
    estimated: '15 minutes'
  })

  return steps
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'refresh') {
      // Re-analyze the system
      const analysis = await analyzeAcademicSystem()
      return NextResponse.json({
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
