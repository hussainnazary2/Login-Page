import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from '../login-form';
import { fetchRandomUser } from '@/lib/api';
import { saveUserToStorage } from '@/lib/auth';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock API and auth functions
vi.mock('@/lib/api', () => ({
  fetchRandomUser: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status?: number) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

vi.mock('@/lib/auth', () => ({
  saveUserToStorage: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  validateIranianPhone: vi.fn(),
}));

const mockFetchRandomUser = fetchRandomUser as any;
const mockSaveUserToStorage = saveUserToStorage as any;

describe('Error Handling and User Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays comprehensive error messages for different error types', async () => {
    const { validateIranianPhone } = await import('@/lib/validation');
    (validateIranianPhone as any).mockReturnValue(true);

    render(<LoginForm />);

    const phoneInput = screen.getByLabelText(/mobile number/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Test network error
    const { ApiError } = await import('@/lib/api');
    mockFetchRandomUser.mockRejectedValueOnce(new ApiError('Network error: Please check your connection'));
    
    fireEvent.change(phoneInput, { target: { value: '09123456789' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/unable to connect to the server/i)).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByRole('button', { name: /retry login attempt/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('shows loading states with accessibility announcements', async () => {
    const { validateIranianPhone } = await import('@/lib/validation');
    (validateIranianPhone as any).mockReturnValue(true);

    // Mock a delayed API response
    mockFetchRandomUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        name: { first: 'John', last: 'Doe' },
        email: 'john@example.com',
        picture: { large: '', medium: '', thumbnail: '' }
      }), 100))
    );

    render(<LoginForm />);

    const phoneInput = screen.getByLabelText(/mobile number/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(phoneInput, { target: { value: '09123456789' } });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(screen.getByText('Please wait, logging you in...')).toBeInTheDocument();
    });

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('provides validation error feedback with proper accessibility', async () => {
    const { validateIranianPhone } = await import('@/lib/validation');
    (validateIranianPhone as any).mockReturnValue(false);

    render(<LoginForm />);

    const phoneInput = screen.getByLabelText(/mobile number/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/validation error/i);
      expect(errorMessage).toHaveTextContent(/please enter a valid iranian mobile number/i);
    });

    // Check that input has proper aria attributes
    expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
    expect(phoneInput).toHaveAttribute('aria-describedby', 'phone-error');
  });

  it('handles storage errors gracefully', async () => {
    const { validateIranianPhone } = await import('@/lib/validation');
    (validateIranianPhone as any).mockReturnValue(true);

    mockFetchRandomUser.mockResolvedValueOnce({
      name: { first: 'John', last: 'Doe' },
      email: 'john@example.com',
      picture: { large: '', medium: '', thumbnail: '' }
    });

    mockSaveUserToStorage.mockImplementation(() => {
      throw new Error('Storage quota exceeded. Please clear some browser data and try again.');
    });

    render(<LoginForm />);

    const phoneInput = screen.getByLabelText(/mobile number/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(phoneInput, { target: { value: '09123456789' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Storage Error')).toBeInTheDocument();
      expect(screen.getByText(/unable to save login information/i)).toBeInTheDocument();
    });
  });

  it('shows retry attempts and limits', async () => {
    const { validateIranianPhone } = await import('@/lib/validation');
    (validateIranianPhone as any).mockReturnValue(true);

    mockFetchRandomUser.mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    const phoneInput = screen.getByLabelText(/mobile number/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(phoneInput, { target: { value: '09123456789' } });

    // First attempt
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry login attempt/i })).toBeInTheDocument();
    });

    // Second attempt
    const retryButton = screen.getByRole('button', { name: /retry login attempt/i });
    fireEvent.click(retryButton);
    await waitFor(() => {
      expect(screen.getByText(/attempt 2 of 3/i)).toBeInTheDocument();
    });
  });
});