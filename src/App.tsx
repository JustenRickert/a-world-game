import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { pick, sample, xor } from "lodash";

import { Root } from "./store";
import {
  updateCity,
  addCity,
  City,
  CityKey,
  addTradeRoute,
  growCityWealth
} from "./city";
import { TraderKey, Trader } from "./trader";
import { playerOwnCity, playerIncrementPoints, Player } from "./player";
import {
  randomRange,
  plusMinusPercentage,
  assertTradeRoutesBidirectional
} from "./util";
import { Map } from "./Map";
import { Help } from "./Help";

type Props = { world: Root } & {
  playerOwnCity: typeof playerOwnCity;
};

export const App = connect((state: Root) => ({ world: state }))(
  (props: Props) => {
    const { world, ...handlers } = props;
    const cities = Object.values(world.cities);
    const traders = Object.values(world.traders);
    return (
      <>
        <div style={{ display: "flex", height: "100%" }}>
          <div>
            <h2 children="hello world" />
            <ul>
              <li
                children={`Player points: ${world.player.points.toFixed()}`}
              />
              <li children={`Number of cities: ${cities.length}`} />
              <li
                children={`Sum of city wealth: ${cities
                  .reduce((sum, c) => sum + c.wealth, 0)
                  .toFixed()}`}
              />
              <li children={`Number of traders: ${traders.length}`} />
              <li
                children={`Sum of trader wealth: ${traders
                  .reduce((sum, t) => sum + t.wealth, 0)
                  .toFixed()}`}
              />
              <li
                children={`Total number of trade routes: ${cities
                  .reduce((sum, t) => sum + t.tradeRoutes.length / 2, 0)
                  .toFixed()}`}
              />
            </ul>
          </div>
          <Map {...world} />
        </div>
        <Help {...world} />
      </>
    );
  }
);
