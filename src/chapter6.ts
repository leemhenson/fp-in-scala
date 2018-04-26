import * as prng from "seedrandom";

export interface RNG {
  nextInt: () => [number, RNG];
}

export class SimpleRNG implements RNG {
  constructor(private readonly seed: number) {}

  public nextInt(): [number, RNG] {
    const newSeed = (this.seed * 0x5deece66d + 0xb) & 0xffffffffffff;
    const nextRNG = new SimpleRNG(newSeed);
    const n = Math.round(newSeed >>> 16);

    return [n, nextRNG];
  }
}

export type NonNegativeInt = (rng: RNG) => [number, RNG];

export const nonNegativeInt: NonNegativeInt = rng => {
  const [int, nextRng] = rng.nextInt();

  if (int < Number.MIN_SAFE_INTEGER || int > Number.MAX_SAFE_INTEGER) {
    return nonNegativeInt(nextRng);
  }

  return [Math.abs(int), nextRng];
};

export type Double = (rng: RNG) => [number, RNG];

export const double: Double = rng => {
  const [int, nextRng] = nonNegativeInt(rng);
  const double = (Number.MAX_SAFE_INTEGER - int) / Number.MAX_SAFE_INTEGER;

  return [double, nextRng];
};

export type IntDouble = (rng: RNG) => [[number, number], RNG];

export const intDouble: IntDouble = rng => {
  const [nextInt, nextRng] = rng.nextInt();
  const [nextDouble, nextRng2] = double(nextRng);

  return [[nextInt, nextDouble], nextRng2];
};

export type DoubleInt = (rng: RNG) => [[number, number], RNG];

export const DoubleInt: DoubleInt = rng => {
  const [nextDouble, nextRng] = double(rng);
  const [nextInt, nextRng2] = nextRng.nextInt();

  return [[nextDouble, nextInt], nextRng2];
};

export type Double3 = (rng: RNG) => [[number, number, number], RNG];

export const double3: Double3 = rng => {
  const [nextDouble1, nextRng1] = double(rng);
  const [nextDouble2, nextRng2] = double(nextRng1);
  const [nextDouble3, nextRng3] = double(nextRng2);

  return [[nextDouble1, nextDouble2, nextDouble3], nextRng3];
};
