package com.lightlog.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LightlogBeApplication

fun main(args: Array<String>) {
    runApplication<LightlogBeApplication>(*args)
}
