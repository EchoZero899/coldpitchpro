import { Persona } from '../schema';
import get from 'lodash/get';

const getPersona = (data: any): Persona => {
  const personaName = get(data, ['personaName'], 'Callie');
  const personaRole = get(data, ['personaRole'], 'Potential Customer');
  const personaTitle = get(
    data,
    ['personaTitle'],
    'Potential Customer, Example Company'
  );
  const personaTone = get(data, ['personaTone'], 'Professional and concise');
  const personaPersonality = get(
    data,
    ['personaPersonality'],
    'curious, friendly, skeptical, easily distracted'
  );
  const personaMotivation = get(
    data,
    ['personaMotivation'],
    'To do your job well and make good decisions'
  );
  const vendorRole = get(data, ['vendorRole'], 'salesperson');
  const vendorMotivation = get(
    data,
    ['vendorMotivation'],
    'get you to accept their pitch'
  );

  // return prompt response
  return {
    personaName,
    personaRole,
    personaTitle,
    personaTone,
    personaPersonality,
    personaMotivation,
    vendorRole,
    vendorMotivation,
  };
};

export default getPersona;
