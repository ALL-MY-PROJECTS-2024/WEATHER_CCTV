import {useState,useEffect} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import api from '../api/axiosConfig'; // 새로운 api 인스턴스 임포트

import "./Login.scss"
const Login = ()=>{
    const [username ,setUsername] = useState()
    const [password ,setPassword] = useState()
    const navigate = useNavigate();

      // useEffect에서 API 검증 호출
    useEffect(() => {
        const validateToken = async () => {
        try {
            // 토큰 유효성 검증을 위한 별도 엔드포인트 호출
            const resp = await axios.get("/auth/validate", {
            withCredentials: true,
            });
            console.log("토큰 검증 성공:", resp);
            navigate("/"); // 성공 시 / 경로로 이동
        } catch (error) {
            console.log("토큰 검증 실패:", error);
            // 비정상 응답 시 아무 동작도 하지 않음 (현재 페이지 유지)
        }
        };
        validateToken();


    }, [navigate]); // navigate를 의존성 배열에 추가


    // 로그인 처리 함수
    const handleLogin = async () => {
        try {
            const resp = await api.post(
                "/login",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );
            alert("로그인 성공:", resp.data);
            navigate("/"); // 성공 시 / 경로로 이동
        } catch (error) {
            console.error("로그인 실패:", error.response ? error.response.data : error);
            alert("로그인 실패! 다시 시도해주세요."); // 실패 시 메시지 표시
        }
    };
    return (
        <div className="wrapper">
          <header>
            <div className="top-header">
              <div className="left"></div>
              <div className="right">
                <a href="javascript:void(0)"></a>
              </div>
            </div>
          </header>
          <main>
            <section>
              <div className="id_login_block">
                <div className="header" style={{ textAlign: "center" }}>
                  <div style={{ position: "relative" }}>
                    <div className="header-icon">ESYSVISION</div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span className="material-symbols-outlined air-icon">speed_camera</span>
                    <span className="material-symbols-outlined apartment-icon">flood</span>
                  </div>
                </div>
                <div className="body">
                  <div className="form">
                    <div className="insert-el-group">
                      <input
                        name="username"
                        className="username"
                        placeholder="INSERT USERNAME"

                        onChange={e=>setUsername(e.target.value)}
                      />
                    </div>
                    <div className="insert-el-group">
                      <input
                        name="password"
                        type="password"
                        className="password"
                        placeholder="INSERT PASSWORD"

                        onChange={e=>setPassword(e.target.value)}
                      />
                    </div>
      
                    <div className="insert-el-group">
                      <button className="btn submit-btn" onClick={handleLogin}>
                        로그인
                      </button>
                    </div>
                    <div className="insert-el-group">
                        <button className="btn" onClick={handleLogin}>
                            회원가입
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <footer></footer>
        </div>
      );
}


export default Login;
