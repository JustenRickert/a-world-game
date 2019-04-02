import { Reducer } from "redux";
import { createReducer } from "@jsasz/jreducer";

import { City, CityKey } from "./city";

export type Player = {
  cities: CityKey[];
  name: string;
  points: number;
  allowedMaxCityDistance: number;
};

export const [playerReducer, updatePlayer] = createReducer<Player>({
  cities: [],
  name: "player",
  points: 0,
  allowedMaxCityDistance: 1000
});

export const playerOwnCity = (city: City) =>
  updatePlayer(player => {
    if (player.cities.some(c => city.key === c))
      throw new Error("Player already owns that city");
    return {
      ...player,
      cities: player.cities.concat(city.key)
    };
  });

export const playerIncrementPoints = (points: number) =>
  updatePlayer(player => ({
    ...player,
    points: player.points + points
  }));
