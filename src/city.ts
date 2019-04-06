import { Reducer } from "redux";
import { Omit, uniqueId, sample } from "lodash";
import { createRecordReducer } from "@jsasz/jreducer";
import { ThunkAction } from "redux-thunk";

import { Root } from "./store";
import { Player } from "./player";
import {
  randomRange,
  randomPositionInCircle,
  calculateMaxDistance,
  magnitude,
  assertPercentage,
  assertTradeRoutesBidirectional
} from "./util";

export type TraderKey = string;

export type Trader = {
  key: TraderKey;
  wealth: number;
  wealthRate: number;
  wealthMax: number;
  usualTravelTime: number;
  currentTravelTime: number;
  destination: {
    toKey: CityKey;
    fromKey: CityKey;
  };
};

export const stubTrader = (
  wealth: number,
  destination: {
    toKey: CityKey;
    fromKey: CityKey;
  }
): Trader => ({
  destination,
  wealthRate: 0.1,
  usualTravelTime: 10000,
  currentTravelTime: -Infinity,
  wealthMax: 10,
  wealth: Math.min(10, wealth),
  key: uniqueId("trader-")
});

export type CityKey = string;

export type City = {
  readonly key: CityKey;
  population: number;
  position: { x: number; y: number };
  techKnowledge: number;
  wealth: number;
  tradeRoutes: CityKey[];
};

export const stubCity = (distance: number): City => ({
  key: uniqueId("city-"),
  population: 25,
  position: randomPositionInCircle(
    randomRange(distance / (2 * Math.PI), distance)
  ),
  techKnowledge: 0,
  wealth: 0,
  tradeRoutes: []
});

const playerCity = stubCity(0);

export const [citiesReducer, updateCity] = createRecordReducer<City, CityKey>({
  [playerCity.key]: playerCity
});

export const [tradersReducer, updateTrader] = createRecordReducer<
  Trader,
  TraderKey
>({});

const assertCanSend = (city: City) => {
  if (!city.wealth) {
    console.log(city);
    throw new Error("No wealth to trade");
  }
};

export const sendTrader = (
  key: TraderKey,
  travelTime: number
): ThunkAction<any, Root, any, any> => (dispatch, getState) => {
  const { traders: tradersRecord, cities: citiesRecord } = getState();
  const trader = tradersRecord[key];
  const newFromCity = citiesRecord[trader.destination.toKey];
  const newToCity = citiesRecord[sample(newFromCity.tradeRoutes)!];
  assertTradeRoutesBidirectional(newFromCity, newToCity);
  dispatch(
    updateCity(newFromCity.key, city => ({
      ...city,
      wealth: city.wealth + trader.wealthRate * trader.wealth
    }))
  );
  dispatch(
    updateTrader(key, trader => ({
      ...trader,
      destination: {
        fromKey: newFromCity.key,
        toKey: newToCity.key
      },
      currentTravelTime: travelTime,
      wealth: Math.min(trader.wealthMax, newFromCity.wealth)
    }))
  );
};

const sendNewTrader = (
  fromKey: CityKey,
  toKey: CityKey
): ThunkAction<any, Root, any, any> => (dispatch, getState) => {
  const { cities: citiesRecord } = getState();
  const fromCity = citiesRecord[fromKey];
  assertCanSend(fromCity);
  assertTradeRoutesBidirectional(citiesRecord[fromKey], citiesRecord[toKey]);
  const trader = stubTrader(fromCity.wealth, { toKey, fromKey });
  dispatch(updateTrader(trader.key, trader));
  dispatch(
    updateCity(fromKey, city => ({
      ...city,
      wealth: city.wealth - trader.wealth
    }))
  );
};

export const maybeSendNewTrader = (): ThunkAction<any, Root, any, any> => (
  dispatch,
  getState
) => {
  const { cities: citiesRecord, traders: tradersRecord } = getState();
  const cities = Object.values(citiesRecord);
  const traders = Object.values(tradersRecord);
  const totalTradeRoutes = cities.reduce(
    (sum, c) => sum + c.tradeRoutes.length,
    0
  );

  if (cities.length > 2) {
    if (totalTradeRoutes < (1 / 5) * cities.length ** 2) {
      const fromCity = sample(Object.keys(citiesRecord))!;
      const toCity = sample(
        Object.keys(citiesRecord).filter(key => key !== fromCity)
      )!;
      dispatch(addTradeRoute(fromCity, toCity));
    }
    if (totalTradeRoutes && traders.length < (1 / 4) * cities.length ** 2) {
      const fromCity = sample(cities.filter(c => c.tradeRoutes.length))!;
      const toCity = sample(fromCity.tradeRoutes)!;
      if (fromCity.wealth) {
        dispatch(sendNewTrader(fromCity.key, toCity));
      }
    }
  }
};

export const addTradeRoute = (
  fromKey: CityKey,
  toKey: CityKey
): ThunkAction<any, Root, any, any> => dispatch => {
  dispatch(
    updateCity([fromKey, toKey], (city, key) => ({
      ...city,
      tradeRoutes: city.tradeRoutes.concat(key === fromKey ? toKey : fromKey)
    }))
  );
};

export const addCity = (): ThunkAction<any, Root, any, any> => (
  dispatch,
  getState
) => {
  const { cities: citiesRecord, player } = getState();
  const cities = Object.values(citiesRecord);
  const maxDistance = calculateMaxDistance(cities);
  const city = stubCity(maxDistance);
  if (magnitude(city.position) < player.allowedMaxCityDistance) {
    dispatch(updateCity(city.key, city));
  }
};

export const addTechKnowledge = (key: string, amount: number) =>
  updateCity(key, city => ({
    ...city,
    techKnowledge: city.techKnowledge + amount
  }));

export const growCityWealth = (key: string, percentage: number) => {
  assertPercentage(percentage);
  return updateCity(key, city => {
    return {
      ...city,
      wealth: city.wealth * (1 + percentage) || 1
    };
  });
};

export const growCity = (key: string, percentage: number) => {
  assertPercentage(percentage);
  return updateCity(key, city => ({
    ...city,
    population: city.population * (1 + percentage)
  }));
};
