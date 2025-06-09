export interface User {
  uid: string;

  name?: string;
  nameFirst?: string;
  nameLast?: string;
  email: string;
  phone?: string;
  photoUrl?: string;

  status: UserStatus;

  // usage details
  lastEmailAt: Date; // date the last email was received from this user
  inboundEmailCount: number; // the number of emails received by coldPitchPro from this user

  // billing
  trialEmailsLeft: number; // the number of received emails left in the free trial
  subscribedAt?: Date;
  subscriptionId?: string; // the ID of the subscription in Lemon Squeezy

  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string; // 'US'
  };

  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  FreeTrial = 'freeTrial', // new user, still has free email responses left
  TrialExpired = 'trialExpired', // trial used up, user has not subscribed yet
  Subscribed = 'subscribed', // currently subscribed
  Unsubscribed = 'unsubscribed', // user has unsubscribed
  Blocked = 'blocked', // user has been blocked by the system
}
