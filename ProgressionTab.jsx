import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, Users, Building, ArrowRight } from 'lucide-react'

const ProgressionTab = ({ data, onUpdateStage, onQuickUpdate, isUpdating }) => {
  const [filter, setFilter] = useState('')

  // Get enriched matches with applicant and property details
  const enrichedMatches = data.manual_matches.map(match => {
    const applicant = data.applicants.find(app => app.applicant_id === match.applicant_id)
    const property = data.properties.find(prop => prop.property_id === match.property_id)
    
    return {
      ...match,
      applicant,
      property
    }
  }).filter(match => match.applicant && match.property)

  // Filter matches based on search
  const filteredMatches = enrichedMatches.filter(match => {
    const searchTerm = filter.toLowerCase()
    return (
      match.applicant.name.toLowerCase().includes(searchTerm) ||
      match.property.address.toLowerCase().includes(searchTerm) ||
      match.property.postcode.toLowerCase().includes(searchTerm)
    )
  })

  // Group matches by stage
  const matchesByStage = data.progression_stages.reduce((acc, stage) => {
    acc[stage.stage_id] = filteredMatches.filter(match => match.current_stage === stage.stage_id)
    return acc
  }, {})

  const handleDragStart = (e, match) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(match))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetStage) => {
    e.preventDefault()
    const matchData = JSON.parse(e.dataTransfer.getData('text/plain'))
    
    if (matchData.current_stage !== targetStage) {
      onUpdateStage(matchData.match_id, targetStage)
    }
  }

  const MatchCard = ({ match }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, match)}
      className="bg-white dark:bg-gray-800 border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <Users className="h-3 w-3 text-blue-500" />
          <span className="font-medium truncate">{match.applicant.name}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Building className="h-3 w-3 text-green-500" />
          <span className="truncate">{match.property.address}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          £{match.property.rent}/month | {match.property.bedrooms} bed
        </div>
        <div className="text-xs text-muted-foreground">
          Budget: £{match.applicant.budget_min}-£{match.applicant.budget_max}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>Deal Progression ({filteredMatches.length} active deals)</span>
            </div>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals by applicant or property..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {data.progression_stages.map((stage) => (
            <div key={stage.stage_id} className="flex-shrink-0 w-80">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span>{stage.stage_name}</span>
                    </div>
                    <Badge variant="secondary">
                      {matchesByStage[stage.stage_id]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="space-y-3 min-h-[200px] p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.stage_id)}
                  >
                    {matchesByStage[stage.stage_id]?.map((match) => (
                      <MatchCard key={match.match_id} match={match} />
                    ))}
                    {(!matchesByStage[stage.stage_id] || matchesByStage[stage.stage_id].length === 0) && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        No deals in this stage
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <strong>How to use:</strong> Drag and drop deal cards between stages to update their progression. 
            Each card shows the applicant and property details for easy identification.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgressionTab

