import { nonNegativeInt, RNG, SimpleRNG } from "../src/chapter6";

describe("chapter 6", () => {
  const rng42 = new SimpleRNG(42);

  it("generates the same nextInt from the same seed", () => {
    expect(rng42.nextInt()["0"]).toEqual(37597);
    expect(rng42.nextInt()["0"]).toEqual(rng42.nextInt()["0"]);
  });

  it("generates a new nextInt from the returned RNG instance", () => {
    expect(rng42.nextInt()["1"].nextInt()["0"]).not.toEqual(rng42.nextInt()["0"]);
  });
});

describe("exercise 6.1", () => {
  const collectNonNegativeInts = (count: number, rng: RNG, results: number[] = []): number[] => {
    if (count === 0) {
      return results;
    }

    const [nextInt, nextRng] = nonNegativeInt(rng);

    return collectNonNegativeInts(count - 1, nextRng, results.concat(nextInt));
  };

  it("generates non-negative integers in the range 0...MAX_SAFE_INTEGER", () => {
    const rng = new SimpleRNG(Math.random());
    const nonNegativeInts = collectNonNegativeInts(100, rng);

    // tslint:disable-next-line:no-expression-statement
    nonNegativeInts.forEach(i => {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      expect(Number.isInteger(i)).toEqual(true);
    });
  });
});
