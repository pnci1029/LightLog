package com.lightlog.dto

data class WhisperRequest(
    val model: String = "whisper-1",
    val language: String? = "ko",
    val responseFormat: String = "json",
    val temperature: Double = 0.0,
    val prompt: String? = null
)