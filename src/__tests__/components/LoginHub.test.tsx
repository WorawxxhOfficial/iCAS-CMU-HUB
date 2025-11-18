import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginHub } from '../../components/LoginHub';
import { useUser } from '../../App';
import * as toast from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

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
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockRequestOTP = vi.fn();

vi.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    requestOTP: mockRequestOTP,
    isLoading: false,
    error: null,
  }),
}));

describe('LoginHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({});
    mockSignup.mockResolvedValue({});
    mockRequestOTP.mockResolvedValue({});
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/your\.email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('should show error state when email is invalid on submit', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/your\.email/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    const form = emailInput.closest('form');

    // Set invalid email (but component doesn't validate format on blur, only on submit)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Mock login to reject
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  it('should show signup form when switching to signup', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const signupTab = screen.getByText(/sign up/i);
    fireEvent.click(signupTab);

    await waitFor(() => {
      // Check for Thai labels or input placeholders
      expect(screen.getByPlaceholderText(/ชื่อ/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/นามสกุล/i)).toBeInTheDocument();
    });
  });

  it('should show error state when password is too short on signup submit', async () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    // Switch to signup
    const signupTab = screen.getByText(/sign up/i);
    fireEvent.click(signupTab);

    await waitFor(() => {
      // Check for Thai placeholder text
      expect(screen.getByPlaceholderText(/ชื่อ/i)).toBeInTheDocument();
    });

    // Fill form with short password
    const firstNameInput = screen.getByPlaceholderText(/ชื่อ/i) as HTMLInputElement;
    const lastNameInput = screen.getByPlaceholderText(/นามสกุล/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/your\.email/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i) as HTMLInputElement;
    const majorSelect = screen.getByRole('combobox');
    const form = firstNameInput.closest('form');

    fireEvent.change(firstNameInput, { target: { value: 'ทดสอบ' } });
    fireEvent.change(lastNameInput, { target: { value: 'ระบบ' } });
    fireEvent.change(emailInput, { target: { value: 'test' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });
    
    // Select major
    fireEvent.click(majorSelect);
    await waitFor(() => {
      const firstMajor = screen.getAllByRole('option')[0];
      if (firstMajor) fireEvent.click(firstMajor);
    });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      // Should show toast error
      expect(toast.toast.error).toHaveBeenCalled();
    });
  });

  it('should allow valid email input', () => {
    render(
      <BrowserRouter>
        <LoginHub />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/your\.email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test.email' } });

    expect(emailInput.value).toBe('test.email');
    expect(emailInput.getAttribute('aria-invalid')).not.toBe('true');
  });
});

