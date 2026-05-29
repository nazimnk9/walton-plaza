# Architectural Justifications & Design Strategy

This document provides structured engineering justifications and explanations of the core technical decisions implemented across the Walton Plaza e-commerce application.

---

## 1. Pagination vs. Infinite Scroll (Criterion #7)

We selected explicit **numbered pagination** instead of infinite scroll or "load more" models for the product catalog due to several critical trade-offs:

### 🚀 Performance & Memory Efficiency
* **Predictable Memory Footprint**: In infinite scroll models, as the user scrolls, more products are appended to the DOM, increasing memory usage. This leads to garbage collection overhead and potential performance degradation (jank) on low-end mobile devices. Pagination enforces a strict maximum page weight of 12 elements, keeping DOM size constant and extremely light.
* **Network Predictability**: Each page query requests a strict payload size, allowing precise database query planning and caching.

### 🌐 SEO & Indexability Advantages
* **Perfect Search Crawler Indexability**: Search engines (like Googlebot) struggle to index content inside infinite scrolls because they do not trigger scroll events. Explicit page links (`/?page=2`) use standard HTML `<a>` tags with absolute paths, enabling search crawlers to seamlessly traverse and index the entire catalog.
* **Metadata Integrity**: Explicit paginated URLs permit setting clean canonical tags on each subpage, preventing duplicate content indexation errors.

### ♿ Accessibility & Focus Management
* **Keyboard Navigation & Reachability**: In infinite scroll systems, the footer becomes unreachable because it is constantly pushed down by new content. This violates WCAG criteria. With pagination, users can reliably navigate to the footer to access copyright information, support pages, and terms.
* **Predictable Focus Control**: Navigating pages updates the URL and re-focuses the top of the grid, allowing screen readers and keyboard users to naturally maintain structural context.

### 📍 Navigation Predictability & State Restoration
* **Back Button Integrity**: If a user clicks a product on page 3 of an infinite scroll, then clicks the back button, they often lose their scroll position and get reset to the top of page 1. With paginated URLs (`/?page=3`), returning to the catalog instantly restores their exact context.

---

## 2. Zustand LocalStorage Cart Persistence (Criterion #15)

We utilized Zustand's persistent middleware backed by `localStorage` to synchronize the shopping cart:

### 🔄 why localStorage over sessionStorage?
* **Multi-tab Synchronization**: E-commerce users frequently open products in multiple tabs. `sessionStorage` isolates state to a single tab, meaning a product added in one tab would not show up in the cart of another tab. `localStorage` is shared across tabs, allowing real-time cart state synchronization across all open browser pages.
* **Longevity & Retention**: Shopping carts represent high-intent customer choices. `sessionStorage` is destroyed when the tab is closed. If a user closes the browser and returns later, their cart is lost. `localStorage` persists the cart across browser restarts, substantially increasing conversion rates.

### ⚡ Client-Side vs. Database Persistence
* **Reduced Database Overhead**: Storing guest sessions in the database before checkout creates massive write/read overhead. Client-side storage keeps guest carts fully offline, utilizing database writes only during checkout or user registration.
* **Instant UI Feedback**: Zustand's synchronous store updates immediately, guaranteeing immediate response times during add-to-cart clicks.

---

## 3. Apollo Client & Normalized Cache Strategy (Criterion #18)

We integrated Apollo Client for server-side fetches and configured a powerful normalized cache strategy:

### 🧩 Reusable Fragments
We defined standardized, layered GraphQL fragments (`PricingFields`, `VariantFields`, `ProductCardFields`, `ProductDetailsFields`) to enforce:
* **Optimal Field Selection**: Prevents over-fetching by requesting only fields that are explicitly rendered by the UI.
* **Strict Type Mapping**: Simplifies typings across components using generated type definitions.

### 🗄️ Normalized Caching
We configured exact `keyFields` in our `InMemoryCache` initialization:
```typescript
cache: new InMemoryCache({
  typePolicies: {
    Product: {
      keyFields: ['uid'],
    },
    ProductVariant: {
      keyFields: ['posItemCode', 'ebsItemCode'],
    },
  },
})
```
* **Key Derivation**: Allows Apollo Client to index elements by their database primary keys. Any component querying these entities shares a single source of truth in memory, instantly updating other parts of the application when data changes.

### 🌐 Hybrid Server Caching
In `serverFetchGraphQL`, we instantiated Apollo Client on the server and wrapped queries inside a Next.js-aware configuration:
```typescript
context: {
  fetchOptions: {
    next: { revalidate: 60, ...options.next },
    cache: options.cache
  }
}
```
This maps Apollo Client queries directly to Next.js's native fetch cache, merging Apollo's normalized query resolution with the App Router's high-speed static site generation (SSG) caching!

---

## 4. Performance Memoization Strategy (Criterion #16)

We implemented a comprehensive rendering optimization plan using React 19 rules:

### 🧠 Memoization Boundaries
* **`useMemo` for Filtering & Sorting**: Product filtering, dynamic category resolution, and rating sorting are O(N) and O(N log N) computational operations. We encapsulated these inside `useMemo` hooks, assuring they only compute when core dependencies (`products`, `brandParam`, `categoryParam`, `minPriceParam`, `maxPriceParam`, `inStockParam`, `sortParam`) change.
* **`useCallback` for Event Handlers**: Event callbacks in `FiltersSidebar` and `SortingHeader` are wrapped in `useCallback` to avoid regenerating fresh function references on every render, protecting child controls from undergoing redundant layout redraws.
* **`React.memo` for ProductCard**: `ProductCard` represents the most repeated item in the catalog. By memoizing it, we guarantee that when a user applies a filter, only the elements entering or exiting the viewport are evaluated, keeping storefront animations exceptionally smooth.
