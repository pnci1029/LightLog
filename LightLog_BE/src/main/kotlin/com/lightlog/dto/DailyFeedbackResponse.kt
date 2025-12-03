package com.lightlog.dto

import java.time.LocalDate

data class DailyFeedbackResponse(
    val date: LocalDate,
    val diaryContent: String?,
    val feedback: String,
    val hasDiary: Boolean,
    val message: String
)