import { createContext, createEffect, JSXElement, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { AuthSchema, defaultAuthResponse } from "../api/schemas/auth.schema";
import { authenticateUser, SignInData, signInUser, SignUpData, signUpUser } from "../api/userHandler";


interface AuthContextStore {
    authenticated: boolean;
    authToken: string;
    userId: string;
    err?: string | object;
}

interface AuthContextDispatch {
    authenticate: () => Promise<AuthSchema>;
    signIn: (data: (SignInData)) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>
}

type AuthContextData = [
    store: AuthContextStore,
    dispatch: AuthContextDispatch
]


const defaultAuthStore: AuthContextStore = {
    authenticated: false,
    authToken: "",
    userId: "",
}
const defaultAuthDispatch: AuthContextDispatch = {
    authenticate: async () => defaultAuthResponse,
    signIn: async (data) => { console.warn("Not implemented", data) },
    signUp: async (data) => { console.warn("Not implemented", data) },
    signOut: async() => { console.warn("Not implemented") },
}
const defaultContextData: AuthContextData = [
    defaultAuthStore,
    defaultAuthDispatch
]



type AuthProviderProps = {
    children: JSXElement
}

export const AuthContext = createContext<AuthContextData>(defaultContextData)
export const AuthProvider = (props: AuthProviderProps) => {
    const [authStore, setAuthStore] = createStore<AuthContextStore>(defaultAuthStore)

    const authenticate = async() => {
        const result = await authenticateUser();
        setAuthStore(() => result);

        return result
    }

    const signIn = async(data: SignInData) => {
        const result = await signInUser(data)
        setAuthStore(() => result)
    }

    const signUp = async(data: SignUpData) => {
        const result = await signUpUser(data)
        setAuthStore(() => result)
    }

    const signOut = async() => {
        localStorage.removeItem("user_id")
        localStorage.removeItem("auth_token")
        setAuthStore("authToken", "")
        setAuthStore("userId", "")
        setAuthStore("authenticated", false)
    }

    const authDispatch: AuthContextDispatch = {
        authenticate,
        signIn,
        signUp,
        signOut
    }

    const authFromCookie = (): AuthContextStore => {
        const authToken = localStorage.getItem("auth_token") ?? ""
        const userId = localStorage.getItem("user_id") ?? ""
        const authenticated = !!authToken && !!userId
        const result: AuthContextStore = {
            authenticated,
            authToken,
            userId
        }
        return result
    }

    createEffect(() => {
        console.info("AuthStore updated!",
            authStore.authenticated,
            authStore.authToken,
            authStore.userId,
            authStore.err
        )
    })

    onMount(async() => {
        const result = authFromCookie()
        setAuthStore(result)
    })

    return(
        <AuthContext.Provider value={[authStore, authDispatch]}>
            {props.children}
        </AuthContext.Provider>
    )
}