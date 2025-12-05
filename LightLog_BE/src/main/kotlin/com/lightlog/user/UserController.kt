package com.lightlog.user

import com.lightlog.dto.UserProfileResponse
import com.lightlog.dto.UpdateAiToneRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/profile")
    fun getUserProfile(): ResponseEntity<UserProfileResponse> {
        val profile = userService.getCurrentUserProfile()
        return ResponseEntity.ok(profile)
    }

    @PutMapping("/ai-tone")
    fun updateAiTone(@RequestBody request: UpdateAiToneRequest): ResponseEntity<UserProfileResponse> {
        return try {
            val updatedProfile = userService.updateAiTone(request.aiTone)
            ResponseEntity.ok(updatedProfile)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }
}