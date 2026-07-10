import type { TTimelineItem } from '@treeui/vue';

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export type Order = {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: OrderStatus;
  amount: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  plan: 'Seed' | 'Sapling' | 'Evergreen';
  orders: number;
  lifetimeValue: number;
  status: 'online' | 'offline' | 'busy' | 'away';
};

export type Stat = {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  meta: string;
  /** Weekly datapoints rendered as a sparkline next to the metric. */
  spark: number[];
};

export const stats: Stat[] = [
  {
    label: 'Monthly revenue',
    value: '$48,920',
    trend: '12.4%',
    trendDirection: 'up',
    tone: 'success',
    meta: 'vs. last month',
    spark: [32, 38, 36, 44, 42, 50, 48, 57, 55],
  },
  {
    label: 'Orders',
    value: '1,284',
    trend: '3.1%',
    trendDirection: 'down',
    tone: 'danger',
    meta: 'vs. last month',
    spark: [55, 50, 52, 45, 47, 40, 43, 36, 38],
  },
  {
    label: 'New customers',
    value: '312',
    trend: '5.8%',
    trendDirection: 'up',
    tone: 'success',
    meta: '92 this week',
    spark: [30, 29, 35, 33, 41, 39, 46, 45, 52],
  },
];

export type ChannelMonth = {
  month: string;
  /** Sessions in thousands, one entry per channel in `channelNames` order. */
  values: number[];
};

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

export const activity: TTimelineItem[] = [
  {
    id: 1,
    title: 'Order #1042 fulfilled',
    description: 'Shipped to Aline Duarte via express courier.',
    timestamp: 'Today, 09:24',
    tone: 'success',
  },
  {
    id: 2,
    title: 'Refund requested',
    description: 'Marcus Chen asked to refund order #1031.',
    timestamp: 'Today, 08:02',
    tone: 'warning',
  },
  {
    id: 3,
    title: 'New Evergreen subscription',
    description: 'Sofia Almeida upgraded from Sapling.',
    timestamp: 'Yesterday, 17:45',
    tone: 'brand',
  },
  {
    id: 4,
    title: 'Payment failed',
    description: 'Card declined for order #1027 — retry scheduled.',
    timestamp: 'Yesterday, 11:12',
    tone: 'danger',
  },
  {
    id: 5,
    title: 'Weekly digest sent',
    description: '1,203 customers received the product update email.',
    timestamp: 'Mon, 07:00',
    tone: 'neutral',
  },
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
  { id: '#1030', customer: 'Yara Haddad', product: 'Seed plan', date: '2026-07-03', status: 'paid', amount: 29 },
  { id: '#1029', customer: 'Pedro Costa', product: 'Sapling plan', date: '2026-07-03', status: 'pending', amount: 99 },
  { id: '#1028', customer: 'Ingrid Berg', product: 'Evergreen plan', date: '2026-07-02', status: 'paid', amount: 289 },
  { id: '#1027', customer: 'Noah Fischer', product: 'Seed plan', date: '2026-07-02', status: 'failed', amount: 29 },
  { id: '#1026', customer: 'Beatriz Lima', product: 'Analytics add-on', date: '2026-07-01', status: 'paid', amount: 79 },
  { id: '#1025', customer: 'Omar Farouk', product: 'Sapling plan', date: '2026-07-01', status: 'paid', amount: 99 },
  { id: '#1024', customer: 'Julia Nowak', product: 'Evergreen plan', date: '2026-06-30', status: 'pending', amount: 289 },
  { id: '#1023', customer: 'Rafael Souza', product: 'Seed plan', date: '2026-06-30', status: 'paid', amount: 29 },
  { id: '#1022', customer: 'Mia Johansson', product: 'Design add-on', date: '2026-06-29', status: 'paid', amount: 49 },
  { id: '#1021', customer: 'Lucas Ferreira', product: 'Sapling plan', date: '2026-06-29', status: 'refunded', amount: 99 },
  { id: '#1020', customer: 'Ana Ribeiro', product: 'Evergreen plan', date: '2026-06-28', status: 'paid', amount: 289 },
];

export const customers: Customer[] = [
  { id: 'c1', name: 'Aline Duarte', email: 'aline@orchard.dev', plan: 'Evergreen', orders: 14, lifetimeValue: 3120, status: 'online' },
  { id: 'c2', name: 'Marcus Chen', email: 'marcus@sproutlabs.io', plan: 'Sapling', orders: 9, lifetimeValue: 1180, status: 'busy' },
  { id: 'c3', name: 'Sofia Almeida', email: 'sofia@leafline.co', plan: 'Evergreen', orders: 11, lifetimeValue: 2540, status: 'online' },
  { id: 'c4', name: 'Jonas Weber', email: 'jonas@rootstack.de', plan: 'Seed', orders: 3, lifetimeValue: 87, status: 'offline' },
  { id: 'c5', name: 'Priya Nair', email: 'priya@canopy.app', plan: 'Sapling', orders: 7, lifetimeValue: 940, status: 'away' },
  { id: 'c6', name: 'Hana Sato', email: 'hana@mori.studio', plan: 'Evergreen', orders: 12, lifetimeValue: 2890, status: 'online' },
  { id: 'c7', name: 'Liam O’Brien', email: 'liam@fernworks.ie', plan: 'Seed', orders: 2, lifetimeValue: 58, status: 'offline' },
  { id: 'c8', name: 'Clara Fontes', email: 'clara@brotar.com.br', plan: 'Sapling', orders: 6, lifetimeValue: 720, status: 'online' },
];

export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
