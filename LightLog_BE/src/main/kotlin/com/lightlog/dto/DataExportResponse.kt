package com.lightlog.dto

import java.time.LocalDate
import java.time.LocalDateTime

data class DataExportResponse(
    val user: UserDataExport,
    val diaries: List<DiaryDataExport>,
    val exportedAt: LocalDateTime,
    val version: String = "1.0"
)

data class UserDataExport(
    val username: String,
    val nickname: String,
    val createdAt: LocalDateTime
)

data class DiaryDataExport(
    val content: String,
    val date: LocalDate,
    val createdAt: LocalDateTime
)