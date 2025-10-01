import React, { useContext } from 'react';
import {userContext} from "../../context/userContext"

const DashboardLayout = ({children}) => {
    const {user} = useContext(userContext);
    return (
        <div>
            <Navbar/>
            {user && <div>{children}</div>}
        </div>
    )
}

export default DashboardLayout