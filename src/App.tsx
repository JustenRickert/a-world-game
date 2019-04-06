import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { pick, sample, xor } from "lodash";

import { Root } from "./store";
import {
  updateCity,
  addCity,
  City,
  TraderKey,
  Trader,
  CityKey,
  addTradeRoute,
  growCityWealth,
  sendTrader,
  maybeSendNewTrader
} from "./city";
import { playerOwnCity, playerIncrementPoints, Player } from "./player";
import {
  randomRange,
  plusMinusPercentage,
  timer,
  Timeout,
  assertTradeRoutesBidirectional
} from "./util";
import { Map } from "./Map";
import { Help } from "./Help";

const useTimerEffect = (
  dep: any,
  t: Timeout,
  handle: () => void,
  timeoutRange: [number, number]
) => {
  const rehandle = () => {
    handle();
    t.start(rehandle, randomRange(...timeoutRange));
  };
  useEffect(() => {
    if (!t.going) {
      t.start(rehandle, randomRange(...timeoutRange));
    }
    return () => {
      t.stop();
    };
  }, [dep]);
};

const usePeriodicEvents = (props: {
  cities: Record<CityKey, City>;
  traders: Record<TraderKey, Trader>;
  player: Player;
  handlers: {
    playerIncrementPoints: typeof playerIncrementPoints;
    addCity: typeof addCity;
    growCityWealth: typeof growCityWealth;
    sendTrader: typeof sendTrader;
    maybeSendNewTrader: typeof maybeSendNewTrader;
    addTradeRoute: typeof addTradeRoute;
  };
}) => {
  const playerIncrementTimer = useRef(timer());
  const addCityTimer = useRef(timer());
  const traderTimers = useRef<Record<TraderKey, Timeout>>({});

  // START TRADER TRADING
  useEffect(() => {
    props.handlers.maybeSendNewTrader();
  }, [props.cities]);

  // KEEP TRADER TRADING
  const handleTraderRoutine = (key: TraderKey, travelTime: number) => {
    props.handlers.sendTrader(key, travelTime);
  };
  useMultipleTimerEffects(
    props.traders,
    handleTraderRoutine,
    trader => trader.key,
    trader => plusMinusPercentage(trader.usualTravelTime, 0.5)
  );

  // CITIES MAKE MONEY
  const handleIncrementCityWealth = (key: string, timeout: number) => {
    props.handlers.growCityWealth(key, 0.1);
  };
  useMultipleTimerEffects(
    props.cities,
    handleIncrementCityWealth,
    city => city.key,
    () => randomRange(1000, 2000)
  );

  const handleIncrement = () => {
    props.handlers.playerIncrementPoints(5);
  };

  useTimerEffect(props.player, playerIncrementTimer.current, handleIncrement, [
    1000,
    2500
  ]);

  const handleAddCity = () => {
    props.handlers.addCity();
  };

  useTimerEffect(props.cities, addCityTimer.current, handleAddCity, [
    1000,
    1750
  ]);
};

const useMultipleTimerEffects = <
  W extends Partial<Root>,
  T extends {},
  K extends string
>(
  deps: Record<K, T>,
  handle: (key: K, timeout: number) => void,
  toId: (t: T) => K,
  intervalFn: (t: T) => number
) => {
  const timers = useRef<Record<CityKey, Timeout>>({});
  useEffect(() => {
    Object.values<T>(deps).map(dep => {
      const key = toId(dep);
      const t = timers.current[key] || (timers.current[key] = timer());
      if (!t.going) {
        const timeout = intervalFn(dep);
        t.start(() => handle(toId(dep), timeout), timeout);
      }
    });
  }, [deps]);
};

type Props = { world: Root } & {
  updateCity: typeof updateCity;
  playerOwnCity: typeof playerOwnCity;
  playerIncrementPoints: typeof playerIncrementPoints;
  addCity: typeof addCity;
  growCityWealth: typeof growCityWealth;
  sendTrader: typeof sendTrader;
  maybeSendNewTrader: typeof maybeSendNewTrader;
  addTradeRoute: typeof addTradeRoute;
};

export const App = connect(
  (state: Root) => ({ world: state }),
  {
    addCity,
    playerOwnCity,
    playerIncrementPoints,
    sendTrader,
    maybeSendNewTrader,
    addTradeRoute,
    growCityWealth
  }
)((props: Props) => {
  const { world, ...handlers } = props;
  const cities = Object.values(world.cities);
  const traders = Object.values(world.traders);
  usePeriodicEvents({
    ...world,
    handlers
  });
  useEffect(() => {
    props.playerOwnCity(cities[0]);
  }, []);
  return (
    <>
      <div style={{ display: "flex", height: "100%" }}>
        <div>
          <h2 children="hello world" />
          <ul>
            <li children={`Player points: ${world.player.points.toFixed()}`} />
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
          </ul>
        </div>
        <Map {...world} />
      </div>
      <Help {...world} />
    </>
  );
});
