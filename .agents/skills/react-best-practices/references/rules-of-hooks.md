# Rules of Hooks — Complete Reference

## Core rules

1. **Only call Hooks at the top level** — Never inside loops, conditions, or nested functions.
2. **Only call Hooks from React functions** — Components or custom hooks, never regular JS functions.

## Why these rules exist

React relies on the call order of Hooks to match state between renders. Moving Hook calls (e.g., inside an `if`) would shift the order and break state mapping.

## Dependency arrays

### useEffect

```tsx
// ❌ Missing dependency
useEffect(() => {
  fetchData(user.id);
}, []); // user.id is missing

// ✅ Correct
useEffect(() => {
  fetchData(user.id);
}, [user.id]);
```

### useMemo / useCallback

```tsx
// ❌ Missing dependency
const memoized = useMemo(() => expensive(a), [a]); // uses b too
const handler = useCallback(() => doSomething(a, b), [a]); // b missing

// ✅ Correct
const memoized = useMemo(() => expensive(a, b), [a, b]);
const handler = useCallback(() => doSomething(a, b), [a, b]);
```

### When NOT to use useCallback/useMemo

```tsx
// ❌ Unnecessary — no child is memoized, callback is cheap
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);

// ✅ Correct — just define it
const handleClick = () => {
  setCount(c => c + 1);
};
```

### Exhaustive-deps rule

The `react-hooks/exhaustive-deps` ESLint rule catches missing dependencies. Enable it in ESLint config:

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Common violations

| Pattern | Issue | Fix |
|---------|-------|-----|
| Hook inside `if` | Conditional call | Move to top level |
| Hook inside `for` loop | Loop call | Move to top level |
| Hook inside `map` | Called in iteration | Move to top level of component |
| Hook inside callback | Nested call | Move to top level |
| Hook after `return` | Unreachable | Move before return |
| Missing deps in `useEffect` | Stale closure | Add to dependency array |
| Missing deps in `useCallback` | Stale closure | Add to dependency array |
