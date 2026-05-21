import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AchievementToast } from "@/features/student/components/achievement-toast";

describe("AchievementToast", () => {
  it("renders visible message and status region", () => {
    render(<AchievementToast message="Você ganhou 85 XP." />);
    expect(screen.getAllByText("Você ganhou 85 XP.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("status")).toHaveTextContent("Você ganhou 85 XP.");
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<AchievementToast message={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
