import axios from "axios";

export const requestJoin = async (username,password) => {
  try {
    
    const response = await axios.post(
        `http://localhost:8080/join`,                            //URL
        {"username":username,"password":password},                //PARAM
        {headers: {'Content-Type': 'application/json'}}         //CONTENT_TYPE
      )
    ;
    console.log("requestRoot...response..", response.data);
    //return response.data;

  } catch (error) {
  } finally {
  }
};



export const requestLogin = async (username,password) => {
    try{
    
        const response = await axios.post(
            `http://localhost:8080/login`,                            //URL
            {"username":username,"password":password},                //PARAM
            {headers: {'Content-Type': 'application/json'}}         //CONTENT_TYPE
        );
     
        // console.log('login...',response);
        return response;
    
    }catch(error){

    }finally{

    }

};
