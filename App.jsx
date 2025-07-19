import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { RefreshCw, Users, Building, GitBranch, List } from 'lucide-react'
import MatchingTab from './components/MatchingTab'
import MatchesTab from './components/MatchesTab'
import ProgressionTab from './components/ProgressionTab'
import mockData from './assets/mock-data.json'
import './App.css'

function App() {
  const [data, setData] = useState(mockData)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuickUpdate = () => {
    setIsUpdating(true)
    // Simulate data refresh
    setTimeout(() => {
      setData({ ...mockData })
      setIsUpdating(false)
    }, 1000)
  }

  const addMatch = (applicantId, propertyId) => {
    const newMatch = {
      match_id: `match-${Date.now()}`,
      applicant_id: applicantId,
      property_id: propertyId,
      matched_at: new Date().toISOString(),
      current_stage: 'matched',
      updated_at: new Date().toISOString()
    }

    // Update applicant and property status
    const updatedApplicants = data.applicants.map(app => 
      app.applicant_id === applicantId ? { ...app, status: 'matched' } : app
    )
    const updatedProperties = data.properties.map(prop => 
      prop.property_id === propertyId ? { ...prop, status: 'matched' } : prop
    )

    setData({
      ...data,
      applicants: updatedApplicants,
      properties: updatedProperties,
      manual_matches: [...data.manual_matches, newMatch]
    })

    return newMatch
  }

  const updateMatchStage = (matchId, newStage) => {
    const updatedMatches = data.manual_matches.map(match =>
      match.match_id === matchId 
        ? { ...match, current_stage: newStage, updated_at: new Date().toISOString() }
        : match
    )

    setData({
      ...data,
      manual_matches: updatedMatches
    })
  }

  const removeMatch = (matchId) => {
    const match = data.manual_matches.find(m => m.match_id === matchId)
    if (match) {
      // Update applicant and property status back to active/available
      const updatedApplicants = data.applicants.map(app => 
        app.applicant_id === match.applicant_id ? { ...app, status: 'active' } : app
      )
      const updatedProperties = data.properties.map(prop => 
        prop.property_id === match.property_id ? { ...prop, status: 'available' } : prop
      )

      setData({
        ...data,
        applicants: updatedApplicants,
        properties: updatedProperties,
        manual_matches: data.manual_matches.filter(m => m.match_id !== matchId)
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">London Sole Agent</h1>
              <span className="text-sm text-muted-foreground">Property Matching Platform</span>
            </div>
            <Button 
              onClick={handleQuickUpdate}
              disabled={isUpdating}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Quick Update</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="matching" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matching" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Matching</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Matches</span>
            </TabsTrigger>
            <TabsTrigger value="progression" className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4" />
              <span>Progression</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matching" className="mt-6">
            <MatchingTab 
              data={data}
              onAddMatch={addMatch}
              onQuickUpdate={handleQuickUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <MatchesTab 
              data={data}
              onRemoveMatch={removeMatch}
              onQuickUpdate={handleQuickUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>

          <TabsContent value="progression" className="mt-6">
            <ProgressionTab 
              data={data}
              onUpdateStage={updateMatchStage}
              onQuickUpdate={handleQuickUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

