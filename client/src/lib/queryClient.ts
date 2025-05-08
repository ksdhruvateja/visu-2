import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiBaseUrl } from "./utils/hostConfig";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status}: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
  console.log(`Making API request to: ${fullUrl}`);
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      // Don't use credentials: "include" unless we specifically need cookies for authentication
      // This can cause CORS issues in some environments
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
    console.log(`Fetching data from: ${fullUrl}`);
    
    try {
      const res = await fetch(fullUrl, {
        // Don't use credentials: "include" unless we specifically need cookies for authentication
        // This can cause CORS issues in some environments
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const jsonData = await res.json();
      console.log(`Data fetched successfully from ${fullUrl}:`, 
        jsonData ? 'Data received' : 'No data');
      return jsonData;
    } catch (error) {
      console.error(`Error fetching data from ${fullUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 2, // Try twice more if failed
    },
    mutations: {
      retry: false,
    },
  },
});
