# React 19 Features — Reference

## Server Components (App Router default)

Server Components run only on the server. They can be async and access databases directly.

```tsx
// ✅ Server Component (no 'use client')
async function UserProfile({ userId }) {
  const user = await db.user.findById(userId);

  return (
    <div>
      <h1>{user.name}</h1>
      <ClientInteractivePart userId={userId} />
    </div>
  );
}
```

**When to add `'use client'`:** Only when the component needs state, effects, event handlers, or browser APIs. Push `'use client'` to the **leaves** of the component tree.

## use() hook

Replaces `useEffect` + `useState` for data fetching in Client Components.

```tsx
// ❌ Old pattern — waterfall, extra state
"use client";
import { useEffect, useState } from 'react';

function Comments({ commentsPromise }) {
  const [comments, setComments] = useState(null);
  useEffect(() => {
    commentsPromise.then(setComments);
  }, [commentsPromise]);

  if (!comments) return <p>Loading...</p>;
  return comments.map(c => <p key={c.id}>{c.body}</p>);
}

// ✅ React 19 — use() suspends
"use client";
import { use, Suspense } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.body}</p>);
}

// Parent wraps with Suspense
<Suspense fallback={<p>Loading...</p>}>
  <Comments commentsPromise={commentsPromise} />
</Suspense>
```

## useActionState

Replaces manual form state management with pending state.

```tsx
// ❌ Old pattern — manual pending, error, etc.
"use client";
import { useState } from 'react';

function Form() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(formData) {
    setPending(true);
    try {
      await submitForm(formData);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="email" disabled={pending} />
      {error && <p>{error}</p>}
      <button disabled={pending}>{pending ? 'Sending...' : 'Send'}</button>
    </form>
  );
}

// ✅ React 19 — useActionState
"use client";
import { useActionState } from 'react';

async function submitFormAction(prevState, formData) {
  try {
    await submitForm(formData);
    return { error: null, success: true };
  } catch (e) {
    return { error: e.message, success: false };
  }
}

function Form() {
  const [state, formAction, pending] = useActionState(submitFormAction, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="email" disabled={pending} />
      {state.error && <p>{state.error}</p>}
      <button disabled={pending}>{pending ? 'Sending...' : 'Send'}</button>
    </form>
  );
}
```

## useOptimistic

Provides immediate UI feedback while an async operation completes.

```tsx
"use client";
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, sending: true }]
  );

  async function handleAdd(formData) {
    const text = formData.get('text');
    addOptimisticTodo({ id: crypto.randomUUID(), text, sending: true });
    await addTodo(text);
  }

  return (
    <form action={handleAdd}>
      <input name="text" />
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.sending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

## Server Functions ('use server')

Define server-side functions that Client Components can call.

```tsx
// actions.ts
"use server";

export async function createNote(formData) {
  const title = formData.get('title');
  await db.notes.create({ data: { title } });
  revalidatePath('/notes');
}

// Client component calling the server function
"use client";
import { createNote } from './actions';

function CreateNote() {
  return (
    <form action={createNote}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## ref as prop (forwardRef deprecated)

In React 19, `ref` is a regular prop. No need for `forwardRef`.

```tsx
// ❌ React 18 — forwardRef required
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});

// ✅ React 19 — ref is a prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

## cleanup functions for refs

Refs can return cleanup functions, like useEffect.

```tsx
function Video({ src, isPlaying }) {
  return (
    <video
      ref={(video) => {
        if (video === null) return;
        // Cleanup runs when ref changes or component unmounts
        return () => {
          video.pause();
        };
      }}
      src={src}
      loop
      playsInline
    />
  );
}
```

## Document metadata

`<title>`, `<meta>`, and `<link>` can be rendered anywhere in the component tree.

```tsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

## Stylesheets

`<link rel="stylesheet">` can be rendered anywhere, with deduplication.

```tsx
function Component() {
  return (
    <>
      <link rel="stylesheet" href="/theme.css" />
      <div className="themed">Hello</div>
    </>
  );
}
```
