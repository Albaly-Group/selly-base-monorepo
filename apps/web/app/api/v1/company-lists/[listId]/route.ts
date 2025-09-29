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

    const service = new CompanyListsService(user)
    const list = await service.getCompanyList(params.listId)
    
    if (!list) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Company list not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error in GET /company-lists/[listId]:', error)
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
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

    const service = new CompanyListsService(user)
    
    try {
      const list = await service.updateCompanyList(params.listId, body)
      
      if (!list) {
        return NextResponse.json(
          { code: 'NOT_FOUND', message: 'Company list not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(list)
    } catch (error: any) {
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { code: 'FORBIDDEN', message: 'You do not have permission to update this list' },
          { status: 403 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error in PATCH /company-lists/[listId]:', error)
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

    const service = new CompanyListsService(user)
    
    try {
      const success = await service.deleteCompanyList(params.listId)
      
      if (!success) {
        return NextResponse.json(
          { code: 'NOT_FOUND', message: 'Company list not found' },
          { status: 404 }
        )
      }

      return new NextResponse(null, { status: 204 })
    } catch (error: any) {
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { code: 'FORBIDDEN', message: 'You do not have permission to delete this list' },
          { status: 403 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error in DELETE /company-lists/[listId]:', error)
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}