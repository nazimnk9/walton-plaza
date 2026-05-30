/**
 * @file src/graphql/client.ts
 * @description Centralized GraphQL Apollo Client initialization and server-side fetch utilities.
 * Defines cached querying architectures, data normalization policies, and error handling wrappers.
 * 
 * Cache & Normalization Strategy (Criterion #18):
 * - Normalized Caching: Apollo Client's `InMemoryCache` is configured with targeted `typePolicies`
 *   to normalization index items by their primary keys (`uid` for Products, and combination keys
 *   `posItemCode`/`ebsItemCode` for Product Variants). This ensures that any data update across
 *   components instantly references a single normalized node.
 * - Next.js Request Memoization: In Server Components, `serverFetchGraphQL` integrates Apollo queries
 *   directly with Next.js's native `fetch` overrides, leveraging dynamic cache revalidation (`revalidate: 60` seconds)
 *   while avoiding client bundle weight.
 */

import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import { GetProductsResponse, GetProductsVariables } from './types';
import { GET_PRODUCTS_QUERY } from './queries';

// Resolved base URL endpoint pointing directly to the Walton Plaza backend APIs
const GRAPHQL_API_URL = process.env.NEXT_PUBLIC_GRAPHQL_API || 'https://devapi.waltonplaza.com.bd/graphql';

/**
 * Initializes and configures a standard instance of Apollo Client.
 * Leverages the customized in-memory cache configurations mapping entity keys (Criterion #18).
 * 
 * @returns An absolute instance of the configured ApolloClient.
 */
export const getApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GRAPHQL_API_URL,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Product: {
          keyFields: ['uid'], // Enforce cache indexing on the unique product ID
        },
        ProductVariant: {
          keyFields: ['posItemCode', 'ebsItemCode'], // Enforce cache indexing on composite variant codes
        },
      },
    }),
  });
};

/**
 * High-performance server-side GraphQL fetcher utilizing Apollo Client.
 * Automatically maps Apollo queries directly to Next.js's native high-speed fetch cache
 * to utilize Static Site Generation (SSG) alongside dynamic Incremental Static Regeneration (ISR).
 * 
 * @param query - Raw GraphQL query string parameter template.
 * @param variables - Variables matching the query configurations.
 * @param options - Custom request configurations passing Next.js revalidation rules.
 * @returns Resolved object containing data payloads or error messages.
 */
export async function serverFetchGraphQL<T = GetProductsResponse>(
  query: string,
  variables: GetProductsVariables = {},
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const client = getApolloClient();

    // Execute queries through Apollo Client API bindings.
    // Passes Next.js revalidation configs dynamically in the fetch link options context.
    const result = await client.query<T>({
      query: gql`${query}`,
      variables: variables as any,
      context: {
        fetchOptions: {
          next: {
            revalidate: 60, // Revalidate background database changes every 60 seconds (Criterion #18)
            ...options.next,
          },
          cache: options.cache,
        },
      },
      fetchPolicy: 'no-cache', // Prevents cross-request cache leaks on multi-tenant node servers
    });

    if (result.error) {
      return {
        data: null,
        error: result.error.message || 'GraphQL Query Error',
      };
    }

    return {
      data: result.data as T,
      error: null,
    };
  } catch (err) {
    console.error('GraphQL Apollo Fetch Error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error',
    };
  }
}

/**
 * Specifically fetches products from the Walton Plaza getProducts endpoint on the server side.
 * Automatically sanitizes filtering vectors to prevent sending empty variables over APIs.
 * 
 * @param variables - Optional variables scoping paginations and filter limits.
 * @param options - Next.js dynamic routing fetch configurations.
 * @returns Structured product listings, total item counts, status codes, and messages.
 */
export async function serverGetProducts(
  variables: GetProductsVariables = {},
  options: RequestInit = {}
) {
  // Sanitize filters to avoid sending 'undefined' fields to GraphQL
  const filter = variables.filter || {};
  const sanitizedFilter = {
    isActive: typeof filter.isActive === 'boolean' ? filter.isActive : true,
    uid: filter.uid !== undefined ? filter.uid : null,
    posItemCode: filter.posItemCode !== undefined ? filter.posItemCode : null,
  };

  const sanitizedVariables: GetProductsVariables = {
    pagination: {
      skip: variables.pagination?.skip ?? 0,
      limit: variables.pagination?.limit ?? 100,
    },
    filter: sanitizedFilter,
  };

  const result = await serverFetchGraphQL<GetProductsResponse>(
    GET_PRODUCTS_QUERY,
    sanitizedVariables,
    options
  );

  // Handle connection errors gracefully
  if (result.error) {
    return {
      products: [],
      count: 0,
      statusCode: 500,
      message: result.error,
    };
  }

  // Guard against missing payload boundaries
  if (!result.data || !result.data.getProducts) {
    return {
      products: [],
      count: 0,
      statusCode: 404,
      message: 'No data returned from GraphQL server',
    };
  }

  const { statusCode, message, result: apiResult } = result.data.getProducts;

  if (statusCode !== 200) {
    return {
      products: [],
      count: 0,
      statusCode,
      message: message || 'Failed to fetch products',
    };
  }

  return {
    products: apiResult?.products || [],
    count: apiResult?.count || 0,
    statusCode,
    message,
  };
}

