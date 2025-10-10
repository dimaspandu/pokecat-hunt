import { render, screen } from "@testing-library/react";
import GrilledFish from "../GrilledFish";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";

describe("GrilledFish", () => {
  it("renders without crashing", () => {
    render(<GrilledFish />);
    const svg = screen.getByLabelText("Grilled Fish");
    expect(svg).toBeInTheDocument();
  });

  it("forwards props to the svg element", () => {
    render(<GrilledFish data-testid="fish" width={64} className="test-class" />);
    const svg = screen.getByTestId("fish");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveClass("test-class");
  });

  it("contains SVG paths", () => {
    render(<GrilledFish />);
    const svg = screen.getByLabelText("Grilled Fish");
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(0);
  });
});
