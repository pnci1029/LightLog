package com.lightlog.dto

import java.time.LocalDate
import java.time.LocalDateTime

data class DataImportRequest(
    val diaries: List<DiaryImportData>,
    val overwriteExisting: Boolean = false
)

data class DiaryImportData(
    val content: String,
    val date: LocalDate
)