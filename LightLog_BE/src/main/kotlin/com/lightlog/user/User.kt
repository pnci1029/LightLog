package com.lightlog.user

import jakarta.persistence.*
import java.time.LocalDateTime
import java.time.LocalDate

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(unique = true, nullable = false)
    var username: String,

    @Column(nullable = false)
    var password: String,

    @Column(unique = true, nullable = false)
    var nickname: String,

    @Column(nullable = false)
    var aiTone: String = "counselor", // Default AI tone: counselor or friend

    @Column(nullable = true)
    var lastToneChangeDate: LocalDate? = null, // 마지막 톤 변경 날짜

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
