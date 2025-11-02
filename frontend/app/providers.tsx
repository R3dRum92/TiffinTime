// 'use client';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { useState } from 'react';

// export function Providers({ children }: { children: React.ReactNode }) {
//     const [queryClient] = useState(() => new QueryClient({
//         defaultOptions: {
//             queries: {
//                 staleTime: 5 * 60 * 1000,
//                 gcTime: 10 * 60 * 1000,
//                 retry: 3,
//                 refetchOnWindowFocus: false,
//             },
//         },
//     }));

//     return (
//         <QueryClientProvider client={queryClient}>
//             {children}
//             <ReactQueryDevtools initialIsOpen={false} />
//         </QueryClientProvider>
//     );
// }

'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// We no longer need a static import for ReactQueryDevtools here

import { useState } from 'react';
// Import Next.js utility for client-side loading
import dynamic from 'next/dynamic'; 

// Use dynamic() to load the Devtools only on the client
const DynamicDevtools = dynamic(() => 
    import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools), 
    { ssr: false } // Crucial: This tells Next.js NOT to render it on the server
);

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        // ... (your queryClient config)
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            
            {/* 💡 RENDER THE DYNAMIC COMPONENT HERE */}
            {process.env.NODE_ENV === 'development' && (
                <DynamicDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}