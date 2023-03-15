import { Component, useContext } from "solid-js"
import { Footer } from "../components/Footer"
import { Navbar } from "../components/Navbar"
import { SchedulesViewer } from "../components/SchedulesViewer"
import { AuthContext } from "../providers/AuthProvider"

import styles from './Dashboard.module.css'

type DashboardProps = {}

export const Dashboard: Component<DashboardProps> = (props) => {
    const [auth, authDispatch] = useContext(AuthContext)

    return (
        <div class={styles.Dashboard}>
            <Navbar authenticated={auth.authenticated} signOut={authDispatch.signOut}/>
            <main class={styles.Main}>
                <section>
                    <SchedulesViewer />
                </section>
            </main>
            <Footer />
        </div>
    )
}