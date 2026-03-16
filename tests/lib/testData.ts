export interface PersonalInfo {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  street: string;
  streetNumber: string;
  postcode: string;
  city: string;
}

export interface GiftInfo {
  recipientName: string;
  message: string;
}

export const VALID_CUSTOMER: PersonalInfo = {
  firstname: 'Jana',
  lastname: 'Testová',
  email: 'jana.testova@example.com',
  phone: '+420777123456',
  street: 'Václavské náměstí',
  streetNumber: '1',
  postcode: '11000',
  city: 'Praha',
};

export const VALID_GIFT: GiftInfo = {
  recipientName: 'Petr Novák',
  message: 'Všechno nejlepší k narozeninám!',
};
