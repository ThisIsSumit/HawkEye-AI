import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactNode, useState} from 'react';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({children}: Readonly<AppProvidersProps>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
