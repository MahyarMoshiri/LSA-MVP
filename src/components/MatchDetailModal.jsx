import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, CheckCircle, Circle, Users, Building, Calendar, FileText, Plus, Trash2 } from 'lucide-react'

const MatchDetailModal = ({ match, onClose, onUpdateMatch, onUpdateChecklist, onUpdateNotes }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(match.notes || '')

  const stages = [
    { id: 'matched', name: 'Matched', color: '#3B82F6' },
    { id: 'viewing', name: 'Viewing', color: '#F59E0B' },
    { id: 'offer', name: 'Offer', color: '#8B5CF6' },
    { id: 'let_agreed', name: 'Let Agreed', color: '#10B981' },
    { id: 'completed', name: 'Completed', color: '#6B7280' }
  ]

  const defaultTasks = {
    matched: [
      'Initial contact made with applicant',
      'Property details sent to applicant',
      'Landlord notified of potential match'
    ],
    viewing: [
      'Viewing appointment scheduled',
      'Property keys arranged',
      'Viewing completed and feedback received'
    ],
    offer: [
      'Offer submitted to landlord',
      'References requested from applicant',
      'Offer negotiation in progress'
    ],
    let_agreed: [
      'Offer accepted by landlord',
      'Tenancy agreement prepared',
      'Deposit and first month rent collected'
    ],
    completed: [
      'Keys handed over to tenant',
      'Inventory completed and signed',
      'Move-in process completed'
    ]
  }

  const handleTaskToggle = (stageId, taskIndex) => {
    const currentChecklist = match.checklist || {}
    const stageChecklist = currentChecklist[stageId] || {}
    const updatedChecklist = {
      ...currentChecklist,
      [stageId]: {
        ...stageChecklist,
        [`task${taskIndex + 1}`]: !stageChecklist[`task${taskIndex + 1}`]
      }
    }
    onUpdateChecklist(match.match_id, updatedChecklist)
  }

  const handleSaveNotes = () => {
    onUpdateNotes(match.match_id, notes)
    setEditingNotes(false)
  }

  const getTaskStatus = (stageId, taskIndex) => {
    const checklist = match.checklist || {}
    const stageChecklist = checklist[stageId] || {}
    return stageChecklist[`task${taskIndex + 1}`] || false
  }

  const getStageProgress = (stageId) => {
    const tasks = defaultTasks[stageId] || []
    const completedTasks = tasks.filter((_, index) => getTaskStatus(stageId, index)).length
    return { completed: completedTasks, total: tasks.length }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">{match.applicant.name}</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-500" />
              <span className="font-semibold">{match.property.address}</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">NEW</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {['overview', 'checklists', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Match Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Match Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Applicant Details</h4>
                      <div className="mt-2 space-y-1">
                        <p><strong>Name:</strong> {match.applicant.name}</p>
                        <p><strong>Email:</strong> {match.applicant.email}</p>
                        <p><strong>Budget:</strong> £{match.applicant.budget_min} - £{match.applicant.budget_max}</p>
                        <p><strong>Bedrooms:</strong> {match.applicant.bedrooms}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Property Details</h4>
                      <div className="mt-2 space-y-1">
                        <p><strong>Address:</strong> {match.property.address}</p>
                        <p><strong>Rent:</strong> £{match.property.rent}/month</p>
                        <p><strong>Bedrooms:</strong> {match.property.bedrooms}</p>
                        <p><strong>Landlord:</strong> {match.property.landlord_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p><strong>Matched:</strong> {new Date(match.matched_at).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(match.updated_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Stage Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Stage Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stages.map((stage) => {
                      const progress = getStageProgress(stage.id)
                      const isApplicantStage = match.applicant_stage === stage.id
                      const isPropertyStage = match.property_stage === stage.id
                      
                      return (
                        <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                            <span className="font-medium">{stage.name}</span>
                            {(isApplicantStage || isPropertyStage) && (
                              <div className="flex space-x-1">
                                {isApplicantStage && <Badge variant="outline" className="text-xs">Applicant</Badge>}
                                {isPropertyStage && <Badge variant="outline" className="text-xs">Property</Badge>}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {progress.completed}/{progress.total} tasks
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'checklists' && (
            <div className="space-y-6">
              {stages.map((stage) => {
                const tasks = defaultTasks[stage.id] || []
                const progress = getStageProgress(stage.id)
                
                return (
                  <Card key={stage.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span>{stage.name}</span>
                        </div>
                        <Badge variant="secondary">
                          {progress.completed}/{progress.total}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tasks.map((task, index) => {
                          const isCompleted = getTaskStatus(stage.id, index)
                          
                          return (
                            <div 
                              key={index}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                              onClick={() => handleTaskToggle(stage.id, index)}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                {task}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {activeTab === 'notes' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Match Notes</span>
                  </div>
                  {!editingNotes && (
                    <Button size="sm" onClick={() => setEditingNotes(true)}>
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingNotes ? (
                  <div className="space-y-4">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this match..."
                      className="w-full h-32 p-3 border rounded-lg resize-none"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveNotes}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setNotes(match.notes || '')
                          setEditingNotes(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[100px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {match.notes ? (
                      <p className="whitespace-pre-wrap">{match.notes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No notes added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-6 border-t bg-gray-50 dark:bg-gray-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MatchDetailModal

