import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog.jsx'
import { 
  User, 
  Users, 
  CreditCard, 
  Briefcase, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  Home,
  PoundSterling,
  Clock,
  FileText,
  Edit,
  X
} from 'lucide-react'

const ApplicantDetailModal = ({ 
  isOpen, 
  onClose, 
  applicant, 
  properties = [],
  onEdit 
}) => {
  if (!applicant) return null

  // Helper function to get property details
  const getPropertyDetails = (propertyId) => {
    return properties.find(p => p.property_id === propertyId)
  }

  // Helper function to calculate total household size
  const getTotalHouseholdSize = () => {
    const adults = 1 + (applicant.is_couple ? 1 : 0) + (applicant.other_adults || 0)
    const children = applicant.total_children || 0
    return adults + children
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const enquiredProperty = getPropertyDetails(applicant.enquired_property)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Applicant Details: {applicant.name}</span>
            </div>
            <Badge variant={applicant.status === 'matched' ? 'secondary' : 'default'}>
              {applicant.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete applicant information and enquiry details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Applicant Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{applicant.name}</p>
                      <p className="text-sm text-muted-foreground">Age: {applicant.age}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{applicant.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{applicant.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Enquired Property</p>
                      <p className="text-sm text-muted-foreground">
                        {enquiredProperty ? enquiredProperty.name : 'Unknown Property'}
                      </p>
                      {enquiredProperty && (
                        <p className="text-xs text-muted-foreground">{enquiredProperty.address}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Housing Benefits</p>
                      <Badge variant={applicant.housing_benefits ? 'secondary' : 'outline'}>
                        {applicant.housing_benefits ? 'Receiving Benefits' : 'Not Receiving Benefits'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Household Composition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Household Composition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Household Type</p>
                    <Badge variant="outline">
                      {applicant.is_couple ? 'Couple' : 'Single'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium">Total Household Size</p>
                    <p className="text-lg font-semibold text-blue-600">{getTotalHouseholdSize()} people</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Other Adults (16+)</p>
                    <p className="text-sm text-muted-foreground">{applicant.other_adults || 0}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Children Breakdown</p>
                    <div className="text-sm space-y-1">
                      <p>Female children (10-15): {applicant.female_children_10_15 || 0}</p>
                      <p>Male children (10-15): {applicant.male_children_10_15 || 0}</p>
                      <p>Female children (under 10): {applicant.female_children_under_10 || 0}</p>
                      <p>Male children (under 10): {applicant.male_children_under_10 || 0}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Total Children</p>
                    <p className="text-lg font-semibold text-green-600">{applicant.total_children || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Benefits & Council Assistance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span>Benefits & Council Assistance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Employment Status</p>
                    <Badge variant={applicant.anyone_working ? 'default' : 'secondary'}>
                      {applicant.anyone_working ? 'Someone Working' : 'No One Working'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium">Council Assistance</p>
                    <Badge variant={applicant.council_assistance ? 'secondary' : 'outline'}>
                      {applicant.council_assistance ? 'Requiring Assistance' : 'No Assistance Needed'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Special Benefits</p>
                    <div className="space-y-1">
                      {applicant.receives_pip_dla && (
                        <Badge variant="secondary" className="mr-2 mb-1">PIP/DLA</Badge>
                      )}
                      {applicant.receives_carers_allowance && (
                        <Badge variant="secondary" className="mr-2 mb-1">Carer's Allowance</Badge>
                      )}
                      {applicant.receives_lcwra && (
                        <Badge variant="secondary" className="mr-2 mb-1">LCWRA</Badge>
                      )}
                      {!applicant.receives_pip_dla && !applicant.receives_carers_allowance && !applicant.receives_lcwra && (
                        <p className="text-sm text-muted-foreground">No special benefits</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Financial & Employment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-orange-600" />
                <span>Financial & Employment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Monthly Income</p>
                      <p className="text-lg font-semibold text-green-600">£{applicant.monthly_income}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Employment Status</p>
                      <Badge variant="outline">{applicant.employment_status}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Guarantor Available</p>
                    <Badge variant={applicant.can_provide_guarantor ? 'default' : 'secondary'}>
                      {applicant.can_provide_guarantor ? 'Can Provide Guarantor' : 'No Guarantor Available'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium">Credit History</p>
                    <Badge variant={applicant.credit_issues ? 'destructive' : 'default'}>
                      {applicant.credit_issues ? 'Has Credit Issues' : 'No Known Issues'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Preferences & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>Preferences & Availability</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Budget Range</p>
                      <p className="text-lg font-semibold text-blue-600">
                        £{applicant.budget_min} - £{applicant.budget_max}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Preferred Move-in Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(applicant.preferred_move_in)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Preferred Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {applicant.preferred_areas && applicant.preferred_areas.length > 0 ? (
                      applicant.preferred_areas.map((area, index) => (
                        <Badge key={index} variant="outline">{area}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific area preference</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Viewing Availability</p>
                    <p className="text-sm text-muted-foreground">
                      {applicant.viewing_availability || 'Flexible'}
                    </p>
                  </div>
                </div>
                
                {applicant.notes && (
                  <div className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="font-medium">Additional Notes</p>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {applicant.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span>Application Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">{formatDate(applicant.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{formatDate(applicant.last_updated)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          <div className="flex space-x-2">
            {onEdit && (
              <Button onClick={() => onEdit(applicant)} className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Details</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ApplicantDetailModal

