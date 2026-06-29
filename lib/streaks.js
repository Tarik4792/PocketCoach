export function calculateStreak(workouts) {
  if (!workouts || workouts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const workoutDays = new Set(
    workouts.map((w) => {
      const d = new Date(w.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Start from today, or yesterday if no workout today yet
  let startDay = workoutDays.has(today.getTime()) ? today : yesterday;
  
  // If neither today nor yesterday has a workout, streak is 0
  if (!workoutDays.has(startDay.getTime())) return 0;

  let streak = 0;
  let current = new Date(startDay);

  while (workoutDays.has(current.getTime())) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export function getStreakMessage(streak) {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Great start! Keep it going!';
  if (streak < 5) return `${streak} days strong! 🔥`;
  if (streak < 10) return `You're on fire! 🔥🔥`;
  return `${streak} days! Unstoppable! 🔥🔥🔥`;
}