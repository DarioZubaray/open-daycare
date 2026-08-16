# Performance Optimization — Reference

## When to optimize

**Don't optimize prematurely.** Only add `memo`, `useMemo`, or `useCallback` when there is a measurable performance problem. React is fast by default.

## memo

Use `React.memo` to skip re-rending a component when its props haven't changed.

```tsx
// ❌ Unnecessary — no re-render problem exists
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return items.map(item => <Item key={item.id} {...item} />);
});

// ✅ Only use when re-renders are expensive and frequent
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return items.map(item => <ExpensiveItem key={item.id} {...item} />);
});
```

### When memo IS worth it

1. **Expensive render** — component takes >5ms to render
2. **Re-renders frequently** — parent re-renders often (e.g., typing in input, animation)
3. **Passed as props** — component receives callbacks or objects that change reference
4. **List items** — rendering 100+ items, only a few change

### When memo is NOT worth it

1. Component renders quickly
2. Parent rarely re-renders
3. Component is rendered only once
4. Props always change (memo adds overhead without benefit)

## useMemo

Caches a **computed value** between re-renders.

```tsx
// ✅ Expensive computation — worth memoizing
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ Object creation that would break shallow comparison
const style = useMemo(
  () => ({ color: theme.primary, fontSize: size }),
  [theme.primary, size]
);

// ❌ Trivial computation — not worth memoizing
const fullName = useMemo(() => `${first} ${last}`, [first, last]);
// Just compute it directly: const fullName = `${first} ${last}`;
```

## useCallback

Caches a **function reference** between re-renders.

```tsx
// ✅ Passed to memoized child — prevents unnecessary re-renders
const MemoizedChild = memo(function Child({ onClick }) { /* ... */ });

function Parent() {
  const [count, setCount] = useState(0);

  // Without useCallback: new function every render → Child re-renders
  // With useCallback: same function reference → Child skips re-render
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <>
      <MemoizedChild onClick={handleClick} />
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}

// ❌ Not memoized child — useCallback adds overhead without benefit
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <NonMemoizedChild onClick={handleClick} />;
  // Just use: onClick={() => console.log('clicked')}
}
```

## Object and array creation in render

New object/array references defeat `memo` and cause unnecessary re-renders.

```tsx
// ❌ New object every render — defeats memo
function Parent() {
  return <MemoizedChild style={{ color: 'red' }} />;
}

// ✅ Memoize the object
function Parent() {
  const style = useMemo(() => ({ color: 'red' }), []);
  return <MemoizedChild style={style} />;
}
```

## Key patterns

### Use key to reset state

```tsx
// ✅ Key resets child state when parent changes
<EditContact key={savedContact.id} savedContact={savedContact} />
```

### State colocation

```tsx
// ❌ State lifted too high — every sibling re-renders
function Parent() {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <>
      <Sidebar selectedId={selectedId} onSelect={setSelectedId} />
      <Content selectedId={selectedId} />
      <Footer /> {/* Re-renders on every selection change! */}
    </>
  );
}

// ✅ State colocated — only relevant components re-render
function Parent() {
  return (
    <>
      <Sidebar />
      <Content />
      <Footer />
    </>
  );
}
// Move selectedId state down into Sidebar + Content
```

## Virtualization for large lists

```tsx
// ✅ For lists with 100+ items, use virtualization
// Libraries: @tanstack/react-virtual, react-window, react-virtuoso

import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Checklist summary

| Technique | Use when | Don't use when |
|-----------|----------|----------------|
| `memo` | Expensive child + frequent re-render + props change reference | Cheap render, infrequent re-render, or props always change |
| `useMemo` | Expensive computation, object needed for shallow comparison | Trivial computation, no comparison downstream |
| `useCallback` | Callback passed to memoized child | Callback passed to non-memoized element |
| Virtualization | 100+ list items | Few items |
| State colocation | State used by only 1-2 components | State used by many siblings |
