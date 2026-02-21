import { motion } from "framer-motion";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function TermsPage({ onGoHome }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "40px 24px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onGoHome}
            style={{ background: "white", border: "1px solid #e2e8f0", color: "#64748b", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
          >
            ← Back to Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/Supasecured.jpg" alt="SupaSecure logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }} />
            <span style={{ fontWeight: 700, color: "#0f172a" }}>SupaSecure</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
        >
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Terms and Conditions</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Last updated: February 21, 2026</p>

          <Section title="Use of Service">
            You agree to use this service only for systems you own or are explicitly authorized to test. Unauthorized scanning or abusive use is prohibited. By using SupaSecure, you represent and warrant that you have full legal authority to scan and analyze the targets you submit.
          </Section>

          <Section title="Publicly Available Data">
            <p style={{ marginBottom: 12 }}>
              SupaSecure operates exclusively by analyzing <strong>publicly accessible information</strong>. Our scanning technology accesses only data that is already exposed to the public internet without authentication. This includes:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Supabase credentials embedded in client-side JavaScript bundles</li>
              <li>API endpoints accessible without authentication</li>
              <li>Database tables and columns exposed through misconfigured Row Level Security (RLS) policies</li>
              <li>Any other information retrievable via standard unauthenticated HTTP requests</li>
            </ul>
            <p style={{ marginBottom: 12 }}>
              <strong>We are not responsible for any data exposure identified by our scans.</strong> If our scanner detects vulnerable or exposed data, that data was already publicly accessible prior to and independent of our scan. SupaSecure does not create, cause, or contribute to any security vulnerabilities—we merely report on pre-existing conditions.
            </p>
            <p>
              You acknowledge that any "leaked" or exposed information discovered by SupaSecure was accessible to any member of the public, including malicious actors, before our scan occurred. We bear no liability for the existence, scope, or consequences of such exposures.
            </p>
          </Section>

          <Section title="Security Scanning Scope">
            The scanner is designed for read-focused security analysis and metadata reporting. We perform only non-destructive, read-only operations. You are responsible for compliance with laws and contractual obligations in your jurisdiction. SupaSecure does not modify, delete, or write any data to your systems.
          </Section>

          <Section title="AI-Generated Recommendations Disclaimer">
            <p style={{ marginBottom: 12 }}>
              SupaSecure provides AI-powered security analysis and remediation recommendations as a convenience feature. <strong>These recommendations are provided for informational purposes only and do not constitute professional security advice.</strong>
            </p>
            <p style={{ marginBottom: 12 }}>
              <strong>YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:</strong>
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>AI-generated recommendations may contain errors, inaccuracies, or suggestions that are not appropriate for your specific environment</li>
              <li>Implementing any recommendation is entirely at your own risk and discretion</li>
              <li>You are solely responsible for reviewing, testing, and validating any changes before applying them to your systems</li>
              <li>We strongly recommend testing all changes in a non-production environment first</li>
              <li>You should maintain current backups before implementing any database or security configuration changes</li>
            </ul>
            <p style={{ marginBottom: 12 }}>
              <strong>WE DISCLAIM ALL LIABILITY</strong> for any damages, data loss, system downtime, security incidents, or other adverse consequences resulting from your implementation of AI-generated recommendations. This includes, without limitation:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Database corruption, data loss, or unintended data exposure</li>
              <li>Application downtime or service disruptions</li>
              <li>Security vulnerabilities introduced by recommended changes</li>
              <li>RLS policy configurations that do not function as intended</li>
              <li>Any direct, indirect, incidental, or consequential damages</li>
            </ul>
            <p>
              The AI recommendations are generated by third-party large language models and may not reflect current security best practices. Always consult with qualified security professionals for critical systems.
            </p>
          </Section>

          <Section title="Accounts and Billing">
            You are responsible for account activity and protecting credentials. Paid features and billing are managed through integrated payment providers and may be updated over time.
          </Section>

          <Section title="Availability and Changes">
            We may modify, suspend, or discontinue parts of the service at any time. We do not guarantee uninterrupted or error-free operation.
          </Section>

          <Section title="Disclaimer of Warranties">
            <p style={{ marginBottom: 12 }}>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, TO THE FULLEST EXTENT PERMITTED BY LAW. WE EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF SCAN RESULTS</li>
              <li>ACCURACY OR APPROPRIATENESS OF AI-GENERATED RECOMMENDATIONS</li>
              <li>NON-INFRINGEMENT</li>
              <li>SECURITY OR AVAILABILITY OF THE SERVICE</li>
            </ul>
            <p>
              We do not warrant that scans will detect all vulnerabilities, that recommendations will resolve all security issues, or that the service will meet your specific requirements.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p style={{ marginBottom: 12 }}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SUPASECURE, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
              <li>DAMAGES RESULTING FROM DATA BREACHES OR SECURITY INCIDENTS, WHETHER OR NOT IDENTIFIED BY OUR SCANS</li>
              <li>DAMAGES ARISING FROM YOUR IMPLEMENTATION OF ANY RECOMMENDATIONS</li>
              <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
              <li>ANY MATTER BEYOND OUR REASONABLE CONTROL</li>
            </ul>
            <p style={{ marginBottom: 12 }}>
              IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
            <p>
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATIONS ON LIABILITY. IN SUCH CASES, OUR LIABILITY SHALL BE LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.
            </p>
          </Section>

          <Section title="Indemnification">
            <p style={{ marginBottom: 12 }}>
              You agree to indemnify, defend, and hold harmless SupaSecure and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from or related to:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Your use of the service</li>
              <li>Your violation of these Terms</li>
              <li>Your implementation of any scan results or AI recommendations</li>
              <li>Any claim that data exposed by your systems caused harm to third parties</li>
              <li>Your violation of any applicable laws or third-party rights</li>
            </ul>
          </Section>

          <Section title="Assumption of Risk">
            You expressly acknowledge that security scanning and implementing security recommendations involve inherent risks. You assume full responsibility for evaluating the appropriateness of using the service and implementing any recommendations for your particular environment and use case.
          </Section>

          <Section title="Contact">
            For legal questions, terms clarifications, or dispute notices, contact your designated support or legal channel for this deployment.
          </Section>
        </motion.div>
      </div>
    </div>
  );
}
