// Storage utility for persistent data management
const STORAGE_KEY = 'london-sole-agent-data'

export const saveData = (data) => {
  try {
    const dataToSave = {
      ...data,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    return true
  } catch (error) {
    console.error('Failed to save data to localStorage:', error)
    return false
  }
}

export const loadData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      return JSON.parse(savedData)
    }
    return null
  } catch (error) {
    console.error('Failed to load data from localStorage:', error)
    return null
  }
}

export const clearData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error)
    return false
  }
}

export const exportDataAsCSV = (data) => {
  try {
    // Export applicants
    const applicantHeaders = ['ID', 'Name', 'Email', 'Phone', 'Budget Min', 'Budget Max', 'Bedrooms', 'Employment', 'Status', 'Created', 'Updated']
    const applicantRows = data.applicants.map(app => [
      app.applicant_id,
      app.name,
      app.email,
      app.phone,
      app.budget_min,
      app.budget_max,
      app.bedrooms,
      app.employment_status,
      app.status,
      app.created_at,
      app.last_updated
    ])

    // Export properties
    const propertyHeaders = ['ID', 'Address', 'Postcode', 'Bedrooms', 'Rent', 'Type', 'Landlord', 'Status', 'Created', 'Updated']
    const propertyRows = data.properties.map(prop => [
      prop.property_id,
      prop.address,
      prop.postcode,
      prop.bedrooms,
      prop.rent,
      prop.property_type,
      prop.landlord_name,
      prop.status,
      prop.created_at,
      prop.last_updated
    ])

    // Export matches
    const matchHeaders = ['ID', 'Applicant ID', 'Property ID', 'Matched At', 'Current Stage', 'Applicant Stage', 'Property Stage', 'Notes', 'Updated']
    const matchRows = data.manual_matches.map(match => [
      match.match_id,
      match.applicant_id,
      match.property_id,
      match.matched_at,
      match.current_stage,
      match.applicant_stage || match.current_stage,
      match.property_stage || match.current_stage,
      match.notes || '',
      match.updated_at
    ])

    // Create CSV content
    const applicantCSV = [applicantHeaders, ...applicantRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const propertyCSV = [propertyHeaders, ...propertyRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const matchCSV = [matchHeaders, ...matchRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const fullCSV = `APPLICANTS\n${applicantCSV}\n\nPROPERTIES\n${propertyCSV}\n\nMATCHES\n${matchCSV}`

    // Create download
    const blob = new Blob([fullCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `london-sole-agent-data-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Failed to export data as CSV:', error)
    return false
  }
}

export const getStorageInfo = () => {
  try {
    const savedData = loadData()
    if (savedData) {
      return {
        hasData: true,
        lastSaved: savedData.lastSaved,
        applicantCount: savedData.applicants?.length || 0,
        propertyCount: savedData.properties?.length || 0,
        matchCount: savedData.manual_matches?.length || 0
      }
    }
    return { hasData: false }
  } catch (error) {
    console.error('Failed to get storage info:', error)
    return { hasData: false, error: error.message }
  }
}

