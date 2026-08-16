# Component Patterns — Purity and Anti-patterns

## Component purity rules

Components must be **idempotent** — same input always produces the same output.

### 1. No side effects during render

```tsx
// ❌ Side effect during render
function MyComponent() {
  document.title = 'Hello'; // Side effect!
  return <h1>Hello</h1>;
}

// ✅ Side effect in useEffect
function MyComponent() {
  useEffect(() => {
    document.title = 'Hello';
  }, []);
  return <h1>Hello</h1>;
}
```

### 2. Props and state are immutable

```tsx
// ❌ Mutating props
function MyComponent({ user }) {
  user.name = 'John'; // Mutating prop!
  return <div>{user.name}</div>;
}

// ✅ Create new object
function MyComponent({ user }) {
  const updatedUser = { ...user, name: 'John' };
  return <div>{updatedUser.name}</div>;
}
```

### 3. State updates via setter, not mutation

```tsx
// ❌ Mutating state directly
const [user, setUser] = useState({ name: 'John' });
user.name = 'Jane'; // Direct mutation!
setUser(user); // React won't re-render (same reference)

// ✅ Create new state object
setUser({ ...user, name: 'Jane' });
```

## Common anti-patterns

### Anti-pattern: useState + useEffect to derive from props

```tsx
// ❌ Unnecessary double render
function EditContact({ savedContact }) {
  const [name, setName] = useState(savedContact.name);
  const [email, setEmail] = useState(savedContact.email);

  useEffect(() => {
    setName(savedContact.name);
    setEmail(savedContact.email);
  }, [savedContact]);

  // ...
}

// ✅ Derived state — no useEffect needed
function EditContact({ savedContact }) {
  const [name, setName] = useState(savedContact.name);
  const [email, setEmail] = useState(savedContact.email);

  // When the user wants to reset:
  const handleReset = () => {
    setName(savedContact.name);
    setEmail(savedContact.email);
  };

  // No useEffect needed
  // ...
}
```

### Anti-pattern: useEffect for data transformation

```tsx
// ❌ Transforming data in useEffect
function ProductList({ items }) {
  const [sorted, setSorted] = useState([]);

  useEffect(() => {
    setSorted(items.toSorted((a, b) => a.price - b.price));
  }, [items]);

  // ...
}

// ✅ Compute during render
function ProductList({ items }) {
  const sorted = useMemo(
    () => items.toSorted((a, b) => a.price - b.price),
    [items]
  );

  // ...
}
```

### Anti-pattern: Boolean sprawl

```tsx
// ❌ Multiple booleans with related state
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// ✅ Single state variable with union type
const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
```

### Anti-pattern: Inline functions defeating memo

```tsx
// ❌ New function reference every render defeats memo
const MemoizedChild = memo(function Child({ onClick }) { /* ... */ });

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MemoizedChild onClick={() => console.log('clicked')} />
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}

// ✅ useCallback preserves reference
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => console.log('clicked'), []);

  return (
    <>
      <MemoizedChild onClick={handleClick} />
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}
```

## Composition patterns

### Prefer composition over configuration

```tsx
// ❌ Configuration prop explosion
<Card
  title="Hello"
  subtitle="World"
  showHeader={true}
  showFooter={false}
  headerColor="blue"
  footerAlign="right"
/>

// ✅ Composition — explicit and flexible
<Card>
  <Card.Header color="blue">
    <Card.Title>Hello</Card.Title>
    <Card.Subtitle>World</Card.Subtitle>
  </Card.Header>
  <Card.Footer align="right">{/* footer content */}</Card.Footer>
</Card>
```

### Children as slot

```tsx
// ✅ Children pattern for flexible composition
function Layout({ children }) {
  return (
    <div className="layout">
      <header>...</header>
      <main>{children}</main>
      <footer>...</footer>
    </div>
  );
}
```
