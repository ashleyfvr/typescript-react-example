import {
  useState,
  useReducer,
  useEffect,
  useCallback,
  FormEvent,
  ChangeEvent,
  Reducer,
} from "react";

const App = () => {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setName(input);
    },
    [input]
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.currentTarget.value);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "60vh",
        }}
      >
        <p>
          <input
            autoComplete="off"
            type="text"
            name="pokemon"
            value={input}
            onChange={handleChange}
          />
          <button type="submit">Search</button>
        </p>
        <PokeFinder name={name} />
      </div>
    </form>
  );
};

enum Type {
  Normal = "normal",
  Fighting = "fighting",
  Flying = "flying",
  Poison = "poison",
  Ground = "ground",
  Rock = "rock",
  Bug = "bug",
  Ghost = "ghost",
  Steel = "steel",
  Fire = "fire",
  Water = "water",
  Grass = "grass",
  Electric = "electric",
  Psychic = "psychic",
  Ice = "ice",
  Dragon = "dragon",
  Dark = "dark",
  Fairy = "fairy",
  Unknown = "unknown",
  Shadow = "shadow",
}

const TYPE_COLORS: Record<Type, string> = {
  [Type.Normal]: "#A8A77A",
  [Type.Fire]: "#EE8130",
  [Type.Water]: "#6390F0",
  [Type.Electric]: "#F7D02C",
  [Type.Grass]: "#7AC74C",
  [Type.Ice]: "#96D9D6",
  [Type.Fighting]: "#C22E28",
  [Type.Poison]: "#A33EA1",
  [Type.Ground]: "#E2BF65",
  [Type.Flying]: "#A98FF3",
  [Type.Psychic]: "#F95587",
  [Type.Bug]: "#A6B91A",
  [Type.Rock]: "#B6A136",
  [Type.Ghost]: "#735797",
  [Type.Dragon]: "#6F35FC",
  [Type.Dark]: "#705746",
  [Type.Steel]: "#B7B7CE",
  [Type.Fairy]: "#D685AD",
  [Type.Unknown]: "#AAAAAA",
  [Type.Shadow]: "#333333",
};

type Pokemon = {
  name: string;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: Type;
      slot: number;
    };
  }[];
};

type PokeFinderProps = {
  name: string;
};
const PokeFinder: React.FC<PokeFinderProps> = ({ name }) => {
  const { error, isLoading, isRefetching, isInitialized, result } =
    useFetch<Pokemon>(name ? `https://pokeapi.co/api/v2/pokemon/${name}` : "");

  if (!isInitialized) {
    return <p>Enter the name of a pokemon to start</p>;
  }

  if (isLoading) {
    return <p>Looking for Pokemon</p>;
  }

  if (error) {
    return (
      <p>
        <strong>Error!</strong> {error.message}
      </p>
    );
  }

  return (
    <>
      <p>{result.name}</p>
      <div style={{ position: "relative", width: 400, height: 400 }}>
        <Background
          left={result.types[0]?.type.name}
          right={result.types[1]?.type.name}
        />
        <img
          width="400"
          height="400"
          src={result.sprites.front_default}
          alt=""
          style={{
            display: "block",
            filter: "drop-shadow(2px 2px 4px #000)",
          }}
        />
      </div>
      <ul style={{ listStyle: "none", display: "flex", gap: 6, padding: 6 }}>
        {result.types.map(({ type }) => (
          <li
            key={type.slot}
            style={{
              padding: "3px 6px",
              borderRadius: 3,
              background: TYPE_COLORS[type.name],
              textShadow: "1px 1px 2px #000",
              color: "#FFF",
            }}
          >
            {type.name}
          </li>
        ))}
      </ul>
      {isRefetching && (
        <p style={{ height: 0, margin: 0 }}>Updating Results...</p>
      )}
    </>
  );
};

type InitialResult = {
  error: null;
  isInitialized: false;
  isLoading: false;
  isRefetching: false;
  result: null;
};
type ErrorResult = {
  isInitialized: true;
  error: Error;
  isLoading: false;
  isRefetching: false;
  result: null;
};
type LoadingResult = {
  isInitialized: true;
  error: null;
  isLoading: true;
  isRefetching: false;
  result: null;
};
type SuccessResult<T> = {
  isInitialized: true;
  error: null;
  isLoading: false;
  isRefetching: boolean;
  result: T;
};
type FetchResult<T> =
  | InitialResult
  | ErrorResult
  | LoadingResult
  | SuccessResult<T>;

type ErrorAction = { type: "error"; error: string };
type StartAction = { type: "start" };
type SuccessAction<T> = { type: "success"; result: T };
type FetchAction<T> = ErrorAction | StartAction | SuccessAction<T>;

function useFetch<T>(url: string): FetchResult<T> {
  const [state, dispatch] = useReducer<Reducer<FetchResult<T>, FetchAction<T>>>(
    (state, action) => {
      switch (action.type) {
        case "error":
          return {
            error: new Error(action.error),
            isInitialized: true,
            isLoading: false,
            isRefetching: false,
            result: null,
          };
        case "start":
          if (state.result) {
            return {
              error: null,
              isInitialized: true,
              isLoading: false,
              isRefetching: true,
              result: state.result,
            };
          } else {
            return {
              error: null,
              isInitialized: true,
              isLoading: true,
              isRefetching: false,
              result: null,
            };
          }
        // return {
        //   error: null,
        //   isInitialized: true,
        //   isLoading: !!state.result,
        //   isRefetching: !!state.result,
        //   result: state.result,
        // };
        case "success":
          return {
            error: null,
            isInitialized: true,
            isLoading: false,
            isRefetching: false,
            result: action.result,
          };
      }
    },
    {
      error: null,
      isLoading: false,
      isRefetching: false,
      result: null,
      isInitialized: false,
    }
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      dispatch({ type: "error", error: "Invalid URL provided" });
      return;
    }

    dispatch({ type: "start" });
    let cancelled = false;
    const abort = new AbortController();
    async function performFetch() {
      try {
        // Fake network time
        await new Promise((r) => setTimeout(r, 1000));
        const response = await fetch(url, {
          signal: abort.signal,
        });
        if (cancelled) {
          return;
        }
        if (!response.ok) {
          dispatch({ type: "error", error: `api returned ${response.status}` });
          return;
        }

        dispatch({ type: "success", result: (await response.json()) as T });
      } catch (e) {
        if (cancelled) {
          return;
        }

        if (e instanceof Error) {
          dispatch({ type: "error", error: e.message });
        } else {
          dispatch({ type: "error", error: `unknown error` });
        }
      }
    }

    void performFetch();

    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [url]);

  return state;
}

export default App;

type BackgroundProps = {
  left: Type | undefined;
  right: Type | undefined;
};
const Background: React.FC<BackgroundProps> = ({ left, right }) => {
  const r = right || left;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        zIndex: "-1",
        overflow: "hidden",
        borderRadius: 3,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          height: "141.7%",
          width: "141.7%",
          background: left ? TYPE_COLORS[left] : "transparent",
          transform: "translate(-50%, -50%) rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "100%",
          height: "141.7%",
          width: "141.7%",
          background: r ? TYPE_COLORS[r] : "transparent",
          transform: "translate(-50%, -50%) rotate(45deg)",
        }}
      />
    </div>
  );
};
