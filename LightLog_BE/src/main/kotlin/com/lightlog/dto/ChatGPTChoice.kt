package com.lightlog.dto

data class ChatGPTChoice(
    val message: ChatGPTMessage,
    val finish_reason: String,
    val index: Int
)