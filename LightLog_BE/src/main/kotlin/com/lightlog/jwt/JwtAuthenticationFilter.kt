package com.lightlog.jwt

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val token = resolveToken(request)

            if (token != null) {
                try {
                    val isValid = jwtTokenProvider.validateToken(token)

                    if (isValid) {
                        val auth = jwtTokenProvider.getAuthentication(token)
                        SecurityContextHolder.getContext().authentication = auth
                    } else {
                        println("JWT Filter - Invalid token, proceeding without authentication")
                    }
                } catch (e: Exception) {
                    println("JWT Filter - Token validation error: ${e.message}")
                }
            } else if (request.requestURI.startsWith("/api/") && !request.requestURI.startsWith("/api/auth/")) {
                println("JWT Filter - No token provided for protected resource")
            }

            filterChain.doFilter(request, response)
        } catch (e: Exception) {
            response.status = HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            return
        }
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7)
        }
        return null
    }
}
