package com.lightlog.dto

import java.time.LocalDate

data class SummaryRequest(
    val activities: List<String>,
    val date: LocalDate
)