# System Modules Directory

This directory contains individual sub-systems (e.g., `sys001`, `sys002`).

## Guidelines:
1. Each system must be strictly isolated to its own folder: `systems/sys001/`.
2. Each system manages its own domain logic, pages, internal components, and data fetching services.
3. Every system MUST reuse Portal Core components and the Shared Design System.
4. Custom CSS, if strictly necessary, must follow the system namespace: `sys001_*`.
5. Human-readable Thai labels must ALWAYS be used; never expose `sys001` or internal field names to normal users.
