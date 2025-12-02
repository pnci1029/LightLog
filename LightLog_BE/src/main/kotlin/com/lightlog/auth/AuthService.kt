package com.lightlog.auth

import com.lightlog.dto.AuthResponse
import com.lightlog.dto.UserLoginRequest
import com.lightlog.dto.UserRegistrationRequest
import com.lightlog.jwt.JwtTokenProvider
import com.lightlog.user.User
import com.lightlog.user.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    fun registerUser(request: UserRegistrationRequest): User {
        if (userRepository.findByUsername(request.username).isPresent) {
            throw IllegalArgumentException("이미 사용 중인 아이디입니다.")
        }
        if (userRepository.findByNickname(request.nickname).isPresent) {
            throw IllegalArgumentException("이미 사용 중인 닉네임입니다.")
        }
        val encodedPassword = passwordEncoder.encode(request.password)
        val user = User(
            username = request.username,
            password = encodedPassword,
            nickname = request.nickname
        )
        return userRepository.save(user)
    }

    fun loginUser(request: UserLoginRequest): AuthResponse {
        val user = userRepository.findByUsername(request.username)
            .orElseThrow { IllegalArgumentException("User not found") }

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("Invalid password")
        }

        val token = jwtTokenProvider.createToken(user.username)
        return AuthResponse(token)
    }

    fun isUsernameAvailable(username: String): Boolean {
        return userRepository.findByUsername(username).isEmpty
    }

    fun isNicknameAvailable(nickname: String): Boolean {
        return userRepository.findByNickname(nickname).isEmpty
    }
}
