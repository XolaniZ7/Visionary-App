import { render } from "@react-email/render";
import VerificationEmail from "emails/Activated";

export const emailHtml = render(<VerificationEmail name="riyaadh" loginLink="ssds" />);
