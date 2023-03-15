import { Component } from "solid-js"
import styles from "./Navbar.module.css"

type NavbarProps = {
    authenticated: boolean;
    signOut: () => Promise<void>
}

export const Navbar: Component<NavbarProps> = (props) => {
    return (
        <header class={styles.Header}>
            <div class={styles.Logo}>
                <h1>Pill Reminder</h1>
            </div>
            <nav>
                <ul>
                    <li><a href="#">Schedules</a></li>
                    <li><a href="#">Delete Account</a></li>
                    <li><a href="#" onClick={props.signOut}>{props.authenticated ? "Logout" : "Login"}</a></li>
                </ul>
            </nav>
        </header>
    )
}