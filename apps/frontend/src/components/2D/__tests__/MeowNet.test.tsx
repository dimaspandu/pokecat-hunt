import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import MeowNet from "../MeowNet";

describe("MeowNet", () => {
  it("renders without crashing", () => {
    render(<MeowNet data-testid="meownet" />);
    const svg = screen.getByTestId("meownet");
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe("svg");
  });

  it("applies custom props correctly", () => {
    render(<MeowNet data-testid="meownet" width={64} height={64} className="icon-cat" />);
    const svg = screen.getByTestId("meownet");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
    expect(svg).toHaveClass("icon-cat");
  });

  it("contains one or more <path> elements", () => {
    render(<MeowNet data-testid="meownet" />);
    const svg = screen.getByTestId("meownet");
    const paths = svg.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });

  it("uses currentColor as fill by default", () => {
    render(<MeowNet data-testid="meownet" />);
    const svg = screen.getByTestId("meownet");
    const path = svg.querySelector("path");
    expect(path).toHaveAttribute("fill", "currentColor");
  });
});
