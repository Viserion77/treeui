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
  tone: 'success' | 'info' | 'warning' | 'neutral' | 'danger';
  /** Weekly datapoints rendered as a sparkline next to the metric. */
  spark: number[];
}

export const stats: Stat[] = [
  {
    label: 'Monthly revenue',
    value: '$48,920',
    trend: '▲ 12.4% vs. last month',
    tone: 'success',
    spark: [32, 38, 36, 44, 42, 50, 48, 57, 55],
  },
  {
    label: 'Orders',
    value: '1,284',
    trend: '▼ 3.1% vs. last month',
    tone: 'danger',
    spark: [55, 50, 52, 45, 47, 40, 43, 36, 38],
  },
  {
    label: 'New customers',
    value: '312',
    trend: '▲ 5.8% — 92 this week',
    tone: 'success',
    spark: [30, 29, 35, 33, 41, 39, 46, 45, 52],
  },
];

export interface ChannelMonth {
  month: string;
  /** Sessions in thousands, one entry per channel in `channelNames` order. */
  values: number[];
}

export const channelNames = ['Organic', 'Social', 'Email', 'Paid', 'Direct'];

export const channelMonths: ChannelMonth[] = [
  { month: 'Jan', values: [32, 25, 17, 14, 10] },
  { month: 'Feb', values: [37, 28, 20, 16, 11] },
  { month: 'Mar', values: [41, 31, 23, 18, 13] },
  { month: 'Apr', values: [39, 28, 22, 17, 12] },
  { month: 'May', values: [44, 33, 25, 19, 13] },
  { month: 'Jun', values: [49, 37, 28, 21, 15] },
  { month: 'Jul', values: [46, 35, 27, 20, 14] },
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
