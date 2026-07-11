import { useNavigate } from 'react-router-dom'

const privacyPolicyHTML = `
<style>
  .privacy-body { font-family: Arial, sans-serif; color: #595959; font-size: 14px; line-height: 1.6; }
  .privacy-body h1 { font-size: 26px; color: #000; }
  .privacy-body h2 { font-size: 19px; color: #000; margin-top: 2rem; }
  .privacy-body h3 { font-size: 17px; color: #000; margin-top: 1.5rem; }
  .privacy-body a { color: #3030F1; word-break: break-word; }
  .privacy-body ul { list-style-type: square; padding-left: 2rem; }
  .privacy-body ul > li > ul { list-style-type: circle; }
  .privacy-body table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  .privacy-body td, .privacy-body th { border: 1px solid #ccc; padding: 8px; font-size: 14px; }
  bdt { display: none; }
</style>
<div class="privacy-body">
  <h1>PRIVACY POLICY</h1>
  <p><strong>Last updated June 15, 2026</strong></p>

  <p>This Privacy Notice for <strong>Lantana Inc</strong> ("we," "us," or "our") describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:</p>
  <ul>
    <li>Visit our website at <a href="https://www.lyanta.com/" target="_blank">https://www.lyanta.com/</a> or any website of ours that links to this Privacy Notice</li>
    <li>Use a gift card marketplace where users can buy, sell, and exchange gift cards for money or other gift cards</li>
    <li>Engage with us in other related ways, including any marketing or events</li>
  </ul>

  <p><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:privacy@lyanta.com">privacy@lyanta.com</a>.</p>

  <h2>SUMMARY OF KEY POINTS</h2>
  <p><strong><em>This summary provides key points from our Privacy Notice.</em></strong></p>
  <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</p>
  <p><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</p>
  <p><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
  <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
  <p><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
  <p><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</p>
  <p><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a <a href="https://app.termly.io/dsar/348c8b7e-4015-44fd-b94e-a39f62c2ab73" target="_blank">data subject access request</a>, or by contacting us.</p>

  <h2 id="toc">TABLE OF CONTENTS</h2>
  <ol>
    <li><a href="#infocollect">WHAT INFORMATION DO WE COLLECT?</a></li>
    <li><a href="#infouse">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
    <li><a href="#legalbases">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></li>
    <li><a href="#whoshare">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
    <li><a href="#cookies">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
    <li><a href="#sociallogins">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></li>
    <li><a href="#inforetain">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
    <li><a href="#infosafe">HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
    <li><a href="#infominors">DO WE COLLECT INFORMATION FROM MINORS?</a></li>
    <li><a href="#privacyrights">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
    <li><a href="#DNT">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
    <li><a href="#uslaws">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
    <li><a href="#policyupdates">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
    <li><a href="#contact">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
    <li><a href="#request">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
  </ol>

  <h2 id="infocollect">1. WHAT INFORMATION DO WE COLLECT?</h2>
  <h3>Personal information you disclose to us</h3>
  <p><em><strong>In Short:</strong> We collect personal information that you provide to us.</em></p>
  <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
  <p><strong>Personal Information Provided by You.</strong> The personal information we collect may include: email addresses, usernames, passwords, names, and contact or authentication data.</p>
  <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>
  <p><strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases. All payment data is handled and stored by <strong>Stripe</strong>. You may find their privacy notice here: <a href="https://stripe.com/privacy#10-us-consumer-privacy-notice" target="_blank">https://stripe.com/privacy#10-us-consumer-privacy-notice</a>.</p>
  <p><strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details. If you choose to register in this way, we will collect certain profile information about you from the social media provider.</p>
  <p>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>

  <h3>Information automatically collected</h3>
  <p><em><strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></p>
  <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and information about how and when you use our Services.</p>
  <p>Like many businesses, we also collect information through cookies and similar technologies. The information we collect includes:</p>
  <ul>
    <li><em>Log and Usage Data</em> — service-related, diagnostic, usage, and performance information our servers automatically collect.</li>
    <li><em>Device Data</em> — information about your computer, phone, tablet, or other device you use to access the Services.</li>
    <li><em>Location Data</em> — information about your device's location, which can be either precise or imprecise.</li>
  </ul>

  <h3>Google API</h3>
  <p>Our use of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank">Google API Services User Data Policy</a>, including the <a href="https://developers.google.com/terms/api-services-user-data-policy#limited-use" target="_blank">Limited Use requirements</a>.</p>

  <h2 id="infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
  <p><em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em></p>
  <p><strong>We process your personal information for a variety of reasons, including:</strong></p>
  <ul>
    <li><strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong></li>
    <li><strong>To deliver and facilitate delivery of services to the user.</strong></li>
    <li><strong>To enable user-to-user communications.</strong></li>
    <li><strong>To request feedback.</strong></li>
    <li><strong>To save or protect an individual's vital interest.</strong></li>
  </ul>

  <h2 id="legalbases">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
  <p><em><strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason to do so under applicable law.</em></p>
  <p><strong><u>If you are located in the EU or UK, this section applies to you.</u></strong></p>
  <p>The GDPR and UK GDPR require us to explain the valid legal bases we rely on. We may rely on the following:</p>
  <ul>
    <li><strong>Consent.</strong> We may process your information if you have given us permission to use your personal information for a specific purpose. You can withdraw your consent at any time.</li>
    <li><strong>Performance of a Contract.</strong> We may process your personal information when necessary to fulfill our contractual obligations to you.</li>
    <li><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests.</li>
    <li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations.</li>
    <li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party.</li>
  </ul>
  <p><strong><u>If you are located in Canada, this section applies to you.</u></strong></p>
  <p>We may process your information if you have given us specific permission (express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (implied consent). You can withdraw your consent at any time.</p>

  <h2 id="whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
  <p><em><strong>In Short:</strong> We may share information in specific situations and with specific third parties.</em></p>
  <p>We may need to share your personal information in the following situations:</p>
  <ul>
    <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
  </ul>

  <h2 id="cookies">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
  <p><em><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</em></p>
  <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</p>
  <p>To the extent these online tracking technologies are deemed to be a "sale"/"sharing" under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described in the section "DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?" below.</p>
  <h3>Google Analytics</h3>
  <p>We may share your information with Google Analytics to track and analyze the use of the Services. We may use Google Analytics Demographics and Interests Reporting. To opt out of being tracked by Google Analytics, visit <a href="https://tools.google.com/dlpage/gaoptout" target="_blank">https://tools.google.com/dlpage/gaoptout</a>.</p>

  <h2 id="sociallogins">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
  <p><em><strong>In Short:</strong> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</em></p>
  <p>Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider, including your name, email address, and profile picture.</p>
  <p>We will use the information we receive only for the purposes that are described in this Privacy Notice. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information.</p>

  <h2 id="inforetain">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
  <p><em><strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</em></p>
  <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law. No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</p>
  <p>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information.</p>

  <h2 id="infosafe">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
  <p><em><strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.</em></p>
  <p>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. You should only access the Services within a secure environment.</p>

  <h2 id="infominors">9. DO WE COLLECT INFORMATION FROM MINORS?</h2>
  <p><em><strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.</em></p>
  <p>We do not knowingly collect, solicit data from, or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If you become aware of any data we may have collected from children under age 18, please contact us at <a href="mailto:privacy@myriapods.com">privacy@myriapods.com</a>.</p>

  <h2 id="privacyrights">10. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
  <p><em><strong>In Short:</strong> Depending on your state of residence in the US or in some regions, such as the EEA, UK, Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information.</em></p>
  <p>In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws, including the right to request access and obtain a copy of your personal information, to request rectification or erasure, to restrict the processing of your personal information, and if applicable, to data portability.</p>
  <p>If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you have the right to complain to your <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" target="_blank">Member State data protection authority</a> or <a href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" target="_blank">UK data protection authority</a>.</p>
  <p><strong><u>Withdrawing your consent:</u></strong> You have the right to withdraw your consent at any time by contacting us using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.</p>
  <h3>Account Information</h3>
  <p>If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings and update your user account. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases.</p>
  <p>If you have questions or comments about your privacy rights, you may email us at <a href="mailto:privacy@myriapods.com">privacy@myriapods.com</a>.</p>

  <h2 id="DNT">11. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
  <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.</p>

  <h2 id="uslaws">12. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
  <p><em><strong>In Short:</strong> If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have specific privacy rights.</em></p>
  <h3>Categories of Personal Information We Collect</h3>
  <table>
    <thead>
      <tr><th>Category</th><th>Examples</th><th>Collected</th></tr>
    </thead>
    <tbody>
      <tr><td>A. Identifiers</td><td>Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</td><td>YES</td></tr>
      <tr><td>B. Personal information as defined in the California Customer Records statute</td><td>Name, contact information, education, employment, employment history, and financial information</td><td>YES</td></tr>
      <tr><td>C. Protected classification characteristics under state or federal law</td><td>Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</td><td>NO</td></tr>
      <tr><td>D. Commercial information</td><td>Transaction information, purchase history, financial details, and payment information</td><td>NO</td></tr>
      <tr><td>E. Biometric information</td><td>Fingerprints and voiceprints</td><td>NO</td></tr>
      <tr><td>F. Internet or other similar network activity</td><td>Browsing history, search history, online behavior, interest data, and interactions with our and other websites</td><td>NO</td></tr>
      <tr><td>G. Geolocation data</td><td>Device location</td><td>NO</td></tr>
      <tr><td>H. Audio, electronic, sensory, or similar information</td><td>Images and audio, video or call recordings created in connection with our business activities</td><td>NO</td></tr>
      <tr><td>I. Professional or employment-related information</td><td>Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</td><td>NO</td></tr>
      <tr><td>J. Education Information</td><td>Student records and directory information</td><td>NO</td></tr>
      <tr><td>K. Inferences drawn from collected personal information</td><td>Inferences drawn from any of the collected personal information listed above to create a profile or summary about an individual's preferences and characteristics</td><td>NO</td></tr>
      <tr><td>L. Sensitive personal Information</td><td></td><td>NO</td></tr>
    </tbody>
  </table>
  <h3>Your Rights</h3>
  <p>You have rights under certain US state data protection laws, including:</p>
  <ul>
    <li><strong>Right to know</strong> whether or not we are processing your personal data</li>
    <li><strong>Right to access</strong> your personal data</li>
    <li><strong>Right to correct</strong> inaccuracies in your personal data</li>
    <li><strong>Right to request</strong> the deletion of your personal data</li>
    <li><strong>Right to obtain a copy</strong> of the personal data you previously shared with us</li>
    <li><strong>Right to non-discrimination</strong> for exercising your rights</li>
    <li><strong>Right to opt out</strong> of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling</li>
  </ul>
  <h3>How to Exercise Your Rights</h3>
  <p>To exercise these rights, you can contact us by submitting a <a href="https://app.termly.io/dsar/348c8b7e-4015-44fd-b94e-a39f62c2ab73" target="_blank">data subject access request</a>, by visiting <a href="https://www.myriapods.com/contact" target="_blank">https://www.myriapods.com/contact</a>, or by referring to the contact details at the bottom of this document.</p>
  <h3>Appeals</h3>
  <p>Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at <a href="mailto:privacy@myriapods.com">privacy@myriapods.com</a>. If your appeal is denied, you may submit a complaint to your state attorney general.</p>

  <h2 id="policyupdates">13. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
  <p><em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></p>
  <p>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</p>

  <h2 id="contact">14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
  <p>If you have questions or comments about this notice, you may email us at <a href="mailto:privacy@myriapods.com">privacy@myriapods.com</a> or contact us by post at:</p>
  <p>Lantana Inc<br>United States</p>

  <h2 id="request">15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
  <p>You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. To request to review, update, or delete your personal information, please fill out and submit a <a href="https://app.termly.io/dsar/348c8b7e-4015-44fd-b94e-a39f62c2ab73" target="_blank">data subject access request</a>.</p>

  <br>
  <p><small>This Privacy Policy was created using <a href="https://termly.io/products/privacy-policy-generator/" target="_blank">Termly's Privacy Policy Generator</a>.</small></p>
</div>
`

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-semibold tracking-tight text-[#2e1a47]"
        >
          Lantana
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        <div
          className="bg-white border border-[#E3DFEF] rounded-2xl p-8 shadow-sm"
          dangerouslySetInnerHTML={{ __html: privacyPolicyHTML }}
        />
      </div>
    </div>
  )
}