import { City } from "./city";

export const assertPercentage = (percentage: number) => {
  if (0 > percentage && percentage > 1) throw new Error("invalid percentage");
};

export const plusMinusPercentage = (n: number, percentage: number) => {
  assertPercentage(percentage);
  return randomRange((1 - percentage) * n, (1 + percentage) * n);
};

export const assertTradeRoutesBidirectional = (
  toCity: City,
  fromCity: City
) => {
  if (
    !(toCity && fromCity) ||
    !toCity.tradeRoutes.includes(fromCity.key) ||
    !fromCity.tradeRoutes.includes(toCity.key)
  ) {
    console.log({ fromCity, toCity });
    throw new Error("Trade routes not bidirectional");
  }
};

export const randomRange = (min: number, max: number) =>
  (max - min) * Math.random() + min;

export const magnitude = <P extends { x: number; y: number }>(p: P) =>
  Math.sqrt(p.x ** 2 + p.y ** 2);

export const randomPositionInCircle = (distance: number) => {
  const theta = 2 * Math.PI * Math.random();
  return {
    x: distance * Math.sin(theta),
    y: distance * Math.cos(theta)
  };
};

export const calculateMaxDistance = (cities: City[]) =>
  100 * Math.log(cities.length + 1);

export type Timeout = {
  _timeout: number;
  going: boolean;
  start(this: Timeout, fn: () => void, interval: number): () => void;
  restart(this: Timeout, fn: () => void, interval: number): () => void;
  stop(this: Timeout): void;
};

export const timer = (): Timeout => ({
  _timeout: -Infinity,
  going: false,
  start: function(this, fn, interval) {
    this.going = true;
    this._timeout = setTimeout(() => {
      this.going = false;
      fn();
    }, interval);
    return () => {
      clearTimeout(this._timeout);
      this.going = false;
    };
  },
  restart: function(this, fn, interval) {
    clearTimeout(this._timeout);
    return this.start(fn, interval);
  },
  stop: function(this) {
    clearTimeout(this._timeout);
    this.going = false;
  }
});
