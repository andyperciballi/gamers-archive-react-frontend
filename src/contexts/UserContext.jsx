import { createContext, useState } from "react";

// creates a global context / state we can use
const UserContext = createContext()

const getUserFromToken = () => {
    // grab the token from local storage
    const token = localStorage.getItem('token')
    // if no token just return null
    if(!token) return null
    // If we have a token lets grab the payload
    return JSON.parse(atob(token.split('.')[1])).payload
}

// set up a provider component to provide or context to its children
function UserProvider({ children }){
    // and children of this component will have access to the 
    // state we define in here through the useContextHook
    const [user, setUser] = useState(getUserFromToken())
    
    return <UserContext.Provider value={{
        user,
        setUser
    }}>
        {children}
    </UserContext.Provider>
}

export { UserProvider, UserContext }