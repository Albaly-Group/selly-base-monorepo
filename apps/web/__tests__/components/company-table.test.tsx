import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { CompanyTable } from '@/components/company-table'

/**
 * Frontend Component Tests - Company Table
 * 
 * Tests the company table component in isolation
 * No backend or database required - components are mocked
 */

describe('CompanyTable Component', () => {
  const mockCompanies = [
    {
      id: '1',
      name: 'Test Company 1',
      industry: 'Technology',
      website: 'https://test1.com',
      employee_count: 100,
      revenue: 1000000,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Test Company 2',
      industry: 'Finance',
      website: 'https://test2.com',
      employee_count: 200,
      revenue: 2000000,
      created_at: new Date('2024-01-02'),
      updated_at: new Date('2024-01-02'),
    },
  ]

  it('should render table headers correctly', () => {
    render(<CompanyTable companies={mockCompanies} />)
    
    expect(screen.getByText(/company name/i)).toBeInTheDocument()
    expect(screen.getByText(/industry/i)).toBeInTheDocument()
  })

  it('should display all companies in the list', () => {
    render(<CompanyTable companies={mockCompanies} />)
    
    expect(screen.getByText('Test Company 1')).toBeInTheDocument()
    expect(screen.getByText('Test Company 2')).toBeInTheDocument()
  })

  it('should show empty state when no companies', () => {
    render(<CompanyTable companies={[]} />)
    
    expect(screen.getByText(/no companies/i)).toBeInTheDocument()
  })

  it('should display company details correctly', () => {
    render(<CompanyTable companies={mockCompanies} />)
    
    const firstCompanyRow = screen.getByText('Test Company 1').closest('tr')
    expect(firstCompanyRow).toBeInTheDocument()
    
    if (firstCompanyRow) {
      expect(within(firstCompanyRow).getByText('Technology')).toBeInTheDocument()
    }
  })

  it('should handle undefined or null values gracefully', () => {
    const companiesWithMissingData = [
      {
        id: '1',
        name: 'Incomplete Company',
        industry: null,
        website: null,
        employee_count: null,
        revenue: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    render(<CompanyTable companies={companiesWithMissingData as any} />)
    
    expect(screen.getByText('Incomplete Company')).toBeInTheDocument()
  })

  it('should render action buttons for each company', () => {
    render(<CompanyTable companies={mockCompanies} />)
    
    const actionButtons = screen.getAllByRole('button')
    expect(actionButtons.length).toBeGreaterThan(0)
  })
})
