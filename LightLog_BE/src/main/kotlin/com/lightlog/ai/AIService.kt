package com.lightlog.ai

import com.lightlog.dto.*
import com.lightlog.moderation.ModerationService
import com.lightlog.user.User
import com.lightlog.user.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.time.LocalDate

@Service
class AIService(
    private val restTemplate: RestTemplate,
    private val moderationService: ModerationService,
    private val userRepository: UserRepository
) {

    @Value("\${openai.api-key}")
    private lateinit var apiKey: String

    @Value("\${openai.chat.endpoint:https://api.openai.com/v1/chat/completions}")
    private lateinit var chatEndpoint: String

    @Value("\${openai.chat.model:gpt-3.5-turbo}")
    private lateinit var chatModel: String

    // Counselor tone prompts
    @Value("\${openai.prompts.counselor.system}")
    private lateinit var counselorSystemPrompt: String

    @Value("\${openai.prompts.counselor.checklist-summary}")
    private lateinit var counselorChecklistSummaryPrompt: String

    @Value("\${openai.prompts.counselor.positive-reinterpretation}")
    private lateinit var counselorPositiveReinterpretationPrompt: String

    // Friend tone prompts
    @Value("\${openai.prompts.friend.system}")
    private lateinit var friendSystemPrompt: String

    @Value("\${openai.prompts.friend.checklist-summary}")
    private lateinit var friendChecklistSummaryPrompt: String

    @Value("\${openai.prompts.friend.positive-reinterpretation}")
    private lateinit var friendPositiveReinterpretationPrompt: String

    // Daily feedback prompts
    @Value("\${openai.prompts.counselor.daily-feedback}")
    private lateinit var counselorDailyFeedbackPrompt: String

    @Value("\${openai.prompts.friend.daily-feedback}")
    private lateinit var friendDailyFeedbackPrompt: String

    fun generateChecklistSummary(activities: List<String>, date: LocalDate): String {
        // 입력 내용 유해성 검사
        val activitiesText = activities.joinToString(", ")
        if (!moderationService.isContentSafe(activitiesText)) {
            throw IllegalArgumentException("부적절한 내용이 포함되어 있습니다.")
        }

        val currentUser = getCurrentUser()
        val prompt = buildChecklistSummaryPrompt(activities, date, currentUser.aiTone)
        return generateChatGPTResponse(prompt, currentUser.aiTone)
    }

    fun generatePositiveReinterpretation(diaryContent: String, date: LocalDate): String {
        // 입력 내용 유해성 검사
        if (!moderationService.isContentSafe(diaryContent)) {
            throw IllegalArgumentException("부적절한 내용이 포함되어 있습니다.")
        }

        val currentUser = getCurrentUser()
        val prompt = buildPositiveReinterpretationPrompt(diaryContent, date, currentUser.aiTone)
        return generateChatGPTResponse(prompt, currentUser.aiTone)
    }

    fun generateDailyFeedback(diaryContent: String?, date: LocalDate): String {
        val currentUser = getCurrentUser()
        
        return try {
            if (diaryContent.isNullOrBlank()) {
                // 일기가 없는 경우
                return when (currentUser.aiTone) {
                    "friend" -> "어? 오늘 일기를 안 썼네! 괜찮아, 때로는 쉬어가는 것도 필요해. 내일은 또 새로운 하루니까 천천히 해보자! 😊"
                    else -> "오늘은 일기를 작성하지 않으셨군요. 괜찮습니다. 때로는 휴식도 필요하니까요. 내일은 또 다른 새로운 시작이에요. 🌅"
                }
            }

            // 입력 내용 유해성 검사
            if (!moderationService.isContentSafe(diaryContent)) {
                throw IllegalArgumentException("부적절한 내용이 포함되어 있습니다.")
            }

            val prompt = buildDailyFeedbackPrompt(diaryContent, date, currentUser.aiTone)
            generateChatGPTResponse(prompt, currentUser.aiTone)
        } catch (e: Exception) {
            // AI 호출 실패 시 폴백 메시지
            when (currentUser.aiTone) {
                "friend" -> "오늘 하루도 정말 고생 많았어! 네가 꾸준히 노력하는 모습이 너무 멋있어. 내일도 함께 화이팅해보자! 💪"
                else -> "오늘 하루도 수고 많으셨어요. 작은 노력들이 모여 큰 성장을 만들어가고 있어요. 내일도 응원할게요! ✨"
            }
        }
    }

    private fun generateChatGPTResponse(prompt: String, aiTone: String = "counselor"): String {
        try {
            val headers = HttpHeaders().apply {
                contentType = MediaType.APPLICATION_JSON
                setBearerAuth(apiKey)
            }

            val systemPrompt = when (aiTone) {
                "friend" -> friendSystemPrompt
                else -> counselorSystemPrompt
            }

            val messages = listOf(
                ChatGPTMessage(
                    role = "system",
                    content = systemPrompt
                ),
                ChatGPTMessage(role = "user", content = prompt)
            )

            val request = ChatGPTRequest(
                model = chatModel,
                messages = messages,
                max_tokens = 500,
                temperature = 0.7
            )

            val entity = HttpEntity(request, headers)

            val response: ResponseEntity<ChatGPTResponse> = restTemplate.postForEntity(
                chatEndpoint,
                entity,
                ChatGPTResponse::class.java
            )

            val chatGPTResponse = response.body
                ?: throw IllegalStateException("Empty response from OpenAI Chat API")

            return if (chatGPTResponse.choices.isNotEmpty()) {
                chatGPTResponse.choices[0].message.content.trim()
            } else {
                generateFallbackResponse()
            }

        } catch (e: Exception) {
            println("ChatGPT API 호출 실패: ${e.message}")
            return generateFallbackResponse()
        }
    }

    private fun buildChecklistSummaryPrompt(activities: List<String>, date: LocalDate, aiTone: String): String {
        val summaryPrompt = when (aiTone) {
            "friend" -> friendChecklistSummaryPrompt
            else -> counselorChecklistSummaryPrompt
        }
        
        return """
            오늘 날짜: ${date}
            오늘 한 일들: ${activities.joinToString(", ")}
            
            $summaryPrompt
        """.trimIndent()
    }

    private fun buildPositiveReinterpretationPrompt(diaryContent: String, date: LocalDate, aiTone: String): String {
        val reinterpretationPrompt = when (aiTone) {
            "friend" -> friendPositiveReinterpretationPrompt
            else -> counselorPositiveReinterpretationPrompt
        }
        
        return """
            오늘 날짜: ${date}
            일기 내용: $diaryContent
            
            $reinterpretationPrompt
        """.trimIndent()
    }

    private fun buildDailyFeedbackPrompt(diaryContent: String, date: LocalDate, aiTone: String): String {
        val feedbackPrompt = when (aiTone) {
            "friend" -> friendDailyFeedbackPrompt
            else -> counselorDailyFeedbackPrompt
        }
        
        return """
            오늘 날짜: ${date}
            오늘의 일기:
            $diaryContent
            
            $feedbackPrompt
        """.trimIndent()
    }

    private fun generateFallbackResponse(): String {
        val fallbackMessages = listOf(
            "오늘 하루도 고생 많으셨어요! 작은 일들도 모두 의미있는 순간들이에요. ✨",
            "하루하루 쌓여가는 노력들이 분명 큰 결실을 맺을 거예요. 오늘도 잘하셨어요! 🌟",
            "때로는 평범한 하루가 가장 소중한 하루일 수 있어요. 오늘도 감사한 하루였네요! 💫",
            "어떤 하루든 그 나름의 의미가 있어요. 오늘의 경험도 분명 값진 시간이었을 거예요! 🌸",
            "매일매일이 새로운 시작이에요. 오늘 하루도 나름대로 의미있게 보내셨네요! ☀️"
        )
        return fallbackMessages.random()
    }

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalStateException("Authenticated user not found in database") }
    }
}