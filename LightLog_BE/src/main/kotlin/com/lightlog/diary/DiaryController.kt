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
}
