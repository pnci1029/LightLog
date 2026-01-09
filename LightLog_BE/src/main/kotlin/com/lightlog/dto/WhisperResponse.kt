package com.lightlog.dto

data class WhisperResponse(
    val text: String,
    val language: String? = null,
    val duration: Double? = null,
    val segments: List<WhisperSegment>? = null
)

data class WhisperSegment(
    val id: Int,
    val seek: Int,
    val start: Double,
    val end: Double,
    val text: String,
    val tokens: List<Int>? = null,
    val temperature: Double? = null,
    val avgLogprob: Double? = null,
    val compressionRatio: Double? = null,
    val noSpeechProb: Double? = null
)