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
