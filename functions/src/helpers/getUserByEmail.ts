import * as logger from 'firebase-functions/logger';
import { admin } from '../integrations/firebase';
import { User } from '../schema';

// get user data from firestore by email address
const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    // lookup user by email
    const userSnap = await admin
      .firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    const userDoc = userSnap.docs[0];

    // if no user found, return undefined
    if (!userDoc || !userDoc.exists) return undefined;

    // return data from user doc
    return userDoc.data() as User;
  } catch (error) {
    logger.error(`Error fetching user by email`);
    logger.error(error);
    return undefined;
  }
};

export default getUserByEmail;
