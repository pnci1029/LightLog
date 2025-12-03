package com.lightlog.dto

import java.time.LocalDateTime

data class UserProfileResponse(
    val username: String,
    val nickname: String,
    val aiTone: String,
    val canChangeToneToday: Boolean,
    val createdAt: LocalDateTime
)