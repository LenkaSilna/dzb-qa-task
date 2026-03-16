export const ROUTES = {
  cz: {
    homepage: '/',
    voucher: '/voucher',
    voucherVerification: '/overeni-poukazu',
    order: '/objednavka',
    accommodation: '/ubytovani',
    reservation: '/rezervace',
    status: '/status',
  },
  pl: {
    homepage: '/',
    voucherVerification: '/sprawdz-voucher',
    order: '/zamowienie',
    accommodation: '/nocleg',
    reservation: '/rezerwacja',
    status: '/status',
  },
  whitelabel: {
    homepage: '/',
    voucher: '/voucher',
    voucherVerification: '/overeni-poukazu',
    order: '/objednavka',
    accommodation: '/ubytovani',
    reservation: '/rezervace',
    status: '/status',
  },
} as const;

export type ProjectName = keyof typeof ROUTES; // Extract valid project names
