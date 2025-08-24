import { supabase } from '@/lib/supabase'

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DropdownOption {
  id: string
  dropdown_type: string
  option_key: string
  option_label: string
  option_value?: string
  sort_order: number
  is_active: boolean
}

export interface ProgramType {
  id: string
  code: string
  name: string
  description?: string
  default_lecturing_days: number
  default_staff_service_days: number
  is_active: boolean
}

export class SystemConfigService {

  // ==================== SYSTEM SETTINGS ====================

  /**
   * Get all system settings
   */
  static async getAllSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching system settings:', error)
      throw new Error(`Failed to fetch system settings: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Get specific system setting
   */
  static async getSetting(settingKey: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value, setting_type')
        .eq('setting_key', settingKey)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Setting not found
          return null
        }
        throw error
      }

      const value = data.setting_value
      if (data.setting_type === 'boolean') {
        return value === 'true' ? 'true' : 'false'
      } else if (data.setting_type === 'number') {
        return value
      } else if (data.setting_type === 'json') {
        return value
      }

      return value
    } catch (error: any) {
      console.error(`Error fetching setting ${settingKey}:`, error)
      return null
    }
  }

  /**
   * Set system setting
   */
  static async setSetting(settingKey: string, settingValue: string, settingType: 'string' | 'number' | 'boolean' | 'json' = 'string', description?: string, category: string = 'general'): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert([{
          setting_key: settingKey,
          setting_value: settingValue,
          setting_type: settingType,
          description,
          category,
          is_active: true,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'setting_key'
        })

      if (error) throw error
    } catch (error: any) {
      console.error(`Error setting ${settingKey}:`, error)
      throw new Error(`Failed to set system setting: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Get institution name from settings
   */
  static async getInstitutionName(): Promise<string> {
    const name = await this.getSetting('institution_name')
    return name || 'TVET College'
  }

  /**
   * Get current academic year from settings
   */
  static async getCurrentAcademicYearId(): Promise<string | null> {
    return await this.getSetting('current_academic_year')
  }

  /**
   * Get current semester from settings
   */
  static async getCurrentSemesterId(): Promise<string | null> {
    return await this.getSetting('current_semester')
  }

  // ==================== DROPDOWN OPTIONS ====================

  /**
   * Get dropdown options for a specific type
   */
  static async getDropdownOptions(dropdownType: string): Promise<DropdownOption[]> {
    try {
      const { data, error } = await supabase
        .from('dropdown_options')
        .select('*')
        .eq('dropdown_type', dropdownType)
        .eq('is_active', true)
        .order('sort_order')
        .order('option_label')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error(`Error fetching dropdown options for ${dropdownType}:`, error)
      // Return fallback options based on type
      return this.getFallbackDropdownOptions(dropdownType)
    }
  }

  /**
   * Add dropdown option
   */
  static async addDropdownOption(dropdownType: string, optionKey: string, optionLabel: string, optionValue?: string, sortOrder: number = 0): Promise<void> {
    try {
      const { error } = await supabase
        .from('dropdown_options')
        .insert([{
          dropdown_type: dropdownType,
          option_key: optionKey,
          option_label: optionLabel,
          option_value: optionValue || optionKey,
          sort_order: sortOrder,
          is_active: true
        }])

      if (error) throw error
    } catch (error: any) {
      console.error('Error adding dropdown option:', error)
      throw new Error(`Failed to add dropdown option: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Get assessment types from database
   */
  static async getAssessmentTypes(): Promise<DropdownOption[]> {
    return await this.getDropdownOptions('assessment_types')
  }

  /**
   * Get grade scales from database
   */
  static async getGradeScales(): Promise<DropdownOption[]> {
    return await this.getDropdownOptions('grade_scales')
  }

  /**
   * Get event types from database
   */
  static async getEventTypes(): Promise<DropdownOption[]> {
    return await this.getDropdownOptions('event_types')
  }

  /**
   * Get fee categories from database
   */
  static async getFeeCategories(): Promise<DropdownOption[]> {
    return await this.getDropdownOptions('fee_categories')
  }

  /**
   * Get payment methods from database
   */
  static async getPaymentMethods(): Promise<DropdownOption[]> {
    return await this.getDropdownOptions('payment_methods')
  }

  /**
   * Fallback dropdown options when database is unavailable
   */
  private static getFallbackDropdownOptions(dropdownType: string): DropdownOption[] {
    const fallbacks: Record<string, DropdownOption[]> = {
      assessment_types: [
        { id: '1', dropdown_type: 'assessment_types', option_key: 'assignment', option_label: 'Assignment', option_value: 'assignment', sort_order: 1, is_active: true },
        { id: '2', dropdown_type: 'assessment_types', option_key: 'midterm', option_label: 'Mid-term Exam', option_value: 'midterm', sort_order: 2, is_active: true },
        { id: '3', dropdown_type: 'assessment_types', option_key: 'practical', option_label: 'Practical Assessment', option_value: 'practical', sort_order: 3, is_active: true },
        { id: '4', dropdown_type: 'assessment_types', option_key: 'final', option_label: 'Final Exam', option_value: 'final', sort_order: 4, is_active: true }
      ],
      grade_scales: [
        { id: '1', dropdown_type: 'grade_scales', option_key: 'HD', option_label: 'High Distinction (80-100%)', option_value: 'HD', sort_order: 1, is_active: true },
        { id: '2', dropdown_type: 'grade_scales', option_key: 'D', option_label: 'Distinction (70-79%)', option_value: 'D', sort_order: 2, is_active: true },
        { id: '3', dropdown_type: 'grade_scales', option_key: 'C', option_label: 'Credit (60-69%)', option_value: 'C', sort_order: 3, is_active: true },
        { id: '4', dropdown_type: 'grade_scales', option_key: 'P', option_label: 'Pass (50-59%)', option_value: 'P', sort_order: 4, is_active: true },
        { id: '5', dropdown_type: 'grade_scales', option_key: 'F', option_label: 'Fail (0-49%)', option_value: 'F', sort_order: 5, is_active: true }
      ],
      event_types: [
        { id: '1', dropdown_type: 'event_types', option_key: 'holiday', option_label: 'Holiday', option_value: 'holiday', sort_order: 1, is_active: true },
        { id: '2', dropdown_type: 'event_types', option_key: 'deadline', option_label: 'Deadline', option_value: 'deadline', sort_order: 2, is_active: true },
        { id: '3', dropdown_type: 'event_types', option_key: 'exam', option_label: 'Examination', option_value: 'exam', sort_order: 3, is_active: true },
        { id: '4', dropdown_type: 'event_types', option_key: 'registration', option_label: 'Registration', option_value: 'registration', sort_order: 4, is_active: true }
      ],
      fee_categories: [
        { id: '1', dropdown_type: 'fee_categories', option_key: 'tuition', option_label: 'Tuition', option_value: 'tuition', sort_order: 1, is_active: true },
        { id: '2', dropdown_type: 'fee_categories', option_key: 'registration', option_label: 'Registration', option_value: 'registration', sort_order: 2, is_active: true },
        { id: '3', dropdown_type: 'fee_categories', option_key: 'materials', option_label: 'Materials', option_value: 'materials', sort_order: 3, is_active: true },
        { id: '4', dropdown_type: 'fee_categories', option_key: 'accommodation', option_label: 'Accommodation', option_value: 'accommodation', sort_order: 4, is_active: true }
      ],
      payment_methods: [
        { id: '1', dropdown_type: 'payment_methods', option_key: 'cash', option_label: 'Cash', option_value: 'cash', sort_order: 1, is_active: true },
        { id: '2', dropdown_type: 'payment_methods', option_key: 'bank_transfer', option_label: 'Bank Transfer', option_value: 'bank_transfer', sort_order: 2, is_active: true },
        { id: '3', dropdown_type: 'payment_methods', option_key: 'eftpos', option_label: 'EFTPOS', option_value: 'eftpos', sort_order: 3, is_active: true },
        { id: '4', dropdown_type: 'payment_methods', option_key: 'cheque', option_label: 'Cheque', option_value: 'cheque', sort_order: 4, is_active: true }
      ]
    }

    return fallbacks[dropdownType] || []
  }

  // ==================== PROGRAM TYPES ====================

  /**
   * Get all program types
   */
  static async getProgramTypes(): Promise<ProgramType[]> {
    try {
      const { data, error } = await supabase
        .from('program_types')
        .select('*')
        .eq('is_active', true)
        .order('code')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching program types:', error)
      // Return fallback program types
      return [
        {
          id: '1',
          code: 'NCV',
          name: 'National Certificate Vocational',
          description: 'National Certificate Vocational Program',
          default_lecturing_days: 182,
          default_staff_service_days: 210,
          is_active: true
        },
        {
          id: '2',
          code: 'NC(V)',
          name: 'NC(V)',
          description: 'NC(V) Program',
          default_lecturing_days: 180,
          default_staff_service_days: 210,
          is_active: true
        },
        {
          id: '3',
          code: 'Report191',
          name: 'Report 191',
          description: 'Report 191 Program',
          default_lecturing_days: 185,
          default_staff_service_days: 215,
          is_active: true
        }
      ]
    }
  }

  /**
   * Get default program type
   */
  static async getDefaultProgramType(): Promise<string> {
    const defaultType = await this.getSetting('default_program_type')
    return defaultType || 'NCV'
  }

  // ==================== FEATURE FLAGS ====================

  /**
   * Check if hostel management is enabled
   */
  static async isHostelManagementEnabled(): Promise<boolean> {
    const enabled = await this.getSetting('enable_hostel_management')
    return enabled === 'true'
  }

  /**
   * Check if fee management is enabled
   */
  static async isFeeManagementEnabled(): Promise<boolean> {
    const enabled = await this.getSetting('enable_fee_management')
    return enabled === 'true'
  }

  // ==================== VALIDATION ====================

  /**
   * Validate assessment type
   */
  static async isValidAssessmentType(assessmentType: string): Promise<boolean> {
    const types = await this.getAssessmentTypes()
    return types.some(type => type.option_key === assessmentType || type.option_value === assessmentType)
  }

  /**
   * Validate grade scale
   */
  static async isValidGradeScale(gradeScale: string): Promise<boolean> {
    const scales = await this.getGradeScales()
    return scales.some(scale => scale.option_key === gradeScale || scale.option_value === gradeScale)
  }

  /**
   * Validate program type
   */
  static async isValidProgramType(programTypeCode: string): Promise<boolean> {
    const types = await this.getProgramTypes()
    return types.some(type => type.code === programTypeCode)
  }
}
