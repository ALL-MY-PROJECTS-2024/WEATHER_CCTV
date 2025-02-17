import axios from "axios"

//-----------------------------------------
//추가하기
//-----------------------------------------
export const requestLecturePost = async (data)=>{
  try{

    const JWTToken = localStorage.getItem("JWTAUTHENTICATION");
    console.log("JWTToken .." ,JWTToken);
    const response = await axios.post(
      `http://localhost:8080/myinfo/lecture/post`,
      data,
      {headers: {Authorization: `Bearer ${JWTToken}`}}
    )        
    console.log('LectureService Post...',response.data)  
    return response.data;
  }catch(error){
    console.log(error);
  }finally{

  }
}

//-----------------------------------------
//가져오기
//-----------------------------------------
export const requestLectureGet = async ()=>{
  try{

    const JWTToken = localStorage.getItem("JWTAUTHENTICATION");
    console.log("JWTToken .." ,JWTToken);
    const response = await axios.get(
      `http://localhost:8080/myinfo/lecture/get`,
      {headers: { Authorization: `Bearer ${JWTToken}`}}
    )        
    console.log('LectureService Get...',response.data)  
    return response.data;
  }catch(error){
    console.log(error);
  }finally{

  }
}
