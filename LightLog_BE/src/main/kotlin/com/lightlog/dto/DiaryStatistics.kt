package com.lightlog.dto

data class DiaryStatistics(
    val totalDiaries: Long,
    val currentMonthDiaries: Long,
    val longestStreak: Int,
    val currentStreak: Int,
    val monthlyStats: List<MonthlyStats>,
    val recentDays: List<DayStats>
)

data class MonthlyStats(
    val month: String,
    val count: Long
)

data class DayStats(
    val date: String,
    val hasEntry: Boolean
)