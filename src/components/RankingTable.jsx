import { useState } from 'react'
import './RankingTable.css'

function RankingTable({ players, viewMode, onPlayerSelect }) {
  const [sortBy, setSortBy] = useState(viewMode === 'tournament' ? 'finalPlace' : 'place')
  const [sortOrder, setSortOrder] = useState('asc')

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder(field === 'place' ? 'asc' : 'desc')
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    // Handle numeric sorting
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    // Handle string sorting
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return 0
  })

  const getMedalEmoji = (place) => {
    if (place === 1) return '🥇'
    if (place === 2) return '🥈'
    if (place === 3) return '🥉'
    return place
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="sort-icon">↕️</span>
    return sortOrder === 'asc' 
      ? <span className="sort-icon active">↑</span>
      : <span className="sort-icon active">↓</span>
  }

  return (
    <div className="ranking-table-container">
      <div className="table-header">
        <h2>{viewMode === 'overall' ? 'Overall Rankings' : 'Player Rankings'}</h2>
        <p className="table-subtitle">
          {viewMode === 'overall' 
            ? `Showing ${players.length} players across all tournaments`
            : `Showing ${players.length} players`
          }
        </p>
      </div>

      <div className="table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th onClick={() => handleSort(viewMode === 'tournament' ? 'finalPlace' : 'place')} className="sortable">
                {viewMode === 'tournament' ? 'Final' : 'Rank'} <SortIcon field={viewMode === 'tournament' ? 'finalPlace' : 'place'} />
              </th>
              <th onClick={() => handleSort('name')} className="sortable name-col">
                Player <SortIcon field="name" />
              </th>
              {viewMode === 'overall' && (
                <>
                  <th onClick={() => handleSort('seasonPoints')} className="sortable season-points-col" title="Season Points - Championship points based on tournament placements">
                    Season Points <SortIcon field="seasonPoints" />
                  </th>
                  <th onClick={() => handleSort('trueSkill')} className="sortable" title="TrueSkill Rating - A skill-based ranking system">
                    TrueSkill <SortIcon field="trueSkill" />
                  </th>
                  <th onClick={() => handleSort('tournaments')} className="sortable">
                    Tournaments <SortIcon field="tournaments" />
                  </th>
                  <th onClick={() => handleSort('bestPlace')} className="sortable">
                    Best Place <SortIcon field="bestPlace" />
                  </th>
                  <th onClick={() => handleSort('avgPlace')} className="sortable">
                    Avg Place <SortIcon field="avgPlace" />
                  </th>
                </>
              )}
              {viewMode === 'tournament' && (
                <>
                  <th onClick={() => handleSort('qualifyingPlace')} className="sortable">
                    Qualifying <SortIcon field="qualifyingPlace" />
                  </th>
                  <th onClick={() => handleSort('eliminationPlace')} className="sortable">
                    Knockout <SortIcon field="eliminationPlace" />
                  </th>
                </>
              )}
              <th onClick={() => handleSort('matches')} className="sortable">
                Matches <SortIcon field="matches" />
              </th>
              <th onClick={() => handleSort('points')} className="sortable">
                Points <SortIcon field="points" />
              </th>
              <th onClick={() => handleSort('won')} className="sortable">
                Won <SortIcon field="won" />
              </th>
              <th onClick={() => handleSort('lost')} className="sortable">
                Lost <SortIcon field="lost" />
              </th>
              <th onClick={() => handleSort('winRate')} className="sortable">
                Win % <SortIcon field="winRate" />
              </th>
              <th onClick={() => handleSort('goalsFor')} className="sortable">
                GF <SortIcon field="goalsFor" />
              </th>
              <th onClick={() => handleSort('goalsAgainst')} className="sortable">
                GA <SortIcon field="goalsAgainst" />
              </th>
              <th onClick={() => handleSort('goalDiff')} className="sortable">
                GD <SortIcon field="goalDiff" />
              </th>
              <th onClick={() => handleSort('pointsPerGame')} className="sortable">
                PPG <SortIcon field="pointsPerGame" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              const displayPlace = viewMode === 'tournament' ? player.finalPlace : player.place
              return (
              <tr key={player.id} className={`rank-${displayPlace <= 3 ? displayPlace : ''}`}>
                <td className="rank-cell">
                  <span className="rank-badge">
                    {getMedalEmoji(displayPlace)}
                  </span>
                </td>
                <td className="name-cell">
                  <div className="player-info">
                    <span 
                      className="player-name clickable" 
                      onClick={() => onPlayerSelect && onPlayerSelect(player.name)}
                      title="Click to view player details"
                    >
                      {player.name}
                    </span>
                    {player.external && (
                      <span className="player-license">
                        {player.external.nationalLicence}
                      </span>
                    )}
                  </div>
                </td>
                {viewMode === 'overall' && (
                  <>
                    <td className="season-points-cell">
                      <span className="season-points-value" title={`Season Points: ${player.seasonPoints}`}>
                        {player.seasonPoints}
                      </span>
                    </td>
                    <td className="trueskill-cell">
                      <span className="trueskill-rating" title={`TrueSkill: ${player.trueSkill.toFixed(1)}`}>
                        {player.trueSkill.toFixed(1)}
                      </span>
                    </td>
                    <td>{player.tournaments}</td>
                    <td>
                      <span className="best-place">
                        {getMedalEmoji(player.bestPlace)}
                      </span>
                    </td>
                    <td>{player.avgPlace}</td>
                  </>
                )}
                {viewMode === 'tournament' && (
                  <>
                    <td>{getMedalEmoji(player.qualifyingPlace)}</td>
                    <td>{player.eliminationPlace !== null ? getMedalEmoji(player.eliminationPlace) : '-'}</td>
                  </>
                )}
                <td>{player.matches}</td>
                <td className="points-cell">
                  <strong>{player.points}</strong>
                </td>
                <td className="positive">{player.won}</td>
                <td className="negative">{player.lost}</td>
                <td>
                  <span className={`win-rate ${
                    parseFloat(player.winRate) >= 60 ? 'high' :
                    parseFloat(player.winRate) >= 40 ? 'medium' : 'low'
                  }`}>
                    {player.winRate}%
                  </span>
                </td>
                <td>{player.goalsFor}</td>
                <td>{player.goalsAgainst}</td>
                <td className={player.goalDiff >= 0 ? 'positive' : 'negative'}>
                  {player.goalDiff >= 0 ? '+' : ''}{player.goalDiff}
                </td>
                <td>{typeof player.pointsPerGame === 'number' 
                  ? player.pointsPerGame.toFixed(2) 
                  : player.pointsPerGame}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RankingTable

