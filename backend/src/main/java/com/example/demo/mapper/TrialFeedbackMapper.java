package com.example.demo.mapper;

import com.example.demo.model.TrialFeedback;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TrialFeedbackMapper {
    @Select("SELECT * FROM trial_feedback WHERE trial_id = #{trialId}")
    TrialFeedback findByTrialId(Long trialId);

    @Select("SELECT * FROM trial_feedback WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<TrialFeedback> findByUserId(Long userId);

    @Select("SELECT * FROM trial_feedback ORDER BY create_time DESC LIMIT #{limit}")
    List<TrialFeedback> findRecent(Integer limit);

    @Insert("INSERT INTO trial_feedback(trial_id, user_id, rating, feedback, issues, purchase_intent, create_time) " +
            "VALUES(#{trialId}, #{userId}, #{rating}, #{feedback}, #{issues}, #{purchaseIntent}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TrialFeedback feedback);

    @Select("SELECT AVG(rating) FROM trial_feedback WHERE trial_id = #{trialId}")
    Double getAverageRating(Long trialId);
}
