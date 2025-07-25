import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog.jsx'
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Users, 
  CreditCard, 
  Briefcase, 
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ApplicantFormModal = ({ isOpen, onClose, onSubmit, properties = [] }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Section 1: Applicant Information
    enquired_property: '',
    email: '',
    phone: '',
    name: '',
    age: '',
    housing_benefits: false,
    
    // Section 2: Household Composition
    is_couple: false,
    other_adults: 0,
    female_children_10_15: 0,
    male_children_10_15: 0,
    female_children_under_10: 0,
    male_children_under_10: 0,
    total_children: 0,
    
    // Section 3: Benefit Cap & Council Assistance
    anyone_working: false,
    receives_pip_dla: false,
    receives_carers_allowance: false,
    receives_lcwra: false,
    council_assistance: false,
    
    // Section 4: Financial & Employment Details
    monthly_income: '',
    employment_status: '',
    can_provide_guarantor: false,
    credit_issues: false,
    
    // Section 5: Preferences & Availability
    budget_min: '',
    budget_max: '',
    preferred_areas: [],
    notes: '',
    viewing_availability: '',
    preferred_move_in: ''
  })

  const [areaInput, setAreaInput] = useState('')

  const steps = [
    { id: 1, title: 'Applicant Information', icon: User },
    { id: 2, title: 'Household Composition', icon: Users },
    { id: 3, title: 'Benefit Cap & Council Assistance', icon: CreditCard },
    { id: 4, title: 'Financial & Employment Details', icon: Briefcase },
    { id: 5, title: 'Preferences & Availability', icon: MapPin }
  ]

  // Calculate total children automatically
  const updateTotalChildren = (newData) => {
    const total = (newData.female_children_10_15 || 0) + 
                  (newData.male_children_10_15 || 0) + 
                  (newData.female_children_under_10 || 0) + 
                  (newData.male_children_under_10 || 0)
    return { ...newData, total_children: total }
  }

  const updateFormData = (field, value) => {
    let newData = { ...formData, [field]: value }
    
    // Auto-calculate total children when child counts change
    if (field.includes('children')) {
      newData = updateTotalChildren(newData)
    }
    
    setFormData(newData)
  }

  const addArea = () => {
    if (areaInput.trim() && !formData.preferred_areas.includes(areaInput.trim())) {
      updateFormData('preferred_areas', [...formData.preferred_areas, areaInput.trim()])
      setAreaInput('')
    }
  }

  const removeArea = (area) => {
    updateFormData('preferred_areas', formData.preferred_areas.filter(a => a !== area))
  }

  // Helper function to check if field is empty and should show visual indicator
  const getFieldClassName = (value, baseClassName = '') => {
    const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === ''
    const indicatorClass = isEmpty ? 'border-orange-300 bg-orange-50' : 'border-green-300'
    return `${baseClassName} ${indicatorClass}`.trim()
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    // Generate applicant ID
    const applicantId = `app-${Date.now()}`
    
    const applicantData = {
      applicant_id: applicantId,
      ...formData,
      age: parseInt(formData.age) || 0,
      other_adults: parseInt(formData.other_adults) || 0,
      female_children_10_15: parseInt(formData.female_children_10_15) || 0,
      male_children_10_15: parseInt(formData.male_children_10_15) || 0,
      female_children_under_10: parseInt(formData.female_children_under_10) || 0,
      male_children_under_10: parseInt(formData.male_children_under_10) || 0,
      monthly_income: parseInt(formData.monthly_income) || 0,
      budget_min: parseInt(formData.budget_min) || 0,
      budget_max: parseInt(formData.budget_max) || 0,
      status: 'active',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
    
    onSubmit(applicantData)
    
    // Reset form
    setFormData({
      enquired_property: '',
      email: '',
      phone: '',
      name: '',
      age: '',
      housing_benefits: false,
      is_couple: false,
      other_adults: 0,
      female_children_10_15: 0,
      male_children_10_15: 0,
      female_children_under_10: 0,
      male_children_under_10: 0,
      total_children: 0,
      anyone_working: false,
      receives_pip_dla: false,
      receives_carers_allowance: false,
      receives_lcwra: false,
      council_assistance: false,
      monthly_income: '',
      employment_status: '',
      can_provide_guarantor: false,
      credit_issues: false,
      budget_min: '',
      budget_max: '',
      preferred_areas: [],
      notes: '',
      viewing_availability: '',
      preferred_move_in: ''
    })
    setCurrentStep(1)
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold">Section 1: Applicant Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="enquired_property" className="text-base font-medium">Which Property They Enquired about?</Label>
                <Select value={formData.enquired_property} onValueChange={(value) => updateFormData('enquired_property', value)}>
                  <SelectTrigger className={getFieldClassName(formData.enquired_property, 'h-12 text-base')}>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.property_id} value={property.property_id}>
                        {property.name} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={getFieldClassName(formData.email, 'h-12 text-base')}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={getFieldClassName(formData.phone, 'h-12 text-base')}
                  placeholder="07700 900123"
                />
              </div>

              <div>
                <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={getFieldClassName(formData.name, 'h-12 text-base')}
                  placeholder="John Smith"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-base font-medium">Applicant Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  className={getFieldClassName(formData.age, 'h-12 text-base')}
                  placeholder="25"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id="housing_benefits"
                    checked={formData.housing_benefits}
                    onCheckedChange={(checked) => updateFormData('housing_benefits', checked)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="housing_benefits" className="text-base font-medium">Currently receiving Housing Benefit / UC housing element?</Label>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold">Section 2: Household Composition</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="is_couple"
                  checked={formData.is_couple}
                  onCheckedChange={(checked) => updateFormData('is_couple', checked)}
                  className="h-5 w-5"
                />
                <Label htmlFor="is_couple" className="text-base font-medium">Are you applying as a couple?</Label>
              </div>

              <div>
                <Label htmlFor="other_adults" className="text-base font-medium">Number of other single adults (16+) in your household (excluding yourself or partner)</Label>
                <Input
                  id="other_adults"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.other_adults}
                  onChange={(e) => updateFormData('other_adults', e.target.value)}
                  className="w-32 h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="female_children_10_15" className="text-base font-medium">Number of female children aged 10–15</Label>
                  <Input
                    id="female_children_10_15"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.female_children_10_15}
                    onChange={(e) => updateFormData('female_children_10_15', e.target.value)}
                    className="w-32 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="male_children_10_15" className="text-base font-medium">Number of male children aged 10–15</Label>
                  <Input
                    id="male_children_10_15"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.male_children_10_15}
                    onChange={(e) => updateFormData('male_children_10_15', e.target.value)}
                    className="w-32 h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="female_children_under_10" className="text-base font-medium">Number of female children under 10</Label>
                  <Input
                    id="female_children_under_10"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.female_children_under_10}
                    onChange={(e) => updateFormData('female_children_under_10', e.target.value)}
                    className="w-32 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="male_children_under_10" className="text-base font-medium">Number of male children under 10</Label>
                  <Input
                    id="male_children_under_10"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.male_children_under_10}
                    onChange={(e) => updateFormData('male_children_under_10', e.target.value)}
                    className="w-32 h-12 text-base"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-lg font-medium text-blue-800">Total number of children in your household: {formData.total_children}</p>
              </div>
            </div>
          </div>
        )

      case 3:
        const showBenefitQuestions = formData.anyone_working && formData.monthly_income && parseInt(formData.monthly_income) < 846
        
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold">Section 3: Benefit Cap & Council Assistance Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="anyone_working"
                  checked={formData.anyone_working}
                  onCheckedChange={(checked) => updateFormData('anyone_working', checked)}
                  className="h-5 w-5"
                />
                <Label htmlFor="anyone_working" className="text-base font-medium">Is anyone in the household currently working?</Label>
              </div>

              {showBenefitQuestions && (
                <div className="pl-6 space-y-4 border-l-4 border-yellow-400 bg-yellow-50 p-6 rounded">
                  <p className="text-base font-medium text-yellow-800">
                    Since earnings are under £846, please answer the following:
                  </p>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-white">
                    <Checkbox
                      id="receives_pip_dla"
                      checked={formData.receives_pip_dla}
                      onCheckedChange={(checked) => updateFormData('receives_pip_dla', checked)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="receives_pip_dla" className="text-base">
                      Does anyone receive Personal Independence Payment (PIP) / Disability Living Allowance (DLA) / Armed Forces Independence Payment (AFIP)?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-white">
                    <Checkbox
                      id="receives_carers_allowance"
                      checked={formData.receives_carers_allowance}
                      onCheckedChange={(checked) => updateFormData('receives_carers_allowance', checked)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="receives_carers_allowance" className="text-base">
                      Carer's Allowance / Carer Element of Universal Credit?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-white">
                    <Checkbox
                      id="receives_lcwra"
                      checked={formData.receives_lcwra}
                      onCheckedChange={(checked) => updateFormData('receives_lcwra', checked)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="receives_lcwra" className="text-base">
                      Limited Capability for Work and Work-Related Activity (LCWRA) / ESA Support Component?
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="council_assistance"
                  checked={formData.council_assistance}
                  onCheckedChange={(checked) => updateFormData('council_assistance', checked)}
                  className="h-5 w-5"
                />
                <Label htmlFor="council_assistance" className="text-base font-medium">Are you relying on council / housing assistance for rent and deposit in advance?</Label>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <Briefcase className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-semibold">Section 4: Financial & Employment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="monthly_income" className="text-base font-medium">What is your monthly income after tax? (£)</Label>
                <Input
                  id="monthly_income"
                  type="number"
                  min="0"
                  value={formData.monthly_income}
                  onChange={(e) => updateFormData('monthly_income', e.target.value)}
                  className={getFieldClassName(formData.monthly_income, 'h-12 text-base')}
                  placeholder="2500"
                />
              </div>

              <div>
                <Label htmlFor="employment_status" className="text-base font-medium">What is your current employment status?</Label>
                <Select value={formData.employment_status} onValueChange={(value) => updateFormData('employment_status', value)}>
                  <SelectTrigger className={getFieldClassName(formData.employment_status, 'h-12 text-base')}>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id="can_provide_guarantor"
                    checked={formData.can_provide_guarantor}
                    onCheckedChange={(checked) => updateFormData('can_provide_guarantor', checked)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="can_provide_guarantor" className="text-base font-medium">Would you be able to provide a guarantor if required?</Label>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id="credit_issues"
                    checked={formData.credit_issues}
                    onCheckedChange={(checked) => updateFormData('credit_issues', checked)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="credit_issues" className="text-base font-medium">Do you have any known issues with credit or rent arrears?</Label>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-semibold">Section 5: Preferences & Availability</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget_min" className="text-base font-medium">Minimum Budget (£)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    min="0"
                    value={formData.budget_min}
                    onChange={(e) => updateFormData('budget_min', e.target.value)}
                    className={getFieldClassName(formData.budget_min, 'h-12 text-base')}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max" className="text-base font-medium">Maximum Budget (£)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    min="0"
                    value={formData.budget_max}
                    onChange={(e) => updateFormData('budget_max', e.target.value)}
                    className={getFieldClassName(formData.budget_max, 'h-12 text-base')}
                    placeholder="1500"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Preferred neighbourhood(s) in London?</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    placeholder="e.g., Camden, Hackney, Islington"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                    className="h-12 text-base"
                  />
                  <Button type="button" onClick={addArea} size="lg">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.preferred_areas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer text-base py-2 px-3" onClick={() => removeArea(area)}>
                      {area} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-base font-medium">Notes (free text area for special requirements, disability, pets, etc.)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Any special requirements, pets, accessibility needs, etc."
                  rows={4}
                  className="text-base"
                />
              </div>

              <div>
                <Label htmlFor="viewing_availability" className="text-base font-medium">Availability for viewing (Date/time options or free text)</Label>
                <Input
                  id="viewing_availability"
                  value={formData.viewing_availability}
                  onChange={(e) => updateFormData('viewing_availability', e.target.value)}
                  placeholder="e.g., Weekends preferred, after 6pm weekdays"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="preferred_move_in" className="text-base font-medium">Preferred move-in date</Label>
                <Input
                  id="preferred_move_in"
                  type="date"
                  value={formData.preferred_move_in}
                  onChange={(e) => updateFormData('preferred_move_in', e.target.value)}
                  className={getFieldClassName(formData.preferred_move_in, 'h-12 text-base')}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <User className="h-6 w-6" />
            <span>Add New Applicant</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Complete all sections to add a new applicant to the system. Fields with orange borders indicate missing information.
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'border-blue-500 text-blue-500' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="min-h-[500px] p-2">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <DialogFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 h-12 px-6 text-base"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="h-12 px-6 text-base">
              Cancel
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={nextStep} className="flex items-center space-x-2 h-12 px-6 text-base">
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex items-center space-x-2 h-12 px-6 text-base">
                <CheckCircle className="h-5 w-5" />
                <span>Submit Application</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ApplicantFormModal

