/**
 * Unit tests for ChickMeow component.
 * Ensures the SVG renders correctly, accepts props,
 * and preserves accessibility attributes.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ChickMeow from "../ChickMeow";

describe("ChickMeow Component", () => {
  /**
   * Confirms that the SVG element renders successfully in the DOM.
   */
  it("renders an SVG element", () => {
    render(<ChickMeow data-testid="chickmeow-svg" />);
    const svg = screen.getByTestId("chickmeow-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  /**
   * Verifies that props like width, height, and className
   * are forwarded properly to the SVG element.
   */
  it("forwards props to SVG element", () => {
    render(<ChickMeow width="128" height="128" className="meow-icon" data-testid="chickmeow-svg" />);
    const svg = screen.getByTestId("chickmeow-svg");
    expect(svg).toHaveAttribute("width", "128");
    expect(svg).toHaveAttribute("height", "128");
    expect(svg).toHaveClass("meow-icon");
  });

  /**
   * Checks that the SVG contains essential structure elements,
   * such as <path> and <g> nodes.
   */
  it("contains essential SVG structure", () => {
    render(<ChickMeow data-testid="chickmeow-svg" />);
    const svg = screen.getByTestId("chickmeow-svg");

    const groups = svg.querySelectorAll("g");
    const paths = svg.querySelectorAll("path");
    expect(groups.length).toBeGreaterThan(0);
    expect(paths.length).toBeGreaterThan(0);
  });

  /**
   * Verifies accessibility attributes (aria-label, role).
   */
  it("supports accessibility attributes", () => {
    render(<ChickMeow role="img" aria-label="Chick Meow icon" data-testid="chickmeow-svg" />);
    const svg = screen.getByTestId("chickmeow-svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "Chick Meow icon");
  });

  /**
   * Ensures that the default aria-label ("Chick Meow") is present
   * even when no explicit aria-label is passed.
   */
  it("has default aria-label when none provided", () => {
    render(<ChickMeow data-testid="chickmeow-svg" />);
    const svg = screen.getByTestId("chickmeow-svg");
    expect(svg).toHaveAttribute("aria-label", "Chick Meow");
  });
});
