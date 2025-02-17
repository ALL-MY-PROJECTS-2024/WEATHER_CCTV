//package com.example.app.config.auth;
//
//import com.example.app.config.auth.provider.GoogleUserInfo;
//import com.example.app.config.auth.provider.KakaoUserInfo;
//import com.example.app.config.auth.provider.NaverUserInfo;
//import com.example.app.config.auth.provider.OAuth2UserInfo;
//import com.example.app.domain.dto.UserDto;
//import com.example.app.domain.entity.User;
//import com.example.app.domain.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
//import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
//import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.stereotype.Service;
//
//import java.util.Map;
//import java.util.Optional;
//
//@Service
//public class PrincipalDetailsOauth2Service extends DefaultOAuth2UserService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        System.out.println("PrincipalDetailsOauth2Service loadUser..."+userRequest);
//        System.out.println("userRequest.getClientRegistration() :"+ userRequest.getClientRegistration());
//        System.out.println("userRequest.getAccessToken() : "+ userRequest.getAccessToken());
//        System.out.println("userRequest.getAdditionalParameters() : "+ userRequest.getAdditionalParameters());
//        System.out.println("userRequest.getAccessToken().getTokenValue() : "+ userRequest.getAccessToken().getTokenValue());
//        System.out.println("userRequest.getAccessToken().getTokenType().getValue() : "+ userRequest.getAccessToken().getTokenType().getValue());
//        System.out.println("userRequest.getAccessToken().getScopes() : "+ userRequest.getAccessToken().getScopes());
//
//        //OAuth2User INFO
//        OAuth2User oAuthUser = super.loadUser(userRequest);
//        System.out.println();
//        System.out.println("oAuthUser : " + oAuthUser);
//
//        //provider 선별하기
//        String provider =  userRequest.getClientRegistration().getRegistrationId();
//
//        OAuth2UserInfo oauth2UserInfo=null;
//        //KAKAO 로그인 인경우
//        if(provider!=null&& provider.startsWith("kakao")){
//            String id = oAuthUser.getAttributes().get("id").toString();
//            Map<String,Object> attributes =(Map<String,Object>)oAuthUser.getAttributes().get("properties");
//            oauth2UserInfo = new KakaoUserInfo(id,attributes);
//            System.out.println("kakaoUserInfo : " + oauth2UserInfo);
//        }
//        else if(provider!=null&& provider.startsWith("naver")){
//            Map<String,Object> resp = (Map<String,Object>)oAuthUser.getAttributes().get("response");
//            String id = (String)resp.get("id");
//            oauth2UserInfo = new NaverUserInfo(id,resp);
//            System.out.println("NaverUserInfo : " + oauth2UserInfo);
//        }
//        else if(provider!=null&& provider.startsWith("google"))
//        {
//            oauth2UserInfo=new GoogleUserInfo(oAuthUser.getAttributes());
//            System.out.println("GoogleUserInfo : " + oauth2UserInfo);
//        }
//
//        //DB 조회
//        String username=oauth2UserInfo.getProvider()+"_"+oauth2UserInfo.getProviderId();
//        String password=passwordEncoder.encode("1234");
//
//        Optional<User> userOptional =userRepository.findById(username);
//        UserDto userDto=null;
//        if(userOptional.isEmpty()){
//            //최초로그인
//            User user = new User();
//            user.setUsername(username);
//            user.setPassword(password);
//            user.setRole("ROLE_USER");
//            user.setProvider(oauth2UserInfo.getProvider());
//            user.setProviderId(oauth2UserInfo.getProviderId());
//            userRepository.save(user);
//
//            userDto = new UserDto();
//            userDto.setUsername(username);
//            userDto.setPassword(password);
//            userDto.setRole("ROLE_USER");
//            userDto.setProvider(oauth2UserInfo.getProvider());
//            userDto.setProviderId(oauth2UserInfo.getProviderId());
//
//        }else{
//            //기존계정존재
//            User user = userOptional.get();
//            userDto = new UserDto();
//            userDto.setUsername(user.getUsername());
//            userDto.setPassword(user.getPassword());
//            userDto.setRole(user.getRole());
//            userDto.setProvider(user.getProvider());
//            userDto.setProviderId(user.getProviderId());
//        }
//
//
//        //PRINCIPALDETAILS 생성/반환
//        PrincipalDetails principalDetails = new PrincipalDetails();
//        //NAVER,GOOLE 하면 변경될 예정
//        principalDetails.setAttributes(oauth2UserInfo.getAttributes());
//        principalDetails.setAccessToken(userRequest.getAccessToken().getTokenValue());
//        principalDetails.setUserDto(userDto);
//        return principalDetails;
//    }
//}
