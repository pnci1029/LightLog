package com.lightlog.diary

import com.lightlog.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface DiaryRepository : JpaRepository<Diary, Long> {
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user AND d.date = :date")
    fun findByUserAndDate(@Param("user") user: User, @Param("date") date: LocalDate): List<Diary>
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user AND LOWER(d.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    fun findByUserAndContentContainingIgnoreCase(@Param("user") user: User, @Param("keyword") keyword: String): List<Diary>
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user AND d.date BETWEEN :startDate AND :endDate ORDER BY d.date DESC")
    fun findByUserAndDateBetween(@Param("user") user: User, @Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Diary>
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user AND LOWER(d.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND d.date BETWEEN :startDate AND :endDate ORDER BY d.date DESC")
    fun findByUserAndContentContainingAndDateBetween(
        @Param("user") user: User, 
        @Param("keyword") keyword: String, 
        @Param("startDate") startDate: LocalDate, 
        @Param("endDate") endDate: LocalDate
    ): List<Diary>
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user ORDER BY d.date DESC")
    fun findAllByUserOrderByDateDesc(@Param("user") user: User): List<Diary>
}
