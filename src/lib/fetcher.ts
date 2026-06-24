import {getServerSession} from "next-auth";
import {signOut} from "next-auth/react";
import {redirect} from "next/navigation";
import {authOptions} from "@/lib/next-auth-options";

export const routes = {
    user: 'user',
    auth: 'auth',
    reseller: 'reseller',
    manufacturer: 'manufacturer',
    order: 'order',
    orderFulfillment: 'order-fulfillment',
    product: 'product',
    priceEngine: 'price-engine',
    dashboard: 'dashboard',
    material: 'material',
    iflows: 'iflows',
}

export async function serverFetch(route: string) {
    console.log("server fetching", route)
    const session = await getServerSession(authOptions as any)

    const res = await fetch(`${process.env.API_BASE_URL}/${route}`, {
        headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        // cache: 'no-cache',
        next: {
            tags: [route],
        },
    } as RequestInit)

    const body = await res.json()
    if (!res.ok) {
        if (body.statusCode === 401) {
            console.log("Token expired > signing out...")
            await redirect('/auth/signout');
        }
        return {data: null, error: body}
    } else {
        return {data: body, error: null}
    }
}

export async function serverSideSignOut() {
    const csrfBody = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`).then(rs => rs.text());
    const fetchOptions = {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        // @ts-expect-error
        body: new URLSearchParams({
            csrfToken: csrfBody,
            callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/session`,
            json: true,
        }),
    }

    return fetch(`${process.env.NEXTAUTH_URL}/api/auth/signout`, fetchOptions);
}

export async function clientFetch(endpoint: string, token?: string | null) {
    const res = await fetch(`${process.env.API_BASE_URL}/${endpoint}`, {
        headers: token ? {
            "Authorization": `Bearer ${token}`,
        } : {},
        next: {
            tags: [endpoint]
        },
    })

    const notJSON = !res.headers.get("content-type")?.includes('application/json');
    const body = notJSON ? await res.arrayBuffer() : await res.json();
    if (!res.ok) {
        return ({data: [], error: body});
    } else {
        return ({data: body, error: null});
    }
}

export async function submitData(route: string, token: string | null, data: any, method?: string) {
    if (!method?.length) method = !data ? 'DELETE' : (data.id ? 'PUT' : 'POST');

    const headers: { 'Content-Type'?: string, 'Authorization'?: string } = {
        "Content-Type": 'application/json'
    };

    if (data instanceof FormData) delete headers["Content-Type"];

    if (token) headers["Authorization"] = `Bearer ${token}`

    const res = await fetch(`${process.env.API_BASE_URL}/${route}`, {
        method: method,
        headers: headers,
        body: data ? ( data instanceof FormData ? data : JSON.stringify(data) ) : ''
    })

    const contentType = res.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');
    
    let body = null;
    if (hasJsonContent) {
        try {
            body = await res.json();
        } catch (error) {
            console.warn('Failed to parse JSON response:', error);
            body = null;
        }
    }
    
    if (!res.ok) {
        return ({data: [], error: body});
    } else {
        return ({data: body, error: null});
    }
}

export const swrFetcher = async (route: string | undefined, query: any, token: string): Promise<any> => {
    const searchParams = new URLSearchParams({...query});
    const path = `${process.env.API_BASE_URL}/${route}?${searchParams}`

    if (!route) {
        return new Promise((resolve) => resolve({}))
    }

    if (!token) {
        console.log('SWR: Missing token...')
        return new Promise((resolve) => resolve({}))
    }

    const res = await fetch(path, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    if (!res.ok) {
        if (res.status === 401) await signOut();

        const error = new Error('An error occurred while fetching the data.');
        // @ts-ignore
        error.info = await res.json();
        // @ts-ignore
        error.status = res.status;
        throw error;
    }
    return await res.json();
}


