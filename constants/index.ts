export const GenderOptions = ["Male", "Female", "Other"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
  "Aadhaar Card",
  "State ID Card",
  "Student ID Card",
  "Pan Card",
  "Voter ID Card",
];

export const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: "Raj Kapoor",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Ishita Mehta",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "Vivaan Reddy",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Aditya Singh",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Diya Patel",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Karan Malhotra",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Sneha Das",
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: "Ananya Nair",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Rohan Deshmukh",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
