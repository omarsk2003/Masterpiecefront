# Client registration preview

`registration.html` creates a browser-local Client account with a name, email, and password. New accounts enter the Free Plan dashboard immediately. The registration form does not collect lifestyle or health details.

On a new account's first AI Assistant visit, LIFT checks the saved personalization profile. Chat, suggested prompts, and plan actions stay unavailable until the user completes the four-step profile and saves it. The profile is stored under the account's email in browser storage, can be edited later from Profile, and remains complete after refresh or sign-in when its required fields are valid.

This is a frontend preview. The account credential is stored as a salted digest, and AI replies are local sample responses. Backend authentication and persistent account storage will replace these browser-local mechanisms later.
