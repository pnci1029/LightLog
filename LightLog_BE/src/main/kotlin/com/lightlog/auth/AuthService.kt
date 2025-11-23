package com.lightlog.auth

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
            throw IllegalArgumentException("Username is already taken")
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
}
