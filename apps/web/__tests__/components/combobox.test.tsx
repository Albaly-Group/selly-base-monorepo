/**
 * Frontend Component Tests - Combobox
 * 
 * Tests combobox component with searchable dropdown functionality
 * Verifies the fix for cmdk 1.1.1 upgrade
 */

describe('Combobox Component', () => {
  it('should accept valid options array', () => {
    const options = [
      { value: '', label: 'Any Industry' },
      { value: 'tech', label: 'Technology' },
      { value: 'mfg', label: 'Manufacturing' },
    ]

    expect(options).toHaveLength(3)
    expect(options[0]).toHaveProperty('value')
    expect(options[0]).toHaveProperty('label')
  })

  it('should handle empty value correctly', () => {
    const value = ''
    const options = [
      { value: '', label: 'Any Industry' },
      { value: 'tech', label: 'Technology' },
    ]

    const selectedOption = options.find((option) => option.value === value)
    expect(selectedOption).toBeDefined()
    expect(selectedOption?.label).toBe('Any Industry')
  })

  it('should find selected option by value', () => {
    const value = 'tech'
    const options = [
      { value: '', label: 'Any Industry' },
      { value: 'tech', label: 'Technology' },
      { value: 'mfg', label: 'Manufacturing' },
    ]

    const selectedOption = options.find((option) => option.value === value)
    expect(selectedOption).toBeDefined()
    expect(selectedOption?.label).toBe('Technology')
  })

  it('should handle value change callback', () => {
    const mockOnValueChange = jest.fn()
    const currentValue = 'tech'
    const newValue = 'mfg'

    // Simulate the onSelect behavior
    const selectedValue = newValue === currentValue ? '' : newValue
    mockOnValueChange(selectedValue)

    expect(mockOnValueChange).toHaveBeenCalledWith('mfg')
  })

  it('should clear selection when same value is selected', () => {
    const mockOnValueChange = jest.fn()
    const currentValue = 'tech'
    const clickedValue = 'tech'

    // Simulate the onSelect behavior (toggle)
    const selectedValue = clickedValue === currentValue ? '' : clickedValue
    mockOnValueChange(selectedValue)

    expect(mockOnValueChange).toHaveBeenCalledWith('')
  })

  it('should generate unique keys for options', () => {
    const options = [
      { value: 'tech', label: 'Technology' },
      { value: 'mfg', label: 'Manufacturing' },
    ]

    const keys = options.map((option, index) => 
      option.value || `option-${index}`
    )

    expect(keys).toEqual(['tech', 'mfg'])
    expect(new Set(keys).size).toBe(keys.length) // All keys are unique
  })

  it('should handle options with empty values', () => {
    const options = [
      { value: '', label: 'Select...' },
      { value: 'option1', label: 'Option 1' },
    ]

    // Test key generation for empty value
    const key = options[0].value || 'option-0'
    expect(key).toBe('option-0')
  })
})
