import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, Users, Building, Link, CheckCircle, ChevronUp, ChevronDown, Plus, Trash2, Eye, Phone, Mail, MapPin, Calendar, DollarSign, Briefcase, Home, Clock } from 'lucide-react'

const MatchingTab = ({ 
  data, 
  onAddMatch, 
  onAddApplicant, 
  onAddProperty, 
  onRemoveApplicant, 
  onRemoveProperty, 
  onQuickUpdate, 
  isUpdating,
  onViewApplicantDetails 
}) => {
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [applicantFilter, setApplicantFilter] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('')
  const [applicantSort, setApplicantSort] = useState({ field: 'name', direction: 'asc' })
  const [propertySort, setPropertySort] = useState({ field: 'address', direction: 'asc' })

  // Helper function to get property name by ID
  const getPropertyName = (propertyId) => {
    const property = data.properties.find(p => p.property_id === propertyId)
    return property ? property.name : 'Unknown Property'
  }

  // Helper function to calculate total household size
  const getTotalHouseholdSize = (applicant) => {
    const adults = 1 + (applicant.is_couple ? 1 : 0) + (applicant.other_adults || 0)
    const children = applicant.total_children || 0
    return adults + children
  }

  // Sort function
  const sortData = (data, sortConfig) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.field]
      let bValue = b[sortConfig.field]
      
      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  // Handle sort click
  const handleSort = (field, type) => {
    if (type === 'applicant') {
      const direction = applicantSort.field === field && applicantSort.direction === 'asc' ? 'desc' : 'asc'
      setApplicantSort({ field, direction })
    } else {
      const direction = propertySort.field === field && propertySort.direction === 'asc' ? 'desc' : 'asc'
      setPropertySort({ field, direction })
    }
  }

  // Filter and sort applicants
  const filteredApplicants = data.applicants.filter(applicant => {
    const searchTerm = applicantFilter.toLowerCase()
    const matchesFilter = applicant.name.toLowerCase().includes(searchTerm) ||
                         applicant.email.toLowerCase().includes(searchTerm) ||
                         applicant.phone.toLowerCase().includes(searchTerm) ||
                         (applicant.preferred_areas && applicant.preferred_areas.join(' ').toLowerCase().includes(searchTerm)) ||
                         (applicant.notes && applicant.notes.toLowerCase().includes(searchTerm))
    return matchesFilter
  })
  const sortedApplicants = sortData(filteredApplicants, applicantSort)

  // Filter and sort properties
  const filteredProperties = data.properties.filter(property => {
    const matchesFilter = property.address.toLowerCase().includes(propertyFilter.toLowerCase()) ||
                         property.postcode.toLowerCase().includes(propertyFilter.toLowerCase()) ||
                         property.name.toLowerCase().includes(propertyFilter.toLowerCase())
    return matchesFilter
  })
  const sortedProperties = sortData(filteredProperties, propertySort)

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

  const handleRemoveApplicant = (applicantId) => {
    if (window.confirm('Are you sure you want to remove this applicant?')) {
      onRemoveApplicant(applicantId)
      if (selectedApplicant?.applicant_id === applicantId) {
        setSelectedApplicant(null)
      }
    }
  }

  const handleRemoveProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to remove this property?')) {
      onRemoveProperty(propertyId)
      if (selectedProperty?.property_id === propertyId) {
        setSelectedProperty(null)
      }
    }
  }

  const handleViewApplicantDetails = (applicant, e) => {
    e.stopPropagation()
    if (onViewApplicantDetails) {
      onViewApplicantDetails(applicant)
    }
  }

  const canMatch = selectedApplicant && selectedProperty && 
                  selectedApplicant.status === 'active' && 
                  selectedProperty.status === 'available'

  const SortHeader = ({ field, currentSort, onSort, children, type }) => {
    const isActive = currentSort.field === field
    const direction = currentSort.direction
    
    return (
      <button
        onClick={() => onSort(field, type)}
        className="flex items-center space-x-1 text-left font-medium text-sm hover:text-primary transition-colors"
      >
        <span>{children}</span>
        {isActive ? (
          direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>
    )
  }

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
          <CardHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Applicants ({sortedApplicants.length})</span>
              </div>
              <Button
                size="sm"
                onClick={() => onAddApplicant && onAddApplicant()}
                className="flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">NEW</Badge>
              </Button>
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
            {/* Sort Options */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <SortHeader field="name" currentSort={applicantSort} onSort={handleSort} type="applicant">
                Name
              </SortHeader>
              <SortHeader field="budget_max" currentSort={applicantSort} onSort={handleSort} type="applicant">
                Budget
              </SortHeader>
              <SortHeader field="monthly_income" currentSort={applicantSort} onSort={handleSort} type="applicant">
                Income
              </SortHeader>
              <SortHeader field="preferred_move_in" currentSort={applicantSort} onSort={handleSort} type="applicant">
                Move-in Date
              </SortHeader>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sortedApplicants.map((applicant) => {
                const isSelected = selectedApplicant?.applicant_id === applicant.applicant_id
                const isMatched = applicant.status === 'matched'
                const totalPeople = getTotalHouseholdSize(applicant)
                
                return (
                  <div
                    key={applicant.applicant_id}
                    onClick={() => !isMatched && setSelectedApplicant(applicant)}
                    onDoubleClick={(e) => handleViewApplicantDetails(applicant, e)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 relative group ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 shadow-md' 
                        : isMatched
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
                    }`}
                  >
                    {/* Header Row - Name and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {applicant.name}
                        </h3>
                        {isMatched && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isMatched ? 'secondary' : 'default'} className="text-sm">
                          {applicant.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleViewApplicantDetails(applicant, e)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Click for full details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isMatched && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveApplicant(applicant.applicant_id)
                            }}
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Property Enquired About */}
                    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Enquired about: {getPropertyName(applicant.enquired_property)}
                        </span>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{applicant.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate" title={applicant.email}>{applicant.email}</span>
                      </div>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-xs text-gray-500 mb-1">Housing Benefits</div>
                        <Badge variant={applicant.housing_benefits ? 'secondary' : 'outline'} className="text-xs">
                          {applicant.housing_benefits ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-xs text-gray-500 mb-1">Household Size</div>
                        <div className="font-semibold">{totalPeople} people</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-xs text-gray-500 mb-1">Employment</div>
                        <div className="text-sm font-medium">{applicant.employment_status}</div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-xs text-green-700 dark:text-green-300">Monthly Income</div>
                          <div className="font-semibold text-green-800 dark:text-green-200">£{applicant.monthly_income}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <Home className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="text-xs text-purple-700 dark:text-purple-300">Budget Range</div>
                          <div className="font-semibold text-purple-800 dark:text-purple-200">£{applicant.budget_min}-{applicant.budget_max}</div>
                        </div>
                      </div>
                    </div>

                    {/* Timing Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Move-in Date</div>
                          <div className="text-sm font-medium">
                            {applicant.preferred_move_in ? new Date(applicant.preferred_move_in).toLocaleDateString() : 'Flexible'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Viewing Availability</div>
                          <div className="text-sm">{applicant.viewing_availability || 'Flexible'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Area Preferences */}
                    {applicant.preferred_areas && applicant.preferred_areas.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500">Preferred Areas</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {applicant.preferred_areas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {applicant.notes && (
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded border-l-4 border-yellow-400">
                        <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">Notes</div>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">{applicant.notes}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Card>
          <CardHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Properties ({sortedProperties.length})</span>
              </div>
              <Button
                size="sm"
                onClick={() => onAddProperty && onAddProperty()}
                className="flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
                <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">NEW</Badge>
              </Button>
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
            {/* Sort Options */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <SortHeader field="address" currentSort={propertySort} onSort={handleSort} type="property">
                Address
              </SortHeader>
              <SortHeader field="rent" currentSort={propertySort} onSort={handleSort} type="property">
                Rent
              </SortHeader>
              <SortHeader field="last_updated" currentSort={propertySort} onSort={handleSort} type="property">
                Updated
              </SortHeader>
              <SortHeader field="status" currentSort={propertySort} onSort={handleSort} type="property">
                Status
              </SortHeader>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedProperties.map((property) => {
                const isSelected = selectedProperty?.property_id === property.property_id
                const isMatched = property.status === 'matched'
                
                return (
                  <div
                    key={property.property_id}
                    onClick={() => !isMatched && setSelectedProperty(property)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 relative group ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 shadow-md' 
                        : isMatched
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg flex items-center space-x-2 mb-2">
                          <span>{property.address}</span>
                          {isMatched && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {property.postcode} | {property.property_type}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                            <div className="text-xs text-green-700 dark:text-green-300">Monthly Rent</div>
                            <div className="font-semibold text-green-800 dark:text-green-200">£{property.rent}</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                            <div className="text-xs text-blue-700 dark:text-blue-300">Bedrooms</div>
                            <div className="font-semibold text-blue-800 dark:text-blue-200">{property.bedrooms}</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded">
                            <div className="text-xs text-purple-700 dark:text-purple-300">Landlord</div>
                            <div className="font-semibold text-purple-800 dark:text-purple-200">{property.landlord_name}</div>
                          </div>
                        </div>
                        {property.eligibility_cases && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Eligible Tenants</div>
                            <div className="flex flex-wrap gap-1">
                              {property.eligibility_cases.map((eligibility, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {eligibility}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center space-y-2 ml-4">
                        <Badge variant={isMatched ? 'secondary' : 'default'} className="text-sm">
                          {property.status}
                        </Badge>
                        {!isMatched && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveProperty(property.property_id)
                            }}
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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

