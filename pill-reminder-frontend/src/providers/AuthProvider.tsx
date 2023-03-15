import { createContext, createEffect, JSXElement, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { AuthSchema, defaultAuthResponse } from "../api/schemas/auth.schema";
import {DeleteUserData, handleUser, SignInData, SignUpData } from "../api/userHandler";
import { ResponseError } from "../utils/api";


interface AuthContextStore {
    authenticated: boolean;
    auth_token: string;
    user_id: string;
    err?: string | object;
}

interface AuthContextDispatch {
    authenticate: () => Promise<AuthSchema>;
    signIn: (data: (SignInData)) => Promise<void>;
    signUp: (data: SignUpData) => Promise<boolean>;
    signOut: () => Promise<void>;
    deleteAccount: (data: DeleteUserData) => Promise<void>
}

type AuthContextData = [
    store: AuthContextStore,
    dispatch: AuthContextDispatch
]


const defaultAuthStore: AuthContextStore = {
    authenticated: false,
    auth_token: "",
    user_id: "",
}
const defaultAuthDispatch: AuthContextDispatch = {
    authenticate: async () => defaultAuthResponse,
    signIn: async (data) => { console.warn("Not implemented", data) },
    signUp: async (data) => { console.warn("Not implemented", data); return false },
    signOut: async() => { console.warn("Not implemented") },
    deleteAccount: async (data) => { console.warn("Not implemented", data) },
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
        const result = await handleUser("auth");
        setAuthStore(() => result);

        return result
    }

    const signIn = async(data: SignInData) => {
        const result = await handleUser("sign-in", data)
        console.info("Sign In", result)
        localStorage.setItem("auth_token", result.authToken)
        localStorage.setItem("user_id", result.user_id)
        setAuthStore(() => result)
    }

    const signUp = async(data: SignUpData): Promise<boolean> => {
        const result = await handleUser("sign-up", data)
        console.info("Sign Up", result)
        setAuthStore(() => result)
        if (!result.err && result.name && result.user_id) return true
        return false
    }

    const signOut = async() => {
        localStorage.removeItem("user_id")
        localStorage.removeItem("auth_token")
        setAuthStore("auth_token", "")
        setAuthStore("user_id", "")
        setAuthStore("authenticated", false)
    }

    const deleteAccount = async(data: DeleteUserData) => {
        const result = await handleUser("delete-account", data)
        console.info(result)
        setAuthStore(() => defaultAuthStore)
    }

    const authDispatch: AuthContextDispatch = {
        authenticate,
        signIn,
        signUp,
        signOut,
        deleteAccount
    }

    const authFromCookie = (): AuthContextStore => {
        const auth_token = localStorage.getItem("auth_token") ?? ""
        const user_id = localStorage.getItem("user_id") ?? ""
        const authenticated = !!auth_token && !!user_id
        const result: AuthContextStore = {
            authenticated,
            auth_token: auth_token,
            user_id: user_id
        }
        return result
    }

    createEffect(() => {
        console.info("AuthStore updated!",
            authStore.authenticated,
            authStore.auth_token,
            authStore.user_id,
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