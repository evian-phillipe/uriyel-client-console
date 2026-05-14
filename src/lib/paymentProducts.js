export const paymentProductMap = {
  general_access: {
    key: 'general_access',
    label: 'General Access',
    type: 'Full payment',
    amountGbp: 180,
    description: 'Standard private release access.',
  },
  vip_dinner: {
    key: 'vip_dinner',
    label: 'VIP Dinner',
    type: 'Full payment',
    amountGbp: 480,
    description: 'VIP access with dinner allocation.',
  },
  glamping_deposit: {
    key: 'glamping_deposit',
    label: 'Glamping Deposit',
    type: 'Deposit',
    amountGbp: 220,
    description: 'Deposit to reserve glamping access.',
  },
  glamping_balance: {
    key: 'glamping_balance',
    label: 'Glamping Balance',
    type: 'Balance',
    amountGbp: 260,
    description: 'Final balance to activate glamping pass.',
  },
  sponsor_guest_allocation: {
    key: 'sponsor_guest_allocation',
    label: 'Sponsor Guest Allocation',
    type: 'Allocation',
    amountGbp: 0,
    description: 'No-charge sponsor allocation record.',
  },
  comp_guest: {
    key: 'comp_guest',
    label: 'Comp Guest',
    type: 'Manual comp',
    amountGbp: 0,
    description: 'Complimentary guest allocation.',
  },
};

export function getDefaultProductKeyForGuest(guest) {
  const tier = String(guest?.tier || '').toLowerCase();
  const status = String(guest?.paymentStatus || '').toLowerCase();

  if (status.includes('deposit')) return 'glamping_balance';
  if (tier.includes('vip')) return 'vip_dinner';
  if (tier.includes('glamping')) return 'glamping_deposit';
  if (tier.includes('sponsor')) return 'sponsor_guest_allocation';
  if (tier.includes('founder') || status.includes('comp')) return 'comp_guest';
  return 'general_access';
}
