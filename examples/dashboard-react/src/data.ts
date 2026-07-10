export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface Order {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: OrderStatus;
  amount: number;
}

export interface Stat {
  label: string;
  value: string;
  trend: string;
  tone: 'success' | 'info' | 'warning' | 'neutral';
}

export const stats: Stat[] = [
  { label: 'Monthly revenue', value: '$48,210', trend: '▲ 12.4% vs. last month', tone: 'success' },
  { label: 'Active customers', value: '1,284', trend: '▲ 3.1% — 92 new this month', tone: 'info' },
  { label: 'Open orders', value: '37', trend: '4 overdue · avg. 2.3 days', tone: 'warning' },
  { label: 'Refund rate', value: '1.9%', trend: '▼ 0.4% vs. last month', tone: 'neutral' },
];

export const orders: Order[] = [
  { id: '#1042', customer: 'Aline Duarte', product: 'Evergreen plan', date: '2026-07-09', status: 'paid', amount: 289 },
  { id: '#1041', customer: 'Marcus Chen', product: 'Sapling plan', date: '2026-07-09', status: 'pending', amount: 99 },
  { id: '#1040', customer: 'Sofia Almeida', product: 'Evergreen plan', date: '2026-07-08', status: 'paid', amount: 289 },
  { id: '#1039', customer: 'Jonas Weber', product: 'Seed plan', date: '2026-07-08', status: 'paid', amount: 29 },
  { id: '#1038', customer: 'Priya Nair', product: 'Design add-on', date: '2026-07-07', status: 'refunded', amount: 49 },
  { id: '#1037', customer: 'Tomás Rocha', product: 'Sapling plan', date: '2026-07-07', status: 'paid', amount: 99 },
  { id: '#1036', customer: 'Hana Sato', product: 'Evergreen plan', date: '2026-07-06', status: 'pending', amount: 289 },
  { id: '#1035', customer: 'Liam O’Brien', product: 'Seed plan', date: '2026-07-06', status: 'failed', amount: 29 },
  { id: '#1034', customer: 'Clara Fontes', product: 'Analytics add-on', date: '2026-07-05', status: 'paid', amount: 79 },
  { id: '#1033', customer: 'Diego Martins', product: 'Sapling plan', date: '2026-07-05', status: 'paid', amount: 99 },
  { id: '#1032', customer: 'Emma Larsen', product: 'Evergreen plan', date: '2026-07-04', status: 'paid', amount: 289 },
  { id: '#1031', customer: 'Marcus Chen', product: 'Design add-on', date: '2026-07-04', status: 'refunded', amount: 49 },
];

export const statusTone = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'danger',
} as const;

export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
