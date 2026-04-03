export const IITK_DEPARTMENTS = [
  'AE',
  'BSBE',
  'CE',
  'CHE',
  'CHM',
  'CSE',
  'ECO',
  'EE',
  'ES',
  'HSS',
  'MSE',
  'ME',
  'MTH',
  'PHY',
  'COGS',
  'DESIGN',
  'IME',
  'SPS',
];

export const isValidIitkDepartment = (value) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  return IITK_DEPARTMENTS.includes(String(value).trim().toUpperCase());
};
