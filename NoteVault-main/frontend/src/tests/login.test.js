import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../pages/login';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.requireMock('react-router-dom').useNavigate;

describe('Login Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    localStorage.clear();
    global.fetch = jest.fn(); // Mock fetch globally
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('renders login form with all fields and buttons', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Check for username and password fields
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

    // Check for login button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Check for forgot password and register links
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  test('displays error message on invalid login', async () => {
    // Mock the fetch API for invalid credentials
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ detail: 'Invalid credentials' }),
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    // Enter invalid credentials
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'wrongpassword' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Ensure fetch was called with correct payload
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/login/', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wronguser', password: 'wrongpassword' }),
    }));
  });

  test('redirects to home on successful login', async () => {
    // Mock the fetch API for successful login
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ access: 'access_token', refresh: 'refresh_token' }),
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    // Enter valid credentials
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    // Ensure tokens and username are saved in localStorage
    expect(localStorage.getItem('username')).toBe('testuser');
    expect(localStorage.getItem('token')).toBe('access_token');
    expect(localStorage.getItem('refresh')).toBe('refresh_token');
  });

  test('redirects to home if already authenticated', () => {
    // Set a token in localStorage
    localStorage.setItem('token', 'existing_token');

    render(
      <Router>
        <Login />
      </Router>
    );

    // Ensure navigate is called immediately
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('shows error message on fetch failure', async () => {
    // Mock fetch API to throw an error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <Router>
        <Login />
      </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/an error occurred while logging in/i)).toBeInTheDocument();
    });

    // Ensure fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
