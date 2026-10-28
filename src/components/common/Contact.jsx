import { CONTACT_EMAIL } from '../../config.js';

// "email us" when a contact address is configured, otherwise points to the Report button.
export default function Contact() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <span>the “Report a problem” button on any movie page</span>
  );
}
