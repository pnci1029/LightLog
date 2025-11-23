package com.lightlog.auth

data class UserRegistrationRequest(
    val username: String,
    val password: String,
    val nickname: String
)
