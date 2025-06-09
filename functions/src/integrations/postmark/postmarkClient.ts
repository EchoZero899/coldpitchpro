import { defineString } from 'firebase-functions/params';
import * as postmark from 'postmark';

export const POSTMARK_SERVER_KEY = defineString('POSTMARK_SERVER_KEY');
let postmarkClient: postmark.ServerClient | null = null;

/* example usage:
 * import { POSTMARK_SERVER_KEY, client } from "./postmark";
 * const postmark = client(POSTMARK_SERVER_KEY.value());
 * await postmark.sendEmail({ ... });
 */
export const client = (serverKey: string): postmark.ServerClient => {
  if (!postmarkClient) {
    postmarkClient = new postmark.ServerClient(serverKey);
  }
  return postmarkClient;
};
