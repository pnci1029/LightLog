package com.lightlog.voice

import com.lightlog.dto.VoiceUploadResponse
import com.lightlog.dto.WhisperResponse
import com.lightlog.moderation.ModerationService
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.FileSystemResource
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestTemplate
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.util.concurrent.TimeUnit
import kotlin.system.measureTimeMillis

@Service
class VoiceService(
    private val restTemplate: RestTemplate,
    private val moderationService: ModerationService
) {

    @Value("\${openai.api-key}")
    private lateinit var apiKey: String

    @Value("\${openai.whisper.endpoint:https://api.openai.com/v1/audio/transcriptions}")
    private lateinit var whisperEndpoint: String

    @Value("\${openai.whisper.model:whisper-1}")
    private lateinit var whisperModel: String

    @Value("\${openai.whisper.language:ko}")
    private lateinit var defaultLanguage: String

    @Value("\${openai.whisper.response-format:json}")
    private lateinit var responseFormat: String

    companion object {
        // 지원하는 오디오 형식
        private val SUPPORTED_FORMATS = setOf("mp3", "wav", "m4a", "flac", "mp4", "mpeg", "mpga", "oga", "ogg", "webm")
        
        // 최대 파일 크기 (25MB)
        private const val MAX_FILE_SIZE = 25 * 1024 * 1024L
        
        // 최대 오디오 길이 (10분)
        private const val MAX_AUDIO_DURATION_SECONDS = 600L
    }

    /**
     * 음성 파일을 텍스트로 변환
     */
    fun convertSpeechToText(audioFile: MultipartFile): VoiceUploadResponse {
        return try {
            var tempFile: File? = null
            var result: VoiceUploadResponse? = null
            
            val totalTime = measureTimeMillis {
                // 파일 유효성 검사
                validateAudioFile(audioFile)
                
                try {
                    // 임시 파일 생성
                    tempFile = createTempFile(audioFile)
                    
                    // Whisper API 호출
                    val whisperResponse = callWhisperAPI(tempFile!!)
                    
                    // 변환된 텍스트 유해성 검사
                    validateTranscribedText(whisperResponse.text)
                    
                    result = VoiceUploadResponse(
                        transcribedText = whisperResponse.text.trim(),
                        processingTimeMs = 0, // 아래에서 업데이트됨
                        language = whisperResponse.language,
                        confidence = calculateConfidence(whisperResponse)
                    )
                } finally {
                    // 임시 파일 삭제
                    tempFile?.delete()
                }
            }
            
            // 총 처리 시간으로 업데이트
            result!!.copy(processingTimeMs = totalTime)
            
        } catch (e: Exception) {
            throw VoiceProcessingException("음성 변환 실패: ${e.message}", e)
        }
    }

    /**
     * 오디오 파일 유효성 검사
     */
    private fun validateAudioFile(audioFile: MultipartFile) {
        // 파일 존재 확인
        if (audioFile.isEmpty) {
            throw IllegalArgumentException("업로드된 파일이 비어있습니다.")
        }
        
        // 파일 크기 검사
        if (audioFile.size > MAX_FILE_SIZE) {
            throw IllegalArgumentException("파일 크기가 너무 큽니다. 최대 25MB까지 지원됩니다.")
        }
        
        // 파일 형식 검사
        val fileExtension = getFileExtension(audioFile.originalFilename)
        if (fileExtension !in SUPPORTED_FORMATS) {
            throw IllegalArgumentException(
                "지원하지 않는 파일 형식입니다. 지원 형식: ${SUPPORTED_FORMATS.joinToString(", ")}"
            )
        }
        
        // MIME 타입 검사
        if (!isValidAudioMimeType(audioFile.contentType)) {
            throw IllegalArgumentException("유효하지 않은 오디오 파일입니다.")
        }
    }

    /**
     * 임시 파일 생성
     */
    private fun createTempFile(audioFile: MultipartFile): File {
        return try {
            val fileExtension = getFileExtension(audioFile.originalFilename)
            val tempPath = Files.createTempFile("voice_upload_", ".$fileExtension")
            
            // 파일 복사
            Files.copy(audioFile.inputStream, tempPath, StandardCopyOption.REPLACE_EXISTING)
            
            tempPath.toFile()
        } catch (e: IOException) {
            throw VoiceProcessingException("임시 파일 생성 실패", e)
        }
    }

    /**
     * OpenAI Whisper API 호출
     */
    private fun callWhisperAPI(audioFile: File): WhisperResponse {
        return try {
            val headers = HttpHeaders().apply {
                setBearerAuth(apiKey)
                contentType = MediaType.MULTIPART_FORM_DATA
            }

            // Multipart 요청 생성
            val body: MultiValueMap<String, Any> = LinkedMultiValueMap<String, Any>().apply {
                add("file", FileSystemResource(audioFile))
                add("model", whisperModel)
                add("language", defaultLanguage)
                add("response_format", responseFormat)
                add("temperature", "0.0")
            }

            val entity = HttpEntity(body, headers)

            val response: ResponseEntity<WhisperResponse> = restTemplate.exchange(
                whisperEndpoint,
                HttpMethod.POST,
                entity,
                WhisperResponse::class.java
            )

            response.body ?: throw IllegalStateException("Whisper API로부터 빈 응답을 받았습니다.")
            
        } catch (e: RestClientException) {
            throw VoiceProcessingException("Whisper API 호출 실패: ${e.message}", e)
        }
    }

    /**
     * 변환된 텍스트 유해성 검사
     */
    private fun validateTranscribedText(text: String) {
        if (text.isBlank()) {
            throw VoiceProcessingException("음성에서 텍스트를 추출할 수 없습니다. 더 명확하게 말씀해 주세요.")
        }
        
        if (text.length > 5000) {
            throw VoiceProcessingException("변환된 텍스트가 너무 깁니다. 더 짧게 녹음해 주세요.")
        }
        
        // 유해성 검사
        if (!moderationService.isContentSafe(text)) {
            throw IllegalArgumentException("변환된 텍스트에 부적절한 내용이 포함되어 있습니다.")
        }
    }

    /**
     * 파일 확장자 추출
     */
    private fun getFileExtension(filename: String?): String {
        return filename?.substringAfterLast('.', "")?.lowercase() ?: ""
    }

    /**
     * 오디오 MIME 타입 유효성 검사
     */
    private fun isValidAudioMimeType(contentType: String?): Boolean {
        if (contentType == null) return false
        
        val validMimeTypes = setOf(
            "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav",
            "audio/mp4", "audio/m4a", "audio/flac", "audio/ogg", "audio/webm",
            "video/mp4", "video/mpeg", "video/webm"
        )
        
        return validMimeTypes.any { contentType.startsWith(it) }
    }

    /**
     * 변환 신뢰도 계산 (Whisper 응답 기반)
     */
    private fun calculateConfidence(whisperResponse: WhisperResponse): Double? {
        // Whisper API는 기본적으로 confidence를 제공하지 않지만,
        // segments 정보가 있을 경우 평균 logprob을 이용해 추정할 수 있음
        return whisperResponse.segments?.let { segments ->
            if (segments.isEmpty()) return null
            
            val avgLogprobs = segments.mapNotNull { it.avgLogprob }
            if (avgLogprobs.isEmpty()) return null
            
            // logprob을 확률로 변환 (대략적인 추정)
            val avgLogprob = avgLogprobs.average()
            Math.exp(avgLogprob).coerceIn(0.0, 1.0)
        }
    }
}

/**
 * 음성 처리 관련 예외
 */
class VoiceProcessingException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)