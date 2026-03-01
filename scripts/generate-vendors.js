const fs = require('fs');
const path = require('path');

const FOOTER = `  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div><span class="logo" style="color: #fff;">Telco Review</span><p class="mb-0">Independent telecommunications review for Australian business.</p></div>
        <div><strong>Pages</strong><ul class="unstyled"><li><a href="/about.html">About Us</a></li><li><a href="/services.html">Services</a></li><li><a href="/benefits.html">Benefits</a></li><li><a href="/case-studies.html">Case Studies</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/vendors/">Vendors</a></li><li><a href="/locations/">Locations</a></li></ul></div>
        <div><strong>Legal</strong><ul class="unstyled"><li><a href="/privacy.html">Privacy</a></li><li><a href="/terms.html">Terms</a></li></ul></div>
      </div>
      <div class="footer-bottom"><p class="mb-0">© Telco Review. All rights reserved.</p></div>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>`;

const NAV = `      <a href="/">Home</a>
        <a href="/about.html">About Us</a>
        <a href="/services.html">Services</a>
        <a href="/blog/">Blog</a>
        <a href="/contact.html" class="btn btn--primary">Contact Us</a>`;

function slug(s) {
  return s.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/&/g, 'and');
}

const VENDORS = [
  { name: 'Superloop', desc: 'Superloop provides NBN, fibre and connectivity services for residential and business customers across Australia.', strengths: ['NBN and business broadband plans.', 'Fibre and ethernet connectivity for enterprise.', 'Wholesale and direct retail offerings.'] },
  { name: 'Commander', desc: 'Commander offers business phone systems, NBN and communications solutions to Australian small and medium businesses.', strengths: ['Business phone and hosted PBX.', 'NBN and broadband for business.', '1300 numbers and call management.'] },
  { name: 'iPrimus', desc: 'iPrimus (part of the Vocus Group) provides NBN, broadband and phone services to residential and business customers in Australia.', strengths: ['NBN and broadband plans.', 'Home and business phone.', 'Bundled options.'] },
  { name: 'Dodo', desc: 'Dodo offers NBN, mobile and energy services to Australian consumers and small business.', strengths: ['NBN and broadband.', 'Mobile plans.', 'Competitive pricing.'] },
  { name: 'iiNet', desc: 'iiNet (part of TPG Telecom) provides NBN, broadband and phone services to Australian households and businesses.', strengths: ['NBN and broadband plans.', 'Business and home phone.', 'Support and local presence.'] },
  { name: 'Internode', desc: 'Internode (part of TPG Telecom) offers NBN and broadband services with a focus on customer service and technical support.', strengths: ['NBN and broadband.', 'Transparent pricing.', 'Technical support.'] },
  { name: 'Westnet', desc: 'Westnet (part of TPG Telecom) provides NBN and broadband services to Australian customers.', strengths: ['NBN and broadband plans.', 'Regional and metro coverage.', 'Bundled options.'] },
  { name: 'Adam Internet', desc: 'Adam Internet provides broadband and internet services in South Australia and nationally.', strengths: ['Broadband and NBN.', 'Local presence in SA.', 'Residential and business.'] },
  { name: 'AAPT', desc: 'AAPT (part of TPG Telecom) provides enterprise telecommunications, data and voice services to Australian business.', strengths: ['Enterprise data and voice.', 'Network and connectivity.', 'Government and corporate.'] },
  { name: 'Southern Phone', desc: 'Southern Phone is an Australian telecommunications provider offering NBN, mobile and home phone services.', strengths: ['NBN and broadband.', 'Mobile plans.', 'Regional focus.'] },
  { name: 'Exetel', desc: 'Exetel provides NBN, broadband and mobile services to Australian residential and business customers.', strengths: ['NBN and broadband.', 'Mobile and data.', 'Competitive pricing.'] },
  { name: 'SpinTel', desc: 'SpinTel offers NBN, broadband, mobile and VoIP services to Australian consumers and business.', strengths: ['NBN and broadband.', 'VoIP and business phone.', 'Mobile plans.'] },
  { name: 'Mate Broadband', desc: 'Mate offers NBN, mobile and energy services with a focus on straightforward pricing and Australian support.', strengths: ['NBN and broadband.', 'Mobile plans.', 'Australian support.'] },
  { name: 'Tangerine Telecom', desc: 'Tangerine Telecom provides NBN and broadband services to Australian households and small business.', strengths: ['NBN plans.', 'Simple pricing.', 'Online sign-up.'] },
  { name: 'More Telecom', desc: 'More Telecom offers NBN, mobile and phone services to Australian residential and business customers.', strengths: ['NBN and broadband.', 'Mobile and voice.', 'Bundled options.'] },
  { name: 'Belong', desc: 'Belong (Telstra-owned) offers NBN and mobile services with simple plans and no lock-in contracts.', strengths: ['NBN and broadband.', 'Mobile plans.', 'Month-to-month options.'] },
  { name: 'Boost Mobile', desc: 'Boost Mobile is an Australian mobile virtual network operator using the Telstra wholesale network.', strengths: ['Prepaid and postpaid mobile.', 'Telstra network coverage.', 'Competitive pricing.'] },
  { name: 'Amaysim', desc: 'Amaysim (part of Optus) offers mobile plans and NBN to Australian consumers and small business.', strengths: ['Mobile plans.', 'NBN options.', 'No lock-in.'] },
  { name: 'Felix Mobile', desc: 'Felix Mobile offers mobile plans with a focus on sustainability and simple pricing.', strengths: ['Mobile plans.', 'Carbon-neutral option.', 'Unlimited data plans.'] },
  { name: 'Kogan Mobile', desc: 'Kogan Mobile provides mobile plans using the Vodafone network with competitive pricing.', strengths: ['Mobile plans.', 'Competitive pricing.', 'Prepaid and recharge.'] },
  { name: 'ALDI Mobile', desc: 'ALDI Mobile offers prepaid mobile services using the Telstra wholesale network.', strengths: ['Prepaid mobile.', 'Telstra network coverage.', 'Simple plans.'] },
  { name: 'Woolworths Mobile', desc: 'Woolworths Mobile (Everyday Mobile) offers mobile plans with rewards and discounts for Woolworths customers.', strengths: ['Mobile plans.', 'Rewards programme.', 'Telstra network.'] },
  { name: 'Coles Mobile', desc: 'Coles Mobile provides prepaid and postpaid mobile services to Australian customers.', strengths: ['Mobile plans.', 'Prepaid options.', 'Retail availability.'] },
  { name: 'Lebara Mobile', desc: 'Lebara Mobile offers mobile plans with competitive international call rates and local value.', strengths: ['Mobile plans.', 'International calling.', 'Prepaid and SIM-only.'] },
  { name: 'Lyca Mobile', desc: 'Lyca Mobile provides mobile services with competitive international and local rates.', strengths: ['Mobile plans.', 'International focus.', 'Prepaid options.'] },
  { name: 'Moose Mobile', desc: 'Moose Mobile offers mobile plans with a focus on value and flexibility.', strengths: ['Mobile plans.', 'Competitive pricing.', 'Online service.'] },
  { name: 'Pennytel', desc: 'Pennytel provides VoIP and mobile services to Australian consumers and business.', strengths: ['VoIP and SIP.', 'Mobile options.', 'Low-cost calling.'] },
  { name: 'TeleChoice', desc: 'TeleChoice offers mobile and NBN services to Australian residential and business customers.', strengths: ['Mobile plans.', 'NBN broadband.', 'Telstra network.'] },
  { name: 'Think Mobile', desc: 'Think Mobile provides mobile plans and telecommunications services.', strengths: ['Mobile plans.', 'Business options.', 'Competitive rates.'] },
  { name: 'NuMobile', desc: 'NuMobile offers mobile plans with a focus on value and customer service.', strengths: ['Mobile plans.', 'Prepaid and postpaid.', 'Australian support.'] },
  { name: 'Gomo', desc: 'Gomo (from Singtel) offers mobile plans with simple pricing and no lock-in contracts.', strengths: ['Mobile plans.', 'Data-focused plans.', 'Online-only.'] },
  { name: 'Catch Connect', desc: 'Catch Connect (OnePass Mobile) offers mobile plans linked to Catch retail and membership.', strengths: ['Mobile plans.', 'Retail integration.', 'Competitive pricing.'] },
  { name: 'Swoop', desc: 'Swoop provides fixed wireless and NBN alternatives for regional and metro Australian customers.', strengths: ['Fixed wireless broadband.', 'Regional coverage.', 'NBN alternatives.'] },
  { name: 'Node1', desc: 'Node1 offers IT and telecommunications services including connectivity and managed services.', strengths: ['Connectivity solutions.', 'Managed services.', 'Business focus.'] },
  { name: 'Beam Internet', desc: 'Beam Internet provides broadband and connectivity services.', strengths: ['Broadband and NBN.', 'Business connectivity.', 'Support.'] },
  { name: 'Pentanet', desc: 'Pentanet provides fixed wireless and fibre broadband in Western Australia and nationally.', strengths: ['Fixed wireless and fibre.', 'WA focus.', 'Gaming and low latency.'] },
  { name: 'Spirit Technology Solutions', desc: 'Spirit Technology Solutions offers telecommunications, IT and managed services to Australian business.', strengths: ['Business connectivity.', 'Managed services.', 'Unified communications.'] },
  { name: 'Vonex', desc: 'Vonex provides business phone, NBN and unified communications to Australian SMEs.', strengths: ['Business phone and VoIP.', 'NBN and broadband.', 'Cloud PBX.'] },
  { name: 'Comms Group', desc: 'Comms Group offers telecommunications and managed services to Australian business.', strengths: ['Business communications.', 'Connectivity.', 'Managed services.'] },
  { name: 'Next Telecom', desc: 'Next Telecom provides business phone, NBN and mobile services.', strengths: ['Business phone and NBN.', 'Mobile plans.', 'SME focus.'] },
  { name: 'Starlink', desc: 'Starlink (SpaceX) provides satellite broadband in Australia and globally, suited to regional and remote areas.', strengths: ['Satellite broadband.', 'Regional and remote coverage.', 'Low-latency option.'] },
  { name: 'NBN Co', desc: 'NBN Co is the Australian government-owned company that builds and operates the National Broadband Network.', strengths: ['Wholesale fixed-line and fixed wireless.', 'National network infrastructure.', 'Access for retail providers.'] },
  { name: 'Opticomm', desc: 'Opticomm operates fibre-to-the-premises networks in selected Australian estates and regions.', strengths: ['Fibre connectivity.', 'Estate and development focus.', 'High-speed broadband.'] },
  { name: 'LBNCo', desc: 'LBNCo provides local fibre and broadband infrastructure in selected areas.', strengths: ['Local fibre networks.', 'Broadband infrastructure.', 'Regional options.'] },
  { name: 'OPENetworks', desc: 'OPENetworks builds and operates open-access fibre networks in Australian regions.', strengths: ['Open-access fibre.', 'Regional infrastructure.', 'Wholesale access.'] },
  { name: 'DGTek', desc: 'DGTek provides fibre and telecommunications infrastructure and services.', strengths: ['Fibre and connectivity.', 'Infrastructure.', 'Business focus.'] },
  { name: 'Redtrain', desc: 'Redtrain offers telecommunications and IT services to business.', strengths: ['Business connectivity.', 'IT and telecoms.', 'Support.'] },
  { name: 'Frontier Networks', desc: 'Frontier Networks provides connectivity and telecommunications services.', strengths: ['Business connectivity.', 'Network services.', 'Support.'] },
  { name: 'VostroNet', desc: 'VostroNet offers broadband and telecommunications services.', strengths: ['Broadband and NBN.', 'Business options.', 'Support.'] },
  { name: 'Activ8me', desc: 'Activ8me provides satellite and fixed wireless broadband to regional and remote Australia.', strengths: ['Satellite broadband.', 'Fixed wireless.', 'Regional focus.'] },
  { name: 'SkyMesh', desc: 'SkyMesh offers NBN and fixed wireless broadband with a focus on regional Australia.', strengths: ['NBN and fixed wireless.', 'Regional coverage.', 'Australian support.'] },
  { name: 'Harbour ISP', desc: 'Harbour ISP provides broadband and telecommunications services.', strengths: ['Broadband and NBN.', 'Business and residential.', 'Support.'] },
  { name: 'IPStar', desc: 'IPStar (Thaicom) provides satellite broadband services in Australia and the Asia-Pacific.', strengths: ['Satellite broadband.', 'Regional and remote.', 'Coverage.'] },
  { name: 'ReachNet', desc: 'ReachNet offers telecommunications and connectivity services.', strengths: ['Connectivity.', 'Business focus.', 'Support.'] },
  { name: 'Ant Communications', desc: 'Ant Communications provides telecommunications and IT services to business.', strengths: ['Business telecoms.', 'Connectivity.', 'Managed services.'] },
  { name: 'Clear Networks', desc: 'Clear Networks offers business telecommunications and connectivity.', strengths: ['Business connectivity.', 'Voice and data.', 'Support.'] },
  { name: 'Borderway', desc: 'Borderway provides telecommunications services.', strengths: ['Connectivity.', 'Business focus.', 'Support.'] },
  { name: 'Bendigo Telco', desc: 'Bendigo Telco offers telecommunications services with a regional focus.', strengths: ['Local and regional focus.', 'Broadband and voice.', 'Community focus.'] },
  { name: 'YourLink', desc: 'YourLink provides telecommunications and connectivity services.', strengths: ['Connectivity.', 'Business options.', 'Support.'] },
  { name: 'Flip Connect', desc: 'Flip Connect offers broadband and telecommunications services.', strengths: ['Broadband and NBN.', 'Residential and business.', 'Support.'] },
  { name: 'Launtel', desc: 'Launtel provides NBN and broadband with daily billing and no lock-in contracts.', strengths: ['NBN and broadband.', 'Daily billing.', 'Flexibility.'] },
  { name: 'Leaptel', desc: 'Leaptel offers NBN and broadband services to Australian customers.', strengths: ['NBN plans.', 'Competitive pricing.', 'Support.'] },
  { name: 'Buddy Telco', desc: 'Buddy Telco provides telecommunications services to residential and business customers.', strengths: ['Broadband and voice.', 'Simple plans.', 'Support.'] },
  { name: 'Escapenet', desc: 'Escapenet offers broadband and telecommunications services.', strengths: ['Broadband and NBN.', 'Business options.', 'Support.'] },
  { name: 'Mint Telecom', desc: 'Mint Telecom provides business phone and telecommunications services.', strengths: ['Business phone.', 'VoIP and connectivity.', 'SME focus.'] },
  { name: 'Origin Broadband', desc: 'Origin Broadband (Origin Energy) offers NBN and broadband to residential customers.', strengths: ['NBN and broadband.', 'Energy bundle options.', 'Brand recognition.'] },
  { name: 'AGL Telecommunications', desc: 'AGL has offered telecommunications and energy bundles to Australian customers.', strengths: ['Energy and telecoms bundles.', 'Residential focus.', 'Brand presence.'] },
  { name: 'Sumo', desc: 'Sumo provides NBN and mobile services with a focus on value and simplicity.', strengths: ['NBN and mobile.', 'Simple plans.', 'Competitive pricing.'] },
  { name: 'MyOwnTel', desc: 'MyOwnTel offers business phone, NBN and telecommunications to Australian SMEs.', strengths: ['Business phone and NBN.', 'VoIP and PBX.', 'SME focus.'] },
  { name: 'Uniti Group', desc: 'Uniti Group builds and operates fibre and fixed wireless networks in selected Australian areas.', strengths: ['Fibre and fixed wireless.', 'New development focus.', 'High-speed broadband.'] },
  { name: 'Harbour IT', desc: 'Harbour IT offers IT and telecommunications services to business.', strengths: ['IT and telecoms.', 'Managed services.', 'Business focus.'] },
  { name: 'BlueFace', desc: 'BlueFace provides cloud communications and unified communications to business.', strengths: ['Cloud voice and UC.', 'Business communications.', 'Integration.'] },
  { name: '8x8', desc: '8x8 provides cloud voice, contact centre and unified communications globally, including in Australia.', strengths: ['Cloud PBX and contact centre.', 'Unified communications.', 'Global platform.'] },
  { name: 'RingCentral', desc: 'RingCentral offers cloud phone, video and unified communications to businesses in Australia and globally.', strengths: ['Cloud PBX and messaging.', 'Video meetings.', 'Integrations.'] },
  { name: 'Zoom Phone', desc: 'Zoom Phone is Zoom’s cloud business phone system, integrated with Zoom Meetings.', strengths: ['Cloud business phone.', 'Zoom integration.', 'Unified communications.'] },
  { name: 'Dialpad', desc: 'Dialpad provides AI-powered cloud voice and unified communications for business.', strengths: ['Cloud voice and UC.', 'AI features.', 'Business focus.'] },
  { name: 'GoTo', desc: 'GoTo (formerly LogMeIn) offers meeting, phone and support solutions for business.', strengths: ['Meetings and phone.', 'Remote support.', 'Unified suite.'] },
  { name: 'Mitel', desc: 'Mitel provides business phone systems, cloud communications and contact centre solutions.', strengths: ['Business phone and UC.', 'Cloud and on-premise.', 'Contact centre.'] },
  { name: 'Avaya', desc: 'Avaya offers contact centre, unified communications and business phone solutions.', strengths: ['Contact centre and UC.', 'Enterprise focus.', 'Cloud and premise.'] },
  { name: 'Cisco Webex', desc: 'Cisco Webex provides meetings, calling and messaging for business communications.', strengths: ['Meetings and calling.', 'Enterprise integration.', 'Security.'] },
  { name: 'Microsoft Teams Calling', desc: 'Microsoft Teams offers voice calling, meetings and collaboration as part of Microsoft 365.', strengths: ['Unified collaboration and calling.', 'Microsoft 365 integration.', 'Enterprise adoption.'] },
  { name: 'Telnyx', desc: 'Telnyx provides programmable voice, messaging and SIP trunking for developers and business.', strengths: ['SIP trunking and APIs.', 'Programmable communications.', 'Global reach.'] },
  { name: 'Twilio', desc: 'Twilio offers programmable voice, messaging and communications APIs used by many Australian businesses.', strengths: ['Communications APIs.', 'Voice and messaging.', 'Developer platform.'] },
  { name: 'MessageMedia', desc: 'MessageMedia (Sinch) provides SMS and messaging solutions for Australian business.', strengths: ['SMS and messaging.', 'Business communications.', 'API and dashboard.'] },
  { name: 'Sinch', desc: 'Sinch provides cloud communications including voice, messaging and verification globally.', strengths: ['Voice and messaging APIs.', 'Verification and engagement.', 'Global platform.'] },
  { name: 'Burst SMS', desc: 'Burst SMS offers SMS messaging and bulk SMS for Australian business.', strengths: ['SMS messaging.', 'Bulk and API.', 'Australian focus.'] },
  { name: 'ClickSend', desc: 'ClickSend provides SMS, voice and email API and platform for business communications.', strengths: ['SMS, voice and email.', 'API and platform.', 'International.'] },
  { name: 'Vertel', desc: 'Vertel offers telecommunications and managed network services to Australian business and government.', strengths: ['Managed networks.', 'Business and government.', 'Connectivity.'] },
  { name: 'Pivotel', desc: 'Pivotel provides satellite and cellular connectivity for remote and regional Australia.', strengths: ['Satellite and cellular.', 'Remote and regional.', 'IoT and voice.'] },
  { name: 'Inmarsat', desc: 'Inmarsat provides global satellite communications for maritime, aviation, government and enterprise.', strengths: ['Satellite communications.', 'Global coverage.', 'Enterprise and government.'] },
  { name: 'Iridium', desc: 'Iridium operates a global satellite constellation for voice and data communications.', strengths: ['Global satellite voice and data.', 'Remote connectivity.', 'Maritime and aviation.'] },
  { name: 'Thuraya', desc: 'Thuraya provides satellite communications and mobile satellite services in coverage regions.', strengths: ['Satellite communications.', 'Regional coverage.', 'Mobile satellite.'] },
  { name: 'Speedcast', desc: 'Speedcast (formerly) provided satellite and remote connectivity; services have been restructured.', strengths: ['Satellite and remote connectivity.', 'Maritime and enterprise.', 'Global reach.'] },
  { name: 'Orion Satellite Systems', desc: 'Orion Satellite Systems provides satellite communications and related services.', strengths: ['Satellite communications.', 'Remote connectivity.', 'Support.'] },
  { name: 'SatPhonics', desc: 'SatPhonics offers satellite and telecommunications solutions.', strengths: ['Satellite solutions.', 'Connectivity.', 'Support.'] },
  { name: 'IP Systems', desc: 'IP Systems provides telecommunications and IT solutions to business.', strengths: ['Business telecoms.', 'IP and voice.', 'Support.'] },
  { name: 'Broadsoft', desc: 'BroadSoft (Cisco) provides cloud PBX and unified communications platforms for service providers.', strengths: ['Cloud PBX platform.', 'Service provider focus.', 'Unified communications.'] },
  { name: 'Metaswitch', desc: 'Metaswitch (Microsoft) provides voice and communications software for operators and enterprises.', strengths: ['Voice and communications software.', 'Cloud and premise.', 'Operator and enterprise.'] },
  { name: 'Gamma Solutions', desc: 'Gamma provides unified communications and voice solutions to UK and European business; has partner presence.', strengths: ['Unified communications.', 'Voice and SIP.', 'Business focus.'] },
  { name: 'Enablis', desc: 'Enablis offers IT and telecommunications services to business.', strengths: ['IT and telecoms.', 'Business solutions.', 'Support.'] },
  { name: 'Brennan IT', desc: 'Brennan IT provides IT services, cloud and telecommunications to Australian business.', strengths: ['IT and telecoms.', 'Managed services.', 'Business focus.'] },
  { name: 'Interactive', desc: 'Interactive provides telecommunications and technology services to business.', strengths: ['Business telecoms.', 'Technology services.', 'Support.'] },
  { name: 'Nexon Asia Pacific', desc: 'Nexon Asia Pacific offers telecommunications and connectivity services in the region.', strengths: ['Connectivity.', 'Asia-Pacific focus.', 'Business services.'] },
  { name: 'Fujitsu Australia', desc: 'Fujitsu Australia provides IT, cloud and telecommunications services to enterprise and government.', strengths: ['IT and telecoms.', 'Enterprise and government.', 'Managed services.'] },
  { name: 'NEC Australia', desc: 'NEC Australia offers IT, networking, unified communications and contact centre solutions.', strengths: ['UC and contact centre.', 'Networking and IT.', 'Enterprise.'] },
  { name: 'Infosys Australia', desc: 'Infosys provides IT, consulting and technology services globally, including in Australia.', strengths: ['IT and consulting.', 'Digital services.', 'Enterprise.'] },
  { name: 'Wipro Australia', desc: 'Wipro offers IT, consulting and communications services in Australia and globally.', strengths: ['IT and consulting.', 'Technology services.', 'Enterprise.'] },
  { name: 'Tata Communications', desc: 'Tata Communications provides global network, cloud and communications services.', strengths: ['Global network.', 'Enterprise connectivity.', 'Communications.'] },
  { name: 'Verizon Australia', desc: 'Verizon offers enterprise network, security and communications services in Australia.', strengths: ['Enterprise network.', 'Security and connectivity.', 'Global reach.'] },
  { name: 'AT&T Australia', desc: 'AT&T provides enterprise networking and communications services in Australia.', strengths: ['Enterprise network.', 'Global connectivity.', 'Business services.'] },
  { name: 'BT Global Services Australia', desc: 'BT Global Services offers enterprise network and IT services in Australia and globally.', strengths: ['Enterprise network.', 'Global services.', 'Connectivity.'] },
  { name: 'Orange Business Services', desc: 'Orange Business Services provides enterprise network, cloud and communications globally.', strengths: ['Enterprise network.', 'Cloud and security.', 'Global reach.'] },
  { name: 'Equinix', desc: 'Equinix operates data centres and interconnection platforms globally, including in Australia.', strengths: ['Data centres.', 'Interconnection.', 'Digital infrastructure.'] },
  { name: 'NEXTDC', desc: 'NEXTDC operates data centres across Australia for enterprise and cloud providers.', strengths: ['Australian data centres.', 'Connectivity and cloud.', 'Enterprise.'] },
  { name: 'AirTrunk', desc: 'AirTrunk operates hyperscale data centres in Australia and the Asia-Pacific.', strengths: ['Hyperscale data centres.', 'Cloud and enterprise.', 'APAC presence.'] },
  { name: 'Global Switch', desc: 'Global Switch owns and operates data centres in major cities including Sydney.', strengths: ['Data centres.', 'Connectivity.', 'Enterprise.'] },
  { name: 'Megaport', desc: 'Megaport provides software-defined networking and interconnection services globally.', strengths: ['SDN and interconnection.', 'Data centre connectivity.', 'Elastic connectivity.'] },
  { name: 'Console Connect', desc: 'Console Connect (PCCW) provides software-defined interconnection and network-as-a-service.', strengths: ['Interconnection.', 'NaaS.', 'Global reach.'] },
  { name: 'Zayo Group', desc: 'Zayo provides fibre and network infrastructure and connectivity globally.', strengths: ['Fibre and network.', 'Enterprise connectivity.', 'Global infrastructure.'] },
  { name: 'Cogent Communications', desc: 'Cogent provides internet and IP transit services globally, including in Australia.', strengths: ['IP transit.', 'Global network.', 'Competitive pricing.'] },
  { name: 'NTT Communications', desc: 'NTT provides global network, data centre and managed services, including in Australia.', strengths: ['Global network.', 'Data centre and cloud.', 'Enterprise.'] },
  { name: 'KDDI Australia', desc: 'KDDI offers telecommunications and data centre services in Australia.', strengths: ['Telecoms and data centre.', 'Japan link.', 'Enterprise.'] },
  { name: 'PCCW Global', desc: 'PCCW Global provides international network and communications services.', strengths: ['International network.', 'Connectivity.', 'Global reach.'] },
  { name: 'Singtel Optus', desc: 'Singtel Optus (Optus) is a major Australian carrier; see Optus for retail services.', strengths: ['Mobile and fixed.', 'Enterprise and consumer.', 'National coverage.'] },
  { name: 'Spark New Zealand', desc: 'Spark New Zealand has operations and partnerships in the Australasian region.', strengths: ['NZ and regional presence.', 'Mobile and fixed.', 'Enterprise.'] },
  { name: 'Tuas Limited', desc: 'Tuas Limited (formerly TPG Singapore) operates mobile and telecommunications in the region.', strengths: ['Regional telecoms.', 'Mobile operations.', 'Growth markets.'] },
  { name: 'Field Solutions Group', desc: 'Field Solutions Group builds and operates regional fibre and wireless broadband in Australia.', strengths: ['Regional fibre and wireless.', 'NBN alternative.', 'Regional focus.'] },
  { name: 'Wi-Sky', desc: 'Wi-Sky provides fixed wireless broadband in regional and rural Australia.', strengths: ['Fixed wireless.', 'Regional coverage.', 'Broadband.'] },
  { name: 'Lightning Broadband', desc: 'Lightning Broadband offers fixed wireless and broadband in selected Australian areas.', strengths: ['Fixed wireless.', 'High-speed option.', 'Local coverage.'] },
  { name: 'Tenet', desc: 'Tenet provides telecommunications and IT services to business.', strengths: ['Business telecoms.', 'Connectivity.', 'Support.'] },
  { name: 'MyNetFone', desc: 'MyNetFone (MNF Group) offers business and residential VoIP, NBN and phone services.', strengths: ['VoIP and NBN.', 'Business phone.', 'Competitive pricing.'] },
  { name: 'Faktortel', desc: 'Faktortel provides business phone, NBN and telecommunications to Australian SMEs.', strengths: ['Business phone and NBN.', 'VoIP and PBX.', 'SME focus.'] },
  { name: 'Crazytel', desc: 'Crazytel offers business telecommunications and connectivity services.', strengths: ['Business telecoms.', 'Voice and data.', 'Support.'] },
  { name: 'MaxoTel', desc: 'MaxoTel provides business phone, VoIP and telecommunications services.', strengths: ['Business phone and VoIP.', 'Cloud PBX.', 'SME focus.'] },
  { name: 'VoipLine Telecom', desc: 'VoipLine Telecom offers VoIP and business phone solutions.', strengths: ['VoIP and business phone.', 'SIP and PBX.', 'Support.'] },
  { name: 'Heroalk', desc: 'Heroalk provides telecommunications services.', strengths: ['Telecoms solutions.', 'Business focus.', 'Support.'] },
  { name: 'Cloudli', desc: 'Cloudli (formerly VirtualPBX) provides cloud business phone and unified communications.', strengths: ['Cloud phone and UC.', 'Business communications.', 'US and international.'] },
  { name: 'Broadvoice', desc: 'Broadvoice provides cloud voice and UCaaS to businesses in North America and beyond.', strengths: ['Cloud voice.', 'UCaaS.', 'Business focus.'] },
  { name: 'Net SIP', desc: 'Net SIP offers SIP trunking and VoIP services for business.', strengths: ['SIP trunking.', 'VoIP.', 'Business.'] },
  { name: 'Sipcity', desc: 'Sipcity provides SIP, VoIP and telecommunications services.', strengths: ['SIP and VoIP.', 'Business communications.', 'Support.'] },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pageHtml(v) {
  const s = slug(v.name);
  const title = escapeHtml(v.name);
  const desc = escapeHtml(v.desc);
  const strengths = v.strengths.map(x => `<li>${escapeHtml(x)}</li>`).join('\n          ');
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} – Business Telecommunications | Telco Review</title>
  <meta name="description" content="Summary of ${title} business telecommunications capabilities. Australian provider. Compare alternatives with Telco Review.">
  <link rel="canonical" href="https://telcoreview.com.au/vendors/${s}.html">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="/" class="logo" aria-label="Telco Review home"><img src="/assets/tr-logo.png" alt="Telco Review" width="180" height="44"></a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-desktop">Menu</button>
      <nav id="nav-desktop" class="nav-desktop" aria-label="Main">
${NAV}
      </nav>
    </div>
  </header>
  <main>
    <section class="page-title">
      <div class="container">
        <h1>${title}</h1>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <p class="text-lead">${desc} This page summarises typical capabilities; we do not endorse or criticise. If you are reviewing your current provider or exploring alternatives, Telco Review can help you compare options across Sydney, Melbourne, Brisbane, Adelaide, Canberra and Hobart.</p>
        <h2>Typical strengths</h2>
        <ul class="unstyled">
          ${strengths}
        </ul>
        <p>Capabilities and offers change. Confirm current products and pricing with ${title}. We provide vendor-agnostic review and comparison—<a href="/contact.html">contact us</a> to discuss your situation and alternatives.</p>
        <p><a href="/vendors/">← Back to Vendors</a></p>
      </div>
    </section>
  </main>
${FOOTER}`;
}

const vendorsDir = path.join(__dirname, '..', 'vendors');
if (!fs.existsSync(vendorsDir)) fs.mkdirSync(vendorsDir, { recursive: true });

const existing = new Set(['telstra', 'optus', 'tpg', 'vocus', 'aussie-broadband']);
const created = ['vodafone-australia', 'superloop', 'macquarie-technology-group', 'over-the-wire', 'symbio', 'mnf-group'];

for (const v of VENDORS) {
  const s = slug(v.name);
  if (existing.has(s)) continue;
  const outPath = path.join(vendorsDir, s + '.html');
  fs.writeFileSync(outPath, pageHtml(v), 'utf8');
  console.log('Written:', s + '.html');
}

const EXISTING = [
  { name: 'Aussie Broadband', slug: 'aussie-broadband' },
  { name: 'Optus', slug: 'optus' },
  { name: 'Telstra', slug: 'telstra' },
  { name: 'TPG Telecom', slug: 'tpg' },
  { name: 'Vodafone Australia', slug: 'vodafone-australia' },
  { name: 'Vocus (Vocus Group)', slug: 'vocus' },
];
const allEntries = EXISTING.concat(VENDORS.map((v) => ({ name: v.name, slug: slug(v.name) })));
allEntries.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
const indexGrid = allEntries.map((e) => `          <a href="/vendors/${e.slug}.html">${e.name.replace(/&/g, '&amp;')}</a>`).join('\n');
const indexPath = path.join(vendorsDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(
  /<div class="index-grid">[\s\S]*?<\/div>/,
  `<div class="index-grid">\n${indexGrid}\n        </div>`
);
fs.writeFileSync(indexPath, indexHtml);
console.log('Updated vendors/index.html with', allEntries.length, 'vendors.');

const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const vendorUrls = allEntries.map((e) => `  <url><loc>https://telcoreview.com.au/vendors/${e.slug}.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n');
sitemap = sitemap.replace(
  /(<url><loc>https:\/\/telcoreview\.com\.au\/vendors\/aussie-broadband\.html<\/loc><changefreq>monthly<\/changefreq><priority>0\.6<\/priority><\/url>)\n(  <url><loc>https:\/\/telcoreview\.com\.au\/locations)/,
  '$1\n' + vendorUrls.replace(/  <url><loc>https:\/\/telcoreview\.com\.au\/vendors\/(?:telstra|optus|tpg|vocus|aussie-broadband)\.html<\/loc>.*?\n/g, '') + '\n$2'
);
const existingVendorLines = ['  <url><loc>https://telcoreview.com.au/vendors/telstra.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>', '  <url><loc>https://telcoreview.com.au/vendors/optus.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>', '  <url><loc>https://telcoreview.com.au/vendors/tpg.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>', '  <url><loc>https://telcoreview.com.au/vendors/vocus.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>', '  <url><loc>https://telcoreview.com.au/vendors/aussie-broadband.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>'];
const newVendorUrls = allEntries.filter((e) => !['telstra', 'optus', 'tpg', 'vocus', 'aussie-broadband'].includes(e.slug)).map((e) => `  <url><loc>https://telcoreview.com.au/vendors/${e.slug}.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n');
sitemap = sitemap.replace(
  '  <url><loc>https://telcoreview.com.au/vendors/aussie-broadband.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n  <url><loc>https://telcoreview.com.au/locations/',
  '  <url><loc>https://telcoreview.com.au/vendors/aussie-broadband.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n' + newVendorUrls + '\n  <url><loc>https://telcoreview.com.au/locations/'
);
fs.writeFileSync(sitemapPath, sitemap);
console.log('Updated sitemap.xml with', allEntries.length, 'vendor URLs.');
