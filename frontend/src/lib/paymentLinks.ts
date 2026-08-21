import { client } from '@/lib/api';

type PaymentLinkTransaction = {
  id: number;
  external_id?: string | null;
  amount: number;
  is_active: boolean;
  title?: string | null;
  order_no?: string | null;
  description?: string | null;
  customer_name?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
};

export type PaymentLink = {
  id: number;
  code: string;
  amount: number;
  title: string;
  status: 'Active' | 'Inactive';
  created: string;
  validUntil: string;
  description: string;
  orderNo: string;
  payor: string;
  paymentUrl?: string;
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function mapPaymentLink(txn: PaymentLinkTransaction): PaymentLink {
  const paymentUrl = txn.external_id ? `${window.location.origin}/checkout/${txn.external_id}` : undefined;
  return {
    id: txn.id,
    code: txn.external_id || String(txn.id),
    amount: txn.amount,
    title: txn.title || txn.description || 'Payment link',
    status: txn.is_active ? 'Active' : 'Inactive',
    created: formatDate(txn.created_at),
    validUntil: formatDate(txn.expires_at),
    description: txn.description || '-',
    orderNo: txn.order_no || txn.external_id || '-',
    payor: txn.customer_name || '-',
    paymentUrl,
  };
}

export async function getAllPaymentLinks(): Promise<PaymentLink[]> {
  const response = await client.get('/api/v1/payment-links');
  if (!response.ok || !Array.isArray(response.data)) {
    throw new Error((response.data as { detail?: string })?.detail || 'Unable to load payment links');
  }
  return response.data.map(mapPaymentLink);
}

export async function getPaymentLink(id: string): Promise<PaymentLink | null> {
  const response = await client.get(`/api/v1/payment-links/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error((response.data as { detail?: string })?.detail || 'Unable to load payment link');
  }
  return mapPaymentLink(response.data as PaymentLinkTransaction);
}

export async function togglePaymentLinkStatus(link: PaymentLink): Promise<PaymentLink> {
  const response = await client.patch(`/api/v1/payment-links/${link.id}`, {
    is_active: link.status !== 'Active',
  });
  if (!response.ok) {
    throw new Error((response.data as { detail?: string })?.detail || 'Unable to update payment link');
  }
  return mapPaymentLink(response.data as PaymentLinkTransaction);
}
