package com.lightlog.diary

import com.lightlog.dto.DataExportResponse
import com.lightlog.dto.DataImportRequest
import com.lightlog.dto.DiaryCreateRequest
import com.lightlog.dto.DiaryStatistics
import com.lightlog.dto.SummaryRequest
import com.lightlog.dto.SummaryResponse
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

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

    @GetMapping("/export")
    fun exportData(): ResponseEntity<DataExportResponse> {
        val exportData = diaryService.exportUserData()
        return ResponseEntity.ok(exportData)
    }

    @PostMapping("/import")
    fun importData(@RequestBody request: DataImportRequest): ResponseEntity<Map<String, Any>> {
        val result = diaryService.importUserData(request)
        return ResponseEntity.ok(mapOf(
            "imported" to result.imported,
            "skipped" to result.skipped,
            "errors" to result.errors,
            "message" to "데이터 가져오기가 완료되었습니다."
        ))
    }
}
