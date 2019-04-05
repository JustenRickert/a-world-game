import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import { Root } from "./store";
import { updateCity, addCity, City } from "./city";
import { playerOwnCity, playerIncrementPoints, Player } from "./player";
import { randomRange } from "./util";
import { Map } from "./Map";
import { Help } from "./Help";

type Timeout = {
  _timeout: number;
  going: boolean;
  start(this: Timeout, fn: () => void, interval: number): () => void;
  restart(this: Timeout, fn: () => void, interval: number): () => void;
  stop(this: Timeout): void;
};

const timer = (): Timeout => ({
  _timeout: -Infinity,
  going: false,
  start: function(this, fn, interval) {
    this.going = true;
    this._timeout = setTimeout(() => {
      this.going = false;
      fn();
    }, interval);
    return () => {
      clearTimeout(this._timeout);
      this.going = false;
    };
  },
  restart: function(this, fn, interval) {
    clearTimeout(this._timeout);
    return this.start(fn, interval);
  },
  stop: function(this) {
    clearTimeout(this._timeout);
    this.going = false;
  }
});

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
  cities: Record<string, City>;
  player: Player;
  playerIncrementPoints: typeof playerIncrementPoints;
  addCity: typeof addCity;
}) => {
  const playerIncrementTimer = useRef(timer());
  const addCityTimer = useRef(timer());

  const handleIncrement = () => {
    props.playerIncrementPoints(5);
  };

  const handleAddCity = () => {
    props.addCity();
  };

  useTimerEffect(props.player, playerIncrementTimer.current, handleIncrement, [
    1000,
    2500
  ]);
  useTimerEffect(props.cities, addCityTimer.current, handleAddCity, [
    10000,
    17500
  ]);
};

type Props = Root & {
  updateCity: typeof updateCity;
  playerOwnCity: typeof playerOwnCity;
  playerIncrementPoints: typeof playerIncrementPoints;
  addCity: typeof addCity;
};

export const App = connect(
  (state: Root) => state,
  {
    addCity,
    playerOwnCity,
    updateCity,
    playerIncrementPoints
  }
)((props: Props) => {
  const cities = Object.values(props.cities);
  usePeriodicEvents(props);
  useEffect(() => {
    props.playerOwnCity(cities[0]);
  }, []);
  return (
    <>
      <div style={{ display: "flex" }}>
        <div>
          <h2 children="hello world" />
          <ul>
            <p children={"Points: " + props.player.points} />
            {cities.map(city => (
              <li>
                <p
                  children={[
                    `(${city.position.x.toFixed()},${city.position.y.toFixed()})`,
                    city.population,
                    city.wealth
                  ].join(", ")}
                />
                {props.player.cities.some(c => c === city.key) && (
                  <p children="Player owns" />
                )}
              </li>
            ))}
          </ul>
        </div>
        <Map {...props} />
      </div>
      <Help {...props} />
    </>
  );
});
