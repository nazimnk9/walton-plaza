import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
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
 * Ultra-high-performance server-side GraphQL fetcher using Apollo Client.
 * Leverages native Next.js fetch cache, request memoization, and utilizes
 * Apollo's normalized query checks.
 */
export async function serverFetchGraphQL<T = GetProductsResponse>(
  query: string,
  variables: GetProductsVariables = {},
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const client = getApolloClient();

    // Run query through Apollo Client's querying mechanism.
    // Passes Next.js revalidation configs dynamically in the fetch link options.
    const result = await client.query<T>({
      query: gql`${query}`,
      variables: variables as any,
      context: {
        fetchOptions: {
          next: {
            revalidate: 60, // Revalidate every 60 seconds
            ...options.next,
          },
          cache: options.cache,
        },
      },
      fetchPolicy: 'no-cache', // Prevents server cache cross-request leaks
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
 * Specifically fetches products from the Walton Plaza getProducts endpoint on the server.
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
