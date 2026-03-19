package com.example.demo.mapper;

import com.example.demo.model.AiConversation;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AiConversationMapper {
    @Select("SELECT * FROM ai_conversations WHERE id = #{id}")
    AiConversation findById(Long id);

    @Select("SELECT * FROM ai_conversations ORDER BY update_time DESC LIMIT #{limit}")
    List<AiConversation> findRecent(@Param("limit") Integer limit);

    @Select("SELECT * FROM ai_conversations WHERE user_id = #{userId} ORDER BY update_time DESC LIMIT #{limit}")
    List<AiConversation> findRecentByUser(@Param("userId") Long userId, @Param("limit") Integer limit);

    @Insert("INSERT INTO ai_conversations(user_id, title, status, requirements_json, tags, completeness, needs_more_info, next_question, create_time, update_time) " +
            "VALUES(#{userId}, #{title}, #{status}, #{requirementsJson}, #{tags}, #{completeness}, #{needsMoreInfo}, #{nextQuestion}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AiConversation conv);

    @Update("UPDATE ai_conversations SET title=#{title}, status=#{status}, requirements_json=#{requirementsJson}, tags=#{tags}, completeness=#{completeness}, needs_more_info=#{needsMoreInfo}, next_question=#{nextQuestion}, update_time=NOW() WHERE id=#{id}")
    int update(AiConversation conv);
}

