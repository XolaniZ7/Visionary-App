import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface TwitchResetPasswordEmailProps {
  children: ReactNode;
}

export const EmailLayout = ({ children }: TwitchResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />

      {/* <Preview>You updated the password for your Twitch account</Preview> */}
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Img
              className="logo-light-mode"
              width={114}
              src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/43e4bd62-dc89-47b4-6209-7901c09d1900/Thumbnail`}
            />
            <Img
              className="logo-dark-mode"
              width={114}
              src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/56678976-e890-4b66-ece0-adbcfca62600/Thumbnail`}
              style={{ display: "none" }}
            />
          </Section>
          <Section style={sectionsBorders}>
            <Row>
              <Column style={sectionBorder} />
              <Column style={sectionCenter} />
              <Column style={sectionBorder} />
            </Row>
          </Section>
          <Section style={content}>{children}</Section>
        </Container>

        <Section style={footer}>
          <Text style={{ textAlign: "center", color: "#706a7b" }}>
            © 2023 Visionary Writings, All Rights Reserved
          </Text>
        </Section>
      </Body>
    </Html>
  );
};

export default EmailLayout;

type ContactFormEmailprops = {
  name: string;
  email: string;
  message: string;
};
export const ContactFormEmail = (props: ContactFormEmailprops) => {
  return (
    <EmailLayout>
      <Text style={paragraph}>Hi Admin,</Text>
      <Text style={paragraph}>You have recived a new submission on the contact form</Text>
      <Text style={paragraph}>Name: {props.name}</Text>
      <Text style={paragraph}>From: {props.email}</Text>
      <Text style={paragraph}>Message: {props.message}</Text>
    </EmailLayout>
  );
};

type ForgotPasswordEmailprops = {
  name: string;
  email: string;
  resetPasswordUrl: string;
};
export const ForgotPasswordEmail = (props: ForgotPasswordEmailprops) => {
  return (
    <EmailLayout>
      <Text style={paragraph}>Password Reset</Text>
      <Text style={paragraph}>
        <Link style={link} href={props.resetPasswordUrl}>
          👉 Click here to sign in 👈
        </Link>
        <Text style={paragraph}>If you didn't request this, please ignore this email.</Text>
      </Text>
    </EmailLayout>
  );
};

const fontFamily = "HelveticaNeue,Helvetica,Arial,sans-serif";

const main = {
  backgroundColor: "#efeef1",
  fontFamily,
};

const paragraph = {
  lineHeight: 1.5,
  fontSize: 14,
};

const container = {
  width: "580px",
  margin: "30px auto",
  backgroundColor: "#ffffff",
};

const footer = {
  width: "580px",
  margin: "0 auto",
};

const content = {
  padding: "5px 50px 10px 60px",
};

const logo = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 30,
};

const sectionsBorders = {
  width: "100%",
  display: "flex",
};

const sectionBorder = {
  borderBottom: "1px solid rgb(238,238,238)",
  width: "249px",
};

const sectionCenter = {
  borderBottom: "1px solid rgb(145,71,255)",
  width: "102px",
};

const link = {
  textDecoration: "underline",
};
