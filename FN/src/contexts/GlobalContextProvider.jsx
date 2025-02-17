import { createContext, useState } from "react";

//
export const GlobalContext = createContext(null);

//COOKIE
//import Cookies from 'js-cookie';

export const GlobalContextProvider = (props) => {
    
    const [value, setValue] = useState();

    return (
        <GlobalContext.Provider value={{ value, setValue }}>
            {props.children}
        </GlobalContext.Provider>
    )

}
