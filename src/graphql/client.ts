import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { GetProductsResponse, GetProductsVariables } from './types';
import { GET_PRODUCTS_QUERY } from './queries';

const GRAPHQL_API_URL = process.env.NEXT_PUBLIC_GRAPHQL_API || 'https://devapi.waltonplaza.com.bd/graphql';

// Create a configured client-side Apollo Client
export const getApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GRAPHQL_API_URL,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Product: {
          keyFields: ['uid'],
        },
        ProductVariant: {
          keyFields: ['posItemCode', 'ebsItemCode'],
        },
      },
    }),
  });
};

/**
 * Ultra-high-performance server-side GraphQL fetcher.
 * Leverages native Next.js fetch cache, request memoization, and is 100% server-side (zero bundle size).
 */
export async function serverFetchGraphQL<T = GetProductsResponse>(
  query: string,
  variables: GetProductsVariables = {},
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // Use Next.js native fetch cache config
      next: {
        revalidate: 60, // Revalidate every 60 seconds
        ...options.next,
      },
      cache: options.cache,
    });

    if (!res.ok) {
      return {
        data: null,
        error: `HTTP error! Status: ${res.status}`,
      };
    }

    const json = await res.json();

    if (json.errors && json.errors.length > 0) {
      return {
        data: null,
        error: json.errors[0].message || 'GraphQL Query Error',
      };
    }

    return {
      data: json.data as T,
      error: null,
    };
  } catch (err) {
    console.error('GraphQL Fetch Error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error',
    };
  }
}

/**
 * Specifically fetches products from the Walton Plaza getProducts endpoint on the server.
 */
export async function serverGetProducts(
  variables: GetProductsVariables = {},
  options: RequestInit = {}
) {
  const result = await serverFetchGraphQL<GetProductsResponse>(
    GET_PRODUCTS_QUERY,
    variables,
    options
  );

  if (result.error) {
    return {
      products: [],
      count: 0,
      statusCode: 500,
      message: result.error,
    };
  }

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
