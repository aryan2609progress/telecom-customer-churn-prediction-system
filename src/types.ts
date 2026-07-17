export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface CustomerPersonalDetails {
  id: string; // Customer ID
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  dob: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface CustomerFamilyDetails {
  seniorCitizen: 'Yes' | 'No';
  partner: 'Yes' | 'No';
  dependents: 'Yes' | 'No';
}

export interface CustomerTelecomDetails {
  tenure: number; // months
  phoneService: 'Yes' | 'No';
  multipleLines: 'Yes' | 'No' | 'No phone service';
  internetService: 'DSL' | 'Fiber optic' | 'No';
  onlineSecurity: 'Yes' | 'No' | 'No internet service';
  onlineBackup: 'Yes' | 'No' | 'No internet service';
  deviceProtection: 'Yes' | 'No' | 'No internet service';
  techSupport: 'Yes' | 'No' | 'No internet service';
  streamingTV: 'Yes' | 'No' | 'No internet service';
  streamingMovies: 'Yes' | 'No' | 'No internet service';
}

export interface CustomerBillingDetails {
  contract: 'Month-to-month' | 'One year' | 'Two year';
  paperlessBilling: 'Yes' | 'No';
  paymentMethod: 'Electronic check' | 'Mailed check' | 'Bank transfer (automatic)' | 'Credit card (automatic)';
  monthlyCharges: number;
  totalCharges: number;
}

export interface Customer {
  id: string;
  personal: CustomerPersonalDetails;
  family: CustomerFamilyDetails;
  telecom: CustomerTelecomDetails;
  billing: CustomerBillingDetails;
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  churnProbability: number; // 0 to 100
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  customerId: string;
  customerName: string;
  churnProbability: number;
  riskScore: number; // 0 to 100
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  confidenceScore: number; // 0 to 100
  explanation: string;
  riskFactors: string[];
  positiveFactors: string[];
  createdAt: string;
}

export interface AIReport {
  id: string;
  customerId: string;
  customerName: string;
  executiveSummary: string;
  riskAnalysis: string;
  retentionStrategies: string[];
  discountSuggestion: string;
  nextBestAction: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface FollowUp {
  id: string;
  customerId: string;
  customerName: string;
  assignedToId: string;
  assignedToName: string;
  notes: string;
  followUpDate: string;
  customerResponse: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

export interface CompanyProfile {
  name: string;
  logoUrl: string;
  email: string;
  phone: string;
  address: string;
}

export interface AppSettings {
  company: CompanyProfile;
  theme: 'light' | 'dark';
  aiModel: string;
  emailAlertsEnabled: boolean;
  geminiApiKey?: string;
}
