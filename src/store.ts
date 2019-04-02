import {
  createStore,
  applyMiddleware,
  AnyAction,
  combineReducers
} from "redux";
import { default as thunk } from "redux-thunk";

import { playerReducer, Player } from "./player";
import { citiesReducer, City, CityKey } from "./city";

export type Root = {
  player: Player;
  cities: Record<CityKey, City>;
};

const reducer = combineReducers({
  player: playerReducer,
  cities: citiesReducer
});

export const store = createStore(reducer, applyMiddleware(thunk));
