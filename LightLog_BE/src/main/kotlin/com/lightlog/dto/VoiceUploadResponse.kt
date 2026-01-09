package com.lightlog.dto

data class VoiceUploadResponse(
    val transcribedText: String,
    val processingTimeMs: Long,
    val language: String? = null,
    val confidence: Double? = null
)