import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { RefreshCw, Users, Building, GitBranch, List, Download, Upload, Database } from 'lucide-react'
import MatchingTab from './components/MatchingTab'
import MatchesTab from './components/MatchesTab'
import ProgressionTab from './components/ProgressionTab'
import ApplicantFormModal from './components/ApplicantFormModal'
import ApplicantDetailModal from './components/ApplicantDetailModal'
import mockData from './assets/mock-data.json'
import { saveData, loadData, exportDataAsCSV, getStorageInfo } from './utils/storage'
import './App.css'

function App() {
  const [data, setData] = useState(mockData)
  const [isUpdating, setIsUpdating] = useState(false)
  const [storageInfo, setStorageInfo] = useState({ hasData: false })
  const [activeTab, setActiveTab] = useState('matching')
  const [highlightedMatch, setHighlightedMatch] = useState(null)
  
  // Modal states
  const [isApplicantFormOpen, setIsApplicantFormOpen] = useState(false)
  const [isApplicantDetailOpen, setIsApplicantDetailOpen] = useState(false)
  const [selectedApplicantForDetail, setSelectedApplicantForDetail] = useState(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadData()
    if (savedData) {
      setData(savedData)
      console.log('Loaded data from localStorage')
    }
    setStorageInfo(getStorageInfo())
  }, [])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (data !== mockData) { // Don't save initial mock data
      const success = saveData(data)
      if (success) {
        setStorageInfo(getStorageInfo())
      }
    }
  }, [data])

  const handleQuickUpdate = () => {
    setIsUpdating(true)
    // Simulate data refresh with conflict detection
    setTimeout(() => {
      // Simulate random conflict (10% chance)
      if (Math.random() < 0.1) {
        alert('⚠️ Data conflict detected! Some changes may have been made by another user. Please review and resolve conflicts.')
      }
      
      // For MVP, we'll just refresh the current data
      setData({ ...data })
      setIsUpdating(false)
    }, 1000)
  }

  const handleExportCSV = () => {
    const success = exportDataAsCSV(data)
    if (success) {
      alert('✅ Data exported successfully!')
    } else {
      alert('❌ Failed to export data. Please try again.')
    }
  }

  const handleImportCSV = () => {
    // For MVP, simulate CSV import
    alert('📁 CSV Import feature coming soon! This will allow you to upload and replace current data with CSV files.')
  }

  const addMatch = (applicantId, propertyId) => {
    const newMatch = {
      match_id: `match-${Date.now()}`,
      applicant_id: applicantId,
      property_id: propertyId,
      matched_at: new Date().toISOString(),
      current_stage: 'matched',
      applicant_stage: 'matched',
      property_stage: 'matched',
      checklist: {
        matched: { task1: false, task2: false, task3: false },
        viewing: { task1: false, task2: false, task3: false },
        offer: { task1: false, task2: false, task3: false },
        let_agreed: { task1: false, task2: false, task3: false },
        completed: { task1: false, task2: false, task3: false }
      },
      notes: '',
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

  const updateMatchStage = (matchId, newStage, laneType = 'both') => {
    const updatedMatches = data.manual_matches.map(match => {
      if (match.match_id === matchId) {
        const updatedMatch = { ...match, updated_at: new Date().toISOString() }
        
        if (laneType === 'applicant') {
          updatedMatch.applicant_stage = newStage
        } else if (laneType === 'property') {
          updatedMatch.property_stage = newStage
        } else {
          // Both lanes move together (legacy behavior)
          updatedMatch.current_stage = newStage
          updatedMatch.applicant_stage = newStage
          updatedMatch.property_stage = newStage
        }
        
        return updatedMatch
      }
      return match
    })

    setData({
      ...data,
      manual_matches: updatedMatches
    })
  }

  const archiveMatch = (matchId) => {
    const match = data.manual_matches.find(m => m.match_id === matchId)
    if (match) {
      // Update applicant and property status back to active/available
      const updatedApplicants = data.applicants.map(app => 
        app.applicant_id === match.applicant_id ? { ...app, status: 'active' } : app
      )
      const updatedProperties = data.properties.map(prop => 
        prop.property_id === match.property_id ? { ...prop, status: 'available' } : prop
      )

      // Add to archived matches (for future phases)
      const archivedMatch = {
        ...match,
        archived_at: new Date().toISOString(),
        final_stage: 'completed'
      }

      setData({
        ...data,
        applicants: updatedApplicants,
        properties: updatedProperties,
        manual_matches: data.manual_matches.filter(m => m.match_id !== matchId),
        archived_matches: [...(data.archived_matches || []), archivedMatch]
      })
    }
  }

  const addApplicant = () => {
    setIsApplicantFormOpen(true)
  }

  const handleApplicantFormSubmit = (applicantData) => {
    setData({
      ...data,
      applicants: [...data.applicants, applicantData]
    })
    console.log('New applicant added:', applicantData)
  }

  const addProperty = () => {
    // For MVP, we'll add a placeholder property
    const newProperty = {
      property_id: `prop-${Date.now()}`,
      name: "New Property",
      address: "New Property Address",
      postcode: "SW1A 1AA",
      bedrooms: 2,
      rent: 1500,
      property_type: "Flat",
      landlord_name: "New Landlord",
      eligibility_cases: ["Working professionals"],
      property_url: "https://example.com/property/new",
      status: "available",
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    setData({
      ...data,
      properties: [...data.properties, newProperty]
    })
  }

  const removeApplicant = (applicantId) => {
    // Check if applicant is in any matches
    const hasMatches = data.manual_matches.some(match => match.applicant_id === applicantId)
    if (hasMatches) {
      alert('Cannot remove applicant with active matches. Please remove matches first.')
      return
    }

    setData({
      ...data,
      applicants: data.applicants.filter(app => app.applicant_id !== applicantId)
    })
  }

  const removeProperty = (propertyId) => {
    // Check if property is in any matches
    const hasMatches = data.manual_matches.some(match => match.property_id === propertyId)
    if (hasMatches) {
      alert('Cannot remove property with active matches. Please remove matches first.')
      return
    }

    setData({
      ...data,
      properties: data.properties.filter(prop => prop.property_id !== propertyId)
    })
  }

  const updateMatch = (matchId, updates) => {
    const updatedMatches = data.manual_matches.map(match =>
      match.match_id === matchId 
        ? { ...match, ...updates, updated_at: new Date().toISOString() }
        : match
    )

    setData({
      ...data,
      manual_matches: updatedMatches
    })
  }

  const goToProgression = (matchId) => {
    setHighlightedMatch(matchId)
    setActiveTab('progression')
    // Clear highlight after a few seconds
    setTimeout(() => setHighlightedMatch(null), 3000)
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

  const handleViewApplicantDetails = (applicant) => {
    setSelectedApplicantForDetail(applicant)
    setIsApplicantDetailOpen(true)
  }

  const handleEditApplicant = (applicant) => {
    // For MVP, show alert - full edit functionality would be in Phase 2
    alert('Edit functionality coming soon! This will allow you to modify applicant details using the same comprehensive form.')
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
              {storageInfo.hasData && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Database className="h-3 w-3" />
                  <span>Saved: {storageInfo.lastSaved ? new Date(storageInfo.lastSaved).toLocaleTimeString() : 'Never'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
              </Button>
              <Button 
                onClick={handleImportCSV}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Upload className="h-3 w-3" />
                <span>Import</span>
              </Button>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              onAddApplicant={addApplicant}
              onAddProperty={addProperty}
              onRemoveApplicant={removeApplicant}
              onRemoveProperty={removeProperty}
              onQuickUpdate={handleQuickUpdate}
              isUpdating={isUpdating}
              onViewApplicantDetails={handleViewApplicantDetails}
            />
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <MatchesTab 
              data={data}
              onRemoveMatch={removeMatch}
              onGoToProgression={goToProgression}
              onQuickUpdate={handleQuickUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>

          <TabsContent value="progression" className="mt-6">
            <ProgressionTab 
              data={data}
              onUpdateStage={updateMatchStage}
              onArchiveMatch={archiveMatch}
              onUpdateMatch={updateMatch}
              highlightedMatch={highlightedMatch}
              onQuickUpdate={handleQuickUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ApplicantFormModal
        isOpen={isApplicantFormOpen}
        onClose={() => setIsApplicantFormOpen(false)}
        onSubmit={handleApplicantFormSubmit}
        properties={data.properties}
      />

      <ApplicantDetailModal
        isOpen={isApplicantDetailOpen}
        onClose={() => {
          setIsApplicantDetailOpen(false)
          setSelectedApplicantForDetail(null)
        }}
        applicant={selectedApplicantForDetail}
        properties={data.properties}
        onEdit={handleEditApplicant}
      />
    </div>
  )
}

export default App

