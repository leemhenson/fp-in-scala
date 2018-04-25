import { SimpleRNG } from "../chapter6";

describe("SimpleRNG", () => {
  const rng42 = new SimpleRNG(42);

  it("generates the same nextInt from the same seed", () => {
    expect(rng42.nextInt()["0"]).toEqual(37597);
    expect(rng42.nextInt()["0"]).toEqual(rng42.nextInt()["0"]);
  });

  it("generates a new nextInt from the returned RNG instance", () => {
    expect(rng42.nextInt()["1"].nextInt()["0"]).not.toEqual(rng42.nextInt()["0"]);
  });
});
