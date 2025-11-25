package com.lightlog.config

import com.lightlog.user.User
import com.lightlog.user.UserRepository
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class DataInitializer(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : ApplicationRunner {

    override fun run(args: ApplicationArguments?) {
        initializeDefaultUser()
    }

    private fun initializeDefaultUser() {
        val defaultUsername = "aaa"
        val defaultPassword = "123qwe"
        val defaultNickname = "개발자"

        // 이미 기본 사용자가 존재하는지 확인
        if (!userRepository.findByUsername(defaultUsername).isPresent) {
            val defaultUser = User(
                username = defaultUsername,
                password = passwordEncoder.encode(defaultPassword),
                nickname = defaultNickname
            )
            
            userRepository.save(defaultUser)
            println("✅ 기본 사용자 생성됨: username=$defaultUsername, password=$defaultPassword")
        } else {
            println("ℹ️ 기본 사용자가 이미 존재합니다: username=$defaultUsername")
        }
    }
}