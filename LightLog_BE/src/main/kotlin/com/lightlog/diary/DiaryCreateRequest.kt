package com.lightlog.diary

import java.time.LocalDate

data class DiaryCreateRequest(
    val content: String,
    val date: LocalDate
)
