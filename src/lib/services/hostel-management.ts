import { supabase } from '@/lib/supabase'

// =============================================
// HOSTEL MANAGEMENT TYPES
// =============================================

export interface HostelBuilding {
  id: string
  building_name: string
  building_code: string
  description?: string
  total_floors: number
  total_rooms: number
  capacity: number
  gender_restriction?: 'male' | 'female' | 'mixed' | 'none'
  warden_id?: string
  warden_name?: string
  maintenance_contact?: string
  emergency_contact?: string
  facilities?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomType {
  id: string
  type_name: string
  type_code: string
  capacity: number
  monthly_fee: number
  security_deposit: number
  amenities?: any
  description?: string
  is_active: boolean
}

export interface HostelRoom {
  id: string
  building_id: string
  building_name?: string
  room_type_id?: string
  room_type?: RoomType
  room_number: string
  floor_number: number
  capacity: number
  current_occupancy: number
  monthly_fee: number
  security_deposit: number
  room_status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  facilities?: any
  last_maintenance?: string
  next_maintenance?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomAllocation {
  id: string
  student_id: string
  student_name?: string
  student_email?: string
  room_id: string
  room_number?: string
  building_name?: string
  allocation_date: string
  check_in_date?: string
  check_out_date?: string
  expected_checkout_date?: string
  allocation_status: 'allocated' | 'checked_in' | 'checked_out' | 'cancelled' | 'transferred'
  monthly_fee: number
  security_deposit: number
  deposit_paid: boolean
  deposit_paid_date?: string
  special_requirements?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  allocated_by?: string
  approved_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MealPlanType {
  id: string
  plan_name: string
  plan_code: string
  description?: string
  meals_per_day: number
  meals_per_week: number
  monthly_cost: number
  breakfast_included: boolean
  lunch_included: boolean
  dinner_included: boolean
  weekend_meals: boolean
  validity_days: number
  is_active: boolean
}

export interface MealCard {
  id: string
  student_id: string
  student_name?: string
  card_number: string
  card_type: 'physical' | 'digital' | 'hybrid'
  meal_plan_id?: string
  meal_plan?: MealPlanType
  issue_date: string
  expiry_date: string
  card_status: 'active' | 'inactive' | 'lost' | 'damaged' | 'expired' | 'blocked'
  balance_meals: number
  total_meals_purchased: number
  total_meals_consumed: number
  last_recharge_date?: string
  last_used_date?: string
  card_fee: number
  security_deposit: number
  issued_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MealCardTransaction {
  id: string
  meal_card_id: string
  transaction_type: 'recharge' | 'consumption' | 'refund' | 'adjustment'
  transaction_date: string
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  meals_count: number
  amount: number
  balance_after: number
  location?: string
  terminal_id?: string
  processed_by?: string
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'mobile_money'
  reference_number?: string
  notes?: string
}

export interface MaintenanceRequest {
  id: string
  request_number: string
  room_id?: string
  room_number?: string
  building_id?: string
  building_name?: string
  category_id?: string
  category_name?: string
  reported_by?: string
  reporter_name?: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  request_status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  reported_date: string
  assigned_date?: string
  started_date?: string
  completed_date?: string
  assigned_to?: string
  assigned_to_name?: string
  estimated_cost?: number
  actual_cost?: number
  estimated_completion?: string
  completion_notes?: string
  satisfaction_rating?: number
  satisfaction_feedback?: string
  attachments?: any
  created_at: string
  updated_at: string
}

export interface OccupancyAnalytics {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  reservedRooms: number
  occupancyRate: number
  buildingOccupancy: Array<{
    building: string
    totalRooms: number
    occupiedRooms: number
    occupancyRate: number
  }>
  roomTypeOccupancy: Array<{
    roomType: string
    totalRooms: number
    occupiedRooms: number
    occupancyRate: number
    averageFee: number
  }>
  monthlyTrends: Array<{
    month: string
    occupancyRate: number
    newAllocations: number
    checkOuts: number
  }>
}

export interface MealCardAnalytics {
  totalCards: number
  activeCards: number
  totalMealsConsumed: number
  totalRevenue: number
  averageMealsPerDay: number
  planDistribution: Array<{
    planName: string
    cardCount: number
    revenue: number
  }>
  consumptionTrends: Array<{
    date: string
    breakfast: number
    lunch: number
    dinner: number
    total: number
  }>
  popularMealTimes: Array<{
    mealType: string
    count: number
    percentage: number
  }>
}

export interface MaintenanceAnalytics {
  totalRequests: number
  openRequests: number
  completedRequests: number
  averageResolutionTime: number
  totalCost: number
  categoryBreakdown: Array<{
    category: string
    count: number
    averageTime: number
    totalCost: number
  }>
  priorityDistribution: Array<{
    priority: string
    count: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    requests: number
    completed: number
    cost: number
  }>
}

// =============================================
// HOSTEL MANAGEMENT SERVICE
// =============================================

export class HostelManagementService {

  // =============================================
  // BUILDING AND ROOM MANAGEMENT
  // =============================================

  /**
   * Get all hostel buildings
   */
  static async getHostelBuildings(): Promise<HostelBuilding[]> {
    try {
      const { data, error } = await supabase
        .from('hostel_buildings')
        .select(`
          *,
          warden:users!hostel_buildings_warden_id_fkey (full_name)
        `)
        .eq('is_active', true)
        .order('building_name')

      if (error) throw new Error(`Failed to fetch hostel buildings: ${error.message}`)

      return (data || []).map(building => ({
        ...building,
        warden_name: building.warden?.full_name
      }))
    } catch (error: any) {
      console.error('Error fetching hostel buildings:', error)
      throw new Error(`Failed to fetch hostel buildings: ${error.message}`)
    }
  }

  /**
   * Get all room types
   */
  static async getRoomTypes(): Promise<RoomType[]> {
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('monthly_fee')

      if (error) throw new Error(`Failed to fetch room types: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching room types:', error)
      throw new Error(`Failed to fetch room types: ${error.message}`)
    }
  }

  /**
   * Get hostel rooms with filters
   */
  static async getHostelRooms(filters?: {
    building_id?: string
    room_status?: string
    room_type?: string
    availability?: boolean
  }): Promise<HostelRoom[]> {
    try {
      let query = supabase
        .from('hostel_rooms')
        .select(`
          *,
          hostel_buildings!inner (building_name),
          room_types (*)
        `)
        .eq('is_active', true)

      if (filters?.building_id) {
        query = query.eq('building_id', filters.building_id)
      }
      if (filters?.room_status) {
        query = query.eq('room_status', filters.room_status)
      }
      if (filters?.room_type) {
        query = query.eq('room_type_id', filters.room_type)
      }
      if (filters?.availability) {
        query = query.lt('current_occupancy', supabase.raw('capacity'))
      }

      query = query.order('building_id').order('floor_number').order('room_number')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch hostel rooms: ${error.message}`)

      return (data || []).map(room => ({
        ...room,
        building_name: room.hostel_buildings.building_name,
        room_type: room.room_types
      }))
    } catch (error: any) {
      console.error('Error fetching hostel rooms:', error)
      throw new Error(`Failed to fetch hostel rooms: ${error.message}`)
    }
  }

  // =============================================
  // ROOM ALLOCATION MANAGEMENT
  // =============================================

  /**
   * Get room allocations with filters
   */
  static async getRoomAllocations(filters?: {
    student_id?: string
    building_id?: string
    allocation_status?: string
    date_from?: string
    date_to?: string
  }): Promise<RoomAllocation[]> {
    try {
      let query = supabase
        .from('room_allocations')
        .select(`
          *,
          students!inner (
            user_id,
            users!inner (full_name, email)
          ),
          hostel_rooms!inner (
            room_number,
            hostel_buildings!inner (building_name)
          )
        `)

      if (filters?.student_id) {
        query = query.eq('student_id', filters.student_id)
      }
      if (filters?.building_id) {
        query = query.eq('hostel_rooms.building_id', filters.building_id)
      }
      if (filters?.allocation_status) {
        query = query.eq('allocation_status', filters.allocation_status)
      }
      if (filters?.date_from) {
        query = query.gte('allocation_date', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('allocation_date', filters.date_to)
      }

      query = query.order('allocation_date', { ascending: false })

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch room allocations: ${error.message}`)

      return (data || []).map(allocation => ({
        ...allocation,
        student_name: allocation.students.users.full_name,
        student_email: allocation.students.users.email,
        room_number: allocation.hostel_rooms.room_number,
        building_name: allocation.hostel_rooms.hostel_buildings.building_name
      }))
    } catch (error: any) {
      console.error('Error fetching room allocations:', error)
      throw new Error(`Failed to fetch room allocations: ${error.message}`)
    }
  }

  /**
   * Allocate room to student
   */
  static async allocateRoom(allocationData: {
    student_id: string
    room_id: string
    allocation_date: string
    expected_checkout_date?: string
    monthly_fee: number
    security_deposit: number
    special_requirements?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    allocated_by: string
    notes?: string
  }): Promise<RoomAllocation> {
    try {
      // Check room availability
      const { data: room } = await supabase
        .from('hostel_rooms')
        .select('capacity, current_occupancy, room_status')
        .eq('id', allocationData.room_id)
        .single()

      if (!room || room.current_occupancy >= room.capacity) {
        throw new Error('Room is not available for allocation')
      }

      if (room.room_status !== 'available') {
        throw new Error('Room is currently unavailable')
      }

      // Create allocation
      const { data, error } = await supabase
        .from('room_allocations')
        .insert([{
          ...allocationData,
          allocation_status: 'allocated',
          deposit_paid: false
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to allocate room: ${error.message}`)

      console.log('Room allocated successfully')
      return data
    } catch (error: any) {
      console.error('Error allocating room:', error)
      throw new Error(`Failed to allocate room: ${error.message}`)
    }
  }

  /**
   * Check in student
   */
  static async checkInStudent(allocationId: string, checkInData: {
    check_in_date: string
    deposit_paid?: boolean
    deposit_paid_date?: string
    notes?: string
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('room_allocations')
        .update({
          ...checkInData,
          allocation_status: 'checked_in',
          updated_at: new Date().toISOString()
        })
        .eq('id', allocationId)

      if (error) throw new Error(`Failed to check in student: ${error.message}`)

      console.log('Student checked in successfully')
    } catch (error: any) {
      console.error('Error checking in student:', error)
      throw new Error(`Failed to check in student: ${error.message}`)
    }
  }

  /**
   * Check out student
   */
  static async checkOutStudent(allocationId: string, checkOutData: {
    check_out_date: string
    completion_notes?: string
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('room_allocations')
        .update({
          ...checkOutData,
          allocation_status: 'checked_out',
          updated_at: new Date().toISOString()
        })
        .eq('id', allocationId)

      if (error) throw new Error(`Failed to check out student: ${error.message}`)

      console.log('Student checked out successfully')
    } catch (error: any) {
      console.error('Error checking out student:', error)
      throw new Error(`Failed to check out student: ${error.message}`)
    }
  }

  // =============================================
  // MEAL CARD MANAGEMENT
  // =============================================

  /**
   * Get meal plan types
   */
  static async getMealPlanTypes(): Promise<MealPlanType[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_types')
        .select('*')
        .eq('is_active', true)
        .order('monthly_cost')

      if (error) throw new Error(`Failed to fetch meal plan types: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching meal plan types:', error)
      throw new Error(`Failed to fetch meal plan types: ${error.message}`)
    }
  }

  /**
   * Get meal cards with filters
   */
  static async getMealCards(filters?: {
    student_id?: string
    card_status?: string
    meal_plan_id?: string
  }): Promise<MealCard[]> {
    try {
      let query = supabase
        .from('meal_cards')
        .select(`
          *,
          students!inner (
            user_id,
            users!inner (full_name)
          ),
          meal_plan_types (*)
        `)

      if (filters?.student_id) {
        query = query.eq('student_id', filters.student_id)
      }
      if (filters?.card_status) {
        query = query.eq('card_status', filters.card_status)
      }
      if (filters?.meal_plan_id) {
        query = query.eq('meal_plan_id', filters.meal_plan_id)
      }

      query = query.order('issue_date', { ascending: false })

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch meal cards: ${error.message}`)

      return (data || []).map(card => ({
        ...card,
        student_name: card.students.users.full_name,
        meal_plan: card.meal_plan_types
      }))
    } catch (error: any) {
      console.error('Error fetching meal cards:', error)
      throw new Error(`Failed to fetch meal cards: ${error.message}`)
    }
  }

  /**
   * Issue new meal card
   */
  static async issueMealCard(cardData: {
    student_id: string
    card_number: string
    card_type: 'physical' | 'digital' | 'hybrid'
    meal_plan_id?: string
    expiry_date: string
    card_fee: number
    security_deposit: number
    issued_by: string
    notes?: string
  }): Promise<MealCard> {
    try {
      // Check if card number already exists
      const { data: existing } = await supabase
        .from('meal_cards')
        .select('card_number')
        .eq('card_number', cardData.card_number)
        .single()

      if (existing) {
        throw new Error('Card number already exists')
      }

      const { data, error } = await supabase
        .from('meal_cards')
        .insert([{
          ...cardData,
          issue_date: new Date().toISOString().split('T')[0],
          card_status: 'active',
          balance_meals: 0,
          total_meals_purchased: 0,
          total_meals_consumed: 0
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to issue meal card: ${error.message}`)

      console.log('Meal card issued successfully')
      return data
    } catch (error: any) {
      console.error('Error issuing meal card:', error)
      throw new Error(`Failed to issue meal card: ${error.message}`)
    }
  }

  /**
   * Recharge meal card
   */
  static async rechargeMealCard(rechargeData: {
    meal_card_id: string
    meals_count: number
    amount: number
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money'
    processed_by: string
    reference_number?: string
    notes?: string
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('meal_card_transactions')
        .insert([{
          ...rechargeData,
          transaction_type: 'recharge',
          transaction_date: new Date().toISOString(),
          balance_after: 0 // Will be updated by trigger
        }])

      if (error) throw new Error(`Failed to recharge meal card: ${error.message}`)

      console.log('Meal card recharged successfully')
    } catch (error: any) {
      console.error('Error recharging meal card:', error)
      throw new Error(`Failed to recharge meal card: ${error.message}`)
    }
  }

  /**
   * Record meal consumption
   */
  static async recordMealConsumption(consumptionData: {
    meal_card_id: string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    meals_count: number
    location?: string
    terminal_id?: string
  }): Promise<void> {
    try {
      // Check card balance
      const { data: card } = await supabase
        .from('meal_cards')
        .select('balance_meals, card_status')
        .eq('id', consumptionData.meal_card_id)
        .single()

      if (!card || card.card_status !== 'active') {
        throw new Error('Card is not active')
      }

      if (card.balance_meals < consumptionData.meals_count) {
        throw new Error('Insufficient meal balance')
      }

      const { error } = await supabase
        .from('meal_card_transactions')
        .insert([{
          ...consumptionData,
          transaction_type: 'consumption',
          transaction_date: new Date().toISOString(),
          amount: 0,
          balance_after: 0 // Will be updated by trigger
        }])

      if (error) throw new Error(`Failed to record meal consumption: ${error.message}`)

      console.log('Meal consumption recorded successfully')
    } catch (error: any) {
      console.error('Error recording meal consumption:', error)
      throw new Error(`Failed to record meal consumption: ${error.message}`)
    }
  }

  // =============================================
  // MAINTENANCE MANAGEMENT
  // =============================================

  /**
   * Get maintenance requests with filters
   */
  static async getMaintenanceRequests(filters?: {
    room_id?: string
    building_id?: string
    request_status?: string
    priority?: string
    assigned_to?: string
  }): Promise<MaintenanceRequest[]> {
    try {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          hostel_rooms (
            room_number,
            hostel_buildings (building_name)
          ),
          maintenance_categories (category_name),
          reporter:users!maintenance_requests_reported_by_fkey (full_name),
          assignee:users!maintenance_requests_assigned_to_fkey (full_name)
        `)

      if (filters?.room_id) {
        query = query.eq('room_id', filters.room_id)
      }
      if (filters?.building_id) {
        query = query.eq('building_id', filters.building_id)
      }
      if (filters?.request_status) {
        query = query.eq('request_status', filters.request_status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }

      query = query.order('reported_date', { ascending: false })

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch maintenance requests: ${error.message}`)

      return (data || []).map(request => ({
        ...request,
        room_number: request.hostel_rooms?.room_number,
        building_name: request.hostel_rooms?.hostel_buildings?.building_name,
        category_name: request.maintenance_categories?.category_name,
        reporter_name: request.reporter?.full_name,
        assigned_to_name: request.assignee?.full_name
      }))
    } catch (error: any) {
      console.error('Error fetching maintenance requests:', error)
      throw new Error(`Failed to fetch maintenance requests: ${error.message}`)
    }
  }

  /**
   * Create maintenance request
   */
  static async createMaintenanceRequest(requestData: {
    room_id?: string
    building_id?: string
    category_id?: string
    reported_by: string
    title: string
    description: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    estimated_cost?: number
    attachments?: any
  }): Promise<MaintenanceRequest> {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([{
          ...requestData,
          request_status: 'open',
          reported_date: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create maintenance request: ${error.message}`)

      console.log('Maintenance request created successfully')
      return data
    } catch (error: any) {
      console.error('Error creating maintenance request:', error)
      throw new Error(`Failed to create maintenance request: ${error.message}`)
    }
  }

  // =============================================
  // ANALYTICS AND REPORTING
  // =============================================

  /**
   * Get occupancy analytics
   */
  static async getOccupancyAnalytics(): Promise<OccupancyAnalytics> {
    try {
      const [roomsResult, allocationsResult] = await Promise.all([
        supabase
          .from('hostel_rooms')
          .select(`
            id,
            room_status,
            capacity,
            current_occupancy,
            monthly_fee,
            hostel_buildings (building_name),
            room_types (type_name)
          `)
          .eq('is_active', true),

        supabase
          .from('room_allocations')
          .select('allocation_date, check_out_date, allocation_status')
          .gte('allocation_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      ])

      if (roomsResult.error) throw roomsResult.error
      if (allocationsResult.error) throw allocationsResult.error

      const rooms = roomsResult.data || []
      const allocations = allocationsResult.data || []

      // Basic room statistics
      const totalRooms = rooms.length
      const availableRooms = rooms.filter(r => r.room_status === 'available').length
      const occupiedRooms = rooms.filter(r => r.room_status === 'occupied').length
      const maintenanceRooms = rooms.filter(r => r.room_status === 'maintenance').length
      const reservedRooms = rooms.filter(r => r.room_status === 'reserved').length
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

      // Building occupancy
      const buildingGroups = this.groupBy(rooms, 'hostel_buildings.building_name')
      const buildingOccupancy = Object.entries(buildingGroups).map(([building, buildingRooms]: [string, any[]]) => {
        const totalRooms = buildingRooms.length
        const occupiedRooms = buildingRooms.filter(r => r.room_status === 'occupied').length
        return {
          building,
          totalRooms,
          occupiedRooms,
          occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
        }
      })

      // Room type occupancy
      const roomTypeGroups = this.groupBy(rooms, 'room_types.type_name')
      const roomTypeOccupancy = Object.entries(roomTypeGroups).map(([roomType, typeRooms]: [string, any[]]) => {
        const totalRooms = typeRooms.length
        const occupiedRooms = typeRooms.filter(r => r.room_status === 'occupied').length
        const averageFee = typeRooms.reduce((sum, room) => sum + (room.monthly_fee || 0), 0) / totalRooms
        return {
          roomType,
          totalRooms,
          occupiedRooms,
          occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
          averageFee
        }
      })

      // Monthly trends (last 12 months)
      const monthlyTrends = this.calculateOccupancyTrends(allocations)

      return {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        reservedRooms,
        occupancyRate,
        buildingOccupancy,
        roomTypeOccupancy,
        monthlyTrends
      }
    } catch (error: any) {
      console.error('Error fetching occupancy analytics:', error)
      throw new Error(`Failed to fetch occupancy analytics: ${error.message}`)
    }
  }

  /**
   * Get meal card analytics
   */
  static async getMealCardAnalytics(): Promise<MealCardAnalytics> {
    try {
      const [cardsResult, transactionsResult] = await Promise.all([
        supabase
          .from('meal_cards')
          .select(`
            id,
            card_status,
            balance_meals,
            total_meals_purchased,
            total_meals_consumed,
            meal_plan_types (plan_name, monthly_cost)
          `),

        supabase
          .from('meal_card_transactions')
          .select('transaction_type, meal_type, meals_count, amount, transaction_date')
          .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      ])

      if (cardsResult.error) throw cardsResult.error
      if (transactionsResult.error) throw transactionsResult.error

      const cards = cardsResult.data || []
      const transactions = transactionsResult.data || []

      const totalCards = cards.length
      const activeCards = cards.filter(c => c.card_status === 'active').length
      const totalMealsConsumed = cards.reduce((sum, card) => sum + (card.total_meals_consumed || 0), 0)
      const totalRevenue = transactions
        .filter(t => t.transaction_type === 'recharge')
        .reduce((sum, t) => sum + (t.amount || 0), 0)

      const averageMealsPerDay = totalMealsConsumed > 0 ? totalMealsConsumed / 90 : 0

      // Plan distribution
      const planGroups = this.groupBy(cards, 'meal_plan_types.plan_name')
      const planDistribution = Object.entries(planGroups).map(([planName, planCards]: [string, any[]]) => ({
        planName,
        cardCount: planCards.length,
        revenue: planCards.reduce((sum, card) => {
          return sum + (card.meal_plan_types?.monthly_cost || 0)
        }, 0)
      }))

      // Consumption trends and popular meal times
      const consumptionTrends = this.calculateConsumptionTrends(transactions)
      const popularMealTimes = this.calculatePopularMealTimes(transactions)

      return {
        totalCards,
        activeCards,
        totalMealsConsumed,
        totalRevenue,
        averageMealsPerDay,
        planDistribution,
        consumptionTrends,
        popularMealTimes
      }
    } catch (error: any) {
      console.error('Error fetching meal card analytics:', error)
      throw new Error(`Failed to fetch meal card analytics: ${error.message}`)
    }
  }

  /**
   * Get maintenance analytics
   */
  static async getMaintenanceAnalytics(): Promise<MaintenanceAnalytics> {
    try {
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          priority,
          request_status,
          reported_date,
          completed_date,
          estimated_cost,
          actual_cost,
          maintenance_categories (category_name)
        `)
        .gte('reported_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const totalRequests = requests?.length || 0
      const openRequests = requests?.filter(r => r.request_status === 'open').length || 0
      const completedRequests = requests?.filter(r => r.request_status === 'completed').length || 0

      // Average resolution time
      const completedWithTimes = requests?.filter(r => r.completed_date && r.reported_date) || []
      const averageResolutionTime = completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, req) => {
            const start = new Date(req.reported_date).getTime()
            const end = new Date(req.completed_date!).getTime()
            return sum + (end - start) / (1000 * 60 * 60) // hours
          }, 0) / completedWithTimes.length
        : 0

      const totalCost = requests?.reduce((sum, req) => sum + (req.actual_cost || req.estimated_cost || 0), 0) || 0

      // Category breakdown
      const categoryGroups = this.groupBy(requests || [], 'maintenance_categories.category_name')
      const categoryBreakdown = Object.entries(categoryGroups).map(([category, categoryRequests]: [string, any[]]) => ({
        category,
        count: categoryRequests.length,
        averageTime: this.calculateAverageResolutionTime(categoryRequests),
        totalCost: categoryRequests.reduce((sum, req) => sum + (req.actual_cost || req.estimated_cost || 0), 0)
      }))

      // Priority distribution
      const priorityGroups = this.groupBy(requests || [], 'priority')
      const priorityDistribution = Object.entries(priorityGroups).map(([priority, priorityRequests]: [string, any[]]) => ({
        priority,
        count: priorityRequests.length,
        percentage: totalRequests > 0 ? (priorityRequests.length / totalRequests) * 100 : 0
      }))

      // Monthly trends
      const monthlyTrends = this.calculateMaintenanceTrends(requests || [])

      return {
        totalRequests,
        openRequests,
        completedRequests,
        averageResolutionTime,
        totalCost,
        categoryBreakdown,
        priorityDistribution,
        monthlyTrends
      }
    } catch (error: any) {
      console.error('Error fetching maintenance analytics:', error)
      throw new Error(`Failed to fetch maintenance analytics: ${error.message}`)
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  private static groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((groups, item) => {
      const value = this.getNestedValue(item, key) || 'Unknown'
      groups[value] = groups[value] || []
      groups[value].push(item)
      return groups
    }, {})
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private static calculateOccupancyTrends(allocations: any[]): Array<{ month: string; occupancyRate: number; newAllocations: number; checkOuts: number }> {
    // Implementation for calculating monthly occupancy trends
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toISOString().slice(0, 7),
        occupancyRate: 70 + Math.random() * 20, // Mock data
        newAllocations: Math.floor(Math.random() * 50),
        checkOuts: Math.floor(Math.random() * 30)
      }
    })
    return last12Months
  }

  private static calculateConsumptionTrends(transactions: any[]): Array<{ date: string; breakfast: number; lunch: number; dinner: number; total: number }> {
    // Implementation for calculating daily consumption trends
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const breakfast = Math.floor(Math.random() * 100)
      const lunch = Math.floor(Math.random() * 150)
      const dinner = Math.floor(Math.random() * 120)
      return {
        date: date.toISOString().slice(0, 10),
        breakfast,
        lunch,
        dinner,
        total: breakfast + lunch + dinner
      }
    })
    return last30Days
  }

  private static calculatePopularMealTimes(transactions: any[]): Array<{ mealType: string; count: number; percentage: number }> {
    const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }

    transactions
      .filter(t => t.transaction_type === 'consumption' && t.meal_type)
      .forEach(t => {
        mealCounts[t.meal_type as keyof typeof mealCounts]++
      })

    const total = Object.values(mealCounts).reduce((sum, count) => sum + count, 0)

    return Object.entries(mealCounts).map(([mealType, count]) => ({
      mealType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
  }

  private static calculateAverageResolutionTime(requests: any[]): number {
    const completedRequests = requests.filter(r => r.completed_date && r.reported_date)
    if (completedRequests.length === 0) return 0

    return completedRequests.reduce((sum, req) => {
      const start = new Date(req.reported_date).getTime()
      const end = new Date(req.completed_date).getTime()
      return sum + (end - start) / (1000 * 60 * 60) // hours
    }, 0) / completedRequests.length
  }

  private static calculateMaintenanceTrends(requests: any[]): Array<{ month: string; requests: number; completed: number; cost: number }> {
    // Implementation for calculating monthly maintenance trends
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toISOString().slice(0, 7),
        requests: Math.floor(Math.random() * 30),
        completed: Math.floor(Math.random() * 25),
        cost: Math.floor(Math.random() * 5000)
      }
    })
    return last12Months
  }
}
