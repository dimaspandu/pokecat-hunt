/**
 * Unit tests for CatCoin component.
 * This suite ensures that the CatCoin SVG renders correctly,
 * forwards props properly, and maintains semantic accessibility.
 */

import { render, screen } from "@testing-library/react";
import CatCoin from "../CatCoin";
import { describe, it, expect } from "vitest";

describe("CatCoin Component", () => {
  /**
   * Ensures that the component renders a valid <svg> element in the DOM.
   */
  it("renders an SVG element", () => {
    render(<CatCoin data-testid="catcoin-svg" />);
    const svg = screen.getByTestId("catcoin-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  /**
   * Ensures that the component forwards SVG props (e.g., width, height, className) correctly.
   */
  it("forwards props to the SVG element", () => {
    render(<CatCoin width="100" height="100" className="test-svg" data-testid="catcoin-svg" />);
    const svg = screen.getByTestId("catcoin-svg");
    expect(svg).toHaveAttribute("width", "100");
    expect(svg).toHaveAttribute("height", "100");
    expect(svg).toHaveClass("test-svg");
  });

  /**
   * Ensures that the component contains key elements that define the CatCoin graphic.
   * For instance, it should include at least one <circle> and multiple <path> tags.
   */
  it("contains essential SVG elements", () => {
    render(<CatCoin data-testid="catcoin-svg" />);
    const svg = screen.getByTestId("catcoin-svg");

    const circles = svg.querySelectorAll("circle");
    const paths = svg.querySelectorAll("path");
    expect(circles.length).toBeGreaterThan(0);
    expect(paths.length).toBeGreaterThan(0);
  });

  /**
   * Ensures that the component is accessible by verifying that it can accept aria-label or role attributes.
   */
  it("supports accessibility attributes", () => {
    render(<CatCoin role="img" aria-label="cat coin icon" data-testid="catcoin-svg" />);
    const svg = screen.getByTestId("catcoin-svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "cat coin icon");
  });
});
