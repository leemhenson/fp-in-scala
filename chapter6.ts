export interface RNG {
  nextInt: () => [number, RNG];
}

export class SimpleRNG implements RNG {
  nextInt: () => [number, RNG];
}
