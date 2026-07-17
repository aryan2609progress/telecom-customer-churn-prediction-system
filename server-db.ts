import fs from 'fs';
import path from 'path';
import { 
  User, Customer, Prediction, AIReport, ActivityLog, FollowUp, AppSettings, UserRole
} from './src/types';

const DB_PATH = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> password
  customers: Customer[];
  predictions: Prediction[];
  aiReports: AIReport[];
  activityLogs: ActivityLog[];
  followUps: FollowUp[];
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  company: {
    name: "TeleConnect Global",
    logoUrl: "",
    email: "retention@teleconnect.com",
    phone: "+1 (555) 019-2834",
    address: "100 Innovation Way, Suite 400, Silicon Valley, CA"
  },
  theme: "light",
  aiModel: "gemini-3.5-flash",
  emailAlertsEnabled: true
};

const initialUsers: User[] = [
  { id: 'u1', username: 'admin', name: 'Arjun Sharma (Admin)', email: 'admin@teleconnect.com', role: 'admin', status: 'active' },
  { id: 'u2', username: 'manager', name: 'Priya Patel (Manager)', email: 'priya@teleconnect.com', role: 'manager', status: 'active' },
  { id: 'u3', username: 'employee', name: 'Rohan Verma (Executive)', email: 'rohan@teleconnect.com', role: 'employee', status: 'active' }
];

const initialPasswords: Record<string, string> = {
  'u1': 'password123',
  'u2': 'password123',
  'u3': 'password123'
};

// Generate highly realistic customers with mixed profiles
const initialCustomers: Customer[] = [
  {
    id: 'CUST-8374',
    personal: {
      id: 'CUST-8374',
      name: 'Rajesh Kumar',
      gender: 'Male',
      age: 67,
      dob: '1959-04-12',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@gmail.com',
      address: 'A-45, Shanti Kunj, Sector 12',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      pincode: '201301'
    },
    family: {
      seniorCitizen: 'Yes',
      partner: 'No',
      dependents: 'No'
    },
    telecom: {
      tenure: 3,
      phoneService: 'Yes',
      multipleLines: 'No',
      internetService: 'Fiber optic',
      onlineSecurity: 'No',
      onlineBackup: 'No',
      deviceProtection: 'No',
      techSupport: 'No',
      streamingTV: 'Yes',
      streamingMovies: 'Yes'
    },
    billing: {
      contract: 'Month-to-month',
      paperlessBilling: 'Yes',
      paymentMethod: 'Electronic check',
      monthlyCharges: 95.85,
      totalCharges: 287.55
    },
    riskLevel: 'high',
    churnProbability: 88,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedEmployeeId: 'u3',
    assignedEmployeeName: 'Rohan Verma (Executive)'
  },
  {
    id: 'CUST-2940',
    personal: {
      id: 'CUST-2940',
      name: 'Anjali Sharma',
      gender: 'Female',
      age: 32,
      dob: '1994-08-22',
      phone: '+91 87654 32109',
      email: 'anjali.sharma@outlook.com',
      address: 'Flat 402, Royal Residency, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560038'
    },
    family: {
      seniorCitizen: 'No',
      partner: 'Yes',
      dependents: 'Yes'
    },
    telecom: {
      tenure: 48,
      phoneService: 'Yes',
      multipleLines: 'Yes',
      internetService: 'DSL',
      onlineSecurity: 'Yes',
      onlineBackup: 'Yes',
      deviceProtection: 'Yes',
      techSupport: 'Yes',
      streamingTV: 'No',
      streamingMovies: 'No'
    },
    billing: {
      contract: 'Two year',
      paperlessBilling: 'No',
      paymentMethod: 'Bank transfer (automatic)',
      monthlyCharges: 64.25,
      totalCharges: 3084.00
    },
    riskLevel: 'low',
    churnProbability: 12,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'CUST-1049',
    personal: {
      id: 'CUST-1049',
      name: 'Vikram Singh',
      gender: 'Male',
      age: 45,
      dob: '1981-11-05',
      phone: '+91 91234 56789',
      email: 'vikram.singh@yahoo.com',
      address: 'House No. 12, Sector 15-A',
      city: 'Chandigarh',
      state: 'Punjab',
      country: 'India',
      pincode: '160015'
    },
    family: {
      seniorCitizen: 'No',
      partner: 'Yes',
      dependents: 'No'
    },
    telecom: {
      tenure: 14,
      phoneService: 'Yes',
      multipleLines: 'Yes',
      internetService: 'Fiber optic',
      onlineSecurity: 'No',
      onlineBackup: 'Yes',
      deviceProtection: 'No',
      techSupport: 'No',
      streamingTV: 'Yes',
      streamingMovies: 'No'
    },
    billing: {
      contract: 'One year',
      paperlessBilling: 'Yes',
      paymentMethod: 'Credit card (automatic)',
      monthlyCharges: 85.10,
      totalCharges: 1191.40
    },
    riskLevel: 'medium',
    churnProbability: 46,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'CUST-6629',
    personal: {
      id: 'CUST-6629',
      name: 'Siddharth Mehta',
      gender: 'Male',
      age: 28,
      dob: '1998-02-14',
      phone: '+91 99887 76655',
      email: 'sidmehta@gmail.com',
      address: '7C, Orbit Heights, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400013'
    },
    family: {
      seniorCitizen: 'No',
      partner: 'No',
      dependents: 'No'
    },
    telecom: {
      tenure: 2,
      phoneService: 'Yes',
      multipleLines: 'No',
      internetService: 'Fiber optic',
      onlineSecurity: 'No',
      onlineBackup: 'No',
      deviceProtection: 'No',
      techSupport: 'No',
      streamingTV: 'No',
      streamingMovies: 'No'
    },
    billing: {
      contract: 'Month-to-month',
      paperlessBilling: 'Yes',
      paymentMethod: 'Electronic check',
      monthlyCharges: 70.65,
      totalCharges: 141.30
    },
    riskLevel: 'high',
    churnProbability: 79,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedEmployeeId: 'u3',
    assignedEmployeeName: 'Rohan Verma (Executive)'
  },
  {
    id: 'CUST-4410',
    personal: {
      id: 'CUST-4410',
      name: 'Neha Gupta',
      gender: 'Female',
      age: 23,
      dob: '2003-07-30',
      phone: '+91 88990 11223',
      email: 'neha.gupta@edu.in',
      address: 'Girls Hostel, IIT Delhi, Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110016'
    },
    family: {
      seniorCitizen: 'No',
      partner: 'No',
      dependents: 'No'
    },
    telecom: {
      tenure: 9,
      phoneService: 'Yes',
      multipleLines: 'No',
      internetService: 'No',
      onlineSecurity: 'No internet service',
      onlineBackup: 'No internet service',
      deviceProtection: 'No internet service',
      techSupport: 'No internet service',
      streamingTV: 'No internet service',
      streamingMovies: 'No internet service'
    },
    billing: {
      contract: 'Month-to-month',
      paperlessBilling: 'No',
      paymentMethod: 'Mailed check',
      monthlyCharges: 20.15,
      totalCharges: 181.35
    },
    riskLevel: 'low',
    churnProbability: 25,
    createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialPredictions: Prediction[] = [
  {
    id: 'PRED-001',
    customerId: 'CUST-8374',
    customerName: 'Rajesh Kumar',
    churnProbability: 88,
    riskScore: 88,
    riskLevel: 'high',
    confidenceScore: 92,
    explanation: 'The customer is a Senior Citizen on a high monthly plan ($95.85) with a Month-to-month contract and no protective services (Online Security, Tech Support, Backup). Electronic check payment also significantly increases historical risk.',
    riskFactors: [
      'Month-to-month contract (High risk factor)',
      'No Technical Support or Online Security subscribed',
      'Electronic check manual payment method',
      'Extremely short tenure (3 months) indicating a lack of brand loyalty',
      'Senior Citizen profile increases risk correlation'
    ],
    positiveFactors: [
      'Subscribed to Phone Service'
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PRED-002',
    customerId: 'CUST-2940',
    customerName: 'Anjali Sharma',
    churnProbability: 12,
    riskScore: 12,
    riskLevel: 'low',
    confidenceScore: 95,
    explanation: 'Customer has an extremely stable profile. Long tenure of 48 months, long-term Two-year contract, and automatic bank transfers are strong positive retainers.',
    riskFactors: [
      'Older DSL technology which has slightly lower speeds'
    ],
    positiveFactors: [
      'Two-year secure lock-in contract',
      'High tenure of 48 months',
      'All security, backup, and tech support services are active',
      'Automatic payment via bank transfer is enabled'
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialAIReports: AIReport[] = [
  {
    id: 'REP-001',
    customerId: 'CUST-8374',
    customerName: 'Rajesh Kumar',
    executiveSummary: 'Customer Rajesh Kumar is highly likely to churn within 30 days due to month-to-month contracting, poor technical protection, and rapid billing fatigue on high fiber optic charges.',
    riskAnalysis: 'High vulnerability due to zero sticky services. Lack of Online Security and Tech Support makes them prone to service interruptions, leading to high frustration. The high charge of $95.85/mo for a senior citizen increases billing friction.',
    retentionStrategies: [
      'Offer a 30% loyalty discount if they convert to a One-year contract ($67/month).',
      'Provide complimentary Online Security and Tech Support for 6 months as an incentive.',
      'Suggest setting up automatic billing (credit card/bank) with a one-time $10 account credit.'
    ],
    discountSuggestion: '30% Discount on 1-Year lock-in, plus $10 auto-pay sign up bonus.',
    nextBestAction: 'Call customer immediately to pitch the Senior Citizen Care Bundle and transition to automatic billing.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialLogs: ActivityLog[] = [
  {
    id: 'LOG-001',
    userId: 'u1',
    userName: 'Arjun Sharma (Admin)',
    role: 'admin',
    action: 'SYSTEM_STARTUP',
    details: 'Telecom Customer Churn Prediction System database successfully initialized.',
    timestamp: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'LOG-002',
    userId: 'u3',
    userName: 'Rohan Verma (Executive)',
    role: 'employee',
    action: 'PREDICTION_GENERATED',
    details: 'Generated Churn Risk assessment for customer Rajesh Kumar (CUST-8374). Risk: High (88%)',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialFollowUps: FollowUp[] = [
  {
    id: 'FW-001',
    customerId: 'CUST-8374',
    customerName: 'Rajesh Kumar',
    assignedToId: 'u3',
    assignedToName: 'Rohan Verma (Executive)',
    notes: 'Called customer to pitch contract migration. Customer is frustrated with recent speeds but is willing to consider a discounted contract if service improves.',
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerResponse: 'Under Consideration',
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export class FileDatabase {
  private static load(): DatabaseSchema {
    if (!fs.existsSync(DB_PATH)) {
      const data: DatabaseSchema = {
        users: initialUsers,
        passwords: initialPasswords,
        customers: initialCustomers,
        predictions: initialPredictions,
        aiReports: initialAIReports,
        activityLogs: initialLogs,
        followUps: initialFollowUps,
        settings: defaultSettings
      };
      this.save(data);
      return data;
    }
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading DB, recreating standard database:', e);
      const data: DatabaseSchema = {
        users: initialUsers,
        passwords: initialPasswords,
        customers: initialCustomers,
        predictions: initialPredictions,
        aiReports: initialAIReports,
        activityLogs: initialLogs,
        followUps: initialFollowUps,
        settings: defaultSettings
      };
      this.save(data);
      return data;
    }
  }

  private static save(data: DatabaseSchema): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Auth Operations
  static getUsers(): User[] {
    return this.load().users;
  }

  static findUserByUsername(username: string): User | undefined {
    return this.load().users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  static verifyPassword(userId: string, passwordString: string): boolean {
    return this.load().passwords[userId] === passwordString;
  }

  static createUser(user: Omit<User, 'id' | 'status'>, passwordString: string): User {
    const db = this.load();
    const id = 'u' + (db.users.length + 1);
    const newUser: User = { ...user, id, status: 'active' };
    db.users.push(newUser);
    db.passwords[id] = passwordString;
    this.save(db);
    this.addLog(id, newUser.name, newUser.role, 'USER_SIGNUP', `New user registered: ${newUser.username} as ${newUser.role}`);
    return newUser;
  }

  static changePassword(userId: string, oldPass: string, newPass: string): boolean {
    const db = this.load();
    if (db.passwords[userId] === oldPass) {
      db.passwords[userId] = newPass;
      this.save(db);
      const user = db.users.find(u => u.id === userId);
      if (user) {
        this.addLog(userId, user.name, user.role, 'PASSWORD_CHANGE', `Changed account password.`);
      }
      return true;
    }
    return false;
  }

  static updateUserRole(adminUserId: string, userId: string, role: UserRole): boolean {
    const db = this.load();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].role = role;
      this.save(db);
      
      const admin = db.users.find(u => u.id === adminUserId);
      if (admin) {
        this.addLog(adminUserId, admin.name, admin.role, 'USER_ROLE_UPDATE', `Updated user role of ${db.users[userIndex].username} to ${role}`);
      }
      return true;
    }
    return false;
  }

  static updateUserStatus(adminUserId: string, userId: string, status: 'active' | 'inactive'): boolean {
    const db = this.load();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].status = status;
      this.save(db);
      
      const admin = db.users.find(u => u.id === adminUserId);
      if (admin) {
        this.addLog(adminUserId, admin.name, admin.role, 'USER_STATUS_UPDATE', `Updated status of ${db.users[userIndex].username} to ${status}`);
      }
      return true;
    }
    return false;
  }

  // Customers Operations
  static getCustomers(): Customer[] {
    return this.load().customers;
  }

  static getCustomerById(id: string): Customer | undefined {
    return this.load().customers.find(c => c.id === id);
  }

  static createCustomer(userId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'churnProbability' | 'riskLevel'>): Customer {
    const db = this.load();
    const id = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Perform initial heuristic churn calculation
    const { probability, level } = this.calculateHeuristicChurn(customerData);
    
    const newCustomer: Customer = {
      ...customerData,
      id,
      personal: {
        ...customerData.personal,
        id
      },
      churnProbability: probability,
      riskLevel: level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.customers.push(newCustomer);
    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'CUSTOMER_CREATED', `Added new customer profile: ${newCustomer.personal.name} (${id})`);
    }

    return newCustomer;
  }

  static updateCustomer(userId: string, id: string, customerData: Partial<Customer>): Customer {
    const db = this.load();
    const index = db.customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }

    const current = db.customers[index];
    const updatedPersonal = { ...current.personal, ...customerData.personal };
    const updatedFamily = { ...current.family, ...customerData.family };
    const updatedTelecom = { ...current.telecom, ...customerData.telecom };
    const updatedBilling = { ...current.billing, ...customerData.billing };

    const partialObj = {
      personal: updatedPersonal,
      family: updatedFamily,
      telecom: updatedTelecom,
      billing: updatedBilling
    };

    const { probability, level } = this.calculateHeuristicChurn(partialObj);

    const updatedCustomer: Customer = {
      ...current,
      ...customerData,
      personal: updatedPersonal,
      family: updatedFamily,
      telecom: updatedTelecom,
      billing: updatedBilling,
      churnProbability: probability,
      riskLevel: level,
      updatedAt: new Date().toISOString()
    };

    db.customers[index] = updatedCustomer;
    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'CUSTOMER_UPDATED', `Updated profile for customer: ${updatedCustomer.personal.name} (${id})`);
    }

    return updatedCustomer;
  }

  static deleteCustomer(userId: string, id: string): boolean {
    const db = this.load();
    const customerIndex = db.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) return false;

    const custName = db.customers[customerIndex].personal.name;
    db.customers.splice(customerIndex, 1);
    
    // Clean up corresponding follow-ups, predictions, aiReports
    db.followUps = db.followUps.filter(f => f.customerId !== id);
    db.predictions = db.predictions.filter(p => p.customerId !== id);
    db.aiReports = db.aiReports.filter(a => a.customerId !== id);

    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'CUSTOMER_DELETED', `Deleted customer profile: ${custName} (${id})`);
    }

    return true;
  }

  // Churn Prediction Engine
  static calculateHeuristicChurn(c: {
    personal: any;
    family: any;
    telecom: any;
    billing: any;
  }): { probability: number; level: 'high' | 'medium' | 'low' | 'none' } {
    let p = 25; // Base probability

    // Contract impact
    if (c.billing.contract === 'Month-to-month') p += 35;
    else if (c.billing.contract === 'One year') p -= 10;
    else if (c.billing.contract === 'Two year') p -= 25;

    // Tenure impact (brand loyalty)
    const tenure = c.telecom.tenure;
    if (tenure < 6) p += 15;
    else if (tenure < 12) p += 5;
    else if (tenure > 24) p -= 15;
    else if (tenure > 48) p -= 25;

    // Internet Service impact
    if (c.telecom.internetService === 'Fiber optic') p += 15; // Fiber optic has high price, high churn correlation
    else if (c.telecom.internetService === 'DSL') p -= 5;
    else if (c.telecom.internetService === 'No') p -= 10;

    // Sticky Services (reduces churn)
    if (c.telecom.onlineSecurity === 'Yes') p -= 8;
    if (c.telecom.onlineBackup === 'Yes') p -= 6;
    if (c.telecom.deviceProtection === 'Yes') p -= 5;
    if (c.telecom.techSupport === 'Yes') p -= 8;

    // Billing and Charges
    if (c.billing.paymentMethod === 'Electronic check') p += 10; // High correlation with churn
    else if (c.billing.paymentMethod.includes('automatic')) p -= 10;

    if (c.billing.paperlessBilling === 'Yes') p += 5;

    if (c.billing.monthlyCharges > 85) p += 10;
    else if (c.billing.monthlyCharges < 35) p -= 5;

    // Demographics
    if (c.family.seniorCitizen === 'Yes') p += 5;
    if (c.family.partner === 'Yes') p -= 3;
    if (c.family.dependents === 'Yes') p -= 5;

    // Clamp between 5% and 98%
    const probability = Math.max(5, Math.min(98, p));
    
    let level: 'high' | 'medium' | 'low' | 'none' = 'none';
    if (probability >= 70) level = 'high';
    else if (probability >= 40) level = 'medium';
    else if (probability >= 15) level = 'low';

    return { probability, level };
  }

  static runRealPrediction(userId: string, customerId: string): Prediction {
    const db = this.load();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) throw new Error(`Customer ${customerId} not found.`);

    const { probability, level } = this.calculateHeuristicChurn(customer);

    // Update customer risk parameters
    customer.churnProbability = probability;
    customer.riskLevel = level;
    customer.updatedAt = new Date().toISOString();

    const confidenceScore = Math.floor(82 + Math.random() * 15); // Standard high confidence
    const riskScore = probability;

    // Generate Risk and Positive Factors
    const riskFactors: string[] = [];
    const positiveFactors: string[] = [];

    // Evaluate Risk Factors
    if (customer.billing.contract === 'Month-to-month') {
      riskFactors.push('Month-to-month contract carries no commitment penalty.');
    }
    if (customer.telecom.internetService === 'Fiber optic') {
      riskFactors.push('Premium Fiber Optic service is highly sensitive to pricing.');
    }
    if (customer.telecom.onlineSecurity === 'No' || customer.telecom.onlineSecurity === 'No internet service') {
      riskFactors.push('Missing Online Security increases digital vulnerabilities.');
    }
    if (customer.telecom.techSupport === 'No' || customer.telecom.techSupport === 'No internet service') {
      riskFactors.push('Lack of dedicated Technical Support limits service resolution.');
    }
    if (customer.billing.paymentMethod === 'Electronic check') {
      riskFactors.push('Electronic Check is a manual payment type linked to high payment failures.');
    }
    if (customer.telecom.tenure < 6) {
      riskFactors.push(`Short account tenure of ${customer.telecom.tenure} months indicates low brand stickiness.`);
    }
    if (customer.billing.monthlyCharges > 80) {
      riskFactors.push(`High monthly expenditure of $${customer.billing.monthlyCharges} triggers billing fatigue.`);
    }

    // Evaluate Positive Factors
    if (customer.billing.contract === 'Two year') {
      positiveFactors.push('Two-year long-term agreement acts as a critical lock-in.');
    } else if (customer.billing.contract === 'One year') {
      positiveFactors.push('One-year lock-in agreement decreases transition flexibility.');
    }
    if (customer.telecom.tenure >= 24) {
      positiveFactors.push(`Extremely loyal tenure of ${customer.telecom.tenure} months with the brand.`);
    }
    if (customer.telecom.onlineSecurity === 'Yes') {
      positiveFactors.push('Active Online Security decreases cancellation intent.');
    }
    if (customer.telecom.techSupport === 'Yes') {
      positiveFactors.push('Customer accesses priority Technical Support lines.');
    }
    if (customer.billing.paymentMethod.includes('automatic')) {
      positiveFactors.push(`Automated payment methods (${customer.billing.paymentMethod}) avoid billing friction.`);
    }
    if (customer.family.dependents === 'Yes') {
      positiveFactors.push('Multiple dependents indicate family-plan dependencies.');
    }

    if (riskFactors.length === 0) riskFactors.push('Pricing changes or seasonal offers.');
    if (positiveFactors.length === 0) positiveFactors.push('Basic service access.');

    const explanation = `Telecom predictive algorithms indicate a ${level.toUpperCase()} risk profile (${probability}% Churn Probability) for ${customer.personal.name}. The primary drivers are ${
      customer.billing.contract === 'Month-to-month' ? 'the flexible Month-to-month contract model' : 'pricing factors'
    } paired with ${
      customer.telecom.onlineSecurity === 'No' || customer.telecom.techSupport === 'No' ? 'low subscription density for protection products' : 'ongoing service duration trends'
    }.`;

    const newPrediction: Prediction = {
      id: `PRED-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId,
      customerName: customer.personal.name,
      churnProbability: probability,
      riskScore,
      riskLevel: level,
      confidenceScore,
      explanation,
      riskFactors,
      positiveFactors,
      createdAt: new Date().toISOString()
    };

    db.predictions.push(newPrediction);
    
    // Save updated customer risk level
    const cIndex = db.customers.findIndex(c => c.id === customerId);
    if (cIndex !== -1) {
      db.customers[cIndex] = customer;
    }

    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'PREDICTION_GENERATED', `Generated churn prediction for ${customer.personal.name}. Risk Score: ${riskScore}%, Level: ${level.toUpperCase()}`);
    }

    return newPrediction;
  }

  static getPredictionHistory(customerId: string): Prediction[] {
    return this.load().predictions
      .filter(p => p.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // AI Reports Operations
  static getAIReports(customerId: string): AIReport[] {
    return this.load().aiReports
      .filter(r => r.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static saveAIReport(report: AIReport): void {
    const db = this.load();
    db.aiReports.push(report);
    this.save(db);
  }

  // Follow Ups Operations
  static getFollowUps(): FollowUp[] {
    return this.load().followUps;
  }

  static createFollowUp(userId: string, followup: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
    const db = this.load();
    const id = `FW-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFollowup: FollowUp = {
      ...followup,
      id,
      createdAt: new Date().toISOString()
    };
    db.followUps.push(newFollowup);

    // Update customer's assigned representative
    const custIndex = db.customers.findIndex(c => c.id === followup.customerId);
    if (custIndex !== -1) {
      db.customers[custIndex].assignedEmployeeId = followup.assignedToId;
      db.customers[custIndex].assignedEmployeeName = followup.assignedToName;
    }

    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'FOLLOW_UP_CREATED', `Scheduled customer follow-up for ${followup.customerName} on ${followup.followUpDate}`);
    }

    return newFollowup;
  }

  static updateFollowUp(userId: string, id: string, notes: string, response: string, status: 'Open' | 'Closed'): FollowUp {
    const db = this.load();
    const index = db.followUps.findIndex(f => f.id === id);
    if (index === -1) throw new Error(`Follow-up ${id} not found.`);

    db.followUps[index].notes = notes;
    db.followUps[index].customerResponse = response;
    db.followUps[index].status = status;
    
    const updated = db.followUps[index];
    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'FOLLOW_UP_UPDATED', `Updated follow-up ID ${id} status to ${status}`);
    }

    return updated;
  }

  // Logs Operations
  static getLogs(): ActivityLog[] {
    return this.load().activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private static addLog(userId: string, userName: string, role: UserRole, action: string, details: string): void {
    const db = this.load();
    const log: ActivityLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      userName,
      role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.activityLogs.push(log);
    this.save(db);
  }

  static forceLog(userId: string, userName: string, role: UserRole, action: string, details: string): void {
    this.addLog(userId, userName, role, action, details);
  }

  // Settings Operations
  static getSettings(): AppSettings {
    return this.load().settings;
  }

  static updateSettings(userId: string, settings: AppSettings): AppSettings {
    const db = this.load();
    db.settings = settings;
    this.save(db);

    const user = db.users.find(u => u.id === userId);
    if (user) {
      this.addLog(userId, user.name, user.role, 'SETTINGS_UPDATED', 'Updated application settings and company profile details.');
    }

    return db.settings;
  }
}
