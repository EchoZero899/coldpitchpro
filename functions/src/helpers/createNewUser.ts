import * as logger from 'firebase-functions/logger';
import { admin } from '../integrations/firebase';
import { User, UserStatus } from '../schema';
import { ulid } from 'ulid';

// add a new user doc to firestore
const createNewUser = async (
  email: string,
  fullName: string = ''
): Promise<User | undefined> => {
  try {
    // lookup free trial settings (default to 5 free emails)
    let freeTrialEmailCount: number = 5;
    const configSnap = await admin
      .firestore()
      .collection('config')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (configSnap && !configSnap.empty) {
      const configDoc = configSnap.docs[0];
      const config = configDoc.data();
      freeTrialEmailCount = Math.max(1, Number(config.freeTrialEmails)) || 5;
    }

    // setup new user document
    const uid = email.toLowerCase();
    const nameParts = fullName.split(' ');
    const nameFirst = nameParts[0] || '';
    const nameLast = nameParts.slice(1).join(' ') || '';
    const newUser: User = {
      uid,
      name: fullName,
      nameFirst,
      nameLast,
      email,

      status: UserStatus.FreeTrial,

      lastEmailAt: new Date(),
      inboundEmailCount: 1,
      trialEmailsLeft: freeTrialEmailCount - 1,

      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await admin.firestore().collection('users').doc(uid).set(newUser);

    // return new user data
    return newUser;
  } catch (error) {
    logger.error(`Error creating new user document`);
    logger.error(error);
    return undefined;
  }
};

export default createNewUser;
