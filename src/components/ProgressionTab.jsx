import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, Users, Building, ArrowRight, CheckCircle, Archive, Plus, Info } from 'lucide-react'
import MatchDetailModal from './MatchDetailModal'

const ProgressionTab = ({ data, onUpdateStage, onArchiveMatch, onUpdateMatch, highlightedMatch, onQuickUpdate, isUpdating }) => {
  const [filter, setFilter] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)

  // Get enriched matches with applicant and property details
  const enrichedMatches = data.manual_matches.map(match => {
    const applicant = data.applicants.find(app => app.applicant_id === match.applicant_id)
    const property = data.properties.find(prop => prop.property_id === match.property_id)
    
    return {
      ...match,
      applicant,
      property,
      applicant_stage: match.applicant_stage || match.current_stage,
      property_stage: match.property_stage || match.current_stage,
      checklist: match.checklist || {},
      notes: match.notes || ''
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

  // Group matches by stage for both swim lanes
  const applicantMatchesByStage = data.progression_stages.reduce((acc, stage) => {
    acc[stage.stage_id] = filteredMatches.filter(match => match.applicant_stage === stage.stage_id)
    return acc
  }, {})

  const propertyMatchesByStage = data.progression_stages.reduce((acc, stage) => {
    acc[stage.stage_id] = filteredMatches.filter(match => match.property_stage === stage.stage_id)
    return acc
  }, {})

  const handleDragStart = (e, match, laneType) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ match, laneType }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetStage, laneType) => {
    e.preventDefault()
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'))
    const { match, laneType: sourceLaneType } = dragData
    
    if (sourceLaneType === laneType) {
      const currentStage = laneType === 'applicant' ? match.applicant_stage : match.property_stage
      if (currentStage !== targetStage) {
        onUpdateStage(match.match_id, targetStage, laneType)
      }
    }
  }

  const handleArchive = (matchId) => {
    if (window.confirm('Are you sure you want to archive this deal?')) {
      onArchiveMatch(matchId)
    }
  }

  const handleUpdateChecklist = (matchId, checklist) => {
    onUpdateMatch(matchId, { checklist })
  }

  const handleUpdateNotes = (matchId, notes) => {
    onUpdateMatch(matchId, { notes })
  }

  const MatchCard = ({ match, laneType }) => {
    const stage = laneType === 'applicant' ? match.applicant_stage : match.property_stage
    const isCompleted = stage === 'completed'
    const isHighlighted = highlightedMatch === match.match_id
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, match, laneType)}
        className={`bg-white dark:bg-gray-800 border rounded-lg p-3 cursor-move hover:shadow-md transition-all relative group ${
          isCompleted ? 'opacity-75' : ''
        } ${
          isHighlighted ? 'ring-2 ring-blue-500 shadow-lg animate-pulse' : ''
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              {laneType === 'applicant' ? (
                <>
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="font-medium truncate">{match.applicant.name}</span>
                </>
              ) : (
                <>
                  <Building className="h-3 w-3 text-green-500" />
                  <span className="font-medium truncate">{match.property.address}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedMatch(match)
                }}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Info className="h-3 w-3" />
              </Button>
              {isCompleted && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleArchive(match.match_id)
                  }}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {laneType === 'applicant' ? (
              <>
                <div>Budget: £{match.applicant.budget_min}-£{match.applicant.budget_max}</div>
                <div>{match.applicant.email}</div>
              </>
            ) : (
              <>
                <div>£{match.property.rent}/month | {match.property.bedrooms} bed</div>
                <div>{match.property.landlord_name}</div>
              </>
            )}
          </div>

          {/* Stage-specific checklist preview */}
          <div className="text-xs">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Tasks: {Object.values(match.checklist[stage] || {}).filter(Boolean).length}/3</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>Deal Progression - Dual Swim-Lane ({filteredMatches.length} active deals)</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">NEW</Badge>
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

      {/* Dual Swim-Lane Kanban Board */}
      <div className="space-y-6">
        {/* Applicant Swim-Lane */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Applicant Progress</h3>
            <Badge variant="outline">Applicant Side</Badge>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max pb-4">
              {data.progression_stages.map((stage) => (
                <div key={`applicant-${stage.stage_id}`} className="flex-shrink-0 w-80">
                  <Card className="border-blue-200">
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
                          {applicantMatchesByStage[stage.stage_id]?.length || 0}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="space-y-3 min-h-[200px] p-2 border-2 border-dashed border-blue-200 rounded-lg"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.stage_id, 'applicant')}
                      >
                        {applicantMatchesByStage[stage.stage_id]?.map((match) => (
                          <MatchCard key={`applicant-${match.match_id}`} match={match} laneType="applicant" />
                        ))}
                        {(!applicantMatchesByStage[stage.stage_id] || applicantMatchesByStage[stage.stage_id].length === 0) && (
                          <div className="text-center text-muted-foreground text-sm py-8">
                            No applicant tasks in this stage
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property/Landlord Swim-Lane */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Building className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Property/Landlord Progress</h3>
            <Badge variant="outline">Property Side</Badge>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max pb-4">
              {data.progression_stages.map((stage) => (
                <div key={`property-${stage.stage_id}`} className="flex-shrink-0 w-80">
                  <Card className="border-green-200">
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
                          {propertyMatchesByStage[stage.stage_id]?.length || 0}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="space-y-3 min-h-[200px] p-2 border-2 border-dashed border-green-200 rounded-lg"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.stage_id, 'property')}
                      >
                        {propertyMatchesByStage[stage.stage_id]?.map((match) => (
                          <MatchCard key={`property-${match.match_id}`} match={match} laneType="property" />
                        ))}
                        {(!propertyMatchesByStage[stage.stage_id] || propertyMatchesByStage[stage.stage_id].length === 0) && (
                          <div className="text-center text-muted-foreground text-sm py-8">
                            No property tasks in this stage
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <strong>How to use the Dual Swim-Lane Kanban:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Applicant Lane (Blue):</strong> Track applicant-side tasks and progress</li>
              <li><strong>Property Lane (Green):</strong> Track landlord/property-side tasks and progress</li>
              <li><strong>Independent Movement:</strong> Drag cards within each lane to update progress independently</li>
              <li><strong>Archive Deals:</strong> Click the archive icon on completed deals to remove them</li>
              <li><strong>Task Tracking:</strong> Each card shows checklist progress for that stage</li>
              <li><strong>Match Details:</strong> Click the info icon to view detailed checklists and notes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdateMatch={onUpdateMatch}
          onUpdateChecklist={handleUpdateChecklist}
          onUpdateNotes={handleUpdateNotes}
        />
      )}
    </div>
  )
}

export default ProgressionTab

