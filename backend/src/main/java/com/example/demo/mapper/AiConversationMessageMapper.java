package com.example.demo.mapper;

import com.example.demo.model.AiConversationMessage;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AiConversationMessageMapper {
    @Select("SELECT * FROM ai_conversation_messages WHERE conversation_id = #{conversationId} ORDER BY id ASC")
    List<AiConversationMessage> findByConversationId(Long conversationId);

    @Insert("INSERT INTO ai_conversation_messages(conversation_id, role, content, requirements_json, tags, needs_more_info, next_question, create_time) " +
            "VALUES(#{conversationId}, #{role}, #{content}, #{requirementsJson}, #{tags}, #{needsMoreInfo}, #{nextQuestion}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AiConversationMessage msg);
}

