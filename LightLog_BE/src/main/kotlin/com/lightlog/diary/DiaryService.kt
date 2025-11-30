package com.lightlog.diary

import com.lightlog.user.User
import com.lightlog.user.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.math.abs

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

    fun updateDiary(id: Long, content: String): Diary {
        val currentUser = getCurrentUser()
        val diary = diaryRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Diary not found") }
        
        // 본인 일기인지 확인
        if (diary.user.id != currentUser.id) {
            throw IllegalArgumentException("Permission denied")
        }
        
        diary.content = content
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

    fun getPastDiary(monthsAgo: Int): Diary? {
        val currentUser = getCurrentUser()
        val targetDate = LocalDate.now().minusMonths(monthsAgo.toLong())
        val diaries = diaryRepository.findByUserAndDate(currentUser, targetDate)
        return if (diaries.isNotEmpty()) diaries[0] else null
    }

    fun getPastDiaries(): Map<String, Diary?> {
        return mapOf(
            "1month" to getPastDiary(1),
            "3months" to getPastDiary(3),
            "6months" to getPastDiary(6),
            "12months" to getPastDiary(12)
        )
    }

    fun searchDiaries(keyword: String?, startDate: LocalDate?, endDate: LocalDate?): List<Diary> {
        val currentUser = getCurrentUser()
        
        return when {
            // 키워드와 날짜 범위 모두 있는 경우
            !keyword.isNullOrBlank() && startDate != null && endDate != null -> {
                diaryRepository.findByUserAndContentContainingAndDateBetween(currentUser, keyword, startDate, endDate)
            }
            // 키워드만 있는 경우
            !keyword.isNullOrBlank() -> {
                diaryRepository.findByUserAndContentContainingIgnoreCase(currentUser, keyword)
            }
            // 날짜 범위만 있는 경우
            startDate != null && endDate != null -> {
                diaryRepository.findByUserAndDateBetween(currentUser, startDate, endDate)
            }
            // 아무 조건도 없는 경우 - 최근 순으로 전체 일기 반환
            else -> {
                diaryRepository.findAllByUserOrderByDateDesc(currentUser)
            }
        }
    }

    fun getDiaryStatistics(): DiaryStatistics {
        val currentUser = getCurrentUser()
        val allUserDiaries = diaryRepository.findAllByUserOrderByDateDesc(currentUser)
            .sortedBy { it.date }

        val totalDiaries = allUserDiaries.size.toLong()
        
        // 현재 월의 일기 수
        val currentMonth = LocalDate.now()
        val currentMonthDiaries = allUserDiaries.count { 
            it.date.month == currentMonth.month && it.date.year == currentMonth.year
        }.toLong()

        // 연속 기록 계산
        val streakData = calculateStreaks(allUserDiaries.map { it.date })
        
        // 월별 통계 (최근 12개월)
        val monthlyStats = calculateMonthlyStats(allUserDiaries)
        
        // 최근 30일 데이터
        val recentDays = calculateRecentDays(allUserDiaries)

        return DiaryStatistics(
            totalDiaries = totalDiaries,
            currentMonthDiaries = currentMonthDiaries,
            longestStreak = streakData.first,
            currentStreak = streakData.second,
            monthlyStats = monthlyStats,
            recentDays = recentDays
        )
    }

    private fun calculateStreaks(dates: List<LocalDate>): Pair<Int, Int> {
        if (dates.isEmpty()) return Pair(0, 0)

        val sortedDates = dates.toSet().sorted()
        var longestStreak = 1
        var currentStreakLength = 1
        var tempStreakLength = 1

        // 가장 긴 연속 기록 계산
        for (i in 1 until sortedDates.size) {
            if (sortedDates[i] == sortedDates[i-1].plusDays(1)) {
                tempStreakLength++
            } else {
                longestStreak = maxOf(longestStreak, tempStreakLength)
                tempStreakLength = 1
            }
        }
        longestStreak = maxOf(longestStreak, tempStreakLength)

        // 현재 연속 기록 계산 (오늘부터 거꾸로)
        val today = LocalDate.now()
        var checkDate = today
        
        while (sortedDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1)
        }
        
        checkDate = checkDate.plusDays(1)
        while (sortedDates.contains(checkDate)) {
            currentStreakLength++
            checkDate = checkDate.plusDays(1)
        }
        
        currentStreakLength = if (sortedDates.contains(today) || sortedDates.contains(today.minusDays(1))) {
            currentStreakLength
        } else {
            0
        }

        return Pair(longestStreak, currentStreakLength - 1)
    }

    private fun calculateMonthlyStats(diaries: List<Diary>): List<MonthlyStats> {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")
        val monthlyData = mutableMapOf<String, Long>()
        
        // 최근 12개월 초기화
        val currentDate = LocalDate.now()
        for (i in 0..11) {
            val monthDate = currentDate.minusMonths(i.toLong())
            val monthKey = monthDate.format(formatter)
            monthlyData[monthKey] = 0
        }
        
        // 실제 데이터 집계
        diaries.forEach { diary ->
            val monthKey = diary.date.format(formatter)
            if (monthlyData.containsKey(monthKey)) {
                monthlyData[monthKey] = monthlyData[monthKey]!! + 1
            }
        }
        
        return monthlyData.entries
            .sortedBy { it.key }
            .map { MonthlyStats(it.key, it.value) }
    }

    private fun calculateRecentDays(diaries: List<Diary>): List<DayStats> {
        val diaryDates = diaries.map { it.date }.toSet()
        val today = LocalDate.now()
        val recentDays = mutableListOf<DayStats>()
        
        for (i in 29 downTo 0) {
            val date = today.minusDays(i.toLong())
            recentDays.add(
                DayStats(
                    date = date.toString(),
                    hasEntry = diaryDates.contains(date)
                )
            )
        }
        
        return recentDays
    }

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }
}
