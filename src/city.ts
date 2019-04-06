import { Reducer, AnyAction } from "redux";
import { Omit, uniqueId, sample } from "lodash";
import { createRecordReducer } from "@jsasz/jreducer";
import { ThunkAction } from "redux-thunk";
import { of, merge } from "rxjs";

import { Root, AppEpic } from "./store";
import { Player } from "./player";
import {
  randomRange,
  randomPositionInCircle,
  calculateMaxDistance,
  magnitude,
  assertPercentage,
  assertTradeRoutesBidirectional,
  canAddCity,
  plusMinusPercentage
} from "./util";
import {
  concat,
  map,
  mapTo,
  delay,
  switchMap,
  switchMapTo,
  tap
} from "rxjs/operators";
import { combineEpics } from "redux-observable";
import { TraderKey } from "./trader";

export type CityKey = string;

export type City = {
  readonly key: CityKey;
  population: number;
  position: { x: number; y: number };
  techKnowledge: number;
  wealth: number;
  tradeRoutes: CityKey[];
};

export const stubCity = (key: string, distance: number): City => ({
  key,
  population: 25,
  position: randomPositionInCircle(
    randomRange(distance / (2 * Math.PI), distance)
  ),
  techKnowledge: 0,
  wealth: 0,
  tradeRoutes: []
});

const playerCity = stubCity(uniqueId("city-"), 0);

export const [citiesReducer, CITIES_SYMBOL, updateCity] = createRecordReducer<
  City,
  CityKey
>({});

type CityThunk = ThunkAction<
  any,
  Root,
  any,
  { type: "START_CITY_INCREMENT"; key: CityKey } | { type: "CREATE_CITY" }
>;

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

export const addCity = (cityKey: string): CityThunk => (dispatch, getState) => {
  const { cities: citiesRecord, player } = getState();
  const cities = Object.values(citiesRecord);
  const maxDistance = calculateMaxDistance(cities);
  const city = stubCity(cityKey, maxDistance);
  dispatch(updateCity(city.key, city));
  dispatch({ type: "START_CITY_INCREMENT", key: cityKey });
  dispatch({ type: "CREATE_CITY" });
};

export const growCityWealth = (key: string, percentage: number): CityThunk => (
  dispatch,
  getState
) => {
  assertPercentage(percentage);
  dispatch(
    updateCity(key, city => ({
      ...city,
      wealth: city.wealth * (1 + percentage) || 1
    }))
  );
  dispatch({ type: "START_CITY_INCREMENT", key });
};

export const createCityEpic: AppEpic<"CREATE_CITY"> = (action$, state$) => {
  return action$.ofType("CREATE_CITY").pipe(
    switchMap(q => {
      return of(q).pipe(
        delay(plusMinusPercentage(3000, 0.5)),
        switchMap(() => {
          const cityKey = uniqueId("city-");
          const { cities: citiesRecord } = state$.value;
          return of(addCity(cityKey) as any);
        })
      );
    })
  );
};

export const incrementCityEpic: AppEpic<"START_CITY_INCREMENT"> = action$ => {
  return action$
    .ofType<{ type: "START_CITY_INCREMENT"; key: string }>(
      "START_CITY_INCREMENT"
    )
    .pipe(
      switchMap(({ key }) =>
        of(key).pipe(
          delay(plusMinusPercentage(1000, 0.25)),
          switchMap(key => of(growCityWealth(key, 0.01) as any))
        )
      )
    );
};

// export const testEpic: AppEpic = (action$, state$) => {
//   return action$.pipe(
//     tap(console.log),
//     switchMapTo(of())
//   );
// };

export const cityEpics = combineEpics(incrementCityEpic, createCityEpic);

// export const individualTraderEpic: AppEpic<"START_CITY"> = action$ => {
//   console.log("INDIVIDUAL");
//   return action$
//     .ofType<{ type: "START_TRADER"; key: string }>("START_TRADER")
//     .pipe(map(a => sendTrader(a.key, 1000) as any));
// };
