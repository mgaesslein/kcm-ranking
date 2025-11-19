import './EliminationBracket.css'

function EliminationBracket({ eliminationData }) {
  if (!eliminationData || eliminationData.length === 0) {
    return null
  }

  const renderMatch = (match) => {
    if (!match || !match.team1 || !match.team2) return null

    const team1Won = match.result && match.result[0] > match.result[1]
    const team2Won = match.result && match.result[1] > match.result[0]

    return (
      <div key={match._id} className="match-card">
        <div className={`team ${team1Won ? 'winner' : ''}`}>
          <span className="team-name">{match.team1.name}</span>
          {match.result && <span className="score">{match.result[0]}</span>}
        </div>
        <div className={`team ${team2Won ? 'winner' : ''}`}>
          <span className="team-name">{match.team2.name}</span>
          {match.result && <span className="score">{match.result[1]}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="elimination-bracket">
      <div className="bracket-header">
        <h2>🏆 Knockout Stage</h2>
        <p className="bracket-subtitle">Finals and Playoffs</p>
      </div>

      {eliminationData.map((elimination) => (
        <div key={elimination._id} className="elimination-section">
          <h3 className="elimination-title">{elimination.name}</h3>

          <div className="bracket-container">
            {/* Render levels (rounds) */}
            {elimination.levels && elimination.levels.map((level) => (
              <div key={level._id} className="bracket-round">
                <div className="round-title">{level.name}</div>
                <div className="matches">
                  {level.matches && level.matches.map(renderMatch)}
                </div>
              </div>
            ))}

            {/* Render third place match if exists */}
            {elimination.third && elimination.third.matches && (
              <div className="bracket-round third-place">
                <div className="round-title">{elimination.third.name}</div>
                <div className="matches">
                  {elimination.third.matches.map(renderMatch)}
                </div>
              </div>
            )}
          </div>

          {/* Display final standings */}
          {elimination.standings && elimination.standings.length > 0 && (
            <div className="elimination-standings">
              <h4>Final Results</h4>
              <div className="podium">
                {elimination.standings
                  .filter(player => player.stats.finalResult && player.stats.place <= 4)
                  .sort((a, b) => a.stats.place - b.stats.place)
                  .map((player) => (
                    <div key={player._id} className={`podium-place place-${player.stats.place}`}>
                      <div className="podium-rank">
                        {player.stats.place === 1 && '🥇'}
                        {player.stats.place === 2 && '🥈'}
                        {player.stats.place === 3 && '🥉'}
                        {player.stats.place === 4 && '4th'}
                      </div>
                      <div className="podium-name">{player.name}</div>
                      <div className="podium-stats">
                        {player.stats.won}W - {player.stats.lost}L
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default EliminationBracket

