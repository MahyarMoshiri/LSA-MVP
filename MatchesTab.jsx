import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, X, Users, Building, Calendar, ArrowRight } from 'lucide-react'

const MatchesTab = ({ data, onRemoveMatch, onQuickUpdate, isUpdating }) => {
  const [filter, setFilter] = useState('')

  // Get applicant and property details for each match
  const enrichedMatches = data.manual_matches.map(match => {
    const applicant = data.applicants.find(app => app.applicant_id === match.applicant_id)
    const property = data.properties.find(prop => prop.property_id === match.property_id)
    const stage = data.progression_stages.find(stage => stage.stage_id === match.current_stage)
    
    return {
      ...match,
      applicant,
      property,
      stage
    }
  })

  // Filter matches based on search
  const filteredMatches = enrichedMatches.filter(match => {
    if (!match.applicant || !match.property) return false
    
    const searchTerm = filter.toLowerCase()
    return (
      match.applicant.name.toLowerCase().includes(searchTerm) ||
      match.property.address.toLowerCase().includes(searchTerm) ||
      match.property.postcode.toLowerCase().includes(searchTerm) ||
      match.current_stage.toLowerCase().includes(searchTerm)
    )
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStageColor = (stageId) => {
    const stage = data.progression_stages.find(s => s.stage_id === stageId)
    return stage?.color || '#6B7280'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Active Matches ({filteredMatches.length})</span>
            </div>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches by applicant, property, or stage..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                {filter ? 'No matches found for your search.' : 'No matches created yet. Go to the Matching tab to create your first match.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredMatches.map((match) => (
            <Card key={match.match_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Match Info */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{match.applicant?.name}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{match.property?.address}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Applicant:</strong> {match.applicant?.email}<br />
                        Budget: £{match.applicant?.budget_min} - £{match.applicant?.budget_max}
                      </div>
                      <div>
                        <strong>Property:</strong> {match.property?.postcode}<br />
                        Rent: £{match.property?.rent}/month | {match.property?.bedrooms} bed
                      </div>
                      <div>
                        <strong>Timeline:</strong><br />
                        Matched: {formatDate(match.matched_at)}<br />
                        Updated: {formatDate(match.updated_at)}
                      </div>
                    </div>

                    {/* Stage */}
                    <div className="flex items-center space-x-2">
                      <Badge 
                        style={{ 
                          backgroundColor: getStageColor(match.current_stage),
                          color: 'white'
                        }}
                      >
                        {match.stage?.stage_name || match.current_stage}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveMatch(match.match_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default MatchesTab

