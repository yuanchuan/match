# Match
Erlang-like pattern matching in JavaScript **(use at your own risk)**.

```js
const { match } = require('@yuanchuan/match');

const sum = match(
  ([]) => 0,
  ([H, ...T]) => H + sum(T)
);

// 10
sum([1, 2, 3, 4]);

```

## Installation

```bash
npm install --save @yuanchuan/match
```

## Patterns
Unlike the [proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching), patterns inside the function arguments are quite limited supported. However, it can be extended using `when()`.

#### Match by number of parameters

```js
const greeting = match(
  (User) => greeting(Str, "Hi"),
  (User, Words) => `${Words} ${User}!`
);

// Hi Ana!
greeting("Ana");

// Hello Ana!
greeting("Ana", "Hello");

```

#### Match empty array

```js
const foldl = match(
  ([], _, Acc) => Acc,
  ([H, ...T], F, Acc) => foldl(T, F, F(Acc, H))
);

const add = (A, B) => A + B;

// 10
foldl([1, 2, 3, 4], add, 0);

```

#### Match with guards

```js
const { match, when } = require('@yuanchuan/match');

const fib = match(
  N => 0, when(N => N === 0),
  N => 1, when(N => N < 2),
  N => fib(N - 1) + fib(N - 2)
);

// 6765
fib(20);
```

## More examples

**map**

```js
const map = match(
  (L, F) =>
    map(L, F, []),
  ([], F, L1) =>
    L1,
  ([H, ...T], F, L1) =>
    map(T, F, [...L1, F(H)])
);
```

**filter**

```js
const filter = match(
  (L, F) =>
    filter(L, F, []),
  ([], _, L1) =>
    L1,
  ([H, ...T], F, L1) =>
    filter(T, F, F(H) ? [...L1, H] : L1)
);
```

**range**

```js
const range = match(
  (N) =>
    range(1, N),
  (N, M) =>
    [], when((N, M) => N > M),
  (N, M) =>
    range(N, M, []),
  (N, M, L) =>
    [...L, M], when((N, M) => N == M),
  (N, M, L) =>
    range(N + 1, M, [...L, N])
);
```

**foldr**

```js
const foldr = match(
  ([], F, Acc) =>
    Acc,
  ([H, ...T], F, Acc) =>
    F(foldr(T, F, Acc), H)
);

const reverse = L =>
  foldr(L, (Acc, N) => [...Acc, N], []);
```
