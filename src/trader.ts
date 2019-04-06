import { uniqueId } from "lodash";
import { ThunkAction } from "redux-thunk";
import { createRecordReducer } from "@jsasz/jreducer";
import { sample } from "lodash";
import { of, from, pipe, merge } from "rxjs";
import {
  delay,
  switchMap,
  switchMapTo,
  concat,
  concatMap,
  map,
  mapTo
} from "rxjs/operators";

import {
  CityKey,
  updateCity,
  addTradeRoute,
  CITIES_SYMBOL,
  City
} from "./city";
import { Root, AppEpic, store } from "./store";
import {
  assertTradeRoutesBidirectional,
  assertPercentage,
  assertCanSend,
  plusMinusPercentage,
  randomRange
} from "./util";
import { AnyAction, Action } from "redux";
import { combineEpics } from "redux-observable";

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

type TraderThunk = ThunkAction<
  any,
  Root,
  any,
  | { type: "START_CITY_INCREMENT"; key: TraderKey }
  | { type: "START_TRADER"; key: TraderKey }
>;

export const stubTrader = (
  key: TraderKey,
  wealth: number,
  destination: {
    toKey: CityKey;
    fromKey: CityKey;
  }
): Trader => ({
  key,
  destination,
  wealthRate: 0.1,
  usualTravelTime: 10000,
  currentTravelTime: -Infinity,
  wealthMax: 10,
  wealth: Math.min(10, wealth)
});

export const [
  tradersReducer,
  TRADERS_SYMBOL,
  updateTrader
] = createRecordReducer<Trader, TraderKey>({});

const sendTrader = (key: TraderKey): TraderThunk => (dispatch, getState) => {
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
  const distance = Math.sqrt(
    newFromCity.position.x ** 2 +
      newToCity.position.x ** 2 +
      newFromCity.position.y ** 2 +
      newToCity.position.y
  );
  const currentTravelTime = plusMinusPercentage(1000, 0.1) * distance;
  dispatch(
    updateTrader(key, trader => ({
      ...trader,
      destination: {
        fromKey: newFromCity.key,
        toKey: newToCity.key
      },
      currentTravelTime,
      wealth: Math.min(trader.wealthMax, newFromCity.wealth)
    }))
  );
  dispatch({ type: "START_TRADER", key });
};

const createNewTraderAndSend = (
  fromKey: CityKey,
  toKey: CityKey
): ThunkAction<any, Root, any, any> => (dispatch, getState) => {
  const { cities: citiesRecord } = getState();
  const fromCity = citiesRecord[fromKey];
  assertTradeRoutesBidirectional(citiesRecord[fromKey], citiesRecord[toKey]);
  const trader = stubTrader(uniqueId("trader-"), fromCity.wealth, {
    toKey,
    fromKey
  });
  dispatch(updateTrader(trader.key, trader));
  dispatch(sendTrader(trader.key));
};

const maybeAddTradeRouteAndSendNewTrader = (): TraderThunk => (
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

  if (cities.length > 2 && totalTradeRoutes < 2 * cities.length) {
    const fromCity = sample(Object.keys(citiesRecord))!;
    const toCity = sample(
      Object.keys(citiesRecord).filter(key => key !== fromCity)
    )!;
    const shouldSendTrader = canSendNewTrader(
      Object.values(cities),
      Object.values(traders)
    );
    dispatch(addTradeRoute(fromCity, toCity));
  }

  if (totalTradeRoutes && traders.length < 2 * cities.length) {
    const fromCity = sample(cities.filter(c => c.tradeRoutes.length))!;
    const toCity = sample(fromCity.tradeRoutes)!;
    dispatch(createNewTraderAndSend(fromCity.key, toCity));
  }
};

const canSendNewTrader = (cities: City[], traders: Trader[]) => {
  const totalTradeRoutes =
    cities.reduce((sum, c) => sum + c.tradeRoutes.length, 0) / 2;
  return Boolean(totalTradeRoutes) && traders.length < 2 * cities.length;
};

export const traderEpic: AppEpic = (action$, state$) => {
  return action$.ofType(CITIES_SYMBOL).pipe(
    switchMap(q => {
      return of(q).pipe(
        delay(plusMinusPercentage(1000, 0.5)),
        switchMap(() => {
          const { cities, traders } = state$.value;
          return of(maybeAddTradeRouteAndSendNewTrader() as any);
        })
      );
    })
  );
};

export const individualTraderEpic: AppEpic<"START_TRADER"> = (
  action$,
  state$
) => {
  return action$
    .ofType<{ type: "START_TRADER"; key: string }>("START_TRADER")
    .pipe(
      switchMap(({ key }) => {
        const { traders } = state$.value;
        return of(key).pipe(
          delay(traders[key].currentTravelTime),
          switchMap(key => of(sendTrader(key) as any))
        );
      })
    );
};

export const traderEpics = combineEpics(traderEpic, individualTraderEpic);
