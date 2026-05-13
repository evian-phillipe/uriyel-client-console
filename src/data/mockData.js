export const client = {
  name: 'Sharkbeams',
  eventName: 'Private Release — Fukuoka',
  dateLabel: 'October 2026',
  status: 'Console v1',
};

export const guests = [
  {
    id: 'gst_001',
    name: 'Aiko Tanaka',
    email: 'aiko@example.com',
    phone: '+81 90 0000 1001',
    tier: 'VIP Dinner',
    paymentStatus: 'Paid',
    accessStatus: 'Issued',
    checkedIn: true,
    sponsor: 'Snow Peak',
    spend: 480,
    notes: 'Priority arrival. Vegetarian dinner preference.',
  },
  {
    id: 'gst_002',
    name: 'James Mori',
    email: 'james@example.com',
    phone: '+44 7700 900202',
    tier: 'Glamping',
    paymentStatus: 'Deposit',
    accessStatus: 'Pending Balance',
    checkedIn: false,
    sponsor: '—',
    spend: 220,
    notes: 'Balance payment required before pass activation.',
  },
  {
    id: 'gst_003',
    name: 'Mina Sato',
    email: 'mina@example.com',
    phone: '+81 90 0000 1003',
    tier: 'Founder Guest',
    paymentStatus: 'Comped',
    accessStatus: 'Issued',
    checkedIn: true,
    sponsor: 'Suntory',
    spend: 0,
    notes: 'Founder allocation. Include in sponsor lounge list.',
  },
  {
    id: 'gst_004',
    name: 'Daniel Cho',
    email: 'daniel@example.com',
    phone: '+852 6000 1004',
    tier: 'General Access',
    paymentStatus: 'Unpaid',
    accessStatus: 'Not Issued',
    checkedIn: false,
    sponsor: '—',
    spend: 0,
    notes: 'Invite accepted. Payment link not completed.',
  },
  {
    id: 'gst_005',
    name: 'Elena Wada',
    email: 'elena@example.com',
    phone: '+81 80 0000 1005',
    tier: 'Sponsor Guest',
    paymentStatus: 'Allocated',
    accessStatus: 'Issued',
    checkedIn: false,
    sponsor: 'Private Partner',
    spend: 0,
    notes: 'Partner allocation. No payment required.',
  },
];

export const paymentProducts = [
  {
    id: 'prod_ga',
    name: 'General Access',
    price: 180,
    type: 'Full payment',
    description: 'Private access pass with QR verification.',
  },
  {
    id: 'prod_vip',
    name: 'VIP Dinner',
    price: 480,
    type: 'Full payment',
    description: 'Dinner, premium access and afterglow allocation.',
  },
  {
    id: 'prod_glamp_deposit',
    name: 'Glamping Deposit',
    price: 220,
    type: 'Deposit',
    description: 'Deposit reserves glamping allocation; balance activates pass.',
  },
  {
    id: 'prod_balance',
    name: 'Balance Payment',
    price: 260,
    type: 'Balance',
    description: 'Balance collection for deposit-only guests.',
  },
];

export const sponsorPerks = [
  {
    id: 'spk_001',
    sponsor: 'Snow Peak',
    perk: 'VIP lounge allocation',
    issued: 24,
    redeemed: 17,
    value: 'High-intent outdoor/lifestyle audience proof',
  },
  {
    id: 'spk_002',
    sponsor: 'Suntory',
    perk: 'Afterglow drinks token',
    issued: 80,
    redeemed: 52,
    value: 'On-site product interaction and redemption data',
  },
  {
    id: 'spk_003',
    sponsor: 'Private Partner',
    perk: 'Founder table access',
    issued: 12,
    redeemed: 9,
    value: 'VIP hospitality allocation and attendance proof',
  },
];

export const accessRules = [
  {
    title: 'Paid guests',
    description: 'Pass issued immediately after Stripe payment confirmation.',
  },
  {
    title: 'Deposit guests',
    description: 'Pass reserved after deposit; activated once balance is collected.',
  },
  {
    title: 'Sponsor guests',
    description: 'Pass issued against controlled sponsor allocation limits.',
  },
  {
    title: 'Comped guests',
    description: 'Manual approval required by owner or event administrator.',
  },
];
