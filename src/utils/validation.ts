export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validateSprint = (sprint: any): ValidationResult => {
  const errors: ValidationError[] = []

  // Required fields
  if (!sprint.sprint_name?.trim()) {
    errors.push({ field: 'sprint_name', message: 'Sprint name is required' })
  }

  if (!sprint.start_date) {
    errors.push({ field: 'start_date', message: 'Start date is required' })
  }

  if (!sprint.end_date) {
    errors.push({ field: 'end_date', message: 'End date is required' })
  }

  // Date validation
  if (sprint.start_date && sprint.end_date) {
    const startDate = new Date(sprint.start_date)
    const endDate = new Date(sprint.end_date)
    
    if (startDate >= endDate) {
      errors.push({ field: 'end_date', message: 'End date must be after start date' })
    }

    // Check if sprint is not too long (more than 4 weeks)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 28) {
      errors.push({ field: 'end_date', message: 'Sprint duration should not exceed 4 weeks' })
    }
  }

  // Numeric validation
  if (sprint.story_points_committed !== undefined) {
    if (sprint.story_points_committed < 0) {
      errors.push({ field: 'story_points_committed', message: 'Story points committed cannot be negative' })
    }
    if (sprint.story_points_committed > 1000) {
      errors.push({ field: 'story_points_committed', message: 'Story points committed seems too high' })
    }
  }

  if (sprint.story_points_completed !== undefined) {
    if (sprint.story_points_completed < 0) {
      errors.push({ field: 'story_points_completed', message: 'Story points completed cannot be negative' })
    }
    if (sprint.story_points_completed > 1000) {
      errors.push({ field: 'story_points_completed', message: 'Story points completed seems too high' })
    }
  }

  if (sprint.team_size !== undefined) {
    if (sprint.team_size < 1) {
      errors.push({ field: 'team_size', message: 'Team size must be at least 1' })
    }
    if (sprint.team_size > 50) {
      errors.push({ field: 'team_size', message: 'Team size seems too large' })
    }
  }

  if (sprint.blockers !== undefined) {
    if (sprint.blockers < 0) {
      errors.push({ field: 'blockers', message: 'Number of blockers cannot be negative' })
    }
  }

  // Logical validation
  if (sprint.story_points_completed > sprint.story_points_committed) {
    errors.push({ 
      field: 'story_points_completed', 
      message: 'Completed story points cannot exceed committed story points' 
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateUser = (user: any): ValidationResult => {
  const errors: ValidationError[] = []

  if (!user.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' })
  }

  if (!user.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!isValidEmail(user.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  if (user.role && !['admin', 'member', 'viewer'].includes(user.role)) {
    errors.push({ field: 'role', message: 'Invalid role. Must be admin, member, or viewer' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateTeam = (team: any): ValidationResult => {
  const errors: ValidationError[] = []

  if (!team.name?.trim()) {
    errors.push({ field: 'name', message: 'Team name is required' })
  }

  if (team.name && team.name.length < 2) {
    errors.push({ field: 'name', message: 'Team name must be at least 2 characters' })
  }

  if (team.name && team.name.length > 100) {
    errors.push({ field: 'name', message: 'Team name must be less than 100 characters' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateCSVData = (data: any[]): ValidationResult => {
  const errors: ValidationError[] = []

  if (!data || data.length === 0) {
    errors.push({ field: 'data', message: 'No data found in CSV file' })
    return { isValid: false, errors }
  }

  // Check required columns
  const requiredColumns = ['sprint_name', 'start_date', 'end_date', 'story_points_committed', 'story_points_completed', 'team_size']
  const firstRow = data[0]
  const missingColumns = requiredColumns.filter(col => !(col in firstRow))

  if (missingColumns.length > 0) {
    errors.push({ 
      field: 'columns', 
      message: `Missing required columns: ${missingColumns.join(', ')}` 
    })
  }

  // Validate each row
  data.forEach((row, index) => {
    const sprintValidation = validateSprint(row)
    sprintValidation.errors.forEach(error => {
      errors.push({
        field: `row_${index + 1}_${error.field}`,
        message: `Row ${index + 1}: ${error.message}`
      })
    })
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.field}: ${error.message}`).join('\n')
}
