import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders AWS exam application", () => {
  render(<App />);
  // Look for any text that should be present in the app
  const element = screen.getByText(/AWS/i);
  expect(element).toBeInTheDocument();
});
