import { render, screen } from '@testing-library/react';
import App from './App'; // Assuming this is where the heading or other content is

test('renders NOTE VAULT header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Note Vault/i); // Check for your own text
  expect(headingElement).toBeInTheDocument();
});
