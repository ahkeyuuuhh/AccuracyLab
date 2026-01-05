export default function Profile() {
  return (
    <div className="page-container">
      <h1 className="page-title">PROFILE</h1>
      <div className="page-content">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <h2>Player Name</h2>
            <p className="level">Level 25 • Elite Rank</p>
          </div>
        </div>
        
        <div className="profile-stats-grid">
          <div className="stat-card">
            <h3>15,240</h3>
            <p>Total Score</p>
          </div>
          <div className="stat-card">
            <h3>96.5%</h3>
            <p>Avg Accuracy</p>
          </div>
          <div className="stat-card">
            <h3>156</h3>
            <p>Games Played</p>
          </div>
          <div className="stat-card">
            <h3>42</h3>
            <p>Win Streak</p>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span>🎯 Completed Quick Match</span>
              <span className="time">2 hours ago</span>
            </div>
            <div className="activity-item">
              <span>🏆 Unlocked "Speed Demon" achievement</span>
              <span className="time">5 hours ago</span>
            </div>
            <div className="activity-item">
              <span>💰 Purchased Premium Theme Pack</span>
              <span className="time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
