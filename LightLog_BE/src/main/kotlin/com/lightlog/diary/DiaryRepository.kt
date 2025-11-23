package com.lightlog.diary

import com.lightlog.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface DiaryRepository : JpaRepository<Diary, Long> {
    fun findByUserAndDate(user: User, date: LocalDate): List<Diary>
}
