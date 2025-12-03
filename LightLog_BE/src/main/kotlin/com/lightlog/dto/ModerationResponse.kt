package com.lightlog.dto

data class ModerationResponse(
    val id: String,
    val model: String,
    val results: List<ModerationResult>
)