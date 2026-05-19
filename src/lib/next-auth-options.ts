import {AuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "API",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "email@domain.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                let res;
                if ((credentials as any)?.code) {
                    res = await fetch(`${process.env.API_BASE_URL}/auth/social-login?source=backoffice`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            provider: 'google',
                            code: (credentials as any)?.code,
                        })
                    });
                } else {
                    res = await fetch(`${process.env.API_BASE_URL}/auth/login?source=backoffice`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: (credentials as any)?.username,
                            password: (credentials as any)?.password,
                        })
                    });
                }

                const response = await res.json();
                if (!res.ok) throw new Error(JSON.stringify(response));

                if (response) {
                    return { ...response, apiToken: response.authToken };
                } else {
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === 'update') {
                return {...token, user: {...session.user}}
            }

            if (user) {
                return {
                    ...token,
                    accessToken: (user as any).accessToken,
                    user: {
                        name: (user as any).name,
                        email: (user as any).email,
                        role: (user as any).role,
                        organisation: (user as any).organisation,
                        id: (user as any).id,
                    }
                }
            }

            if (Date.now() < (token as any).exp * 1000) {
                return token;
            } else {
                return {...token, error: 'jwt-expired'};
            }
        },
        async session({ session, token }) {
            if(session) {
                return {
                    ...session,
                    ...token,
                }
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/login'
    }
};
