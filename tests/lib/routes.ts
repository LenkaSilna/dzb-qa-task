export const ROUTES = {
  cz: {
    homepage: '/',
    order: '/objednavka',
    accommodation: '/ubytovani',
    reservation: '/rezervace',
    status: '/status',
  },
  pl: {
    homepage: '/',
    order: '/zamowienie',
    accommodation: '/nocleg',
    reservation: '/rezerwacja',
    status: '/status',
  },
  whitelabel: {
    homepage: '/',
    order: '/objednavka',
    accommodation: '/ubytovani',
    reservation: '/rezervace',
    status: '/status',
  },
} as const;

export type ProjectName = keyof typeof ROUTES; // Extract valid project names
