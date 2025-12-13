package com.lightlog.moderation

import com.lightlog.dto.ModerationRequest
import com.lightlog.dto.ModerationResult
import com.lightlog.dto.ModerationResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class ModerationService(
    private val restTemplate: RestTemplate
) {

    @Value("\${openai.api-key}")
    private lateinit var apiKey: String

    @Value("\${openai.moderation.endpoint:https://api.openai.com/v1/moderations}")
    private lateinit var moderationEndpoint: String

    fun checkContent(content: String): ModerationResult {
        try {
            val headers = HttpHeaders().apply {
                contentType = MediaType.APPLICATION_JSON
                setBearerAuth(apiKey)
            }

            val request = ModerationRequest(input = content)
            val entity = HttpEntity(request, headers)

            val response: ResponseEntity<ModerationResponse> = restTemplate.postForEntity(
                moderationEndpoint,
                entity,
                ModerationResponse::class.java
            )

            val moderationResponse = response.body
                ?: throw IllegalStateException("Empty response from OpenAI Moderation API")

            return if (moderationResponse.results.isNotEmpty()) {
                moderationResponse.results[0]
            } else {
                // 결과가 없으면 안전한 콘텐츠로 간주
                ModerationResult(
                    flagged = false,
                    categories = emptyMap(),
                    category_scores = emptyMap()
                )
            }

        } catch (e: Exception) {
            // API 호출 실패 시 로그 기록 후 안전한 콘텐츠로 간주
            println("Moderation API 호출 실패: ${e.message}")
            return ModerationResult(
                flagged = false,
                categories = emptyMap(),
                category_scores = emptyMap()
            )
        }
    }

    fun isContentSafe(content: String): Boolean {
        val result = checkContent(content)
        return !result.flagged
    }

    fun getDetailedModerationInfo(content: String): Map<String, Any> {
        val result = checkContent(content)
        return mapOf(
            "safe" to !result.flagged,
            "flagged" to result.flagged,
            "categories" to result.categories,
            "scores" to result.category_scores
        )
    }
}