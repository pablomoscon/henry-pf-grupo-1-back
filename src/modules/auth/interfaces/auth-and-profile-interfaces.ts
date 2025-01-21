interface UserInfoData {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  locale?: string;
}

interface PeopleData {
  phoneNumbers?: Array<{
    value: string; 
    canonicalForm?: string;
    type?: string;
  }>;
  addresses?: Array<{
    formattedValue: string;
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }>;
}
