import {
  useState,
  useReducer,
  useEffect,
  useCallback,
  FormEvent,
  ChangeEvent,
  Reducer,
} from "react";
import styles from "./styles";

const App = () => {
  // Two sets of state, one for controlled input, one to apply search
  // useState uses generics and tuples!
  const [input, setInput] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      // Ensure the submit event doesn't trigger a page reload and apply
      // our search terms
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
      <div style={styles.root}>
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
        <PokeFinder name={name} onResult={() => setInput("")} />
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

// Keep a record of every type's color for rendering styles later on
// If the Type enum ever updates, this map will also invalidate
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

// Shape definitions can deeply type
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

// React provides typings to help us define our props
type PokeFinderProps = {
  name: string;
  onResult: () => void;
};
const PokeFinder: React.FC<PokeFinderProps> = ({ name, onResult }) => {
  // Here we provide our Pokemon type definition into useFetch to let
  // typescript know what we expect back. This is *risky* as we do not
  // check the result from the server at runtime. Any changes could break our
  // application!
  const { error, isLoading, isRefetching, isInitialized, result } =
    useFetch<Pokemon>(
      name ? `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}` : ""
    );

  useEffect(() => {
    if (result) {
      onResult();
    }
  }, [result]);

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

  const RAW_IMAGE_SIZE = 96;

  // result will no longer be | null due to our earlier checks and early returns
  return (
    <>
      <p style={styles.name}>{result.name}</p>
      <div style={styles.card}>
        <Background
          left={result.types[0]?.type.name}
          right={result.types[1]?.type.name}
        />
        <img
          width={RAW_IMAGE_SIZE * 4}
          height={RAW_IMAGE_SIZE * 4}
          src={result.sprites.front_default}
          alt=""
          style={styles.sprite}
        />
      </div>
      <ul style={styles.typeList}>
        {result.types.map(({ type }) => (
          <li
            key={type.slot}
            style={{
              ...styles.type,
              background: TYPE_COLORS[type.name],
            }}
          >
            {type.name}
          </li>
        ))}
      </ul>
      {isRefetching && <p style={styles.loader}>Updating Results...</p>}
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

// What happens if we use this definition instead? It's much simpler!
// type FetchResult<T> = {
//   isInitialized: boolean;
//   error: Error | null;
//   isLoading: boolean;
//   isRefetching: boolean;
//   result: T | null;
// };

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
        // Why not just use a ternary rather than duplicating code above?
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
      // Do some basic checking that the provided URL is valid
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
        // There are better, cleaner ways to handle cancelling, but we'll
        // brute force it for now
        if (cancelled) {
          return;
        }

        if (!response.ok) {
          dispatch({ type: "error", error: `api returned ${response.status}` });
          return;
        }

        dispatch({ type: "success", result: (await response.json()) as T });
      } catch (e) {
        // If we cancelled, we likely received an Abort error and can ignore
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

    // void prefix here is out of habit from my own eslint rules
    // it shows that you're conscious you're generating a promise but aren't
    // looking to await or then() it.
    void performFetch();

    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [url]);

  return state;
}

export default App;

// Not really related to Typescript. Just wanted to make a cool-ish background
// for the pokemon types
type BackgroundProps = {
  left: Type | undefined;
  right: Type | undefined;
};
const Background: React.FC<BackgroundProps> = ({ left, right }) => {
  const r = right || left;
  return (
    <div style={styles.background}>
      <div
        style={{
          ...styles.backgroundLeft,
          background: left ? TYPE_COLORS[left] : "transparent",
        }}
      />
      <div
        style={{
          ...styles.backgroundRight,
          background: r ? TYPE_COLORS[r] : "transparent",
        }}
      />
    </div>
  );
};
