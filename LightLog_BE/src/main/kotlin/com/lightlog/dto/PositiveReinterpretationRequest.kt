package com.lightlog.dto

import java.time.LocalDate

data class PositiveReinterpretationRequest(
    val content: String,
    val date: LocalDate
)