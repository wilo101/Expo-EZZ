## 2024-05-22 - [Avoid Redundant Image Prefetching]
**Learning:** Using `Image.prefetch` inside a component's `useEffect` is redundant and harmful when using `expo-image`. It causes double requests and network contention, especially in large lists (`FlatList`).
**Action:** Rely on `expo-image`'s built-in caching and loading handling. Only use `Image.prefetch` for critical assets that need to be loaded *before* the component mounts (e.g., in a parent route or splash screen).
