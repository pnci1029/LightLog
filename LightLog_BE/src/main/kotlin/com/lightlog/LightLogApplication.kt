package com.lightlog

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LightLogApplication

fun main(args: Array<String>) {
    runApplication<LightLogApplication>(*args)
}
