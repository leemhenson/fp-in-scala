import * as prng from "seedrandom";
import { fold } from "fp-ts/lib/Array";

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
  const dbl = (Number.MAX_SAFE_INTEGER - int) / Number.MAX_SAFE_INTEGER;

  return [dbl, nextRng];
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

export type Rand<A> = (rng: RNG) => [A, RNG];

export const unit = <A>(a: A): Rand<A> => rng => [a, rng];

export const map = <A, B>(f: (a: A) => B) => (s: Rand<A>): Rand<B> => rng => {
  const [nextA, nextRNG] = s(rng);
  return [f(nextA), nextRNG];
};

export const map2 = <A, B, C>(f: (ab: [A, B]) => C) => (ra: Rand<A>) => (
  rb: Rand<B>,
): Rand<C> => rng => {
  const [nextA, nextRNG] = ra(rng);
  const [nextB, nextRNG2] = rb(nextRNG);

  return [f([nextA, nextB]), nextRNG2];
};

export const nonNegativeEven: Rand<number> = map((i: number) => i - i % 2)(nonNegativeInt);

export const elegantDouble: Rand<number> = map(
  (i: number) => (Number.MAX_SAFE_INTEGER - i) / Number.MAX_SAFE_INTEGER,
)(nonNegativeInt);

export const both = <A, B>(ra: Rand<A>, rb: Rand<B>): Rand<[A, B]> =>
  map2<A, B, [A, B]>(([a, b]) => [a, b])(ra)(rb);

export const elegantIntDouble = both(nonNegativeInt, double);
export const elegantDoubleInt = both(double, nonNegativeInt);

export const ints = (count: number): Rand<number[]> => rng => {
  const go = (c: number, r: RNG, l: number[]): [number[], RNG] => {
    if (c === 0) {
      return [l, r];
    }

    const [int, nextRng] = r.nextInt();

    return go(c - 1, nextRng, [int].concat(l));
  };

  return go(count, rng, []);
};

export const sequence2 = <A>(...rs: Array<Rand<A>>): Rand<A[]> => rng => {
  const go = (i: Array<Rand<A>>, r: RNG, l: A[]): [A[], RNG] => {
    if (i.length === 0) {
      return [l, r];
    }

    const [x, ...xs] = i;
    const [nextA, nextRng] = x(r);

    return go(xs, nextRng, [nextA].concat(l));
  };

  return go(rs, rng, []);
};

export const sequence = <A>(...rs: Array<Rand<A>>): Rand<A[]> => rng => {
  // return fold(rs, unit<A[]>([]), (head, tail): Rand<A[]> => {});
};
