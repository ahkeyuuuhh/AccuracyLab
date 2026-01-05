export default function Achievements() {
  const achievements = [
    { title: 'First Steps', description: 'Complete your first game', unlocked: true, icon: '🎯' },
    { title: 'Accuracy Master', description: 'Achieve 95% accuracy in a game', unlocked: true, icon: '🎖️' },
    { title: 'Speed Demon', description: 'Complete 100 targets in under 60 seconds', unlocked: true, icon: '⚡' },
    { title: 'Perfect Shot', description: 'Get 100% accuracy in a game', unlocked: false, icon: '💯' },
    { title: 'Marathon Runner', description: 'Play for 5 hours total', unlocked: false, icon: '🏃' },
    { title: 'Social Butterfly', description: 'Play 10 multiplayer games', unlocked: false, icon: '🦋' },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">ACHIEVEMENTS</h1>
      <div className="page-content">
        <div className="achievements-stats">
          <div className="stat-box">
            <h3>3/6</h3>
            <p>Unlocked</p>
          </div>
          <div className="stat-box">
            <h3>50%</h3>
            <p>Completion</p>
          </div>
        </div>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">{achievement.icon}</div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              {achievement.unlocked && <span className="unlocked-badge">✓ Unlocked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
