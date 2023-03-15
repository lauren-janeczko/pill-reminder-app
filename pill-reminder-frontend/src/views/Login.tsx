import { Component, createEffect, createResource, createSignal, Show, useContext } from "solid-js"
import { createStore } from 'solid-js/store'
import { AuthContext } from "../providers/AuthProvider"
import styles from "./Login.module.css"


interface UserFormData {
    user_id: string,
    password: string,
    name: string
}

type LoginProps = {}

export const Login: Component<LoginProps> = (props) => {
    const [auth, authDispatch] = useContext(AuthContext)
    const [signInMode, setSignInMode] = createSignal<boolean>(true)
    const [formData, setFormData] = createStore<UserFormData>({
        user_id: "", password: "", name: ""
    });

    const [loading, setLoading] = createSignal(false)
    const [info, setInfo] = createSignal("")

    const toggleMode = (e: any) => {
        e.preventDefault();
        setSignInMode(signInMode() ? false : true)
    }

    const onInputuser_id = (e: any) => setFormData("user_id", e.target.value)
    const onInputPassword = (e: any) => setFormData("password", e.target.value)
    const onInputName = (e: any) => setFormData("name", e.target.value)

    const signInHandler = async(e:any) => {
        e.preventDefault();
        console.log(formData)

        if (!loading()) {
            setLoading(true)
            if (signInMode()) {
                await authDispatch.signIn(formData).then(r => console.log(r)).catch(e => console.error(e))
            } else {
                await authDispatch.signUp(formData)
                    .then(r => {
                        setSignInMode(true)
                        setInfo("Account created, Sign In now!")
                    })
                    .catch(e => console.error(e))
            }
            setLoading(false)
        }
    }

    createEffect(() => {
        if (!loading()) {
            console.log("Finished!")
        } else {
            console.log("Loading...")
        }
    })
    

    return (
        <div class={styles.LoginBg}>
            <div class={styles.LoginBox} style={{
                opacity: loading() ? '0.5' : '1'
            }}>
                <h1>{signInMode() ? "Sign In" : "Sign Up"}</h1>
                <p style={{color: "#00ff70", "font-size": "0.8em"}}>{info()}</p>
                <form class={styles.LoginForm}>
                    <label>Email</label>
                    <input type="text" placeholder="example@gmail.com" value={formData.user_id} oninput={onInputuser_id}/>

                    <label>Password</label>
                    <input type="password" placeholder="SimplePassword123" value={formData.password} oninput={onInputPassword}/>

                    <Show when={!signInMode()}>
                        <label>Name</label>
                        <input type="text" placeholder="John Smith" value={formData.name} oninput={onInputName}/>
                    </Show>

                    <div class={styles.FormSubmitBox}>
                        <button onclick={signInHandler}>Submit</button>
                        <p class={"error"}>
                            <span style={{color: "red"}}>{auth.err && "" + auth.err}</span>
                            <span style={{color: "#0eff1d"}}>{auth.authenticated && "Success!"}</span>
                        </p>
                        <p>{signInMode() ? 
                            <>No account? <a href="" onclick={toggleMode}>Sign Up!</a></>
                            :
                            <>Have account? <a href="" onclick={toggleMode}>Sign In!</a></>
                        }</p>
                    </div>
                </form>
            </div>
        </div>
    )
}