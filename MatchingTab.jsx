import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, Users, Building, Link, CheckCircle } from 'lucide-react'

const MatchingTab = ({ data, onAddMatch, onQuickUpdate, isUpdating }) => {
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [applicantFilter, setApplicantFilter] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('')

  // Filter applicants based on search and availability
  const filteredApplicants = data.applicants.filter(applicant => {
    const matchesFilter = applicant.name.toLowerCase().includes(applicantFilter.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(applicantFilter.toLowerCase())
    return matchesFilter
  })

  // Filter properties based on search and availability
  const filteredProperties = data.properties.filter(property => {
    const matchesFilter = property.address.toLowerCase().includes(propertyFilter.toLowerCase()) ||
                         property.postcode.toLowerCase().includes(propertyFilter.toLowerCase())
    return matchesFilter
  })

  // Check if a match already exists
  const isAlreadyMatched = (applicantId, propertyId) => {
    return data.manual_matches.some(match => 
      match.applicant_id === applicantId && match.property_id === propertyId
    )
  }

  const handleManualMatch = () => {
    if (selectedApplicant && selectedProperty) {
      if (isAlreadyMatched(selectedApplicant.applicant_id, selectedProperty.property_id)) {
        alert('This applicant and property are already matched!')
        return
      }
      
      if (selectedApplicant.status === 'matched') {
        alert('This applicant is already matched to another property!')
        return
      }
      
      if (selectedProperty.status === 'matched') {
        alert('This property is already matched to another applicant!')
        return
      }

      onAddMatch(selectedApplicant.applicant_id, selectedProperty.property_id)
      setSelectedApplicant(null)
      setSelectedProperty(null)
    }
  }

  const canMatch = selectedApplicant && selectedProperty && 
                  selectedApplicant.status === 'active' && 
                  selectedProperty.status === 'available'

  return (
    <div className="space-y-6">
      {/* Match Action Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Selected: {selectedApplicant ? selectedApplicant.name : 'No applicant'} 
                {selectedApplicant && selectedProperty && ' + '}
                {selectedProperty ? selectedProperty.address : selectedApplicant ? '' : 'No property'}
              </div>
            </div>
            <Button 
              onClick={handleManualMatch}
              disabled={!canMatch}
              className="flex items-center space-x-2"
            >
              <Link className="h-4 w-4" />
              <span>Match Manual</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dual Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicants List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Applicants ({filteredApplicants.length})</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                value={applicantFilter}
                onChange={(e) => setApplicantFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredApplicants.map((applicant) => {
                const isSelected = selectedApplicant?.applicant_id === applicant.applicant_id
                const isMatched = applicant.status === 'matched'
                
                return (
                  <div
                    key={applicant.applicant_id}
                    onClick={() => !isMatched && setSelectedApplicant(applicant)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' 
                        : isMatched
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{applicant.name}</span>
                          {isMatched && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {applicant.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Budget: £{applicant.budget_min} - £{applicant.budget_max} | {applicant.bedrooms} bed
                        </div>
                      </div>
                      <Badge variant={isMatched ? 'secondary' : 'default'}>
                        {applicant.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Properties ({filteredProperties.length})</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProperties.map((property) => {
                const isSelected = selectedProperty?.property_id === property.property_id
                const isMatched = property.status === 'matched'
                
                return (
                  <div
                    key={property.property_id}
                    onClick={() => !isMatched && setSelectedProperty(property)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' 
                        : isMatched
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{property.address}</span>
                          {isMatched && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.postcode} | {property.property_type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          £{property.rent}/month | {property.bedrooms} bed | {property.landlord_name}
                        </div>
                      </div>
                      <Badge variant={isMatched ? 'secondary' : 'default'}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MatchingTab

