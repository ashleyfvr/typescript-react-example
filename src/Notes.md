```tsx
<form>
  <input type="text" name="name" />
  <button type="submit">Search</button>
</form>
```

```tsx
const onSubmit = useCallback((event: SubmitEvent) => {

}, []);


return (
    <form onSubmit={onSubmit}>
<form>

```

```tsx
const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {}, []);
```

```tsx
event.preventDefault();
const data = new FormData(event.currentTarget);
```
