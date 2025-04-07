import { canPartition } from "../src/leetcode416.js";
import { describe, expect, test } from "@jest/globals";

describe("canPartition", () => {
  test("should return true for an array that can be partitioned into two subsets with equal sum", () => {
    expect(canPartition([1, 5, 11, 5])).toBe(true);
  });

  test("should return false for an array that cannot be partitioned into two subsets with equal sum", () => {
    expect(canPartition([1, 2, 3, 5])).toBe(false);
  });

  test("should return true for an empty array", () => {
    expect(canPartition([])).toBe(true);
  });

  test("should return false for an array with a single element", () => {
    expect(canPartition([1])).toBe(false);
  });

  test("should handle arrays with all elements being the same", () => {
    expect(canPartition([2, 2, 2, 2])).toBe(true);
    expect(canPartition([2, 2, 2])).toBe(false);
  });
});
