package com.lightlog.diary

import com.lightlog.ai.AIService
import com.lightlog.dto.*
import java.time.LocalDateTime
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
    private val userRepository: UserRepository,
    private val aiService: AIService
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
        
        return try {
            // AI 기반 체크리스트 요약 생성
            aiService.generateChecklistSummary(activities, date)
        } catch (e: Exception) {
            // AI 호출 실패 시 폴백 로직
            generateFallbackSummary(activities)
        }
    }

    fun generatePositiveReinterpretation(diaryContent: String, date: LocalDate): String {
        val currentUser = getCurrentUser()
        
        return try {
            // AI 기반 긍정 재해석 생성
            aiService.generatePositiveReinterpretation(diaryContent, date)
        } catch (e: Exception) {
            // AI 호출 실패 시 폴백 메시지
            "오늘의 경험들도 모두 소중한 의미가 있어요. 하루하루 성장해나가는 모습이 정말 멋져요! ✨"
        }
    }

    fun generateDailyFeedback(date: LocalDate): String {
        val currentUser = getCurrentUser()
        
        // 해당 날짜의 일기 조회
        val diaries = diaryRepository.findByUserAndDate(currentUser, date)
        val diaryContent = if (diaries.isNotEmpty()) {
            diaries.joinToString("\n\n") { it.content }
        } else {
            null
        }
        
        return aiService.generateDailyFeedback(diaryContent, date)
    }

    private fun generateFallbackSummary(activities: List<String>): String {
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

    fun exportUserData(): DataExportResponse {
        val currentUser = getCurrentUser()
        val allDiaries = diaryRepository.findAllByUserOrderByDateDesc(currentUser)
        
        val userExport = UserDataExport(
            username = currentUser.username,
            nickname = currentUser.nickname,
            createdAt = currentUser.createdAt
        )
        
        val diaryExports = allDiaries.map { diary ->
            DiaryDataExport(
                content = diary.content,
                date = diary.date,
                createdAt = diary.createdAt
            )
        }
        
        return DataExportResponse(
            user = userExport,
            diaries = diaryExports,
            exportedAt = LocalDateTime.now()
        )
    }
    
    fun importUserData(request: DataImportRequest): ImportResult {
        val currentUser = getCurrentUser()
        var imported = 0
        var skipped = 0
        val errors = mutableListOf<String>()
        
        for (diaryData in request.diaries) {
            try {
                val existingDiaries = diaryRepository.findByUserAndDate(currentUser, diaryData.date)
                
                if (existingDiaries.isNotEmpty() && !request.overwriteExisting) {
                    skipped++
                    continue
                }
                
                // 기존 일기가 있고 덮어쓰기 모드인 경우 기존 일기 삭제
                if (existingDiaries.isNotEmpty() && request.overwriteExisting) {
                    diaryRepository.deleteAll(existingDiaries)
                }
                
                val diary = Diary(
                    content = diaryData.content,
                    date = diaryData.date,
                    user = currentUser
                )
                diaryRepository.save(diary)
                imported++
                
            } catch (e: Exception) {
                errors.add("${diaryData.date}: ${e.message}")
            }
        }
        
        return ImportResult(imported, skipped, errors)
    }

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }
}

