package com.lightlog.dto

data class ChatGPTUsage(
    val prompt_tokens: Int,
    val completion_tokens: Int,
    val total_tokens: Int
)