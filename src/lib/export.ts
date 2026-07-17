import { Customer, Prediction, AIReport } from '../types';

export function exportCustomersToCSV(customers: Customer[]): void {
  const headers = [
    'Customer ID', 'Name', 'Email', 'Phone', 'Gender', 'Age', 
    'City', 'State', 'Tenure (Months)', 'Contract', 'Internet Service', 
    'Monthly Charges ($)', 'Total Charges ($)', 'Churn Probability (%)', 'Risk Level'
  ];

  const rows = customers.map(c => [
    c.id,
    c.personal.name,
    c.personal.email,
    c.personal.phone,
    c.personal.gender,
    c.personal.age,
    c.personal.city,
    c.personal.state,
    c.telecom.tenure,
    c.billing.contract,
    c.telecom.internetService,
    c.billing.monthlyCharges,
    c.billing.totalCharges,
    c.churnProbability,
    c.riskLevel.toUpperCase()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `teleconnect_customer_churn_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPredictionsToCSV(predictions: Prediction[]): void {
  const headers = ['Prediction ID', 'Customer ID', 'Customer Name', 'Risk Score', 'Risk Level', 'Confidence Score', 'Created At'];
  const rows = predictions.map(p => [
    p.id,
    p.customerId,
    p.customerName,
    p.riskScore,
    p.riskLevel.toUpperCase(),
    p.confidenceScore,
    p.createdAt
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `churn_predictions_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
