package com.lightlog.dto

data class ModerationResult(
    val flagged: Boolean,
    val categories: Map<String, Boolean>,
    val category_scores: Map<String, Double>
)