import { Reducer, Action } from "redux";

export const createReducer = <T extends any>(initial: T) => {
  const symbol = Symbol("reducer");

  const actionCreator = (update: (t: T) => T) => ({
    type: symbol,
    update
  });

  const reducer: Reducer<T, ReturnType<typeof actionCreator>> = (
    state = initial,
    action
  ) => {
    if (action.type === symbol) return action.update(state);
    return state;
  };

  return [reducer, actionCreator] as [typeof reducer, typeof actionCreator];
};

export const createRecordReducer = <T extends {}, K extends string>(
  initial: Record<K, T>
) => {
  const symbol = Symbol("record-reducer");

  type RecordAction = {
    type: typeof symbol;
    key: K;
    update: (t: T) => T;
  };

  const actionCreator = (key: K, update: (t: T) => T): RecordAction => ({
    type: symbol,
    key,
    update
  });

  const reducer: Reducer<Record<K, T>, ReturnType<typeof actionCreator>> = (
    state = initial,
    action
  ) => {
    if (action.type === symbol)
      return {
        ...state,
        [action.key]: action.update(state[action.key])
      };
    return state;
  };

  return [reducer, actionCreator] as [typeof reducer, typeof actionCreator];
};

type Inside<T> = T extends (infer U)[] ? U : never;

const createArrayReducer = <T, I extends number>(initial: T[]) => {
  const symbol = Symbol("array-reducer");

  const actionCreator = (index: I, update: (t: T) => T) => ({
    type: symbol,
    index,
    update
  });

  const reducer: Reducer<T[], ReturnType<typeof actionCreator>> = (
    state = initial,
    action
  ) => {
    if (action.type === symbol)
      return state.map((s, i) => (i === action.index ? action.update(s) : s));
    return state;
  };

  return [reducer, actionCreator];
};
