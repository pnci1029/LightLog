package com.lightlog.diary

import com.lightlog.user.User
import com.lightlog.user.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class DiaryService(
    private val diaryRepository: DiaryRepository,
    private val userRepository: UserRepository
) {

    fun createDiary(content: String, date: LocalDate): Diary {
        val currentUser = getCurrentUser()
        val diary = Diary(
            content = content,
            date = date,
            user = currentUser
        )
        return diaryRepository.save(diary)
    }

    fun getDiariesForDate(date: LocalDate): List<Diary> {
        val currentUser = getCurrentUser()
        return diaryRepository.findByUserAndDate(currentUser, date)
    }

    fun generateSummary(activities: List<String>, date: LocalDate): String {
        val currentUser = getCurrentUser()
        
        // 간단한 규칙 기반 요약 생성 (나중에 AI로 교체 예정)
        return when {
            activities.isEmpty() -> "별다른 일 없이 평온한 하루를 보냈군요. 그것만으로도 충분히 좋은 하루예요."
            activities.size == 1 -> "${activities[0]}을 하며 의미있는 하루를 보내셨네요! 🌟"
            activities.size <= 3 -> "${activities.joinToString(", ")}을 하며 알차게 보낸 하루였어요. 좋은 하루 보내셨네요! ✨"
            else -> "정말 다채로운 하루를 보내셨네요! ${activities.take(3).joinToString(", ")} 등 많은 일들로 가득한 하루였군요. 활기찬 하루였어요! 🎉"
        }
    }

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }
}
