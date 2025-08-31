// Medical Knowledge Base for Personalized AI Training
const medicalKnowledgeBase = {
  // Pregnancy week-specific information
  weeklyGuidance: {
    1: { trimester: 1, focus: "Early pregnancy care", symptoms: ["fatigue", "nausea"], advice: "Start prenatal vitamins, avoid alcohol" },
    4: { trimester: 1, focus: "Embryo development", symptoms: ["morning sickness", "breast tenderness"], advice: "Eat small frequent meals" },
    8: { trimester: 1, focus: "First prenatal visit", symptoms: ["nausea", "fatigue"], advice: "Schedule first doctor visit" },
    12: { trimester: 1, focus: "End of first trimester", symptoms: ["nausea improving"], advice: "Consider sharing pregnancy news" },
    16: { trimester: 2, focus: "Anatomy scan preparation", symptoms: ["energy returning"], advice: "Schedule anatomy scan" },
    20: { trimester: 2, focus: "Halfway point", symptoms: ["baby movements"], advice: "Start feeling baby kicks" },
    24: { trimester: 2, focus: "Glucose screening", symptoms: ["back pain"], advice: "Glucose tolerance test" },
    28: { trimester: 3, focus: "Third trimester begins", symptoms: ["shortness of breath"], advice: "More frequent checkups" },
    32: { trimester: 3, focus: "Baby growth spurt", symptoms: ["heartburn", "swelling"], advice: "Monitor baby movements daily" },
    36: { trimester: 3, focus: "Full term approaching", symptoms: ["pelvic pressure"], advice: "Prepare hospital bag" },
    40: { trimester: 3, focus: "Due date", symptoms: ["contractions"], advice: "Watch for labor signs" }
  },

  // Symptom-specific guidance
  symptoms: {
    "morning sickness": {
      causes: ["hormonal changes", "hCG levels"],
      remedies: ["ginger tea", "small frequent meals", "crackers", "vitamin B6"],
      whenToWorry: ["can't keep fluids down", "weight loss", "dehydration"],
      personalizedTips: (week) => week < 12 ? "Very common in first trimester" : "Should be improving now"
    },
    "back pain": {
      causes: ["weight gain", "posture changes", "relaxin hormone"],
      remedies: ["prenatal yoga", "pregnancy pillow", "warm compress", "proper posture"],
      whenToWorry: ["severe pain", "pain down leg", "numbness"],
      personalizedTips: (week) => week > 20 ? "Common as baby grows" : "May be early pregnancy symptom"
    },
    "heartburn": {
      causes: ["progesterone", "uterus pressure on stomach"],
      remedies: ["small meals", "avoid spicy foods", "sleep elevated", "Tums"],
      whenToWorry: ["severe pain", "can't eat", "vomiting"],
      personalizedTips: (week) => week > 24 ? "Very common in third trimester" : "May start in second trimester"
    }
  },

  // Nutrition guidance by trimester
  nutrition: {
    1: {
      calories: 0, // no extra calories needed
      focus: ["folic acid", "iron", "avoiding harmful foods"],
      foods: ["leafy greens", "citrus fruits", "fortified cereals"],
      avoid: ["raw fish", "alcohol", "high mercury fish"]
    },
    2: {
      calories: 340, // extra calories per day
      focus: ["calcium", "protein", "healthy weight gain"],
      foods: ["dairy", "lean meat", "whole grains"],
      avoid: ["unpasteurized cheese", "raw eggs"]
    },
    3: {
      calories: 450, // extra calories per day
      focus: ["iron", "calcium", "omega-3"],
      foods: ["fish", "nuts", "vegetables"],
      avoid: ["excessive caffeine", "large fish"]
    }
  },

  // Exercise recommendations
  exercise: {
    safe: ["walking", "swimming", "prenatal yoga", "stationary bike"],
    avoid: ["contact sports", "lying on back", "hot yoga", "activities with fall risk"],
    byTrimester: {
      1: "Light exercise, listen to body",
      2: "Best time for exercise, energy returns",
      3: "Modify as needed, avoid overheating"
    }
  },

  // Warning signs requiring immediate care
  emergencySymptoms: [
    "severe abdominal pain",
    "heavy bleeding",
    "severe headache with vision changes",
    "difficulty breathing",
    "chest pain",
    "decreased fetal movement after 28 weeks",
    "signs of preterm labor",
    "severe swelling with headache"
  ]
};

module.exports = medicalKnowledgeBase;