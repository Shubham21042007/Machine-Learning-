export const residenceOptions = [
  { label: 'Rural', value: 1 },
  { label: 'Urban', value: 2 },
]

export const educationOptions = [
  { label: 'Less than Primary School', value: 1 },
  { label: 'Primary School Completed', value: 2 },
  { label: 'Middle School Completed', value: 3 },
  { label: 'Secondary/Matriculation', value: 4 },
  { label: 'Higher Secondary/Intermediate/Senior Secondary', value: 5 },
  { label: 'Diploma/Certificate', value: 6 },
  { label: 'Graduate Degree', value: 7 },
  { label: 'Post-Graduate or Above', value: 8 },
  { label: 'Professional Course/Degree', value: 9 },
]

export const maritalStatusOptions = [
  { label: 'Currently Married', value: 1 },
  { label: 'Widowed', value: 2 },
  { label: 'Divorced', value: 3 },
  { label: 'Separated', value: 4 },
  { label: 'Deserted', value: 5 },
  { label: 'Live-in Relationship', value: 6 },
  { label: 'Never Married', value: 7 },
]

export const sexOptions = [
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Transgender', value: 3 },
]

export const occupationOptions = [
  { label: 'Professional / Salaried Employee', value: 1 },
  { label: 'Skilled Worker / Self-employed', value: 2 },
  { label: 'Agriculture / Farm Worker', value: 3 },
  { label: 'Unskilled / Daily Wage Worker', value: 4 },
  { label: 'Homemaker', value: 5 },
  { label: 'Retired', value: 6 },
  { label: 'Student', value: 7 },
  { label: 'Unemployed', value: 8 },
  { label: 'Other', value: 9 },
]

export const yesNoOptions = [
  { label: 'Yes', value: 1 },
  { label: 'No', value: 2 },
]

export const yesNoBinaryOptions = [
  { label: 'Yes', value: 1 },
  { label: 'No', value: 0 },
]

export const frequencyOptions = [
  { label: 'Every Day', value: 1 },
  { label: 'More Than Once a Week', value: 2 },
  { label: 'Once a Week', value: 3 },
  { label: 'One to Three Times a Month', value: 4 },
  { label: 'Hardly Ever or Never', value: 5 },
]

export const sportsOptions = [
  { label: 'Daily', value: 1 },
  { label: 'Several Times a Week', value: 2 },
  { label: 'Once a Week', value: 3 },
  { label: 'Several Times a Month', value: 4 },
  { label: 'At Least Once a Month', value: 5 },
  { label: 'Rarely / Once in a Year', value: 6 },
  { label: 'Never / Not Relevant', value: 7 },
]

export const healthOptions = [
  { label: 'Excellent', value: 1 },
  { label: 'Very Good', value: 2 },
  { label: 'Good', value: 3 },
  { label: 'Fair', value: 4 },
  { label: 'Poor', value: 5 },
]

export const sleepOptions = [
  { label: 'Never', value: 1 },
  { label: 'Rarely', value: 2 },
  { label: 'Occasionally', value: 3 },
  { label: 'Frequently', value: 4 },
]

export const defaultPatientData = {
  residence: 1,
  dm003: 1,
  dm005: 55,
  dm008: 2,
  dm021: 1,
  we027_main: 5,
  hb001: 2,
  hb101: 2,
  hb211: 5,
  hb213: 5,
  fs507: 5,
  bm017: 145,
  bm018: 90,
  bm019: 75,
  bm028: 20,
  bm029: 20,
  bm030: 18,
  bm031: 18,
  bm056: 10,
  bm057: 10,
  bm061: 1,
  bm062: 1,
  bm063: 1,
  bm064: 1,
  bm067: 171,
  bm071: 75,
  bm076: 90,
  bm079: 100,
  ht001_a: 4,
  ht212: 2,
  ht219: 1,
  ht220: 1,
  ht221: 1,
  ht222: 1,
  ht225: 2,
  ht229s1: 0,
  ht229s2: 0,
  ht229s3: 0,
  ht229s4: 0,
  ht229s5: 0,
  ht229s6: 0,
  ht229s7: 0,
  ht229s8: 0,
  ht229s9: 0,
}

export const requiredFields = Object.keys(defaultPatientData)
