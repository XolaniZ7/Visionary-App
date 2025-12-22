import { render } from "@react-email/render";
import WelcomeEmail from "emails/Activated";
import { ContactFormEmail } from "emails/EmailLayout";
import ForgotPasswordEmail from "emails/ForgotPasswordEmail";
import VerificationEmail from "emails/VerificationEmail";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";

import { k } from "./db";

const devEmail = "riyaadh.abr@gmail.com";
const smpt = await k.selectFrom("smtpemail").selectAll().executeTakeFirstOrThrow();

// const transporter = nodemailer.createTransport({
//   host: "localhost",
//   port: 1025,
// });

const transporter = nodemailer.createTransport({
  host: smpt.MAIL_HOST,
  port: Number(smpt.MAIL_PORT),
  secure: true,
  auth: {
    user: smpt.MAIL_USERNAME,
    pass: smpt.MAIL_PASSWORD,
  },
});

type SendEmailOptions = {
  email: string;
  subject: string;
  component: ReactElement;
};

const sendEmail = async ({ email, subject, component }: SendEmailOptions) => {
  try {
    const emailHtml = render(component);
    const emailText = render(component, { plainText: true });

    console.log("Sending Email");

    await transporter.sendMail({
      sender: "Visionary Writings",
      from: smpt.MAIL_FROM_ADDRESS,
      to: import.meta.env.DEV ? devEmail : email,
      subject,
      html: emailHtml,
      text: emailText,
    });
  } catch (e) {
    console.log(e);
  }
};

export const sendWelcomeEmail = async (name: string, email: string) => {
  await sendEmail({
    email,
    subject: "Welcome to Visionary Writings",
    component: <WelcomeEmail name={name} loginLink={process.env.ASTROAUTH_URL ?? ""} />,
  });
};

export const sendVerificationEmail = async (name: string, email: string, verifyLink: string) => {
  await sendEmail({
    email,
    subject: "Please confirm your email",
    component: <VerificationEmail name={name} verifyLink={verifyLink} />,
  });
};
export const sendContactFormEmail = async (name: string, email: string, message: string) => {
  await sendEmail({
    email: "info@visionarywritings.com",
    subject: "New Contact Form Submission",
    component: <ContactFormEmail name={name} email={email} message={message} />,
  });
};
export const sendForgotPasswordEmail = async (
  name: string,
  email: string,
  resetPasswordLink: string
) => {
  await sendEmail({
    email,
    subject: "Reset your password",
    component: <ForgotPasswordEmail userFirstname={name} resetPasswordLink={resetPasswordLink} />,
  });
};
