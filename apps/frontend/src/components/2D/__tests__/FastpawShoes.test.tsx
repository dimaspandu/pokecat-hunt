/**
 * Unit tests for FastpawShoes component.
 * Verifies that the SVG renders correctly,
 * forwards props properly, and maintains accessibility attributes.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FastpawShoes from "../FastpawShoes";

describe("FastpawShoes Component", () => {
  /**
   * Ensures the SVG renders in the document with the correct tag.
   */
  it("renders an SVG element", () => {
    render(<FastpawShoes data-testid="fastpaw-svg" />);
    const svg = screen.getByTestId("fastpaw-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  /**
   * Verifies that width, height, and custom className
   * props are forwarded correctly to the SVG element.
   */
  it("forwards props to the SVG element", () => {
    render(
      <FastpawShoes
        width="256"
        height="256"
        className="fastpaw-icon"
        data-testid="fastpaw-svg"
      />
    );
    const svg = screen.getByTestId("fastpaw-svg");
    expect(svg).toHaveAttribute("width", "256");
    expect(svg).toHaveAttribute("height", "256");
    expect(svg).toHaveClass("fastpaw-icon");
  });

  /**
   * Validates that the SVG includes core attributes and structure:
   * - viewBox
   * - multiple <path>, <g>, and <ellipse> nodes
   */
  it("contains essential SVG structure and attributes", () => {
    render(<FastpawShoes data-testid="fastpaw-svg" />);
    const svg = screen.getByTestId("fastpaw-svg");

    expect(svg).toHaveAttribute("viewBox", "0 0 64 64");

    const paths = svg.querySelectorAll("path");
    const groups = svg.querySelectorAll("g");
    const ellipses = svg.querySelectorAll("ellipse");

    expect(paths.length).toBeGreaterThan(0);
    expect(groups.length).toBeGreaterThan(0);
    expect(ellipses.length).toBeGreaterThan(0);
  });

  /**
   * Ensures that accessibility attributes are applied correctly.
   */
  it("contains correct accessibility attributes", () => {
    render(<FastpawShoes data-testid="fastpaw-svg" />);
    const svg = screen.getByTestId("fastpaw-svg");

    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  /**
   * Verifies that custom accessibility overrides can be applied.
   */
  it("supports custom accessibility overrides", () => {
    render(
      <FastpawShoes
        aria-hidden="false"
        aria-label="Fastpaw Shoes Icon"
        role="presentation"
        data-testid="fastpaw-svg"
      />
    );
    const svg = screen.getByTestId("fastpaw-svg");
    expect(svg).toHaveAttribute("aria-hidden", "false");
    expect(svg).toHaveAttribute("aria-label", "Fastpaw Shoes Icon");
    expect(svg).toHaveAttribute("role", "presentation");
  });
});
