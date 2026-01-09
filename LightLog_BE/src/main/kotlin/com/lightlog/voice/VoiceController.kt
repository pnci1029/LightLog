package com.lightlog.voice

import com.lightlog.dto.VoiceUploadResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/voice")
class VoiceController(
    private val voiceService: VoiceService
) {

    /**
     * 음성 파일 업로드 및 텍스트 변환
     * 
     * @param file 업로드할 음성 파일 (최대 25MB, 지원 형식: mp3, wav, m4a, flac, mp4, mpeg, mpga, oga, ogg, webm)
     * @return 변환된 텍스트와 처리 정보
     */
    @PostMapping("/upload")
    fun uploadVoice(
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<*> {
        return try {
            // 음성 파일을 텍스트로 변환
            val response = voiceService.convertSpeechToText(file)
            
            ResponseEntity.ok(response)
            
        } catch (e: IllegalArgumentException) {
            // 클라이언트 오류 (잘못된 파일, 유해 콘텐츠 등)
            ResponseEntity.badRequest().body(
                mapOf(
                    "error" to "INVALID_REQUEST",
                    "message" to e.message,
                    "timestamp" to System.currentTimeMillis()
                )
            )
            
        } catch (e: VoiceProcessingException) {
            // 음성 처리 오류
            ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                mapOf(
                    "error" to "VOICE_PROCESSING_ERROR",
                    "message" to e.message,
                    "timestamp" to System.currentTimeMillis()
                )
            )
            
        } catch (e: Exception) {
            // 일반적인 서버 오류
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "error" to "INTERNAL_SERVER_ERROR",
                    "message" to "음성 변환 중 예상치 못한 오류가 발생했습니다.",
                    "timestamp" to System.currentTimeMillis()
                )
            )
        }
    }

    /**
     * 음성 변환 서비스 상태 확인
     */
    @GetMapping("/health")
    fun healthCheck(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(
            mapOf(
                "status" to "healthy",
                "service" to "voice-to-text",
                "timestamp" to System.currentTimeMillis().toString()
            )
        )
    }

    /**
     * 지원하는 오디오 파일 형식 정보
     */
    @GetMapping("/supported-formats")
    fun getSupportedFormats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(
            mapOf(
                "supportedFormats" to listOf("mp3", "wav", "m4a", "flac", "mp4", "mpeg", "mpga", "oga", "ogg", "webm"),
                "maxFileSize" to "25MB",
                "maxDuration" to "10 minutes",
                "language" to "ko (Korean)",
                "model" to "whisper-1"
            )
        )
    }
}