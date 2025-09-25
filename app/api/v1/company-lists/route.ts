import { NextRequest, NextResponse } from 'next/server'
import { CompanyListsService } from '@/lib/services/company-lists-service'
import { validateAuthHeader } from '@/lib/auth/api-auth'
import { ApiError } from '@/lib/types/company-lists'

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const user = await validateAuthHeader(request.headers.get('authorization'))
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const scope = searchParams.get('scope') as 'mine' | 'shared' | 'org' || 'mine'
    const q = searchParams.get('q') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    // Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { code: 'INVALID_PAGE', message: 'Page must be >= 1' },
        { status: 400 }
      )
    }
    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        { code: 'INVALID_LIMIT', message: 'Limit must be between 1 and 200' },
        { status: 400 }
      )
    }

    // Get company lists
    const service = new CompanyListsService(user)
    const result = await service.listCompanyLists({ scope, q, page, limit })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /company-lists:', error)
    return NextResponse.json(
      { 
        code: 'INTERNAL_ERROR', 
        message: 'Internal server error',
        traceId: Math.random().toString(36).substring(7)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await validateAuthHeader(request.headers.get('authorization'))
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication' },
        { status: 401 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { code: 'INVALID_NAME', message: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Create company list
    const service = new CompanyListsService(user)
    const result = await service.createCompanyList(body)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /company-lists:', error)
    return NextResponse.json(
      { 
        code: 'INTERNAL_ERROR', 
        message: 'Internal server error',
        traceId: Math.random().toString(36).substring(7)
      },
      { status: 500 }
    )
  }
}