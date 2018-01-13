# Match
Erlang-like pattern matching in JavaScript **(use at your own risk)**.

```js
const { match, when } = require('@yuanchuan/match');

const fib = match(
  N => 0, when(N => N === 0),
  N => 1, when(N => N < 2),
  N => fib(N - 1) + fib(N - 2)
);

fib(10)
```
