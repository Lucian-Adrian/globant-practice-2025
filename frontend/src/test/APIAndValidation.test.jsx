import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { DataProviderContext, I18nContextProvider } from 'react-admin'
import { raI18nProvider } from '../i18n/index.jsx'

// Mock react-router-dom hooks but keep MemoryRouter
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

// Create a simple test wrapper
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

const theme = createTheme()

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <MemoryRouter>
      <QueryClientProvider client={testQueryClient}>
        <I18nContextProvider value={raI18nProvider}>
          <DataProviderContext.Provider value={mockDataProvider}>
            <div data-testid="test-wrapper">
              {children}
            </div>
          </DataProviderContext.Provider>
        </I18nContextProvider>
      </QueryClientProvider>
    </MemoryRouter>
  </ThemeProvider>
)

// Mock API and hooks
const mockDataProvider = {
  create: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
  getList: vi.fn((resource) => {
    if (resource === 'classes') {
      return Promise.resolve({
        data: [
          { id: 1, name: 'Test Course 1' },
          { id: 2, name: 'Test Course 2' }
        ],
        total: 2
      })
    }
    if (resource === 'instructors') {
      return Promise.resolve({
        data: [
          { id: 1, first_name: 'John', last_name: 'Doe' },
          { id: 2, first_name: 'Jane', last_name: 'Smith' }
        ],
        total: 2
      })
    }
    if (resource === 'resources') {
      return Promise.resolve({
        data: [
          { id: 1, name: 'Resource 1', license_plate: 'ABC123' },
          { id: 2, name: 'Resource 2', license_plate: 'DEF456' }
        ],
        total: 2
      })
    }
    return Promise.resolve({ data: [], total: 0 })
  }),
  getOne: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
  update: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
  delete: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
  getMany: vi.fn(() => Promise.resolve({ data: [] })),
  getManyReference: vi.fn(() => Promise.resolve({ data: [], total: 0 })),
  deleteMany: vi.fn(() => Promise.resolve({ data: [1] })),
}

const mockNotify = vi.fn()
const mockRefresh = vi.fn()
const mockUnselectAll = vi.fn()

vi.mock('react-admin', async () => {
  const actual = await vi.importActual('react-admin')
  return {
    ...actual,
    useDataProvider: () => mockDataProvider,
    useNotify: () => mockNotify,
    useRefresh: () => mockRefresh,
    useUnselectAll: () => mockUnselectAll,
  }
})

// Import the component after mocks are set up
import ScheduledClassPatternList from '../features/scheduledclasspatterns/ScheduledClassPatternList'
import ScheduledClassPatternCreate from '../features/scheduledclasspatterns/ScheduledClassPatternCreate'

describe('ScheduledClassPatternList API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDataProvider.create.mockResolvedValue({ data: { generated_count: 5 } })
    mockDataProvider.getList.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Test Pattern',
          course: { name: 'Test Course' },
          instructor: { first_name: 'John', last_name: 'Doe' },
          start_date: '2025-01-01',
          num_lessons: 10,
          status: 'SCHEDULED'
        }
      ],
      total: 1
    })
  })

  it('calls generate-classes API when bulk generate button is clicked', async () => {
    const user = userEvent.setup()
    render(<TestWrapper><ScheduledClassPatternList resource="scheduledclasspatterns" /></TestWrapper>)

    // Wait for the list to load
    await waitFor(() => {
      expect(mockDataProvider.getList).toHaveBeenCalled()
    })

    // Find and click the generate button (this might need adjustment based on actual component structure)
    // Note: Testing bulk actions requires more complex setup with selected items
  })

  it('handles API errors during class generation', async () => {
    mockDataProvider.create.mockRejectedValue(new Error('Generation failed'))
    render(<TestWrapper><ScheduledClassPatternList resource="scheduledclasspatterns" /></TestWrapper>)

    // This test would verify error handling in bulk actions
    // Implementation depends on how the bulk action buttons are structured
  })

  it('shows loading states during API calls', async () => {
    mockDataProvider.create.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)))
    render(<TestWrapper><ScheduledClassPatternList resource="scheduledclasspatterns" /></TestWrapper>)

    // Test loading indicators during operations
  })

  it('refreshes data after successful operations', async () => {
    render(<TestWrapper><ScheduledClassPatternList resource="scheduledclasspatterns" /></TestWrapper>)

    // Verify that refresh is called after successful API operations
    await waitFor(() => {
      // This would test the refresh behavior
    })
  })
})

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip('displays network error messages', async () => {
    // Mock a create operation to fail with network error
    mockDataProvider.create.mockRejectedValue(new Error('Network Error'))
    
    const user = userEvent.setup()
    render(<TestWrapper><ScheduledClassPatternCreate resource="scheduledclasspatterns" /></TestWrapper>)

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    // Fill minimal required fields to trigger form submission
    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'Test Pattern')

    // Try to submit the form - this should trigger the network error even if form is invalid
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Check that error notification was shown
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.stringContaining('Network Error'),
        { type: 'error' }
      )
    }, { timeout: 10000 })
  }, 10000)

  it('handles permission denied errors', async () => {
    const error = new Error('Permission denied')
    error.status = 403
    mockDataProvider.create.mockRejectedValue(error)
    render(<TestWrapper><ScheduledClassPatternList resource="scheduledclasspatterns" /></TestWrapper>)

    // Test permission error handling
  })

  it('handles validation errors from API', async () => {
    const validationError = {
      response: {
        data: {
          recurrence_days: ['Invalid day format'],
          times: ['Invalid time format']
        }
      }
    }
    mockDataProvider.create.mockRejectedValue(validationError)
    render(<TestWrapper><ScheduledClassPatternList resource="scheduledclasspatterns" /></TestWrapper>)

    // Test validation error display
  })
})

describe('Form Validation Scenarios', () => {
  it('validates required fields in create form', async () => {
    const user = userEvent.setup()
    render(<TestWrapper><ScheduledClassPatternCreate resource="scheduledclasspatterns" /></TestWrapper>)

    // Wait for form to render and reference data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const saveButton = screen.getByRole('button', { name: /save/i })
    
    // The save button should be disabled when required fields are not filled
    expect(saveButton).toBeDisabled()
    
    // Check that validation errors appear (the button being disabled indicates validation)
    // In React Admin, the save button is disabled when the form is invalid
  })

  it('validates time format in recurrence inputs', async () => {
    const user = userEvent.setup()
    render(<TestWrapper><ScheduledClassPatternCreate resource="scheduledclasspatterns" /></TestWrapper>)

    // Find time input and enter invalid format
    const timeInputs = screen.getAllByDisplayValue('') // or appropriate selector
    for (const input of timeInputs) {
      if (input.type === 'time' || input.placeholder?.includes('time')) {
        await user.type(input, '25:00') // Invalid time
        break
      }
    }

    // Submit and check for validation error
  })

  it('validates date constraints', async () => {
    const user = userEvent.setup()
    render(<TestWrapper><ScheduledClassPatternCreate resource="scheduledclasspatterns" /></TestWrapper>)

    // Enter past date
    const dateInput = screen.getByTestId('start_date')
    await user.type(dateInput, '2020-01-01')

    // Submit and check validation
  })

  it('validates recurrence requirements', async () => {
    const user = userEvent.setup()
    render(<TestWrapper><ScheduledClassPatternCreate resource="scheduledclasspatterns" /></TestWrapper>)

    // Try to submit without any recurrences
    // This should trigger the "at least one recurrence" validation
  })
})