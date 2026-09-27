# Shared Portal Design System Components

Reusable atomic and molecular UI components adhering strictly to the PCSK Design System:

- **Button** (`button.tsx`)
- **Input / Form Controls** (`input.tsx`, `select.tsx`, `checkbox.tsx`, `textarea.tsx`)
- **Card / Panel** (`card.tsx`)
- **Badge / Status Tag** (`badge.tsx`)
- **Alert / Notification** (`alert.tsx`)
- **Modal / Dialog** (`modal.tsx`)
- **DataTable / Pagination** (`table.tsx`)
- **Loading / Skeleton** (`skeleton.tsx`, `spinner.tsx`)
- **Empty State** (`empty-state.tsx`)

**RULE**: System modules (`sys001`, `sys002`, etc.) MUST reuse these components and never recreate their own styled variants.
