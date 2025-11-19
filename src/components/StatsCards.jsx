import './StatsCards.css'

function StatsCards({ players, viewMode, tournaments }) {
  const totalPlayers = players.length
  const totalMatches = players.reduce((sum, p) => sum + p.matches, 0)
  const topScorer = players.reduce((max, p) => 
    p.goalsFor > max.goalsFor ? p : max
  , players[0])
  const bestWinRate = players
    .filter(p => p.matches >= 3)
    .reduce((max, p) => 
      parseFloat(p.winRate) > parseFloat(max.winRate) ? p : max
    , players[0])

  const cards = viewMode === 'overall' ? [
    {
      title: 'Total Players',
      value: totalPlayers,
      icon: '👥',
      color: 'primary'
    },
    {
      title: 'Tournaments',
      value: tournaments?.length || 0,
      icon: '📅',
      color: 'secondary'
    },
    {
      title: 'Top Scorer',
      value: topScorer?.name,
      subtitle: `${topScorer?.goalsFor} goals`,
      icon: '⚽',
      color: 'success'
    },
    {
      title: 'Best PPG',
      value: players[0]?.name,
      subtitle: `${players[0]?.pointsPerGame} PPG`,
      icon: '🏆',
      color: 'warning'
    }
  ] : [
    {
      title: 'Total Players',
      value: totalPlayers,
      icon: '👥',
      color: 'primary'
    },
    {
      title: 'Total Matches',
      value: totalMatches,
      icon: '🎯',
      color: 'secondary'
    },
    {
      title: 'Top Scorer',
      value: topScorer?.name,
      subtitle: `${topScorer?.goalsFor} goals`,
      icon: '⚽',
      color: 'success'
    },
    {
      title: 'Best Win Rate',
      value: bestWinRate?.name,
      subtitle: `${bestWinRate?.winRate}%`,
      icon: '🏆',
      color: 'warning'
    }
  ]

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className={`stat-card ${card.color}`}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-content">
            <div className="stat-title">{card.title}</div>
            <div className="stat-value">{card.value}</div>
            {card.subtitle && (
              <div className="stat-subtitle">{card.subtitle}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards

