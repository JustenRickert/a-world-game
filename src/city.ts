import { Reducer } from "redux";
import { Omit } from "lodash";

import { createRecordReducer } from "./jreducer";

export type CityKey = string;

export type City = {
  readonly key: CityKey;
  population: number;
  wealth: number;
};

export const [citiesReducer, updateCity] = createRecordReducer<City, CityKey>(
  {}
);
