import { City } from "./city";

export const canAddCity = (cities: City[]) => {
  return cities.length < 20;
};

export const assertCanSend = (city: City) => {
  if (!city.wealth) {
    console.log(city);
    throw new Error("No wealth to trade");
  }
};

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
