package com.lightlog.dto

data class UserRegistrationRequest(
    val username: String,
    val password: String,
    val nickname: String
)
