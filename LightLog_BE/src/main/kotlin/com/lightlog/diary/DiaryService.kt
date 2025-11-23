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

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }
}
