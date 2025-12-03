package com.lightlog.dto

data class ChatGPTRequest(
    val model: String,
    val messages: List<ChatGPTMessage>,
    val max_tokens: Int = 1000,
    val temperature: Double = 0.7
)