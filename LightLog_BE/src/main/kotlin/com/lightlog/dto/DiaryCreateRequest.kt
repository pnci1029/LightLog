package com.lightlog.dto

import java.time.LocalDate

data class DiaryCreateRequest(
    val content: String,
    val date: LocalDate
)
