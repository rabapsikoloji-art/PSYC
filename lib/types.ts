export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// Anamnez Formu Types
export type AnamnesisFormData = {
  id?: string
  clientId: string
  // 1) Sosyodemografik Bilgiler
  age?: number | null
  education?: string | null
  maritalStatus?: string | null
  employmentStatus?: string | null
  numberOfChildren?: number | null
  residence?: string | null
  livingWith?: string | null
  // 2-8) Öykü Bölümleri
  currentComplaint?: string | null
  currentComplaintHistory?: string | null
  pastComplaintHistory?: string | null
  pastLifeHistory?: string | null
  substanceMedicationHistory?: string | null
  generalMedicalCondition?: string | null
  familyMedicalHistory?: string | null
  // 9) Mental Durum Değerlendirmesi
  selfCare?: string | null
  speech?: string | null
  psychomotorActivity?: string | null
  affect?: string | null
  mood?: string | null
  thought?: string | null
  perception?: string | null
  behavior?: string | null
  insight?: string | null
  // 10) Bilişsel İşlevler
  attention?: string | null
  memory?: string | null
  calculation?: string | null
  drawing?: string | null
  abstraction?: string | null
  executiveFunctions?: string | null
  orientation?: string | null
  // 11-14) Teknik Bölümler
  technicalSummary?: string | null
  differentialDiagnosis?: string | null
  diagnosis?: string | null
  treatmentPlan?: string | null
  includeInAI?: string[] | null
  createdAt?: Date
  updatedAt?: Date
}

// Session Plan Types
export type SessionPlanData = {
  id?: string
  clientId: string
  personnelId: string
  totalSessions: number
  completedSessions?: number
  sessionType?: string | null
  frequency?: string | null
  startDate: Date
  endDate?: Date | null
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
  notes?: string | null
  createdAt?: Date
  updatedAt?: Date
}

// Integration Settings Types
export type IntegrationType = 'whatsapp' | 'google' | 'sms' | 'ai'

export type IntegrationConfig = {
  [key: string]: any
}

export type IntegrationSettingsData = {
  id?: string
  integrationType: IntegrationType
  providerName?: string | null
  config: IntegrationConfig
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Session Note Types
export type SessionNoteData = {
  id?: string
  appointmentId: string
  clientId: string
  personnelId: string
  content: string
  isConfidential?: boolean
  includeInAI?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Personnel Service Types
export type PersonnelServiceData = {
  id?: string
  personnelId: string
  serviceId: string
  createdAt?: Date
}