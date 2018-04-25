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
