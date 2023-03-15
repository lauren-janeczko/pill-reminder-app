import { Component, createEffect, createResource, createSignal, Show, useContext } from "solid-js"
import { createStore } from 'solid-js/store'
import { signInUser, signUpUser } from "../api/userHandler"
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
        user_id: "kieten7@gmail.com", password: "Meow123", name: "Kieten"
    });

    const toggleMode = (e: any) => {
        e.preventDefault();
        setSignInMode(signInMode() ? false : true)
    }

    const onInputuser_id = (e: any) => setFormData("user_id", e.target.value)
    const onInputPassword = (e: any) => setFormData("password", e.target.value)
    const onInputName = (e: any) => setFormData("name", e.target.value)

    const signInHandler = (e:any) => {
        e.preventDefault();
        console.log(formData)

        if (signInMode()) {
            authDispatch.signIn(formData).then(r => console.log(r)).catch(e => console.error(e))
        } else {
            authDispatch.signUp(formData).then(r => console.log(r)).catch(e => console.error(e))
        }
    }

    createEffect(() => {
        // console.log(formData.user_id)
    })
    

    return (
        <div class={styles.LoginBg}>
            <div class={styles.LoginBox}>
                <h1>{signInMode() ? "Sign In" : "Sign Up"}</h1>
                <form class={styles.LoginForm}>
                    <label>user_id</label>
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
                    </div>
                    <p>{signInMode() ? 
                        <>No account? <a href="" onclick={toggleMode}>Sign Up!</a></>
                        :
                        <>Have account? <a href="" onclick={toggleMode}>Sign In!</a></>
                    }</p>
                </form>
            </div>
        </div>
    )
}