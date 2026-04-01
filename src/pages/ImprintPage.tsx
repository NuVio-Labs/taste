import { LegalPageLayout, LegalSection } from "../components/legal/LegalPageLayout";

export function ImprintPage() {
  return (
    <LegalPageLayout
      title="Impressum"
      description="Angaben gemäß § 5 DDG sowie ergänzende Anbieterinformationen für NuVio Taste."
    >
      <LegalSection title="Anbieter">
        <p>
          NuVio Labs
          <br />
          Einzelunternehmen
          <br />
          Inhaber: Axel Schurer
          <br />
          Nimwegerstraße 3
          <br />
          47559 Kranenburg
          <br />
          Deutschland
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail: contact@nuviolabs.de
        </p>
      </LegalSection>

      <LegalSection title="Registereintrag">
        <p>Ein Handelsregistereintrag besteht nicht.</p>
      </LegalSection>

      <LegalSection title="Umsatzsteuer">
        <p>Eine Umsatzsteuer-Identifikationsnummer liegt derzeit nicht vor.</p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt">
        <p>
          Axel Schurer
          <br />
          Nimwegerstraße 3
          <br />
          47559 Kranenburg
        </p>
      </LegalSection>

      <LegalSection title="Verbraucherschlichtung">
        <p>
          NuVio Labs ist nicht bereit und nicht verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
