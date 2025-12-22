/* import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  username?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

export const VercelInviteUserEmail = ({
  username = "zenorocha",
  userImage = `${baseUrl}/static/vercel-user.png`,
  invitedByUsername = "bukinoshita",
  invitedByEmail = "bukinoshita@example.com",
  teamName = "My Project",
  teamImage = `${baseUrl}/static/vercel-team.png`,
  inviteLink = "https://vercel.com/teams/invite/foo",
}: VercelInviteUserEmailProps) => {
  const previewText = `Join ${invitedByUsername} on Vercel`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ marginTop: "32px" }}>
            <Img
              src={`${baseUrl}/static/vercel-logo.png`}
              width="40"
              height="37"
              alt="Vercel"
              style={logo}
            />
          </Section>
          <Heading style={h1}>
            Join <strong>{teamName}</strong> on <strong>Vercel</strong>
          </Heading>
          <Text style={text}>Hello {username},</Text>
          <Text style={text}>
            <strong>bukinoshita</strong> (
            <Link href={`mailto:${invitedByEmail}`} style={link}>
              {invitedByEmail}
            </Link>
            ) has invited you to the <strong>{teamName}</strong> team on <strong>Vercel</strong>.
          </Text>
          <Section>
            <Row>
              <Column align="right">
                <Img style={avatar} src={userImage} width="64" height="64" />
              </Column>
              <Column align="center">
                <Img
                  src={`${baseUrl}/static/vercel-arrow.png`}
                  width="12"
                  height="9"
                  alt="invited you to"
                />
              </Column>
              <Column align="left">
                <Img style={avatar} src={teamImage} width="64" height="64" />
              </Column>
            </Row>
          </Section>
          <Section
            style={{
              textAlign: "center",
              marginTop: "26px",
              marginBottom: "26px",
            }}
          >
            <Button pX={20} pY={12} style={btn} href={inviteLink}>
              Join the team
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VercelInviteUserEmail;

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  border: "1px solid #eaeaea",
  borderRadius: "5px",
  margin: "40px auto",
  padding: "20px",
  width: "465px",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "normal",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
};

const avatar = {
  borderRadius: "100%",
};

const link = {
  color: "#067df7",
  textDecoration: "none",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const btn = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "50px",
  textDecoration: "none",
  textAlign: "center" as const,
};
 */
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  verifyLink: string;
}

const VerificationEmail = ({ name, verifyLink }: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your visionary writings password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/43e4bd62-dc89-47b4-6209-7901c09d1900/Thumbnail`}
            width="100"
            height="100"
            alt="Visionary Writings Logo"
          />
          <Section>
            <Text style={text}>Welcome {name},</Text>
            <Text style={text}>
              Thank you for signing up. Please click the button below to verify your account.
            </Text>
            <Button style={button} href={verifyLink}>
              Verify Account
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#ff980a",
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};
