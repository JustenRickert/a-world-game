import React from "react";

import { Root } from "./store";
import { City } from "./city";

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

export const Map = (props: { cities: Root["cities"] }) => {
  const cities = Object.values(props.cities);
  const negativeOffset = lowestOffset(cities.map(c => c.position));
  const style = (city: City): React.CSSProperties => ({
    position: "absolute",
    width: -negativeOffset.x + city.position.x,
    height: -negativeOffset.y + city.position.y,
    transform: interpolateTranslate(
      -negativeOffset.x + city.position.x,
      -negativeOffset.y + city.position.y
    )
  });
  const maxOffset = highestOffset(
    cities.map(c => ({ x: c.position.x, y: c.position.y }))
  );
  return (
    <div
      style={{
        overflow: "scroll",
        width: -negativeOffset.x + maxOffset.x,
        height: -negativeOffset.y + maxOffset.y,
        maxWidth: "100%",
        maxHeight: "100%"
      }}
    >
      {cities.map(city => (
        <div style={style(city)} children="o" />
      ))}
    </div>
  );
};
