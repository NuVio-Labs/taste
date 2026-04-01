import { LegalPageLayout, LegalSection } from "../components/legal/LegalPageLayout";

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Datenschutzerklärung"
      description="Stand: 1. April 2026. Diese Datenschutzerklärung informiert darüber, welche personenbezogenen Daten bei der Nutzung von NuVio Taste verarbeitet werden, zu welchen Zwecken dies geschieht und welche Rechte betroffene Personen nach der DSGVO haben."
    >
      <LegalSection title="1. Verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung ist:</p>
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
          E-Mail: contact@nuviolabs.de
        </p>
      </LegalSection>

      <LegalSection title="2. Allgemeines zur Datenverarbeitung">
        <p>
          Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der
          geltenden datenschutzrechtlichen Vorschriften, insbesondere der
          Datenschutz-Grundverordnung (DSGVO).
        </p>
        <p>
          Personenbezogene Daten sind alle Informationen, die sich auf eine
          identifizierte oder identifizierbare natürliche Person beziehen.
        </p>
      </LegalSection>

      <LegalSection title="3. Welche Daten wir verarbeiten">
        <p>Bei der Nutzung von NuVio Taste können insbesondere folgende Daten verarbeitet werden:</p>
        <p>
          Kontodaten:
          E-Mail-Adresse, verschlüsselte Authentifizierungsdaten sowie freiwillig
          angegebene Profildaten wie Name oder Benutzername.
        </p>
        <p>
          Nutzungsinhalte:
          Von Nutzerinnen und Nutzern angelegte Rezepte und die dazugehörigen
          Inhalte wie Titel, Beschreibungen, Kategorien, Zutaten, Schritte,
          Bilder, Zeitangaben, Portionen und Sichtbarkeitseinstellungen.
        </p>
        <p>
          Technische Daten:
          Server- und Protokolldaten, Geräte- und Browserinformationen,
          aufgerufene Seiten, Referrer, Zeitstempel sowie performancebezogene
          Messwerte.
        </p>
      </LegalSection>

      <LegalSection title="4. Zwecke und Rechtsgrundlagen">
        <p>Die Verarbeitung erfolgt zu folgenden Zwecken und auf folgenden Rechtsgrundlagen:</p>
        <p>
          Bereitstellung der Web-App, Nutzerkontoverwaltung, Anmeldung,
          Authentifizierung und Speicherung von Rezepten auf Grundlage von Art. 6
          Abs. 1 lit. b DSGVO.
        </p>
        <p>
          Sicherstellung von Stabilität, IT-Sicherheit, Fehleranalyse, Missbrauchsabwehr
          und technische Administration auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Reichweitenmessung und technische Leistungsanalyse mittels
          Vercel Analytics und Vercel Speed Insights auf Grundlage von Art. 6
          Abs. 1 lit. f DSGVO, soweit die eingesetzten Dienste nach ihrem
          dokumentierten Funktionsumfang ohne Third-Party-Cookies und mit
          anonymisierten beziehungsweise aggregierten Daten arbeiten.
        </p>
        <p>
          Erfüllung rechtlicher Verpflichtungen auf Grundlage von Art. 6 Abs. 1
          lit. c DSGVO, soweit gesetzlich erforderlich.
        </p>
      </LegalSection>

      <LegalSection title="5. Eingesetzte Dienstleister">
        <p>Für den Betrieb von NuVio Taste setzen wir insbesondere folgende Dienstleister ein:</p>
        <p>
          Supabase:
          für Datenbank, Authentifizierung und technische Speicherung von
          Nutzerdaten und Rezeptinhalten.
        </p>
        <p>
          Vercel:
          für Hosting, Deployment sowie die Dienste Vercel Analytics und Vercel
          Speed Insights.
        </p>
        <p>
          Mit diesen Anbietern werden, soweit erforderlich, Verträge zur
          Auftragsverarbeitung geschlossen beziehungsweise von den Anbietern
          bereitgestellte Datenschutzmechanismen genutzt.
        </p>
      </LegalSection>

      <LegalSection title="6. Hosting, Analytics und Performance-Messung">
        <p>
          Unsere App wird über Vercel bereitgestellt. Dabei können technische
          Verbindungsdaten verarbeitet werden, die zur Auslieferung und
          Absicherung der Website erforderlich sind.
        </p>
        <p>
          Zusätzlich verwenden wir Vercel Analytics, um aggregierte
          Nutzungsstatistiken wie Seitenaufrufe, Referrer, Gerätetypen,
          Browserinformationen und ungefähr abgeleitete Standortdaten auszuwerten.
        </p>
        <p>
          Außerdem nutzen wir Vercel Speed Insights, um Leistungskennzahlen der
          App, insbesondere Web-Vitals und gerätebezogene Performance-Werte, zu
          erfassen und die technische Qualität zu verbessern.
        </p>
        <p>
          Nach der öffentlichen Produktdokumentation von Vercel arbeiten diese
          Dienste datenschutzfreundlich, ohne klassische Third-Party-Cookies, und
          verarbeiten Daten in anonymisierter oder aggregierter Form. Dennoch
          werden Nutzungs- und Telemetriedaten an Vercel übermittelt.
        </p>
      </LegalSection>

      <LegalSection title="7. Registrierung und Authentifizierung">
        <p>
          Für die Registrierung und Anmeldung verwenden wir Supabase Auth. Dabei
          verarbeiten wir insbesondere die E-Mail-Adresse, die
          Authentifizierungsinformationen sowie Zeitpunkte der Registrierung und
          Anmeldung.
        </p>
        <p>
          Sofern im Registrierungsprozess weitere freiwillige Angaben gemacht
          werden, werden auch diese gespeichert.
        </p>
      </LegalSection>

      <LegalSection title="8. Speicherung von Nutzerinhalten">
        <p>
          Rezepte und sonstige Inhalte, die Nutzerinnen und Nutzer innerhalb der
          App anlegen, speichern wir, um die vertraglich geschuldete Funktion der
          Anwendung bereitzustellen.
        </p>
        <p>
          Private Inhalte sind nur für das jeweilige Nutzerkonto bestimmt.
          Inhalte, die ausdrücklich als öffentlich markiert werden, können im
          Rahmen der jeweiligen App-Funktion sichtbar sein.
        </p>
      </LegalSection>

      <LegalSection title="9. Empfänger und Drittlandübermittlung">
        <p>
          Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies für
          den Betrieb der App erforderlich ist, eine gesetzliche Verpflichtung
          besteht oder eine andere datenschutzrechtliche Grundlage dies erlaubt.
        </p>
        <p>
          Bei Nutzung externer Dienstleister kann nicht ausgeschlossen werden,
          dass Daten auch in Staaten außerhalb der Europäischen Union oder des
          Europäischen Wirtschaftsraums verarbeitet werden. In solchen Fällen
          erfolgt die Verarbeitung nur unter Beachtung der gesetzlichen
          Voraussetzungen, insbesondere auf Grundlage geeigneter Garantien wie
          Standardvertragsklauseln, soweit erforderlich.
        </p>
      </LegalSection>

      <LegalSection title="10. Speicherdauer">
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie dies für die
          jeweiligen Zwecke erforderlich ist oder gesetzliche
          Aufbewahrungspflichten bestehen.
        </p>
        <p>
          Kontodaten und zugehörige Inhalte bleiben grundsätzlich gespeichert,
          solange das Nutzerkonto besteht. Nach Löschung des Kontos oder
          einzelner Inhalte werden die Daten gelöscht, sofern keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>
      </LegalSection>

      <LegalSection title="11. Rechte betroffener Personen">
        <p>Betroffene Personen haben insbesondere folgende Rechte:</p>
        <p>Recht auf Auskunft nach Art. 15 DSGVO</p>
        <p>Recht auf Berichtigung nach Art. 16 DSGVO</p>
        <p>Recht auf Löschung nach Art. 17 DSGVO</p>
        <p>Recht auf Einschränkung der Verarbeitung nach Art. 18 DSGVO</p>
        <p>Recht auf Datenübertragbarkeit nach Art. 20 DSGVO</p>
        <p>Recht auf Widerspruch nach Art. 21 DSGVO</p>
        <p>
          Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde nach Art.
          77 DSGVO
        </p>
      </LegalSection>

      <LegalSection title="12. Pflicht zur Bereitstellung">
        <p>
          Die Bereitstellung der für Registrierung, Login und App-Nutzung
          erforderlichen Daten ist notwendig, um NuVio Taste zu verwenden. Ohne
          diese Daten können bestimmte Funktionen nicht bereitgestellt werden.
        </p>
      </LegalSection>

      <LegalSection title="13. Keine automatisierte Entscheidungsfindung">
        <p>
          Eine automatisierte Entscheidungsfindung einschließlich Profiling im
          Sinne von Art. 22 DSGVO findet nicht statt.
        </p>
      </LegalSection>

      <LegalSection title="14. Änderungen dieser Datenschutzerklärung">
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich
          rechtliche Anforderungen, eingesetzte Dienste oder die Funktionen von
          NuVio Taste ändern.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
