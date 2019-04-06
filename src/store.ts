import { createStore, applyMiddleware, Action, combineReducers } from "redux";
import { default as thunk } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { createEpicMiddleware, combineEpics, Epic } from "redux-observable";

import { playerReducer, Player } from "./player";
import {
  citiesReducer,
  City,
  CityKey,
  CITIES_SYMBOL,
  createCityEpic,
  incrementCityEpic,
  cityEpics
} from "./city";
import {
  tradersReducer,
  TraderKey,
  Trader,
  TRADERS_SYMBOL,
  traderEpic,
  traderEpics
} from "./trader";

export type Root = {
  player: Player;
  cities: Record<CityKey, City>;
  traders: Record<TraderKey, Trader>;
};

const reducer = combineReducers<Root>({
  player: playerReducer,
  cities: citiesReducer,
  traders: tradersReducer
});

type AppEpicAction =
  | Action<typeof CITIES_SYMBOL | typeof TRADERS_SYMBOL>
  | Action<"CREATE_CITY">
  | {
      type: "START_CITY_INCREMENT";
      key: string;
    }
  | {
      type: "START_TRADER";
      key: string;
    };

export type AppEpic<Start = symbol> = Epic<
  AppEpicAction | Action<Start>,
  AppEpicAction | Action<Start>,
  Root
>;

const rootEpic = combineEpics<AppEpicAction, AppEpicAction, Root>(
  cityEpics,
  traderEpics
);

const epicMiddleware = createEpicMiddleware<
  AppEpicAction,
  AppEpicAction,
  Root
>();

export const store = createStore(
  reducer,
  applyMiddleware(thunk, epicMiddleware)
);

epicMiddleware.run(rootEpic);

store.dispatch({ type: "CREATE_CITY" });
