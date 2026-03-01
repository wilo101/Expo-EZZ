## 2024-03-01 - Dangerous Custom Comparators in React.memo
**Learning:** Writing custom comparison functions for `React.memo` that only check a few fields (e.g. just `id` and `price` on a `product` object) leads to dangerous, hard-to-detect state synchronization bugs where UI fails to update when other fields (like `name` or `images`) change.
**Action:** Do not write custom comparators for `React.memo` unless strictly necessary and all prop dependencies are perfectly understood. Rely on the default shallow comparison and pass primitive props where possible.
