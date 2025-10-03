import React, { useContext } from 'react';
import { UserContext } from "../../context/userContext";

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