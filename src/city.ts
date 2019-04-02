import { Reducer } from "redux";
import { Omit, uniqueId } from "lodash";
import { createRecordReducer } from "@jsasz/jreducer";
import { ThunkAction } from "redux-thunk";

import { Root } from "./store";
import { Player } from "./player";
import { randomRange } from "./util";

export type CityKey = string;

export type City = {
  readonly key: CityKey;
  population: number;
  position: { x: number; y: number };
  techKnowledge: number;
  wealth: number;
};

const mag = <P extends { x: number; y: number }>(p: P) =>
  Math.sqrt(p.x ** 2 + p.y ** 2);

const randomPosition = (distance: number) => {
  const theta = 2 * Math.PI * Math.random();
  return {
    x: distance * Math.sin(theta),
    y: distance * Math.cos(theta)
  };
};

export const stubCity = (distance: number): City => ({
  key: uniqueId("city-"),
  population: 25,
  position: randomPosition(randomRange(distance / 2, distance)),
  techKnowledge: 0,
  wealth: 0
});

const playerCity = stubCity(0);

export const calculateMaxDistance = (cities: City[]) => cities.length * 100;

export const addCity = (): ThunkAction<any, Root, any, any> => (
  dispatch,
  getState
) => {
  const { cities: citiesRecord, player } = getState();
  const cities = Object.values(citiesRecord);
  const maxDistance = calculateMaxDistance(cities);
  const city = stubCity(maxDistance);
  if (mag(city.position) < player.allowedMaxCityDistance) {
    dispatch(updateCity(city.key, city));
  }
};

const assertPercentage = (percentage: number) => {
  if (0 < percentage && percentage < 1) throw new Error("invalid percentage");
};

export const addTechKnowledge = (key: string, amount: number) =>
  updateCity(key, city => ({
    ...city,
    techKnowledge: city.techKnowledge + amount
  }));

export const growWealth = (key: string, percentage: number) => {
  assertPercentage(percentage);
  return updateCity(key, city => ({
    ...city,
    wealth: city.population * (1 + percentage)
  }));
};

export const growCity = (key: string, percentage: number) => {
  assertPercentage(percentage);
  return updateCity(key, city => ({
    ...city,
    population: city.population * (1 + percentage)
  }));
};

export const [citiesReducer, updateCity] = createRecordReducer<City, CityKey>({
  [playerCity.key]: playerCity
});
