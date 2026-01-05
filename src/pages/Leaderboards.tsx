export default function Leaderboards() {
  const leaderboardData = [
    { rank: 1, name: 'ProShot99', score: 15240, accuracy: '98.5%' },
    { rank: 2, name: 'AimMaster', score: 14890, accuracy: '97.8%' },
    { rank: 3, name: 'QuickDraw', score: 14320, accuracy: '96.2%' },
    { rank: 4, name: 'Precision', score: 13950, accuracy: '95.9%' },
    { rank: 5, name: 'SnapShot', score: 13670, accuracy: '94.7%' },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">LEADERBOARDS</h1>
      <div className="page-content">
        <div className="leaderboard-filters">
          <button className="btn btn-secondary active">Global</button>
          <button className="btn btn-secondary">Friends</button>
          <button className="btn btn-secondary">Daily</button>
          <button className="btn btn-secondary">Weekly</button>
        </div>
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>Player</span>
            <span>Score</span>
            <span>Accuracy</span>
          </div>
          {leaderboardData.map((player) => (
            <div key={player.rank} className="leaderboard-row">
              <span className="rank">#{player.rank}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.score.toLocaleString()}</span>
              <span className="accuracy">{player.accuracy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
