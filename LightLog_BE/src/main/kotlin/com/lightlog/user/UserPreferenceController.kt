package com.lightlog.user

import com.lightlog.dto.UserPreferenceRequest
import com.lightlog.dto.UserPreferenceResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user")
class UserPreferenceController(
    private val userRepository: UserRepository
) {

    @GetMapping("/preferences")
    fun getUserPreferences(): ResponseEntity<UserPreferenceResponse> {
        val currentUser = getCurrentUser()
        return ResponseEntity.ok(
            UserPreferenceResponse(
                aiTone = currentUser.aiTone,
                message = "사용자 설정을 성공적으로 조회했습니다."
            )
        )
    }

    @PutMapping("/preferences")
    fun updateUserPreferences(@RequestBody request: UserPreferenceRequest): ResponseEntity<UserPreferenceResponse> {
        // AI 톤 유효성 검증
        if (request.aiTone !in listOf("counselor", "friend")) {
            return ResponseEntity.badRequest().body(
                UserPreferenceResponse(
                    aiTone = "counselor",
                    message = "유효하지 않은 AI 톤입니다. 'counselor' 또는 'friend'만 가능합니다."
                )
            )
        }

        val currentUser = getCurrentUser()
        currentUser.aiTone = request.aiTone
        userRepository.save(currentUser)

        val message = when (request.aiTone) {
            "counselor" -> "AI가 이제 전문 상담사 톤으로 응답합니다."
            "friend" -> "AI가 이제 친한 친구 톤으로 응답합니다."
            else -> "AI 톤이 업데이트되었습니다."
        }

        return ResponseEntity.ok(
            UserPreferenceResponse(
                aiTone = currentUser.aiTone,
                message = message
            )
        )
    }

    @GetMapping("/ai-tones")
    fun getAvailableAITones(): ResponseEntity<Map<String, Any>> {
        val availableTones = listOf(
            mapOf(
                "id" to "counselor",
                "name" to "전문 상담사",
                "description" to "따뜻하고 전문적인 심리 상담사의 조언을 받아보세요",
                "icon" to "🧠"
            ),
            mapOf(
                "id" to "friend",
                "name" to "친한 친구",
                "description" to "편안하고 유머러스한 친구의 격려를 받아보세요",
                "icon" to "😊"
            )
        )

        return ResponseEntity.ok(
            mapOf(
                "tones" to availableTones,
                "current" to getCurrentUser().aiTone
            )
        )
    }

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }
}