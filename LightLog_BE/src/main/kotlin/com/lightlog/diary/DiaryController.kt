package com.lightlog.diary

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

    @GetMapping
    fun getDiaries(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<List<Diary>> {
        val diaries = diaryService.getDiariesForDate(date)
        return ResponseEntity.ok(diaries)
    }
}
