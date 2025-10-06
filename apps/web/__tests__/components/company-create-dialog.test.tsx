import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompanyCreateDialog } from '@/components/company-create-dialog'

/**
 * Frontend Component Tests - Company Create Dialog
 * 
 * Tests the company creation dialog component in isolation
 * No backend or database required - components are mocked
 */

describe('CompanyCreateDialog Component', () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('should render company create form fields', () => {
    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    const saveButton = screen.getByRole('button', { name: /create|save/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/company name/i)
      expect(nameInput).toBeInvalid()
    })
  })

  it('should accept valid company data input', () => {
    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    const nameInput = screen.getByLabelText(/company name/i)
    const industryInput = screen.getByLabelText(/industry/i)
    
    fireEvent.change(nameInput, { target: { value: 'New Company' } })
    fireEvent.change(industryInput, { target: { value: 'Technology' } })
    
    expect(nameInput).toHaveValue('New Company')
    expect(industryInput).toHaveValue('Technology')
  })

  it('should validate website URL format', async () => {
    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    const websiteInput = screen.getByLabelText(/website/i)
    fireEvent.change(websiteInput, { target: { value: 'invalid-url' } })
    
    const saveButton = screen.getByRole('button', { name: /create|save/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(websiteInput).toBeInvalid()
    })
  })

  it('should handle successful form submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', name: 'New Company' }),
    })

    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    const nameInput = screen.getByLabelText(/company name/i)
    const saveButton = screen.getByRole('button', { name: /create|save/i })
    
    fireEvent.change(nameInput, { target: { value: 'New Company' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should display error message on submission failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    const nameInput = screen.getByLabelText(/company name/i)
    const saveButton = screen.getByRole('button', { name: /create|save/i })
    
    fireEvent.change(nameInput, { target: { value: 'New Company' } })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should disable form during submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<CompanyCreateDialog open={true} onOpenChange={() => {}} onSuccess={mockOnSuccess} />)
    
    const nameInput = screen.getByLabelText(/company name/i)
    const saveButton = screen.getByRole('button', { name: /create|save/i })
    
    fireEvent.change(nameInput, { target: { value: 'New Company' } })
    fireEvent.click(saveButton)
    
    expect(saveButton).toBeDisabled()
  })
})
