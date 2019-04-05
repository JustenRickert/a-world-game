import React, { useMemo, useState, useEffect, Dispatch } from "react";
import { xor, sortBy } from "lodash";

import { Root } from "./store";
import { City } from "./city";

// const useSearchResults = (cities: City[], searchText: string) => {
//   const [results, setResults] = useState([]);
//   useEffect(() => {
//     const {} = cities.map(c => c.)
//   }, [searchText, cities]);
//   return;
// };

const useCitySortedList = (cities: City[]) => {
  const [sort, setSort] = useState<
    null | "wealth" | "population" | "techKnowledge"
  >(null);
  const [sortedCities, setSortedCities] = useState<City[]>([]);
  const handleSetSort = (item: "wealth" | "population" | "techKnowledge") =>
    setSort(sort === item ? null : item);
  useEffect(() => {
    if (sort) {
      setSortedCities(sortBy(cities, [sort]));
    }
  }, [sort, cities]);
  return { sort, setSort, sortedCities: sortedCities.slice(0, 5) };
};

export const Help = (props: { cities: Root["cities"] }) => {
  // const [searchText, setSearchText] = useState("");
  // const {} = useSearchResults(Object.values(props.cities), searchText);
  const { sort, setSort, sortedCities } = useCitySortedList(
    Object.values(props.cities)
  );
  return (
    <div style={{ display: "flex", position: "absolute", bottom: 0 }}>
      <div
        style={{
          margin: 2,
          padding: 4,
          border: "1px solid black"
        }}
      >
        <h3 children="Help menu" />
        <h4 children="Search" />
        <section style={{ display: "flex", flexDirection: "column" }}>
          {["wealth", "population", "techKnowledge"].map(item => (
            <div>
              <input
                checked={sort === item}
                type="radio"
                onClick={() => setSort(item as any)}
              />
              <span children={item} />
            </div>
          ))}
        </section>
      </div>
      <div
        style={{
          margin: 2,
          padding: 4,
          border: "1px solid black"
        }}
      >
        {sort === "wealth" && (
          <>
            <h4 children="Most wealth" />
            <ul>
              {sortedCities.map(c => (
                <li children={`${c.key} @ ${c.wealth}`} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
