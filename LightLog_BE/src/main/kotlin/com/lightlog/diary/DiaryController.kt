package com.lightlog.diary

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

data class SummaryRequest(
    val activities: List<String>,
    val date: LocalDate
)

data class SummaryResponse(
    val summary: String
)

data class DiaryStatistics(
    val totalDiaries: Long,
    val currentMonthDiaries: Long,
    val longestStreak: Int,
    val currentStreak: Int,
    val monthlyStats: List<MonthlyStats>,
    val recentDays: List<DayStats>
)

data class MonthlyStats(
    val month: String,
    val count: Long
)

data class DayStats(
    val date: String,
    val hasEntry: Boolean
)

@RestController
@RequestMapping("/api/diaries")
class DiaryController(
    private val diaryService: DiaryService
) {

    @PostMapping
    fun createDiary(@RequestBody request: DiaryCreateRequest): ResponseEntity<Diary> {
        val diary = diaryService.createDiary(request.content, request.date)
        return ResponseEntity.ok(diary)
    }

    @PutMapping("/{id}")
    fun updateDiary(
        @PathVariable id: Long,
        @RequestBody request: DiaryCreateRequest
    ): ResponseEntity<Diary> {
        val diary = diaryService.updateDiary(id, request.content)
        return ResponseEntity.ok(diary)
    }

    @GetMapping
    fun getDiaries(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<List<Diary>> {
        val diaries = diaryService.getDiariesForDate(date)
        return ResponseEntity.ok(diaries)
    }

    @PostMapping("/summary")
    fun generateSummary(@RequestBody request: SummaryRequest): ResponseEntity<SummaryResponse> {
        val summary = diaryService.generateSummary(request.activities, request.date)
        return ResponseEntity.ok(SummaryResponse(summary))
    }

    @GetMapping("/past")
    fun getPastDiaries(): ResponseEntity<Map<String, Diary?>> {
        val pastDiaries = diaryService.getPastDiaries()
        return ResponseEntity.ok(pastDiaries)
    }

    @GetMapping("/search")
    fun searchDiaries(
        @RequestParam(required = false) keyword: String?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?
    ): ResponseEntity<List<Diary>> {
        val diaries = diaryService.searchDiaries(keyword, startDate, endDate)
        return ResponseEntity.ok(diaries)
    }

    @GetMapping("/statistics")
    fun getDiaryStatistics(): ResponseEntity<DiaryStatistics> {
        val statistics = diaryService.getDiaryStatistics()
        return ResponseEntity.ok(statistics)
    }
}
