package com.lightlog.dto

data class ImportResult(
    val imported: Int,
    val skipped: Int,
    val errors: List<String>
)