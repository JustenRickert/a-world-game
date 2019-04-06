import {
  createStore,
  applyMiddleware,
  AnyAction,
  combineReducers
} from "redux";
import { default as thunk } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import { playerReducer, Player } from "./player";
import {
  citiesReducer,
  City,
  CityKey,
  tradersReducer,
  TraderKey,
  Trader
} from "./city";

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

export const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(thunk))
);
