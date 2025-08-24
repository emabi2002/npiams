import { supabase } from '@/lib/supabase'
import type { Program } from '@/lib/supabase'

// =============================================
// ENHANCED PROGRAM TYPES
// =============================================

export interface ProgramTypeCategory {
  id: string
  category_name: string
  category_code: string
  description?: string
  display_order: number
  is_active: boolean
}

export interface ProgramType {
  id: string
  type_name: string
  type_code: string
  category_id: string
  category_name?: string
  description?: string
  default_duration_months?: number
  min_duration_months?: number
  max_duration_months?: number
  default_credit_hours?: number
  min_credit_hours?: number
  max_credit_hours?: number
  qualification_level?: string
  accreditation_body?: string
  industry_classification?: string[]
  is_system_type: boolean
  is_active: boolean
}

export interface EnhancedProgram {
  id: string
  program_id: string
  program_type_id?: string
  qualification_framework?: string
  nqf_level?: number
  industry_sector?: string
  occupation_codes?: string[]

  // Duration Configuration
  duration_type: string
  duration_value: number
  full_time_duration?: number
  part_time_duration?: number
  flexible_duration: boolean

  // Credit and Assessment Configuration
  total_credit_hours: number
  theory_credit_hours: number
  practical_credit_hours: number
  work_placement_hours: number
  assessment_methods?: string[]
  grading_scale_id?: string

  // Entry Requirements
  entry_requirements?: any
  minimum_age?: number
  maximum_age?: number
  prerequisite_qualifications?: string[]
  english_proficiency_requirements?: string

  // Delivery Configuration
  delivery_modes?: string[]
  campus_locations?: string[]
  intake_periods?: string[]
  class_size_min: number
  class_size_max: number

  // Accreditation and Recognition
  accrediting_body?: string
  accreditation_number?: string
  accreditation_expiry?: string
  recognition_status?: string

  // Pathways and Articulation
  articulation_agreements?: any
  career_pathways?: string[]
  further_study_options?: string[]

  // Financial Configuration
  tuition_fee_domestic?: number
  tuition_fee_international?: number
  materials_fee?: number
  laboratory_fee?: number
  other_fees?: any
  scholarship_available: boolean

  // TVET Specific Fields
  trade_classification?: string
  apprenticeship_available: boolean
  work_integrated_learning: boolean
  industry_partnerships?: string[]
  equipment_requirements?: any

  // Custom Configuration
  custom_fields?: any
  configuration_rules?: any
  validation_rules?: any
}

export interface CertificationType {
  id: string
  certification_name: string
  certification_code: string
  issuing_authority?: string
  description?: string
  validity_period_months?: number
  renewal_required: boolean
  industry_recognition?: string[]
  international_recognition: boolean
  is_active: boolean
}

export interface ProgramCertification {
  id: string
  program_id: string
  certification_type_id: string
  certification_type?: CertificationType
  is_primary_certification: boolean
  requirements?: any
  assessment_criteria?: any
  competency_standards?: string[]
}

export interface CertificationPathway {
  id: string
  pathway_name: string
  pathway_code: string
  description?: string
  from_program_id: string
  to_program_id: string
  from_program_name?: string
  to_program_name?: string
  credit_transfer_hours: number
  exemption_subjects?: string[]
  additional_requirements?: any
  processing_time_weeks?: number
  pathway_type?: string
  is_active: boolean
}

export interface ProgramModule {
  id: string
  program_id: string
  module_code: string
  module_name: string
  module_description?: string
  credit_hours: number
  theory_hours: number
  practical_hours: number
  self_study_hours: number
  prerequisite_modules?: string[]
  delivery_mode?: string
  assessment_weighting?: number
  competency_elements?: string[]
  resources_required?: string[]
  industry_exposure_hours: number
  module_order: number
  is_core: boolean
  is_elective: boolean
}

export interface LearningOutcome {
  id: string
  program_id: string
  outcome_code: string
  outcome_description: string
  outcome_type?: string
  bloom_taxonomy_level?: string
  assessment_methods?: string[]
  industry_relevance?: string
}

export interface IndustryPartner {
  id: string
  partner_name: string
  partner_type?: string
  industry_sector?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  partnership_type?: string
  mou_signed: boolean
  mou_expiry_date?: string
  active_programs?: string[]
  is_active: boolean
}

export interface ProgramIndustryPartnership {
  id: string
  program_id: string
  industry_partner_id: string
  industry_partner?: IndustryPartner
  partnership_details?: any
  placement_capacity?: number
  equipment_support: boolean
  guest_lecturers: boolean
  curriculum_advisory: boolean
  employment_opportunities: boolean
  start_date?: string
  end_date?: string
  is_active: boolean
}

export interface ValidationRule {
  id: string
  rule_name: string
  rule_code: string
  rule_type?: string
  rule_category?: string
  validation_logic: any
  error_message?: string
  warning_message?: string
  applies_to_program_types?: string[]
  is_mandatory: boolean
  is_active: boolean
}

export interface EnhancedProgramWithDetails extends Program {
  enhanced_program?: EnhancedProgram
  program_type?: ProgramType
  certifications?: ProgramCertification[]
  modules?: ProgramModule[]
  learning_outcomes?: LearningOutcome[]
  industry_partnerships?: ProgramIndustryPartnership[]
  incoming_pathways?: CertificationPathway[]
  outgoing_pathways?: CertificationPathway[]
  validation_errors?: string[]
  validation_warnings?: string[]
}

export interface CreateEnhancedProgramData {
  // Basic Program Info
  name: string
  code: string
  description?: string
  department_id: string

  // Enhanced Configuration
  program_type_id?: string
  duration_value: number
  duration_type?: string
  total_credit_hours: number
  theory_credit_hours?: number
  practical_credit_hours?: number
  work_placement_hours?: number

  // Entry and Delivery
  entry_requirements?: any
  delivery_modes?: string[]
  campus_locations?: string[]
  intake_periods?: string[]

  // Financial
  tuition_fee_domestic?: number
  tuition_fee_international?: number
  materials_fee?: number

  // TVET Specific
  qualification_level?: string
  nqf_level?: number
  industry_sector?: string
  apprenticeship_available?: boolean
  work_integrated_learning?: boolean

  // Modules and Outcomes
  modules?: Omit<ProgramModule, 'id' | 'program_id'>[]
  learning_outcomes?: Omit<LearningOutcome, 'id' | 'program_id'>[]
  certifications?: { certification_type_id: string; is_primary_certification: boolean }[]
}

// =============================================
// ENHANCED PROGRAM SERVICE
// =============================================

export class EnhancedProgramService {

  // =============================================
  // PROGRAM TYPE MANAGEMENT
  // =============================================

  /**
   * Get all program type categories
   */
  static async getProgramTypeCategories(): Promise<ProgramTypeCategory[]> {
    try {
      const { data, error } = await supabase
        .from('program_type_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw new Error(`Failed to fetch program type categories: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching program type categories:', error)
      throw new Error(`Failed to fetch program type categories: ${error.message}`)
    }
  }

  /**
   * Get all program types
   */
  static async getProgramTypes(): Promise<ProgramType[]> {
    try {
      const { data, error } = await supabase
        .from('program_types')
        .select(`
          *,
          program_type_categories!inner (
            category_name
          )
        `)
        .eq('is_active', true)
        .order('type_name')

      if (error) throw new Error(`Failed to fetch program types: ${error.message}`)

      return (data || []).map(type => ({
        ...type,
        category_name: type.program_type_categories.category_name
      }))
    } catch (error: any) {
      console.error('Error fetching program types:', error)
      throw new Error(`Failed to fetch program types: ${error.message}`)
    }
  }

  /**
   * Get program types by category
   */
  static async getProgramTypesByCategory(categoryId: string): Promise<ProgramType[]> {
    try {
      const { data, error } = await supabase
        .from('program_types')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('type_name')

      if (error) throw new Error(`Failed to fetch program types by category: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching program types by category:', error)
      throw new Error(`Failed to fetch program types by category: ${error.message}`)
    }
  }

  // =============================================
  // CERTIFICATION MANAGEMENT
  // =============================================

  /**
   * Get all certification types
   */
  static async getCertificationTypes(): Promise<CertificationType[]> {
    try {
      const { data, error } = await supabase
        .from('certification_types')
        .select('*')
        .eq('is_active', true)
        .order('certification_name')

      if (error) throw new Error(`Failed to fetch certification types: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching certification types:', error)
      throw new Error(`Failed to fetch certification types: ${error.message}`)
    }
  }

  /**
   * Get certification pathways for a program
   */
  static async getCertificationPathways(programId: string): Promise<{
    incoming: CertificationPathway[]
    outgoing: CertificationPathway[]
  }> {
    try {
      const [incomingResult, outgoingResult] = await Promise.all([
        // Incoming pathways (other programs leading to this one)
        supabase
          .from('certification_pathways')
          .select(`
            *,
            from_program:programs!certification_pathways_from_program_id_fkey (
              name
            )
          `)
          .eq('to_program_id', programId)
          .eq('is_active', true),

        // Outgoing pathways (this program leading to others)
        supabase
          .from('certification_pathways')
          .select(`
            *,
            to_program:programs!certification_pathways_to_program_id_fkey (
              name
            )
          `)
          .eq('from_program_id', programId)
          .eq('is_active', true)
      ])

      if (incomingResult.error) {
        throw new Error(`Failed to fetch incoming pathways: ${incomingResult.error.message}`)
      }
      if (outgoingResult.error) {
        throw new Error(`Failed to fetch outgoing pathways: ${outgoingResult.error.message}`)
      }

      const incoming = (incomingResult.data || []).map(pathway => ({
        ...pathway,
        from_program_name: pathway.from_program?.name
      }))

      const outgoing = (outgoingResult.data || []).map(pathway => ({
        ...pathway,
        to_program_name: pathway.to_program?.name
      }))

      return { incoming, outgoing }
    } catch (error: any) {
      console.error('Error fetching certification pathways:', error)
      return { incoming: [], outgoing: [] }
    }
  }

  // =============================================
  // VALIDATION MANAGEMENT
  // =============================================

  /**
   * Get validation rules for program types
   */
  static async getValidationRules(programTypes?: string[]): Promise<ValidationRule[]> {
    try {
      let query = supabase
        .from('program_validation_rules')
        .select('*')
        .eq('is_active', true)

      if (programTypes && programTypes.length > 0) {
        query = query.or(`applies_to_program_types.is.null,applies_to_program_types.cs.{${programTypes.join(',')}}`)
      }

      const { data, error } = await query.order('rule_name')

      if (error) throw new Error(`Failed to fetch validation rules: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching validation rules:', error)
      throw new Error(`Failed to fetch validation rules: ${error.message}`)
    }
  }

  /**
   * Validate program data against rules
   */
  static async validateProgramData(
    programData: any,
    programTypeCode?: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const errors: string[] = []
      const warnings: string[] = []

      // Get applicable validation rules
      const rules = await this.getValidationRules(programTypeCode ? [programTypeCode] : undefined)

      for (const rule of rules) {
        const logic = rule.validation_logic
        let isValid = true

        // Simple validation logic implementation
        if (logic.operator && logic.field && logic.value !== undefined) {
          const fieldValue = this.getNestedValue(programData, logic.field)

          switch (logic.operator) {
            case '>=':
              isValid = (fieldValue || 0) >= logic.value
              break
            case '<=':
              isValid = (fieldValue || 0) <= logic.value
              break
            case '>':
              isValid = (fieldValue || 0) > logic.value
              break
            case '<':
              isValid = (fieldValue || 0) < logic.value
              break
            case '==':
              isValid = fieldValue === logic.value
              break
            case '!=':
              isValid = fieldValue !== logic.value
              break
            default:
              continue
          }

          if (!isValid) {
            if (rule.is_mandatory) {
              errors.push(rule.error_message || `Validation failed for ${rule.rule_name}`)
            } else {
              warnings.push(rule.warning_message || `Warning for ${rule.rule_name}`)
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error: any) {
      console.error('Error validating program data:', error)
      return {
        isValid: false,
        errors: ['Validation error occurred'],
        warnings: []
      }
    }
  }

  /**
   * Helper function to get nested object values
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // =============================================
  // ENHANCED PROGRAM CRUD OPERATIONS
  // =============================================

  /**
   * Get all enhanced programs with details
   */
  static async getAllEnhancedPrograms(filters?: {
    department_id?: string
    program_type_id?: string
    nqf_level?: number
    is_active?: boolean
    search?: string
  }): Promise<EnhancedProgramWithDetails[]> {
    try {
      let query = supabase
        .from('programs')
        .select(`
          *,
          enhanced_programs!inner (*),
          program_types!left (
            *,
            program_type_categories!inner (category_name)
          ),
          departments!inner (name, code)
        `)

      // Apply filters
      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id)
      }
      if (filters?.program_type_id) {
        query = query.eq('enhanced_programs.program_type_id', filters.program_type_id)
      }
      if (filters?.nqf_level) {
        query = query.eq('enhanced_programs.nqf_level', filters.nqf_level)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch enhanced programs: ${error.message}`)

      // Enhance with additional details
      const enhancedPrograms = await Promise.all(
        (data || []).map(async (program) => {
          const [certifications, modules, learningOutcomes, industryPartnerships, pathways] = await Promise.all([
            this.getProgramCertifications(program.id),
            this.getProgramModules(program.id),
            this.getLearningOutcomes(program.id),
            this.getProgramIndustryPartnerships(program.id),
            this.getCertificationPathways(program.id)
          ])

          // Validate program data
          const validation = await this.validateProgramData(
            { ...program, ...program.enhanced_programs?.[0] },
            program.program_types?.[0]?.type_code
          )

          return {
            ...program,
            enhanced_program: program.enhanced_programs?.[0] || null,
            program_type: program.program_types?.[0] ? {
              ...program.program_types[0],
              category_name: program.program_types[0].program_type_categories.category_name
            } : null,
            certifications,
            modules,
            learning_outcomes: learningOutcomes,
            industry_partnerships: industryPartnerships,
            incoming_pathways: pathways.incoming,
            outgoing_pathways: pathways.outgoing,
            validation_errors: validation.errors,
            validation_warnings: validation.warnings
          } as EnhancedProgramWithDetails
        })
      )

      return enhancedPrograms
    } catch (error: any) {
      console.error('Error fetching enhanced programs:', error)
      throw new Error(`Failed to fetch enhanced programs: ${error.message}`)
    }
  }

  /**
   * Get enhanced program by ID
   */
  static async getEnhancedProgramById(id: string): Promise<EnhancedProgramWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          enhanced_programs!inner (*),
          program_types!left (
            *,
            program_type_categories!inner (category_name)
          ),
          departments!inner (name, code)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`Failed to fetch enhanced program: ${error.message}`)
      }

      const [certifications, modules, learningOutcomes, industryPartnerships, pathways] = await Promise.all([
        this.getProgramCertifications(id),
        this.getProgramModules(id),
        this.getLearningOutcomes(id),
        this.getProgramIndustryPartnerships(id),
        this.getCertificationPathways(id)
      ])

      // Validate program data
      const validation = await this.validateProgramData(
        { ...data, ...data.enhanced_programs?.[0] },
        data.program_types?.[0]?.type_code
      )

      return {
        ...data,
        enhanced_program: data.enhanced_programs?.[0] || null,
        program_type: data.program_types?.[0] ? {
          ...data.program_types[0],
          category_name: data.program_types[0].program_type_categories.category_name
        } : null,
        certifications,
        modules,
        learning_outcomes: learningOutcomes,
        industry_partnerships: industryPartnerships,
        incoming_pathways: pathways.incoming,
        outgoing_pathways: pathways.outgoing,
        validation_errors: validation.errors,
        validation_warnings: validation.warnings
      } as EnhancedProgramWithDetails
    } catch (error: any) {
      console.error('Error fetching enhanced program:', error)
      throw new Error(`Failed to fetch enhanced program: ${error.message}`)
    }
  }

  /**
   * Create enhanced program
   */
  static async createEnhancedProgram(programData: CreateEnhancedProgramData): Promise<EnhancedProgramWithDetails> {
    try {
      // Validate program data first
      const validation = await this.validateProgramData(programData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Create the basic program
      const { data: newProgram, error: programError } = await supabase
        .from('programs')
        .insert([{
          name: programData.name,
          code: programData.code,
          description: programData.description,
          department_id: programData.department_id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (programError) throw new Error(`Failed to create program: ${programError.message}`)

      // Update the enhanced program details
      const { error: enhancedError } = await supabase
        .from('enhanced_programs')
        .update({
          program_type_id: programData.program_type_id,
          duration_value: programData.duration_value,
          duration_type: programData.duration_type || 'months',
          total_credit_hours: programData.total_credit_hours,
          theory_credit_hours: programData.theory_credit_hours || 0,
          practical_credit_hours: programData.practical_credit_hours || 0,
          work_placement_hours: programData.work_placement_hours || 0,
          entry_requirements: programData.entry_requirements,
          delivery_modes: programData.delivery_modes,
          campus_locations: programData.campus_locations,
          intake_periods: programData.intake_periods,
          tuition_fee_domestic: programData.tuition_fee_domestic,
          tuition_fee_international: programData.tuition_fee_international,
          materials_fee: programData.materials_fee,
          nqf_level: programData.nqf_level,
          industry_sector: programData.industry_sector,
          apprenticeship_available: programData.apprenticeship_available || false,
          work_integrated_learning: programData.work_integrated_learning || false,
          updated_at: new Date().toISOString()
        })
        .eq('program_id', newProgram.id)

      if (enhancedError) throw new Error(`Failed to update enhanced program: ${enhancedError.message}`)

      // Add modules if provided
      if (programData.modules && programData.modules.length > 0) {
        await this.addProgramModules(newProgram.id, programData.modules)
      }

      // Add learning outcomes if provided
      if (programData.learning_outcomes && programData.learning_outcomes.length > 0) {
        await this.addLearningOutcomes(newProgram.id, programData.learning_outcomes)
      }

      // Add certifications if provided
      if (programData.certifications && programData.certifications.length > 0) {
        await this.addProgramCertifications(newProgram.id, programData.certifications)
      }

      // Return the enhanced program
      const enhancedProgram = await this.getEnhancedProgramById(newProgram.id)
      if (!enhancedProgram) throw new Error('Failed to retrieve created program')

      console.log('Enhanced program created successfully:', enhancedProgram.name)
      return enhancedProgram
    } catch (error: any) {
      console.error('Error creating enhanced program:', error)
      throw new Error(`Failed to create enhanced program: ${error.message}`)
    }
  }

  // =============================================
  // PROGRAM MODULES MANAGEMENT
  // =============================================

  /**
   * Get program modules
   */
  static async getProgramModules(programId: string): Promise<ProgramModule[]> {
    try {
      const { data, error } = await supabase
        .from('program_modules')
        .select('*')
        .eq('program_id', programId)
        .order('module_order')

      if (error) throw new Error(`Failed to fetch program modules: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching program modules:', error)
      return []
    }
  }

  /**
   * Add program modules
   */
  static async addProgramModules(
    programId: string,
    modules: Omit<ProgramModule, 'id' | 'program_id'>[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('program_modules')
        .insert(
          modules.map((module, index) => ({
            program_id: programId,
            ...module,
            module_order: module.module_order || index + 1,
            created_at: new Date().toISOString()
          }))
        )

      if (error) throw new Error(`Failed to add program modules: ${error.message}`)
    } catch (error: any) {
      console.error('Error adding program modules:', error)
      throw new Error(`Failed to add program modules: ${error.message}`)
    }
  }

  // =============================================
  // LEARNING OUTCOMES MANAGEMENT
  // =============================================

  /**
   * Get learning outcomes for a program
   */
  static async getLearningOutcomes(programId: string): Promise<LearningOutcome[]> {
    try {
      const { data, error } = await supabase
        .from('learning_outcomes')
        .select('*')
        .eq('program_id', programId)
        .order('outcome_code')

      if (error) throw new Error(`Failed to fetch learning outcomes: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching learning outcomes:', error)
      return []
    }
  }

  /**
   * Add learning outcomes
   */
  static async addLearningOutcomes(
    programId: string,
    outcomes: Omit<LearningOutcome, 'id' | 'program_id'>[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('learning_outcomes')
        .insert(
          outcomes.map(outcome => ({
            program_id: programId,
            ...outcome,
            created_at: new Date().toISOString()
          }))
        )

      if (error) throw new Error(`Failed to add learning outcomes: ${error.message}`)
    } catch (error: any) {
      console.error('Error adding learning outcomes:', error)
      throw new Error(`Failed to add learning outcomes: ${error.message}`)
    }
  }

  // =============================================
  // CERTIFICATION MANAGEMENT
  // =============================================

  /**
   * Get program certifications
   */
  static async getProgramCertifications(programId: string): Promise<ProgramCertification[]> {
    try {
      const { data, error } = await supabase
        .from('program_certifications')
        .select(`
          *,
          certification_types!inner (*)
        `)
        .eq('program_id', programId)

      if (error) throw new Error(`Failed to fetch program certifications: ${error.message}`)

      return (data || []).map(cert => ({
        ...cert,
        certification_type: cert.certification_types
      }))
    } catch (error: any) {
      console.error('Error fetching program certifications:', error)
      return []
    }
  }

  /**
   * Add program certifications
   */
  static async addProgramCertifications(
    programId: string,
    certifications: { certification_type_id: string; is_primary_certification: boolean }[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('program_certifications')
        .insert(
          certifications.map(cert => ({
            program_id: programId,
            certification_type_id: cert.certification_type_id,
            is_primary_certification: cert.is_primary_certification,
            created_at: new Date().toISOString()
          }))
        )

      if (error) throw new Error(`Failed to add program certifications: ${error.message}`)
    } catch (error: any) {
      console.error('Error adding program certifications:', error)
      throw new Error(`Failed to add program certifications: ${error.message}`)
    }
  }

  // =============================================
  // INDUSTRY PARTNERSHIPS
  // =============================================

  /**
   * Get program industry partnerships
   */
  static async getProgramIndustryPartnerships(programId: string): Promise<ProgramIndustryPartnership[]> {
    try {
      const { data, error } = await supabase
        .from('program_industry_partnerships')
        .select(`
          *,
          industry_partners!inner (*)
        `)
        .eq('program_id', programId)
        .eq('is_active', true)

      if (error) throw new Error(`Failed to fetch program industry partnerships: ${error.message}`)

      return (data || []).map(partnership => ({
        ...partnership,
        industry_partner: partnership.industry_partners
      }))
    } catch (error: any) {
      console.error('Error fetching program industry partnerships:', error)
      return []
    }
  }

  // =============================================
  // PROGRAM STATISTICS
  // =============================================

  /**
   * Get enhanced program statistics
   */
  static async getEnhancedProgramStatistics() {
    try {
      const [programTypesResult, certificationsResult, moduleStatsResult] = await Promise.all([
        // Count programs by type
        supabase
          .from('enhanced_programs')
          .select(`
            id,
            program_types!left (type_name)
          `),

        // Count certifications
        supabase
          .from('program_certifications')
          .select('id', { count: 'exact' }),

        // Module statistics
        supabase
          .from('program_modules')
          .select('id, credit_hours', { count: 'exact' })
      ])

      const programsByType: Record<string, number> = {}
      programTypesResult.data?.forEach(program => {
        const typeName = program.program_types?.type_name || 'Unassigned'
        programsByType[typeName] = (programsByType[typeName] || 0) + 1
      })

      return {
        totalPrograms: programTypesResult.data?.length || 0,
        programsByType,
        totalCertifications: certificationsResult.count || 0,
        totalModules: moduleStatsResult.count || 0,
        averageModulesPerProgram: moduleStatsResult.count && programTypesResult.data?.length
          ? Math.round((moduleStatsResult.count / programTypesResult.data.length) * 10) / 10
          : 0
      }
    } catch (error: any) {
      console.error('Error fetching enhanced program statistics:', error)
      return {
        totalPrograms: 0,
        programsByType: {},
        totalCertifications: 0,
        totalModules: 0,
        averageModulesPerProgram: 0
      }
    }
  }

  // =============================================
  // PROGRAM CONFIGURATION UTILITIES
  // =============================================

  /**
   * Get default configuration for program type
   */
  static async getProgramTypeConfiguration(programTypeId: string): Promise<Partial<EnhancedProgram>> {
    try {
      const { data, error } = await supabase
        .from('program_types')
        .select('*')
        .eq('id', programTypeId)
        .single()

      if (error) throw new Error(`Failed to fetch program type: ${error.message}`)

      return {
        duration_value: data.default_duration_months || 12,
        total_credit_hours: data.default_credit_hours || 360,
        theory_credit_hours: Math.round((data.default_credit_hours || 360) * 0.6),
        practical_credit_hours: Math.round((data.default_credit_hours || 360) * 0.3),
        work_placement_hours: Math.round((data.default_credit_hours || 360) * 0.1),
        class_size_min: 1,
        class_size_max: 30,
        flexible_duration: false,
        scholarship_available: false,
        apprenticeship_available: false,
        work_integrated_learning: true
      }
    } catch (error: any) {
      console.error('Error fetching program type configuration:', error)
      return {}
    }
  }
}
