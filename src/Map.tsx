import React, {
  useRef,
  RefObject,
  useReducer,
  useLayoutEffect,
  useEffect,
  useState
} from "react";
import { repeat } from "lodash";

import { Root } from "./store";
import { City } from "./city";
import { createReducer } from "@jsasz/jreducer";

const lowestOffset = (ps: { x: number; y: number }[]) =>
  ps.reduce<{ x: number; y: number }>(
    (offset, p) => ({
      x: Math.min(offset.x, p.x),
      y: Math.min(offset.y, p.y)
    }),
    { x: 0, y: 0 }
  );
const highestOffset = (ps: { x: number; y: number }[]) =>
  ps.reduce<{ x: number; y: number }>(
    (offset, p) => ({
      x: Math.max(offset.x, p.x),
      y: Math.max(offset.y, p.y)
    }),
    { x: 0, y: 0 }
  );

const interpolateTranslate = (x: number, y: number) =>
  `translate(${x}px,${y}px)`;

const mapStateInit = {
  least: {
    x: -Infinity,
    y: -Infinity
  },
  most: {
    x: Infinity,
    y: Infinity
  },
  height: 0,
  width: 0
};

export const Map = (props: {
  cities: Root["cities"];
  player: Root["player"];
}) => {
  const [mapState, setMap] = useState(mapStateInit);
  const cities = Object.values(props.cities);
  useEffect(() => {
    const negativeOffset = lowestOffset(cities.map(c => c.position));
    const maxOffset = highestOffset(
      cities.map(c => ({ x: c.position.x, y: c.position.y }))
    );
    setMap(() => ({
      most: maxOffset,
      least: negativeOffset,
      width: -negativeOffset.x + maxOffset.x,
      height: -negativeOffset.y + maxOffset.y
    }));
  }, [props.cities]);
  const ref = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    const handleScroll = (e: Event) => {
      const { scrollLeft, scrollTop } = ref.current!;
      setScrollOffset({
        x: scrollLeft,
        y: scrollTop
      });
    };
    ref.current!.addEventListener("scroll", handleScroll);
    return () => {
      ref.current!.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        minWidth: 100,
        minHeight: 100,
        overflow: "scroll"
      }}
    >
      {cities.map(city => {
        return (
          <div
            key={city.key}
            style={{
              position: "absolute",
              transform: !ref.current
                ? undefined
                : interpolateTranslate(
                    -mapState.least.x + city.position.x - scrollOffset.x,
                    -mapState.least.y + city.position.y - scrollOffset.y
                  )
            }}
            children={props.player.cities.includes(city.key) ? "p" : "o"}
          />
        );
      })}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: 100,
          minHeight: 100,
          width: mapState.width,
          height: mapState.height
        }}
        children={<div children="center" />}
      />
    </div>
  );
};
