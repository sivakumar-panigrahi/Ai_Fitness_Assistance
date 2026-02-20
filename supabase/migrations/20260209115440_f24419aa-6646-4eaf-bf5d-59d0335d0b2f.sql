
-- Atomic workout completion function (prevents race conditions via row-level locking)
CREATE OR REPLACE FUNCTION public.complete_workout_atomic(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak record;
  v_health record;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
  v_new_streak int;
  v_new_best int;
  v_new_total int;
  v_bmi numeric;
  v_new_badges text[] := '{}';
  v_already_done boolean;
BEGIN
  -- Lock the streak row to prevent concurrent updates
  SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id FOR UPDATE;
  
  IF v_streak IS NULL THEN
    RAISE EXCEPTION 'No streak record found for user';
  END IF;

  -- Check if already completed today
  IF v_streak.last_workout_date = v_today THEN
    RETURN jsonb_build_object('already_completed', true, 'message', 'Workout already completed today');
  END IF;

  -- Also check progress_history for today (belt-and-suspenders)
  SELECT EXISTS(
    SELECT 1 FROM progress_history 
    WHERE user_id = p_user_id AND workout_completed = true 
    AND recorded_at::date = v_today
  ) INTO v_already_done;

  IF v_already_done THEN
    -- Fix streak record to reflect reality
    UPDATE user_streaks SET last_workout_date = v_today WHERE user_id = p_user_id;
    RETURN jsonb_build_object('already_completed', true, 'message', 'Workout already completed today');
  END IF;

  -- Calculate new streak
  IF v_streak.last_workout_date = v_yesterday THEN
    v_new_streak := COALESCE(v_streak.current_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_new_best := GREATEST(v_new_streak, COALESCE(v_streak.best_streak, 0));
  v_new_total := COALESCE(v_streak.total_workouts, 0) + 1;

  -- Update streak atomically
  UPDATE user_streaks SET
    current_streak = v_new_streak,
    best_streak = v_new_best,
    total_workouts = v_new_total,
    last_workout_date = v_today,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Get health data for BMI calculation
  SELECT * INTO v_health FROM health_data WHERE user_id = p_user_id;
  
  IF v_health IS NOT NULL THEN
    v_bmi := v_health.weight / (v_health.height * v_health.height);
    
    INSERT INTO progress_history (user_id, weight, bmi, health_conditions, workout_completed)
    VALUES (p_user_id, v_health.weight, v_bmi, v_health.health_conditions, true);
  END IF;

  -- Check for new badges (use ON CONFLICT to prevent duplicates)
  IF v_new_streak >= 3 AND NOT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = 'bronze') THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name) VALUES (p_user_id, 'bronze', 'Bronze Badge');
    v_new_badges := array_append(v_new_badges, 'Bronze Badge');
  END IF;

  IF v_new_streak >= 7 AND NOT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = 'silver') THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name) VALUES (p_user_id, 'silver', 'Silver Badge');
    v_new_badges := array_append(v_new_badges, 'Silver Badge');
  END IF;

  IF v_new_streak >= 30 AND NOT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = 'gold') THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name) VALUES (p_user_id, 'gold', 'Gold Badge');
    v_new_badges := array_append(v_new_badges, 'Gold Badge');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'current_streak', v_new_streak,
    'best_streak', v_new_best,
    'total_workouts', v_new_total,
    'new_badges', to_jsonb(v_new_badges)
  );
END;
$$;
