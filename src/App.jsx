import { useState, useEffect } from 'react'
import TournamentSelector from './components/TournamentSelector'
import RankingTable from './components/RankingTable'
import StatsCards from './components/StatsCards'
import ViewToggle from './components/ViewToggle'
import EliminationBracket from './components/EliminationBracket'
import PlayerDetail from './components/PlayerDetail'
import { calculateTrueSkillRatings, getConservativeRating } from './utils/trueskill'
import { normalizePlayerName } from './config/playerAliases'
import './App.css'

function App() {
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [players, setPlayers] = useState([])
  const [aggregatedPlayers, setAggregatedPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('tournament') // 'tournament' or 'overall'
  const [selectedPlayer, setSelectedPlayer] = useState(null) // For individual player view
  const [playerHistory, setPlayerHistory] = useState(new Map()) // TrueSkill history per player

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      setLoading(true)
      
      // Use Vite's glob import to automatically load all JSON files
      const tournamentModules = import.meta.glob('../dummy_data/*.json')
      
      const loadedTournaments = await Promise.all(
        Object.entries(tournamentModules).map(async ([path, importFn]) => {
          try {
            const module = await importFn()
            const data = module.default
            const fileName = path.split('/').pop()
            
            return {
              id: data._id,
              name: data.name,
              date: data.createdAt,
              fileName: fileName,
              data: data
            }
          } catch (error) {
            console.warn(`Error loading ${path}:`, error)
            return null
          }
        })
      )

      // Filter out any failed loads and sort by date (most recent first)
      const validTournaments = loadedTournaments
        .filter(t => t !== null)
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      console.log(`Loaded ${validTournaments.length} tournaments`)
      
      setTournaments(validTournaments)
      if (validTournaments.length > 0) {
        setSelectedTournament(validTournaments[0])
        processPlayers(validTournaments[0].data)
        processAggregatedPlayers(validTournaments)
      }
    } catch (error) {
      console.error('Error loading tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const processPlayers = (tournamentData) => {
    if (!tournamentData.qualifying || tournamentData.qualifying.length === 0) {
      setPlayers([])
      return
    }

    // Get qualifying standings
    const qualifyingStandings = tournamentData.qualifying[0].standings || []
    
    // Create a map to aggregate stats by player ID
    const playerStatsMap = new Map()
    
    // Process qualifying round
    qualifyingStandings.forEach(player => {
      if (player.deactivated || player.removed) return
      
      const normalizedName = normalizePlayerName(player.name)
      
      playerStatsMap.set(player._id, {
        id: player._id,
        name: normalizedName,
        qualifyingPlace: player.stats.place,
        matches: player.stats.matches,
        points: player.stats.points,
        won: player.stats.won,
        lost: player.stats.lost,
        goalsFor: player.stats.goals,
        goalsAgainst: player.stats.goals_in,
        goalDiff: player.stats.goal_diff,
        pointsPerGame: player.stats.points_per_game,
        correctedPointsPerGame: player.stats.corrected_points_per_game,
        bh1: player.stats.bh1,
        bh2: player.stats.bh2,
        external: player.external,
        eliminationPlace: null
      })
    })
    
    // Process elimination rounds if they exist
    if (tournamentData.eliminations && tournamentData.eliminations.length > 0) {
      tournamentData.eliminations.forEach(elimination => {
        const eliminationStandings = elimination.standings || []
        
        eliminationStandings.forEach(player => {
          if (player.deactivated || player.removed) return
          
          const existingPlayer = playerStatsMap.get(player._id)
          
          if (existingPlayer) {
            // Add elimination stats to existing player
            existingPlayer.matches += player.stats.matches
            existingPlayer.points += player.stats.points
            existingPlayer.won += player.stats.won
            existingPlayer.lost += player.stats.lost
            existingPlayer.goalsFor += player.stats.goals
            existingPlayer.goalsAgainst += player.stats.goals_in
            existingPlayer.goalDiff = existingPlayer.goalsFor - existingPlayer.goalsAgainst
            existingPlayer.eliminationPlace = player.stats.place
            
            // Recalculate points per game
            if (existingPlayer.matches > 0) {
              existingPlayer.pointsPerGame = (existingPlayer.points / existingPlayer.matches).toFixed(2)
            }
          }
        })
      })
    }
    
    // Convert map to array and calculate final stats
    const processedPlayers = Array.from(playerStatsMap.values())
      .map(player => ({
        ...player,
        winRate: player.matches > 0 
          ? ((player.won / player.matches) * 100).toFixed(1)
          : 0,
        // Use elimination place if available, otherwise qualifying place
        finalPlace: player.eliminationPlace !== null ? player.eliminationPlace : player.qualifyingPlace
      }))
      .sort((a, b) => {
        // Sort by final place (elimination > qualifying)
        if (a.eliminationPlace !== null && b.eliminationPlace !== null) {
          return a.eliminationPlace - b.eliminationPlace
        }
        if (a.eliminationPlace !== null) return -1
        if (b.eliminationPlace !== null) return 1
        return a.qualifyingPlace - b.qualifyingPlace
      })

    setPlayers(processedPlayers)
  }

  const processAggregatedPlayers = (loadedTournaments) => {
    const playerStats = new Map()

    // Calculate TrueSkill ratings across all tournaments
    const { playerRatings: trueSkillRatings, playerHistory: history } = calculateTrueSkillRatings(loadedTournaments)
    setPlayerHistory(history) // Store player history for individual player view

    // Aggregate stats from all tournaments
    loadedTournaments.forEach(tournament => {
      if (!tournament.data.qualifying || tournament.data.qualifying.length === 0) return

      const standings = tournament.data.qualifying[0].standings || []
      
      standings.forEach(player => {
        if (player.deactivated || player.removed || player.stats.matches === 0) return

        const normalizedName = normalizePlayerName(player.name)
        const playerId = normalizedName // Use normalized name as key since IDs might differ between tournaments
        
        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            name: normalizedName,
            matches: 0,
            points: 0,
            won: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            tournaments: 0,
            external: player.external,
            bestPlace: player.stats.place,
            places: []
          })
        }

        const stats = playerStats.get(playerId)
        stats.matches += player.stats.matches
        stats.points += player.stats.points
        stats.won += player.stats.won
        stats.lost += player.stats.lost
        stats.goalsFor += player.stats.goals
        stats.goalsAgainst += player.stats.goals_in
        stats.tournaments += 1
        stats.bestPlace = Math.min(stats.bestPlace, player.stats.place)
        stats.places.push(player.stats.place)
      })
    })

    // Convert to array and calculate derived stats
    const aggregated = Array.from(playerStats.values())
      .filter(player => player.matches > 0)
      .map(player => {
        const rating = trueSkillRatings.get(player.name)
        const trueSkill = rating ? getConservativeRating(rating) : 0
        
        return {
          id: player.name,
          name: player.name,
          matches: player.matches,
          points: player.points,
          won: player.won,
          lost: player.lost,
          goalsFor: player.goalsFor,
          goalsAgainst: player.goalsAgainst,
          goalDiff: player.goalsFor - player.goalsAgainst,
          tournaments: player.tournaments,
          bestPlace: player.bestPlace,
          avgPlace: (player.places.reduce((a, b) => a + b, 0) / player.places.length).toFixed(1),
          pointsPerGame: player.matches > 0 ? (player.points / player.matches).toFixed(2) : 0,
          winRate: player.matches > 0 
            ? ((player.won / player.matches) * 100).toFixed(1)
            : 0,
          trueSkill: trueSkill,
          external: player.external
        }
      })
      .sort((a, b) => {
        // Sort by total points, then by matches played, then by win rate
        const pointsDiff = b.points - a.points
        if (pointsDiff !== 0) return pointsDiff
        
        const matchesDiff = b.matches - a.matches
        if (matchesDiff !== 0) return matchesDiff
        
        return parseFloat(b.winRate) - parseFloat(a.winRate)
      })
      .map((player, index) => ({
        ...player,
        place: index + 1
      }))

    setAggregatedPlayers(aggregated)
  }

  const handleTournamentChange = (tournament) => {
    setSelectedTournament(tournament)
    processPlayers(tournament.data)
  }

  const handlePlayerSelect = (playerName) => {
    setSelectedPlayer(playerName)
  }

  const handleBackFromPlayer = () => {
    setSelectedPlayer(null)
  }

  const currentPlayers = viewMode === 'overall' ? aggregatedPlayers : players

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading tournament data...</p>
        </div>
      </div>
    )
  }

  // If a player is selected, show their detail page
  if (selectedPlayer) {
    return (
      <div className="app">
        <header className="header">
          <div className="container">
            <h1 className="title">
              <span className="icon">🏆</span>
              KCM Ranking
            </h1>
            <p className="subtitle">Table Soccer Tournament Rankings</p>
          </div>
        </header>

        <main className="main">
          <div className="container">
            <PlayerDetail 
              playerName={selectedPlayer}
              playerHistory={playerHistory}
              tournaments={tournaments}
              aggregatedPlayers={aggregatedPlayers}
              onBack={handleBackFromPlayer}
            />
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>KC München Table Soccer Rankings</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">
            <span className="icon">🏆</span>
            KCM Ranking
          </h1>
          <p className="subtitle">Table Soccer Tournament Rankings</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <ViewToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode}
          />

          {viewMode === 'tournament' && (
            <TournamentSelector
              tournaments={tournaments}
              selectedTournament={selectedTournament}
              onSelectTournament={handleTournamentChange}
            />
          )}

          {currentPlayers.length > 0 ? (
            <>
              <StatsCards 
                players={currentPlayers}
                viewMode={viewMode}
                tournaments={tournaments}
              />
              <RankingTable 
                players={currentPlayers}
                viewMode={viewMode}
                onPlayerSelect={handlePlayerSelect}
              />
              {viewMode === 'tournament' && selectedTournament && selectedTournament.data.eliminations && (
                <EliminationBracket eliminationData={selectedTournament.data.eliminations} />
              )}
            </>
          ) : (
            <div className="no-data">
              <p>No player data available.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>KC München Table Soccer Rankings</p>
        </div>
      </footer>
    </div>
  )
}

export default App
