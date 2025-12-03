package com.lightlog.dto

data class ChatGPTResponse(
    val id: String,
    val `object`: String,
    val created: Long,
    val model: String,
    val choices: List<ChatGPTChoice>,
    val usage: ChatGPTUsage
)