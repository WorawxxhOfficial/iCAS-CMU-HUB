import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginHub } from '../../components/LoginHub';
import { useUser } from '../../App';

// Mock the API
vi.mock('../../features/auth/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    requestOTP: vi.fn(),
  },
}));

// Mock useUser hook
vi.mock('../../App', () => ({
  useUser: vi.fn(() => ({
    user: null,
    setUser: vi.fn(),
  })),
}));

// Mock useAuth hook
vi.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    signup: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('LoginHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should validate email domain (@cmu.ac.th)', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/must be from @cmu.ac.th/i)).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('should show OTP form when switching to signup', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const signupTab = screen.getByText(/sign up/i);
    fireEvent.click(signupTab);

    await waitFor(() => {
      expect(screen.getByText(/first name/i)).toBeInTheDocument();
      expect(screen.getByText(/last name/i)).toBeInTheDocument();
    });
  });
});

