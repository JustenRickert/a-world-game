import { Reducer } from "redux";

import { City, CityKey } from "./city";
import { createReducer } from "./jreducer";

export type Player = {
  cities: CityKey[];
  name: string;
  points: number;
};

export const [playerReducer, updatePlayer] = createReducer<Player>({
  cities: [],
  name: "player",
  points: 0
});
