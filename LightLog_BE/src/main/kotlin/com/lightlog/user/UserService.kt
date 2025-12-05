package com.lightlog.user

import com.lightlog.dto.UserProfileResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class UserService(
    private val userRepository: UserRepository
) {

    fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }

    fun getCurrentUserProfile(): UserProfileResponse {
        val user = getCurrentUser()
        return UserProfileResponse(
            username = user.username,
            nickname = user.nickname,
            aiTone = user.aiTone,
            canChangeToneToday = canChangeToneToday(user),
            createdAt = user.createdAt
        )
    }

    fun updateAiTone(newTone: String): UserProfileResponse {
        if (newTone !in listOf("counselor", "friend")) {
            throw IllegalArgumentException("Invalid AI tone. Must be 'counselor' or 'friend'")
        }

        val user = getCurrentUser()
        
        // 오늘 이미 톤을 변경했는지 확인
        if (!canChangeToneToday(user)) {
            throw IllegalArgumentException("AI 톤은 하루에 한 번만 변경할 수 있습니다.")
        }

        user.aiTone = newTone
        user.lastToneChangeDate = LocalDate.now()
        userRepository.save(user)

        return getCurrentUserProfile()
    }

    private fun canChangeToneToday(user: User): Boolean {
        val today = LocalDate.now()
        return user.lastToneChangeDate == null || user.lastToneChangeDate != today
    }
}