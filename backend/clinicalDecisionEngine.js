/**
 * Clinical Decision Engine - Implements WHO IMCI (Integrated Management of Childhood Illness)
 * Based on WHO Crisis Kids CCC DAK decision-support logic
 */

// Age-specific respiratory rate thresholds for fast breathing
const FAST_BREATHING_THRESHOLDS = {
  '<2months': 60,
  '2-11months': 50,
  '12months-5years': 40
};

/**
 * Determine if child has fast breathing based on age and respiratory rate
 */
function hasFastBreathing(ageInMonths, respiratoryRate) {
  if (!respiratoryRate) return false;

  if (ageInMonths < 2) {
    return respiratoryRate >= FAST_BREATHING_THRESHOLDS['<2months'];
  } else if (ageInMonths < 12) {
    return respiratoryRate >= FAST_BREATHING_THRESHOLDS['2-11months'];
  } else {
    return respiratoryRate >= FAST_BREATHING_THRESHOLDS['12months-5years'];
  }
}

/**
 * Check for danger signs that require immediate referral
 */
function checkDangerSigns(patientData) {
  const dangerSigns = [];

  if (patientData.convulsions || patientData.hasConvulsions) {
    dangerSigns.push('Convulsions');
  }

  if (patientData.chestIndrawing || patientData.hasChestIndrawing) {
    dangerSigns.push('Chest indrawing');
  }

  if (patientData.unconscious || patientData.isUnconscious || patientData.lethargic) {
    dangerSigns.push('Unconsciousness/Lethargy');
  }

  if (patientData.cannotDrink || patientData.cannotEat || patientData.unableToDrink) {
    dangerSigns.push('Unable to drink or eat');
  }

  if (patientData.vomitsEverything) {
    dangerSigns.push('Vomits everything');
  }

  // Severe dehydration signs
  if (patientData.sunkenEyes && patientData.skinPinch === 'very slow') {
    dangerSigns.push('Severe dehydration');
  }

  // Severe malnutrition
  if (patientData.muac === 'red' || patientData.bilateralFootEdema) {
    dangerSigns.push('Severe malnutrition');
  }

  return dangerSigns;
}

/**
 * Assess respiratory symptoms (cough/difficult breathing)
 */
function assessRespiratory(patientData) {
  const { hasCough, coughDuration, respiratoryRate, ageInMonths, chestIndrawing, stridorWhenCalm } = patientData;

  if (!hasCough) return null;

  const fastBreathing = hasFastBreathing(ageInMonths, respiratoryRate);

  // Severe pneumonia or very severe disease
  if (chestIndrawing || stridorWhenCalm) {
    return {
      classification: 'SEVERE PNEUMONIA OR VERY SEVERE DISEASE',
      severity: 'severe',
      action: 'REFER URGENTLY to hospital',
      treatment: 'Pre-referral treatment: First dose of antibiotic (amoxicillin)',
      followUp: 'IMMEDIATE'
    };
  }

  // Pneumonia
  if (fastBreathing) {
    return {
      classification: 'PNEUMONIA',
      severity: 'moderate',
      action: 'Treat with oral antibiotics',
      treatment: 'Amoxicillin (age-appropriate dosing) for 5 days',
      dosing: getAmoxicillinDosing(patientData.ageInMonths, patientData.weight),
      followUp: '2 days (or sooner if worse)'
    };
  }

  // No pneumonia - cough or cold
  if (coughDuration < 14) {
    return {
      classification: 'COUGH OR COLD (No pneumonia)',
      severity: 'mild',
      action: 'Home care',
      treatment: 'Home care advice: soothe throat, clear nose, continue feeding',
      followUp: '5 days (or sooner if worse)'
    };
  }

  // Chronic cough
  if (coughDuration >= 14) {
    return {
      classification: 'CHRONIC COUGH',
      severity: 'moderate',
      action: 'REFER for assessment',
      treatment: 'Assess for TB, asthma, or other chronic conditions',
      followUp: 'As per referral facility'
    };
  }

  return null;
}

/**
 * Assess diarrhea
 */
function assessDiarrhea(patientData) {
  const { hasDiarrhea, diarrheaDuration, bloodInStool, sunkenEyes, skinPinch, drinksEagerly, restless } = patientData;

  if (!hasDiarrhea) return null;

  // Severe persistent diarrhea
  if (diarrheaDuration >= 14) {
    return {
      classification: 'SEVERE PERSISTENT DIARRHEA',
      severity: 'severe',
      action: 'REFER to hospital',
      treatment: 'Continue feeding, ORS, zinc',
      followUp: 'IMMEDIATE'
    };
  }

  // Dysentery (blood in stool)
  if (bloodInStool) {
    return {
      classification: 'DYSENTERY',
      severity: 'severe',
      action: 'REFER to hospital',
      treatment: 'Pre-referral: ORS, zinc, and first dose of ciprofloxacin',
      followUp: 'IMMEDIATE'
    };
  }

  // Assess dehydration
  let dehydrationStatus = 'NO DEHYDRATION';
  if ((sunkenEyes || drinksEagerly || restless) && skinPinch === 'slow') {
    dehydrationStatus = 'SOME DEHYDRATION';
  } else if (sunkenEyes && (drinksEagerly || restless)) {
    dehydrationStatus = 'SOME DEHYDRATION';
  } else if (sunkenEyes && skinPinch === 'very slow') {
    dehydrationStatus = 'SEVERE DEHYDRATION';
  }

  if (dehydrationStatus === 'SEVERE DEHYDRATION') {
    return {
      classification: 'DIARRHEA WITH SEVERE DEHYDRATION',
      severity: 'severe',
      action: 'REFER URGENTLY to hospital',
      treatment: 'Start IV fluids immediately or NG tube if unable',
      followUp: 'IMMEDIATE'
    };
  }

  if (dehydrationStatus === 'SOME DEHYDRATION') {
    return {
      classification: 'DIARRHEA WITH SOME DEHYDRATION',
      severity: 'moderate',
      action: 'Give ORS solution over 4 hours',
      treatment: 'ORS: 75ml/kg over 4 hours + zinc for 10-14 days',
      dosing: getZincDosing(patientData.ageInMonths),
      followUp: 'Reassess after 4 hours, then 2 days'
    };
  }

  // No dehydration
  return {
    classification: 'DIARRHEA WITH NO DEHYDRATION',
    severity: 'mild',
    action: 'Home treatment',
    treatment: 'ORS after each loose stool + zinc for 10-14 days + continue feeding',
    dosing: getZincDosing(patientData.ageInMonths),
    followUp: '3 days (or sooner if signs of dehydration)'
  };
}

/**
 * Assess fever (malaria/other febrile illness)
 */
function assessFever(patientData) {
  const { hasFever, feverDuration, malariaTestPositive, malariaRiskArea, hasStiffNeck, hasBulgingFontanelle } = patientData;

  if (!hasFever) return null;

  // Meningitis signs
  if (hasStiffNeck || hasBulgingFontanelle) {
    return {
      classification: 'MENINGITIS',
      severity: 'severe',
      action: 'REFER URGENTLY to hospital',
      treatment: 'Pre-referral: First dose of ceftriaxone',
      followUp: 'IMMEDIATE'
    };
  }

  // Malaria
  if (malariaRiskArea && malariaTestPositive) {
    return {
      classification: 'MALARIA',
      severity: 'moderate',
      action: 'Treat with antimalarial',
      treatment: 'Artemisinin-based combination therapy (ACT) - age-appropriate dosing',
      dosing: getArtemisinDosing(patientData.ageInMonths, patientData.weight),
      followUp: '2 days (or sooner if worse)'
    };
  }

  // Fever in malaria area but negative test
  if (malariaRiskArea && !malariaTestPositive) {
    return {
      classification: 'FEVER - MALARIA UNLIKELY',
      severity: 'mild',
      action: 'Treat fever, give paracetamol',
      treatment: 'Paracetamol for fever, increase fluids. Look for other causes (ear, throat, urine)',
      followUp: '2 days'
    };
  }

  // General fever
  return {
    classification: 'FEVER - NO CLEAR SOURCE',
    severity: 'mild',
    action: 'Symptomatic treatment',
    treatment: 'Paracetamol for fever, increase fluids, monitor closely',
    followUp: '2 days (or sooner if danger signs appear)'
  };
}

/**
 * Assess malnutrition
 */
function assessMalnutrition(patientData) {
  const { muac, bilateralFootEdema, weightForHeight } = patientData;

  // Severe acute malnutrition
  if (muac === 'red' || bilateralFootEdema) {
    return {
      classification: 'SEVERE ACUTE MALNUTRITION',
      severity: 'severe',
      action: 'REFER to nutritional rehabilitation program',
      treatment: 'RUTF (Ready-to-Use Therapeutic Food) or F-75/F-100 milk',
      followUp: 'Weekly until MUAC > 125mm'
    };
  }

  // Moderate acute malnutrition
  if (muac === 'yellow') {
    return {
      classification: 'MODERATE ACUTE MALNUTRITION',
      severity: 'moderate',
      action: 'Supplementary feeding program',
      treatment: 'RUSF (Ready-to-Use Supplementary Food), counsel on feeding',
      followUp: 'Bi-weekly until MUAC > 125mm'
    };
  }

  return null;
}

/**
 * Get amoxicillin dosing based on age and weight
 */
function getAmoxicillinDosing(ageInMonths, weight) {
  if (ageInMonths < 2) {
    return 'Amoxicillin 50mg/kg twice daily for 5 days (REFER for assessment)';
  } else if (ageInMonths < 12) {
    return 'Amoxicillin 250mg (1/2 tablet) twice daily for 5 days';
  } else {
    return 'Amoxicillin 500mg (1 tablet) twice daily for 5 days';
  }
}

/**
 * Get zinc dosing based on age
 */
function getZincDosing(ageInMonths) {
  if (ageInMonths < 6) {
    return 'Zinc 10mg (1/2 tablet) once daily for 10-14 days';
  } else {
    return 'Zinc 20mg (1 tablet) once daily for 10-14 days';
  }
}

/**
 * Get artemisinin dosing based on age and weight
 */
function getArtemisinDosing(ageInMonths, weight) {
  if (weight < 5) {
    return 'Artemisinin-based ACT - infant dose (consult dosing chart)';
  } else if (weight < 15) {
    return 'Artemisinin-based ACT - child dose 5-14kg';
  } else {
    return 'Artemisinin-based ACT - child dose 15-24kg';
  }
}

/**
 * Main diagnostic function - returns comprehensive assessment
 */
export function diagnosePatient(patientData) {
  const diagnoses = [];
  const treatments = [];
  const followUps = [];
  let referralNeeded = false;
  let urgentReferral = false;

  // 1. Check for danger signs FIRST (highest priority)
  const dangerSigns = checkDangerSigns(patientData);
  if (dangerSigns.length > 0) {
    diagnoses.push({
      classification: 'DANGER SIGNS PRESENT',
      severity: 'critical',
      action: 'REFER URGENTLY to hospital immediately',
      dangerSigns: dangerSigns,
      treatment: 'Pre-referral treatment: Keep warm, give nothing by mouth if unconscious, position appropriately',
      followUp: 'IMMEDIATE REFERRAL'
    });
    urgentReferral = true;
    referralNeeded = true;
  }

  // 2. Assess respiratory system
  const respiratoryAssessment = assessRespiratory(patientData);
  if (respiratoryAssessment) {
    diagnoses.push(respiratoryAssessment);
    if (respiratoryAssessment.severity === 'severe') {
      referralNeeded = true;
      urgentReferral = true;
    }
  }

  // 3. Assess diarrhea
  const diarrheaAssessment = assessDiarrhea(patientData);
  if (diarrheaAssessment) {
    diagnoses.push(diarrheaAssessment);
    if (diarrheaAssessment.severity === 'severe') {
      referralNeeded = true;
      urgentReferral = true;
    }
  }

  // 4. Assess fever
  const feverAssessment = assessFever(patientData);
  if (feverAssessment) {
    diagnoses.push(feverAssessment);
    if (feverAssessment.severity === 'severe') {
      referralNeeded = true;
      urgentReferral = true;
    }
  }

  // 5. Assess malnutrition
  const malnutritionAssessment = assessMalnutrition(patientData);
  if (malnutritionAssessment) {
    diagnoses.push(malnutritionAssessment);
    if (malnutritionAssessment.severity === 'severe') {
      referralNeeded = true;
    }
  }

  // If no specific diagnoses, child is healthy or needs preventive care
  if (diagnoses.length === 0) {
    diagnoses.push({
      classification: 'NO URGENT PROBLEMS IDENTIFIED',
      severity: 'none',
      action: 'Health education and preventive care',
      treatment: 'Continue breastfeeding, proper nutrition, immunizations up to date',
      followUp: 'Next scheduled well-child visit'
    });
  }

  // Compile treatments and follow-ups
  diagnoses.forEach(diagnosis => {
    if (diagnosis.treatment) {
      treatments.push({
        condition: diagnosis.classification,
        treatment: diagnosis.treatment,
        dosing: diagnosis.dosing || null
      });
    }
    if (diagnosis.followUp) {
      followUps.push({
        condition: diagnosis.classification,
        timeline: diagnosis.followUp
      });
    }
  });

  return {
    patientInfo: {
      name: patientData.name,
      age: patientData.age,
      ageInMonths: patientData.ageInMonths,
      sex: patientData.sex,
      weight: patientData.weight,
      muac: patientData.muac
    },
    diagnoses: diagnoses,
    treatments: treatments,
    followUp: followUps,
    referralNeeded: referralNeeded,
    urgentReferral: urgentReferral,
    chiefComplaint: patientData.chiefComplaint,
    dangerSigns: dangerSigns,
    timestamp: new Date().toISOString()
  };
}

export default { diagnosePatient };
