package com.lightlog.auth

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun registerUser(@RequestBody request: UserRegistrationRequest): ResponseEntity<*> {
        return try {
            val user = authService.registerUser(request)
            ResponseEntity.ok().body("User registered successfully: ${user.username}")
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: UserLoginRequest): ResponseEntity<*> {
        return try {
            val authResponse = authService.loginUser(request)
            ResponseEntity.ok(authResponse)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/check-username")
    fun checkUsernameAvailability(@RequestParam username: String): ResponseEntity<Map<String, Any>> {
        val isAvailable = authService.isUsernameAvailable(username)
        return ResponseEntity.ok(mapOf(
            "available" to isAvailable,
            "message" to if (isAvailable) "사용 가능한 아이디입니다." else "이미 사용 중인 아이디입니다."
        ))
    }

    @GetMapping("/check-nickname")
    fun checkNicknameAvailability(@RequestParam nickname: String): ResponseEntity<Map<String, Any>> {
        val isAvailable = authService.isNicknameAvailable(nickname)
        return ResponseEntity.ok(mapOf(
            "available" to isAvailable,
            "message" to if (isAvailable) "사용 가능한 닉네임입니다." else "이미 사용 중인 닉네임입니다."
        ))
    }
}
