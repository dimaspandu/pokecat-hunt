/**
 * Unit Test for AutoCage SVG component
 *
 * This test verifies that:
 * 1. The component renders an SVG element successfully.
 * 2. The component correctly applies custom props (e.g. className, width, height).
 * 3. The SVG contains expected child <path> and <g> elements.
 * 4. Snapshot rendering remains consistent (for regression detection).
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AutoCage from "../AutoCage";

describe("AutoCage component", () => {
  /** 
   * Test 1: Should render the SVG element without crashing
   * This ensures the component mounts successfully in the DOM.
   */
  it("renders an SVG element", () => {
    render(<AutoCage data-testid="auto-cage-svg" />);
    const svgElement = screen.getByTestId("auto-cage-svg");
    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName.toLowerCase()).toBe("svg");
  });

  /**
   * Test 2: Should accept and apply custom props
   * This verifies that React.SVGProps are passed correctly to the root <svg> tag.
   */
  it("applies custom className and dimensions", () => {
    render(
      <AutoCage
        data-testid="auto-cage-svg"
        className="custom-icon"
        width="50"
        height="50"
      />
    );

    const svg = screen.getByTestId("auto-cage-svg");
    expect(svg).toHaveClass("custom-icon");
    expect(svg).toHaveAttribute("width", "50");
    expect(svg).toHaveAttribute("height", "50");
  });

  /**
   * Test 3: Should contain expected SVG structure
   * This ensures important child tags like <path> and <g> exist.
   */
  it("contains path and group elements", () => {
    render(<AutoCage data-testid="auto-cage-svg" />);
    const svg = screen.getByTestId("auto-cage-svg");

    const paths = svg.querySelectorAll("path");
    const groups = svg.querySelectorAll("g");

    // Expected multiple <path> and <g> tags as per SVG structure
    expect(paths.length).toBeGreaterThan(5);
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });

  /**
   * Test 4: Snapshot test
   * This detects unintended visual or structural changes in the SVG markup.
   */
  it("matches the snapshot", () => {
    const { asFragment } = render(<AutoCage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
