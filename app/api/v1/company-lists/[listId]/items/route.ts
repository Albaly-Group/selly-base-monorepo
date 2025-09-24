import { NextRequest, NextResponse } from 'next/server'
import { CompanyListsService } from '@/lib/services/company-lists-service'
import { validateAuthHeader } from '@/lib/auth/api-auth'

interface Params {
  listId: string
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await validateAuthHeader(request.headers.get('authorization'))
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '25')
    const nextCursor = searchParams.get('nextCursor') || undefined
    const sortBy = searchParams.get('sortBy') as 'name' | 'createdAt' | 'position' || 'name'
    const sortDir = searchParams.get('sortDir') as 'asc' | 'desc' || 'asc'
    const q = searchParams.get('q') || undefined
    const provinceFilter = searchParams.get('filters[province]') || undefined
    const tagKeyFilter = searchParams.get('filters[tagKey]') || undefined
    const tsicFilter = searchParams.get('filters[tsic]') || undefined

    // Validate parameters
    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        { code: 'INVALID_LIMIT', message: 'Limit must be between 1 and 200' },
        { status: 400 }
      )
    }

    if (tsicFilter && !/^[0-9]{5}$/.test(tsicFilter)) {
      return NextResponse.json(
        { code: 'INVALID_TSIC', message: 'TSIC must be a 5-digit number' },
        { status: 400 }
      )
    }

    const service = new CompanyListsService(user)
    
    try {
      const result = await service.listCompanyListItems(params.listId, {
        limit,
        nextCursor,
        sortBy,
        sortDir,
        q,
        'filters[province]': provinceFilter,
        'filters[tagKey]': tagKeyFilter,
        'filters[tsic]': tsicFilter
      })

      return NextResponse.json(result)
    } catch (error: any) {
      if (error.message === 'LIST_NOT_FOUND') {
        return NextResponse.json(
          { code: 'NOT_FOUND', message: 'Company list not found' },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error in GET /company-lists/[listId]/items:', error)
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await validateAuthHeader(request.headers.get('authorization'))
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication' },
        { status: 401 }
      )
    }

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
    if (!body.companyIds || !Array.isArray(body.companyIds) || body.companyIds.length === 0) {
      return NextResponse.json(
        { code: 'INVALID_COMPANY_IDS', message: 'companyIds must be a non-empty array' },
        { status: 400 }
      )
    }

    const service = new CompanyListsService(user)
    
    try {
      const result = await service.addCompaniesToList(params.listId, body)
      return NextResponse.json(result)
    } catch (error: any) {
      if (error.message === 'LIST_NOT_FOUND') {
        return NextResponse.json(
          { code: 'NOT_FOUND', message: 'Company list not found' },
          { status: 404 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { code: 'FORBIDDEN', message: 'You do not have permission to modify this list' },
          { status: 403 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error in POST /company-lists/[listId]/items:', error)
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await validateAuthHeader(request.headers.get('authorization'))
    if (!user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication' },
        { status: 401 }
      )
    }

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
    if (!body.companyIds || !Array.isArray(body.companyIds) || body.companyIds.length === 0) {
      return NextResponse.json(
        { code: 'INVALID_COMPANY_IDS', message: 'companyIds must be a non-empty array' },
        { status: 400 }
      )
    }

    const service = new CompanyListsService(user)
    
    try {
      const result = await service.removeCompaniesFromList(params.listId, body)
      return NextResponse.json(result)
    } catch (error: any) {
      if (error.message === 'LIST_NOT_FOUND') {
        return NextResponse.json(
          { code: 'NOT_FOUND', message: 'Company list not found' },
          { status: 404 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { code: 'FORBIDDEN', message: 'You do not have permission to modify this list' },
          { status: 403 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error in DELETE /company-lists/[listId]/items:', error)
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}