import useSWR from 'swr';

const fetcher = (url, token) =>
    
    fetch(url, {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}),
        credentials: 'same-origin',
    }).then(res => res.json());

export function useUser() {
    const { data, error } = useSWR('/api/auth', (url) => {
        const token = localStorage.getItem('token');
        if(!token) throw new Error('No auth token found');
        return fetcher(url, token);
    });

    return {
        user: data,
        isLoading: !error && !data,
        isError: error
    };
}