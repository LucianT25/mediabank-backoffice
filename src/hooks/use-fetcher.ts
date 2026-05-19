import useSWR from 'swr';
import { swrFetcher } from '@/lib/fetcher';

interface useFetcherProps {
    route?: string,
    queryParams: any,
    token: string,
}
export function useFetcher({ route, queryParams, token }: useFetcherProps) {
    const { data, error, isLoading, mutate } = useSWR(
        [route, queryParams, token],
        ([route, query, token]) => swrFetcher(route, query, token)
    )

    return {
        data,
        isLoading,
        isError: error,
        mutate
    }
}
