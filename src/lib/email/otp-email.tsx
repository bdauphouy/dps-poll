import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OtpEmailProps {
  code: string;
  expiryMinutes: number;
}

export function OtpEmail({ code, expiryMinutes }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your login code is {code}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Login code</Heading>
          <Text style={paragraph}>
            Enter this code to access the dashboard:
          </Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={paragraph}>
            This code expires in {expiryMinutes} minutes.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request this code, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "32px 40px",
  borderRadius: "16px",
  maxWidth: "400px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  marginBottom: "8px",
  marginTop: "0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#666666",
  fontSize: "15px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const codeContainer = {
  backgroundColor: "#f0f0f0",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const codeText = {
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "8px",
  color: "#1a1a1a",
  margin: "0",
  textAlign: "center" as const,
  fontFamily: "monospace",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footer = {
  color: "#999999",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "0",
};

export default OtpEmail;
