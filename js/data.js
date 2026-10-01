/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — site content & listing data
   ------------------------------------------------------------
   Source of truth for listings: "listngs.xlsx" (Lease + Sales tabs),
   enriched with the 2026 Canva flyers and outliergroup.us.
   To add / edit a listing, edit the LISTINGS array below.
   Each listing automatically gets its own page at
   index.html#property-<id>
   ════════════════════════════════════════════════════════════ */

const COMPANY = {
  name: "The Outlier Group",
  legal: "The Outlier Group, LLC",
  tagline: "Real estate, uncomplicated.",
  phone: "1-888-966-4820",
  email: "solutions@outliergroup.us",
  address: "260 1st Ave S., Unit #1, St. Petersburg, FL",
  license: "CQ1052317",
  social: {
    linkedin: "https://www.linkedin.com/company/outliergroup/",
    youtube: "https://www.youtube.com/@theoutliergroup",
    facebook: "https://www.facebook.com/OutlierGroup/",
    instagram: "https://www.instagram.com/outliercre/"
  },
  links: {
    careers: "mailto:solutions@outliergroup.us?subject=Careers%20at%20The%20Outlier%20Group",
    foundation: "https://www.outlierfoundation.org/",
    privacy: "#privacy"
  }
};
/* Careers — copied word-for-word from the original site's /jobs pages */
const CAREERS = {
  intro: "We believe in the power of people. We also believe in defying conformity, while celebrating what makes each of us unique. An Outlier is someone who breaks the mold on traditional, and takes pride in thinking outside the box. Outliers are entrepreneurs at heart with the burning desire to defy convention, and define their own career. We provide guidance and support, our Outliers pave the way.",
  jobTypes: ["Contractor"],
  workspaces: ["Remote"],
  jobs: [
    { slug: "saint-petersburg", city: "Saint Petersburg", position: "Advisor - St. Petersburg" },
    { slug: "tampa", city: "Tampa", position: "Advisor - Tampa" },
    { slug: "orlando", city: "Orlando", position: "Advisor - Orlando" },
    { slug: "miami", city: "Miami", position: "Advisor - Miami" },
    { slug: "naples", city: "Naples", position: "Advisor - Naples" }
  ].map((j) => Object.assign(j, { title: `Commercial Real Estate Advisor - ${j.city}, Florida (Remote)`, jobType: "Contractor", workspace: "Remote" })),
  role: [
    "We are seeking self-driven real estate professionals to transact on retail, office, and industrial properties throughout Florida.",
    "With a commitment to learning, and the spirit of entrepreneurship, we honor and preserve the connections with each member of our team. With that in mind, we don't hire everyone. We don't have agents either. We have trusted advisors that are dedicated to growth, and perfecting their craft."
  ],
  requirementsIntro: "The Outlier Group is a boutique real estate firm, looking for a passionate and driven <b>Commercial Real Estate Advisor</b> to join our team. As a member of our team, you'll have the chance to work with a range of clients and properties, and build a successful career in this dynamic industry, one brick at a time.",
  responsibilities: [
    "Network and build relationships with clients, property owners, landlords, and other industry professionals",
    "Identify and pursue new business opportunities, including listings, sales, and leasing",
    "Assist clients in the purchase, sale, or leasing of commercial properties",
    "Prepare and present property marketing materials, including flyers, brochures, and property tours",
    "Negotiate deals and close transactions",
    "Stay current on market trends, property values, and other industry-related information"
  ],
  qualifications: [
    "Intellectually versed in literature and business",
    "Strong communication and dependability",
    "Ability to work independently and with tenacity",
    "Active FLORIDA Real Estate license",
    "A strong network in the commercial real estate community is a plus"
  ],
  closing: "We offer ongoing training and one-on-one support with the President to help you succeed in your role. If you are a self-motivated, ambitious individual with a passion for commercial real estate, we encourage you to apply today!",
  eeo: "The Outlier Group is an equal-opportunity employer. All qualified applicants will receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, disability, or veteran status.",
  requirement: "Requirement: Florida Real Estate License",
  company: "The Outlier Group is a boutique commercial real estate firm, headquartered in Saint Petersburg, Florida. We have a team of remote professionals across the state of Florida.",
  positions: ["Advisor - Miami", "Advisor - Naples", "Advisor - Orlando", "Advisor - Tampa", "Advisor - St. Petersburg"]
};

/* Location filter regions (Portfolio + Client Portal): pick North / South / East / West,
   then a city in that region. Each listing's region comes from its county.
   To move a county to a different region, move its name to that list. */
const FL_REGIONS = {
  "North Florida": ["Escambia", "Santa Rosa", "Okaloosa", "Walton", "Holmes", "Washington", "Bay", "Jackson", "Calhoun", "Gulf", "Liberty", "Franklin", "Gadsden", "Leon", "Wakulla", "Jefferson", "Madison", "Taylor", "Hamilton", "Suwannee", "Lafayette", "Dixie", "Columbia", "Gilchrist", "Union", "Bradford", "Baker", "Nassau", "Duval", "Clay", "St. Johns", "Putnam", "Alachua", "Levy", "Marion"],
  "South Florida": ["Martin", "Palm Beach", "Broward", "Miami-Dade", "Monroe", "Collier", "Hendry", "Glades"],
  "East Florida": ["Flagler", "Volusia", "Seminole", "Orange", "Osceola", "Lake", "Sumter", "Brevard", "Indian River", "St. Lucie", "Okeechobee"],
  "West Florida": ["Citrus", "Hernando", "Pasco", "Pinellas", "Hillsborough", "Polk", "Manatee", "Sarasota", "Hardee", "DeSoto", "Highlands", "Charlotte", "Lee"]
};

/* Listing agents — keyed by the "Agent" column in the spreadsheet */
const AGENTS = {
  laurie: { name: "Laurie Lane", role: "Junior Advisor", phone: "+1 614 619 9761", email: "llane@outliergroup.us", img: "assets/img/team/laurie-lane.jpg" },
  joyce:  { name: "Joyce Teixeira", role: "Senior Advisor", phone: "+1 407 312 4231", email: "jteixeira@outliergroup.us", img: "assets/img/team/joyce-teixeira.jpg" },
  mac:    { name: "Mackinley Autrey", role: "Principal Broker", phone: "1-888-966-4820", email: "mautrey@outliergroup.us", img: "assets/img/team/mac-autrey.jpg" },
  jason:  { name: "Jason Clemmey", role: "Advisor", phone: "347-693-3447", email: "jclemmey@outliergroup.us", img: "assets/img/team/jason-clemmey.jpg" },
  team:   { name: "Outlier Solutions Team", role: "The Outlier Group", phone: "1-888-966-4820", email: "solutions@outliergroup.us", img: "" }
};

/* Team — bios, titles, and contact details from each outliergroup.us profile page */
const TEAM = [
 {
  "slug": "mac-autrey",
  "name": "Mackinley Autrey",
  "role": "Principal Broker",
  "img": "assets/img/team/mac-autrey.jpg",
  "email": "outreach@outliergroup.us",
  "phone": "",
  "contactName": "Natasha Santillana",
  "showListings": false,
  "linkedin": "https://www.linkedin.com/in/macautrey",
  "agent": "mac",
  "bio": [
   "Mackinley has provided expert guidance to investors and real estate companies for over a decade; earned a Bachelor of Science Degree in Business, published a book on commercial real estate, and is certified by MIT in commercial real estate analysis and investments. He is an active community member, including involvement with the local Chamber of Commerce, Freemasons, and a volunteer with The Outlier Foundation."
  ],
  "facts": [
   [
    "Role",
    "Principal Broker & Co-Founder"
   ],
   [
    "Experience",
    "Over a decade advising investors and real estate companies"
   ],
   [
    "Education",
    "Bachelor of Science in Business"
   ],
   [
    "Certification",
    "MIT — Commercial Real Estate Analysis & Investments"
   ],
   [
    "Author",
    "Published a book on commercial real estate"
   ],
   [
    "Community",
    "Chamber of Commerce · Freemasons · The Outlier Foundation"
   ]
  ],
  "focus": [
   "Investment Sales",
   "Acquisitions",
   "Retail",
   "Office",
   "Land",
   "Industrial"
  ]
 },
 {
  "slug": "vanessa-autrey",
  "name": "Vanessa Autrey",
  "role": "Partner",
  "img": "assets/img/team/vanessa-autrey.jpg",
  "email": "solutions@outliergroup.us",
  "phone": "1-888-966-4820",
  "linkedin": "",
  "agent": null,
  "bio": [],
  "facts": [
   [
    "Role",
    "Partner"
   ]
  ],
  "focus": []
 },
 {
  "slug": "den-ibasco",
  "name": "Denzylle Ibasco",
  "role": "Solutions Manager",
  "img": "assets/img/team/den-ibasco.jpg",
  "email": "solutions@outliergroup.us",
  "phone": "",
  "linkedin": "",
  "agent": null,
  "bio": [
   "Denzylle Ibasco brings a wealth of experience in customer-centric problem-solving garnered from her tenure at esteemed organizations such as Ubiquity UI (NYSE) and Concentrix, a global leader in customer experience solutions. Commencing her career at Ubiquity, located in San Jose, California, a technology powerhouse valued at $1.6B, Denzylle honed her skills under the mentorship of industry luminaries. Her journey continued at Concentrix, where she played a pivotal role with a team designing and optimizing customer experience (CX) journeys, integrating digital touchpoints with existing business processes to deliver strategic solutions.",
   "Driven by her passion for facilitating meaningful customer interactions, Denzylle sought to align herself with a boutique firm prioritizing personalized client relationships. This quest led her to The Outlier Group, renowned for its commitment to fostering enduring partnerships with its clientele. Handpicked by the President to lead the Solutions department, Denzylle leverages her profound understanding of customer journeys and processes to enhance the real estate experience for investors and industry stakeholders. Her strategic insights inform the implementation of redundancies and automation, ensuring that every interaction with The Outlier Group is characterized by excellence and efficiency."
  ],
  "facts": [
   [
    "Leads",
    "The Solutions department"
   ],
   [
    "Previously",
    "Ubiquity (NYSE) · Concentrix"
   ],
   [
    "Focus",
    "Customer journeys, process automation, client experience"
   ]
  ],
  "focus": [
   "Client Experience",
   "Operations",
   "Automation"
  ]
 },
 {
  "slug": "natasha-santillana",
  "name": "Natasha Santillana",
  "role": "Agent Liaison",
  "img": "assets/img/team/natasha-santillana.jpg",
  "email": "outreach@outliergroup.us",
  "phone": "",
  "linkedin": "",
  "agent": null,
  "bio": [
   "Natasha brings a wealth of experience in sales, client relations, and real estate operations to The Outlier Group. Starting her career with Ubiquity Global Services, she developed strong communication and problem-solving skills that have become her hallmark. With additional experience at real estate firms in Massachusetts, she is skilled in lead generation, contract management, and negotiations. As an Agent Liaison, Natasha ensures seamless communication between agents and clients, fostering smooth transactions and long-term relationships that reflect The Outlier Group’s commitment to excellence."
  ],
  "facts": [
   [
    "Previously",
    "Ubiquity Global Services · real estate firms in Massachusetts"
   ],
   [
    "Skills",
    "Lead generation · contract management · negotiations"
   ],
   [
    "Focus",
    "Seamless communication between agents and clients"
   ]
  ],
  "focus": [
   "Client Relations",
   "Agent Support",
   "Transactions"
  ]
 },
 {
  "slug": "erika-smith",
  "name": "Erika Smith",
  "role": "Marketing Director",
  "img": "assets/img/team/erika-smith.jpg",
  "email": "solutions@outliergroup.us",
  "phone": "",
  "linkedin": "",
  "agent": null,
  "bio": [
   "As the Marketing Director for The Outlier Group, Erika Smith provides strategic guidance on the firm’s marketing initiatives, offering expertise in campaign development, branding, and collateral design.",
   "Erika’s career spans both commercial and residential real estate, with marketing roles at industry leaders such as Colliers, Hines, Compass, and The Oppenheim Group. Before transitioning into real estate, she honed her skills in New York City’s fast-paced fashion industry, developing a deep understanding of audience engagement and brand storytelling.",
   "She holds a bachelor’s degree in Consumer Journalism from the University of Georgia and pursued advanced journalism studies at the University of Oxford.",
   "Beyond her professional work, Erika is an avid traveler who enjoys live music and podcasts. She currently resides in San Diego, California."
  ],
  "facts": [
   [
    "Previously",
    "Colliers · Hines · Compass · The Oppenheim Group"
   ],
   [
    "Education",
    "B.A. in Consumer Journalism, University of Georgia"
   ],
   [
    "Further study",
    "Advanced journalism studies, University of Oxford"
   ],
   [
    "Based in",
    "San Diego, California"
   ]
  ],
  "focus": [
   "Marketing Strategy",
   "Branding",
   "Campaigns",
   "Collateral Design"
  ]
 },
 {
  "slug": "holly-picano",
  "name": "Holly Picano",
  "role": "AI Marketing Specialist",
  "img": "assets/img/team/holly-picano.jpg",
  "email": "solutions@outliergroup.us",
  "phone": "",
  "linkedin": "https://www.linkedin.com/in/holly-picano-481a872/",
  "agent": null,
  "bio": [
   "Holly Picano is a seasoned digital marketer with a rich educational and professional background in the field. She holds a Master of Science in Digital Marketing from Full Sail University, a credential that underscores her deep understanding and expertise in the digital marketing landscape. Holly's career is marked by significant experience working with various digital marketing agencies, where she has honed her skills in crafting and implementing effective marketing strategies.",
   "In her current role, Holly leverages AI-powered tools to provide valuable insights into market conditions, enabling a more nuanced evaluation of property values and the identification of lucrative investment opportunities. Her ability to integrate advanced technology into her marketing strategies not only sets her apart in her field but also adds substantial value to her work in real estate marketing. Holly's blend of academic knowledge, professional experience, and technological proficiency makes her a dynamic and forward-thinking digital marketer."
  ],
  "facts": [
   [
    "Education",
    "M.S. in Digital Marketing, Full Sail University"
   ],
   [
    "Focus",
    "AI-powered market insights and digital marketing strategy"
   ]
  ],
  "focus": [
   "Digital Marketing",
   "AI Insights",
   "Market Analysis"
  ]
 },
 {
  "slug": "joyce-teixeira",
  "name": "Joyce Teixeira",
  "role": "Advisor",
  "img": "assets/img/team/joyce-teixeira.jpg",
  "email": "jteixeira@outliergroup.us",
  "phone": "407-312-4231",
  "linkedin": "https://www.linkedin.com/in/joyceteixeira/",
  "agent": "joyce",
  "bio": [
   "For over 20 years, Joyce has been retained by companies such as Planet Hollywood and Pabst Brewing Company to train their employees in sales and revenue strategy. Joyce has built numerous relationships with corporations in retail and hospitality by delivering key metrics still used today by many companies such as The Hive and Greenhouse Agency.",
   "By honing her craft in sales and marketing, Joyce recognized the benefits her skills bring to the real estate industry. She joined The Outlier Group in 2019 as a licensed real estate advisor. Since then, Joyce has helped companies with site selection, leasing, and acquisitions all over the State of Florida."
  ],
  "facts": [
   [
    "Experience",
    "20+ years in sales and revenue strategy"
   ],
   [
    "With Outlier since",
    "2019"
   ],
   [
    "Focus",
    "Site selection, leasing, and acquisitions across Florida"
   ],
   [
    "Past clients",
    "Planet Hollywood · Pabst Brewing Company"
   ]
  ],
  "focus": [
   "Leasing",
   "Site Selection",
   "Acquisitions",
   "Retail",
   "Hospitality"
  ]
 },
 {
  "slug": "jason-clemmey",
  "name": "Jason Clemmey",
  "role": "Advisor",
  "img": "assets/img/team/jason-clemmey.jpg",
  "email": "jclemmey@outliergroup.us",
  "phone": "347-693-3447",
  "linkedin": "https://www.linkedin.com/in/jason-clemmey-1096683/",
  "agent": "jason",
  "bio": [
   "Jason comes to the table with more than fifteen years of commercial real estate experience. Over the years, he has developed advanced skills relative to market analysis, valuation, and financial modeling. Much of his career has been with large regional banks where he was involved in over $1Bn of debt financing across several property types such as: Single-tenant and shopping center retail, office, multi-family, industrial, hotel, mixed-use, and land acquisitions.",
   "Prior to his career in finance, Mr. Clemmey provided strategic advisory services with RCLCO, a leading national real estate consulting firm. While based in their Washington, D.C. office, he worked with a variety of clients including; The Bozzuto Group, Lowe Enterprises, Del Webb, Oxbridge Development, and The District of Columbia.",
   "Jason received his B.S. in Urban and Regional Studies from Cornell University and his Master’s in Real Estate with a concentration in Finance from Georgetown University.",
   "He is a veteran of the U.S. Marine Corps, currently serves as a youth minister for the Church of Nazarene, and sits on the board of the Great Commission Foundation. His hobbies include traveling and golfing."
  ],
  "facts": [
   [
    "Experience",
    "15+ years in commercial real estate"
   ],
   [
    "Financing",
    "Involved in $1Bn+ of debt financing"
   ],
   [
    "Education",
    "B.S. Urban & Regional Studies, Cornell · Master's in Real Estate (Finance), Georgetown"
   ],
   [
    "Previously",
    "RCLCO, Washington, D.C."
   ],
   [
    "Service",
    "U.S. Marine Corps veteran"
   ]
  ],
  "focus": [
   "Market Analysis",
   "Valuation",
   "Financial Modeling",
   "Financing"
  ]
 },
 {
  "slug": "monsie-rivera",
  "name": "Monsie Rivera",
  "role": "Advisor",
  "img": "assets/img/team/monsie-rivera.jpg",
  "email": "mrivera@outliergroup.us",
  "phone": "813-454-1038",
  "linkedin": "https://www.linkedin.com/in/monsie-clemmey-75514668/",
  "agent": null,
  "bio": [
   "For nearly three decades, Monsie has provided strong leadership and expertise in commercial real estate acquisitions, management, and development with a heavy focus on multi-family, manufactured housing communities and RV resorts.",
   "Throughout her career, she has successfully led the operations of large portfolios for some of the nation’s top multi-family real estate firms, including: ZRS, Pegasus Residential, Equity Residential, and AIMCO.",
   "Monsie was born and raised in Tampa, Florida. She is bilingual/bicultural (English and Spanish), and serves in her community by volunteering with Habitat for Humanity and Corporation to Develop Communities of Tampa (CDC). She also enjoys fitness and traveling."
  ],
  "facts": [
   [
    "Experience",
    "Nearly three decades in CRE acquisitions, management & development"
   ],
   [
    "Previously",
    "ZRS · Pegasus Residential · Equity Residential · AIMCO"
   ],
   [
    "Languages",
    "English · Spanish"
   ],
   [
    "Hometown",
    "Tampa, Florida"
   ]
  ],
  "focus": [
   "Multi-Family",
   "Manufactured Housing",
   "RV Resorts",
   "Property Management"
  ]
 },
 {
  "slug": "laurie-lane",
  "name": "Laurie Lane",
  "role": "Junior Advisor",
  "img": "assets/img/team/laurie-lane.jpg",
  "email": "llane@outliergroup.us",
  "phone": "614-619-9761",
  "linkedin": "https://www.linkedin.com/in/lauriealane/",
  "agent": "laurie",
  "bio": [
   "Laurie Lane brings a strong blend of real estate investment expertise, tech-driven sales experience, and strategic insight to her role as Junior Advisor at The Outlier Group. A graduate of Eckerd College with a Bachelor of Arts in Environmental Studies, Laurie began her career in sales and managed many sales teams. Her last corporate role was Sales Manager at MagicPlan, a real estate technology company, where she surpassed national sales targets by educating contractors, designers, and investors on the benefits of LiDAR for space planning. She also led and managed the company’s SDR team.",
   "Laurie’s background spans hands-on remodeling work, real estate tech, and fund-level investment consulting. At WolfPack Capital, she helped investors passively acquire tax deed properties and partnered with others on multifamily acquisitions, contributing to the firm’s growth to over 30 assets under management. Along the way, she also acquired and self-managed her own investment properties.",
   "Licensed since 2018, Laurie has been involved in numerous commercial transactions, renovations, and tenant-occupied property sales. Her experience working alongside investors and managing her own portfolio gives her a practical edge when advising clients. She is known for her financial acumen, market knowledge, and strong ties within the commercial investing community.",
   "Outside of real estate, Laurie enjoys running, travel, and the beach."
  ],
  "facts": [
   [
    "Licensed since",
    "2018"
   ],
   [
    "Education",
    "B.A. in Environmental Studies, Eckerd College"
   ],
   [
    "Previously",
    "MagicPlan (Sales Manager) · WolfPack Capital"
   ]
  ],
  "focus": [
   "Investment Properties",
   "Tenant-Occupied Sales",
   "Multifamily",
   "Real Estate Tech"
  ]
 },
 {
  "slug": "nathalia-keown",
  "name": "Nathalia Keown",
  "role": "Junior Advisor",
  "img": "assets/img/team/nathalia-keown.jpg",
  "email": "nkeown@outliergroup.us",
  "phone": "(407) 692-7303",
  "linkedin": "http://linkedin.com/in/nathalia-keown-64389a7b",
  "agent": null,
  "bio": [
   "A seasoned professional with over 20 years of expertise in administration, specializing in commercial real estate. Fluent in English, Portuguese, and Spanish, Nathalia Keown holds a B.A. in International Affairs/Economics from Rollins College in Orlando, FL, providing her with a solid academic foundation.",
   "Her career journey includes pivotal roles such as operations assistant at The Forbes Company, where she excelled in CAM management and tenant relations. Subsequently, she served as Site Manager at a pharmaceutical company in Orlando, demonstrating her ability to deliver exceptional results in operational management.",
   "In 2024, Nathalia joined our team as a Junior Advisor, leveraging her expertise in commercial real estate, administration, and customer service to provide unparalleled guidance and support to her clients.",
   "With a meticulous approach and dedication to excellence, Nathalia ensures that each client receives personalized solutions tailored to their unique needs. Her professionalism and depth of experience make her an invaluable asset in navigating the intricacies of the real estate market.",
   "For individuals seeking a results-driven professional to guide them through their commercial real estate endeavors, Nathalia stands ready to deliver exceptional service."
  ],
  "facts": [
   [
    "Experience",
    "20+ years in administration, specializing in CRE"
   ],
   [
    "Joined",
    "2024"
   ],
   [
    "Languages",
    "English · Portuguese · Spanish"
   ],
   [
    "Education",
    "B.A. International Affairs/Economics, Rollins College"
   ],
   [
    "Previously",
    "The Forbes Company"
   ]
  ],
  "focus": [
   "Tenant Relations",
   "CAM Management",
   "Client Service"
  ]
 }
];

/* Text from outliergroup.us/services */
const SERVICES = [
  { key: "consulting", name: "Consulting", icon: "compass", desc: "Our specialist draw on industry expertise, experience, education and market trends to deliver bespoke real estate advice to our clients and investors." },
  { key: "buying-selling", name: "Buying & Selling", icon: "key", desc: "When it comes to buying and selling real estate, we advise across all commercial, residential and rural markets." },
  { key: "financing", name: "Financing", icon: "bank", desc: "Our dedicated team of professionals has a vast network of contacts to assist with all of your financing needs." },
  { key: "leasing", name: "Leasing", icon: "doc", desc: "Whether you're a landlord or occupier, our team of leasing experts provide services to match." },
  { key: "1031", name: "1031 Exchange", icon: "swap", desc: "Our advisors bring years of expertise to every transaction, helping you execute your 1031 exchange with ease." },
  { key: "valuation", name: "Valuation", icon: "chart", desc: "Our team of experts provide commercial and residential property valuations, backed by market research and expertise." }
];

/* Text from outliergroup.us/sectors — `filter` links a sector to Portfolio results */
const SECTORS = [
  { name: "Retail", desc: "Our team provides leasing, sales, acquisition, and investment advice to retailers and owners.", filter: "Retail" },
  { name: "Industrial", desc: "We offer a range of leasing and sales support to industrial occupiers and owners.", filter: null },
  { name: "Mixed Use", desc: "We provide sales, leasing and advisory services for mixed use projects nationwide.", filter: "Mixed Use" },
  { name: "Office", desc: "Whether you're a landlord, investor or occupier, our team of leasing experts provide services to match.", filter: "Office" },
  { name: "Healthcare", desc: "Our specialist teams offer a bespoke range of real estate services across the healthcare industry.", filter: "Medical" },
  { name: "MultiFamily", desc: "Explore prime locations for multifamily projects through our expertise in off-market site discovery.", filter: null },
  { name: "Land", desc: "Whether you're looking to buy, sell, develop or let vacant land, our specialists can assist.", filter: "Land" },
  { name: "Hotel", desc: "Whether a single asset or large portfolio, we can advise clients on various strategies.", filter: null },
  { name: "Marine", desc: "From marinas, to buying, selling, letting or renting moorings, we can help.", filter: null }
];

/* Text from outliergroup.us/whyoutlier */
const VALUES = [
  { name: "Strategy", desc: "Armed with industry expertise, world-class education, and grit - our strategy is unparalleled." },
  { name: "Relationships", desc: "Beyond transactional, relationships are the forefront of our brand and our motto. With us, you're a partner." },
  { name: "Value", desc: "We take tremendous pride in generating lasting value for our clients beyond the first transaction." },
  { name: "Community", desc: "Beyond our business endeavors, we are dedicated to giving back to our community." },
  { name: "Excellence", desc: "Excellence is to do a common thing in an uncommon way. This is the core of our attitude and approach." },
  { name: "Eco-Conscious", desc: "We believe in stewardship of the environment. We are committed to incorporating eco-conscious practices into our daily endeavors." }
];

const ARTICLES = [
  { title: "Retail, Rates, and Reality—Finding the Core In Submarkets", img: "assets/img/site/article-retail.jpg" },
  { title: "Assurity of Sale: Why Relationships Trump Randoms in Commercial Real Estate", img: "assets/img/site/article-assurity.jpg" },
  { title: "Market Update: Summer 2025", img: "assets/img/site/article-summer.jpg" }
];

const BRANDS = [
  { name: "Hilton", img: "assets/img/brands/hilton.png" },
  { name: "Publix", img: "assets/img/brands/publix.png" },
  { name: "Bank of America", img: "assets/img/brands/boa.png" },
  { name: "H&R Block", img: "assets/img/brands/hrblock.png" },
  { name: "Dollar Tree", img: "assets/img/brands/dollartree.png" },
  { name: "U.S. Navy", img: "assets/img/brands/navy.png" },
  { name: "Walmart", img: "assets/img/brands/walmart.png" },
  { name: "T-Mobile", img: "assets/img/brands/tmobile.png" },
  { name: "Pio Pio", img: "assets/img/brands/piopio.png" },
  { name: "Amscot", img: "assets/img/brands/amscot.png" },
  { name: "Dollar General", img: "assets/img/brands/dollargeneral.png" },
  { name: "Orange County Public Schools", img: "assets/img/brands/ocps.png" },
  { name: "Liberty Tax", img: "assets/img/brands/libertytax.png" },
  { name: "Perkins", img: "assets/img/brands/perkins.png" },
  { name: "BJ's", img: "assets/img/brands/bjs.png" },
  { name: "HCA Healthcare", img: "assets/img/brands/hca.png" },
  { name: "Department of Education", img: "assets/img/brands/doe.png" },
  { name: "Winn-Dixie", img: "assets/img/brands/winndixie.png" },
  { name: "Hungry Howie's", img: "assets/img/brands/hungryhowies.png" },
  { name: "Murphy USA", img: "assets/img/brands/murphy.png" },
  { name: "Stanbery", img: "assets/img/brands/stanbery.png" },
  { name: "O'Reilly Auto Parts", img: "assets/img/brands/oreilly.png" },
  { name: "Big Lots", img: "assets/img/brands/biglots.png" },
  { name: "Save A Lot", img: "assets/img/brands/savealot.png" },
  { name: "veriMED", img: "assets/img/brands/verimed.png" }
];

/* ────────────────────────────────────────────────────────────
   LISTINGS
   status:  "Available" | "Leased" | "Pending" | "Sold" | "Off-Market" | "Past Listing"
   deal:    "Lease" | "Sale"
   offMarket: true → hidden details, NDA required, shown in the Client Portal
   The three card fields are: space (Unit # & Space Available), building, unit
   ──────────────────────────────────────────────────────────── */
const LISTINGS = [
  /* ── LEASE LISTINGS (spreadsheet tab "Lease listings") ── */
  {
    id: "6416-central-ave", title: "6416 Central Ave.", headline: "Office Space with High Visibility",
    subhead: "Ideal for attorneys, staffing, cosmetology, and office users",
    address: "6416 Central Ave.", city: "St. Petersburg, FL 33707", county: "Pinellas",
    status: "Available", statusNote: "Available Now", deal: "Lease", type: "Office", agent: "laurie",
    space: "Unit 6416 – 800 SF", building: "4,444 SF", unit: "800 SF", sfNum: 800,
    facts: [["Zoning","CRT-1"],["Year Built","1976"],["Base Rent","$20 PSF"],["NNN or CAM Expense","$5 PSF"],["Est. Monthly Rent","$1,665 in Year 1"],["Occupancy Status","Available Now"]],
    highlights: ["Move-in-ready office suite","Prominent pylon and building signage","Two private offices","Spacious reception area","Private restroom","Ample storage closets","Flexible space for a conference room or open workspace","Rear access with ample on-site parking","High-speed internet available","Convenient access to public transportation"],
    desc: "Located just five minutes from Downtown St. Petersburg and the beach, this office suite offers strong visibility, accessibility, and flexibility within a professional mid-century commercial building. Surrounded by established businesses including Melby & Associates (CPA) and Bozeman Insurance Group, the space is well suited for attorneys, staffing agencies, cosmetology professionals, and other office-based users.",
    photos: ["central-6416-1","central-6416-3","central-6416-4","central-6416-2"], lat: 27.77075, lng: -82.72477, featured: true
  },
  {
    id: "1325-w-cass-st", title: "1325 W Cass St", headline: "Renovated Freestanding Building",
    subhead: "Ideal for office, medical, retail, or service users",
    address: "1325 W Cass Street", city: "Tampa, FL 33606", county: "Hillsborough",
    status: "Available", statusNote: "Active", deal: "Lease", type: "Office", typeLabel: "Office / Retail", agent: "laurie",
    space: "2,758 SF", building: "2,758 SF", unit: "2,758 SF", sfNum: 2758,
    facts: [["Zoning","CG"],["Year Built","1929"],["Base Rent","$20 PSF"],["NNN Expense","$6.65 PSF"],["Est. Monthly Rent","$6,125"],["Previous Use","Law Office"]],
    highlights: ["Fully renovated standalone building","Approx. 3,500 vehicles per day","Six designated parking spaces","Three separate entrances","Four private offices","Conference room","Reception area","Kitchenette/break room","Two restrooms","Flexible office & retail layout"],
    desc: "Located in North Hyde Park, this fully renovated freestanding building offers excellent visibility and accessibility just minutes from Downtown Tampa, Hyde Park Village, and the University of Tampa. Positioned across from The Jade luxury apartments and near established local businesses, the property provides a strong opportunity for users seeking a distinctive presence in a high-demand neighborhood.",
    photos: ["cass-1325-1","cass-1325-2","cass-1325-3"], lat: 27.94989, lng: -82.47296, featured: true
  },
  {
    id: "causeway-village", title: "Causeway Village", headline: "High-Visibility Office/Retail Space",
    subhead: "Ideal for a variety of professional or retail uses",
    address: "1393 Pasadena Ave S", city: "South Pasadena, FL 33707", county: "Pinellas",
    status: "Available", statusNote: "Available December 1, 2026", deal: "Lease", type: "Office", typeLabel: "Office / Retail", agent: "laurie",
    space: "2,600 SF (divisible)", building: "4,343 SF", unit: "2,600 SF", sfNum: 2600,
    facts: [["Zoning","CG"],["Year Built","1955"],["Base Rent","$20 PSF"],["NNN or CAM Expense","$4 PSF"],["Est. Monthly Rent","$5,200"],["Occupancy Status","Available on December 1, 2026"]],
    highlights: ["Delivered as Vanilla Shell","Prominent pylon signage","15+ private parking spaces","Covered parking","Two curb cuts","Front & rear entrances","Build-to-suit options","Densely populated","Approx. 26,500 vehicles per day","Walking distance to park, ocean, hospital & marina"],
    desc: "This office building at Causeway Plaza offers excellent visibility on Pasadena Avenue. The 2,600 SF space is divisible. Includes private and excess parking, and a convenient location near Pasadena Hospital and Marina. Ideal for a variety of professional uses, the property will be delivered as a Vanilla Shell post-lease (currently in Gray Shell condition), allowing tenants the flexibility to customize the space to suit their specific needs.",
    photos: ["causeway-village-1","causeway-village-2","pasadena-office-plaza"], lat: 27.75538, lng: -82.73754, featured: true
  },
  {
    id: "checkers-6200-mlk", title: "Checkers – 6200 Dr. MLK Jr. St. N", headline: "Retail with Drive-Thru — Ground Lease or As-Is",
    subhead: "Ideal for coffee, QSR, or prototype redevelopment",
    address: "6200 Dr. M.L.K. Jr. St. N", city: "St. Petersburg, FL", county: "Pinellas",
    status: "Available", statusNote: "Available Now", deal: "Lease", type: "Retail", typeLabel: "Retail / Drive-Thru", agent: "laurie",
    space: "958 SF", building: "±0.51 Acres (22,303 SF)", unit: "958 SF Heated", sfNum: 958,
    facts: [["Zoning","CCS-1"],["Land Size","±0.51 Acres (22,303 SF)"],["Year Built","2005"],["Annual Rent","$108,000"],["Monthly Rent","$9,000 NNN"],["Term","10–20+ Years"],["Lease Format","True NNN"],["Traffic","~36,700 vehicles/day combined"],["Occupancy Status","Available Now"]],
    highlights: ["Two drive-thru lanes","Grease trap and hood","Commercial freezers","Ample parking + signage","On-site office space","Covered outdoor seating area","Hard corner at a signalized intersection","62nd Ave N: 20,200 AADT · MLK Jr. Blvd N: 16,500 AADT","150 x 150' of highway frontage","Landlord open to tenant demolition"],
    desc: "Prime drive-thru opportunity in St. Petersburg with exceptional visibility and access, ideal for coffee, QSR, or fast-casual operators. Located at the signalized intersection of 62nd Avenue North and Dr. Martin Luther King Jr. Street North, the site benefits from strong traffic counts and proximity to major employers such as Jabil and Raymond James. The surrounding area features dense residential neighborhoods and established retail, supporting consistent daily demand. Offered on a Ground Lease or AS-IS Lease, this property is well-suited for operators seeking a high-exposure hard corner.",
    photos: ["checkers-6200-1","checkers-6200-2"], lat: 27.8286, lng: -82.6456, featured: true
  },
  {
    id: "4714-n-armenia-ave", title: "4714 N Armenia Ave", headline: "Office Condo in Midtown Square",
    subhead: "Ideal for medical, professional, or office users",
    address: "4714 N Armenia Ave, Unit 103", city: "Tampa, FL 33603", county: "Hillsborough",
    status: "Available", statusNote: "Active", deal: "Lease", type: "Medical", typeLabel: "Office / Medical", agent: "laurie",
    space: "1st Floor, Unit 103 – 2,234 SF", building: "2,234 SF", unit: "2,234 SF", sfNum: 2234,
    facts: [["Year Built","2006"],["Base Rent","$24 PSF"],["NNN Expense","$9.79 PSF"],["Est. Monthly Rent","$6,290"],["Previous Use","Radiology Space (X-ray Lab)"]],
    highlights: ["Five private offices","Conference room","Reception area","Office/medical building","Prime location","High traffic","Ample parking","Professionally managed"],
    desc: "Perfect for professional or medical uses, this office condo offers a welcoming reception area, ample office space, and a large conference room. Located near St. Joseph's and AdventHealth hospitals, it provides high visibility and ample parking. Ideal for businesses seeking a prime location in a vibrant, professional environment.",
    photos: ["armenia-4714-1","armenia-4714-2","armenia-4714-3","armenia-ave"], lat: 27.98777, lng: -82.48468
  },
  {
    id: "bailiwick-plaza", title: "Bailiwick Plaza", headline: "800 SF in Cocoa Beach",
    address: "22 N Brevard Avenue", city: "Cocoa Beach, FL", county: "Brevard",
    status: "Available", statusNote: "Active", deal: "Lease", type: "Retail", typeLabel: "Retail / Office", agent: "joyce",
    space: "800 SF", building: "18,831 SF", unit: "800 SF", sfNum: 800,
    facts: [],
    highlights: [],
    desc: "An 800 SF space available at Bailiwick Plaza, an 18,831 SF property on N Brevard Avenue in Cocoa Beach. Contact Joyce Teixeira for rates, floor plan, and a tour.",
    photos: ["bailiwick-plaza-1", "bailiwick-plaza-2", "bailiwick-plaza-3"], lat: 28.31889, lng: -80.61125
  },
  {
    id: "sun-village", title: "Sun Village", headline: "Freestanding Retail Outparcel",
    subhead: "Ideal for retail, food, or service businesses",
    address: "12300 Seminole Blvd (Suites 2 & 3)", city: "Largo, FL 33778", county: "Pinellas",
    status: "Available", statusNote: "Available Now", deal: "Lease", type: "Retail", agent: "laurie",
    space: "940 SF (Suite 2) · 930 SF (Suite 3)", building: "11,511 SF", unit: "940 SF (Suite 2) · 930 SF (Suite 3)", sfNum: 1870,
    facts: [["Base Rent","$13 PSF"],["NNN Expense","$3 PSF"],["Est. Monthly Rent","$2,493"],["Previous Use","Radiology Space (X-ray Lab)"],["Occupancy Status","Available Now"]],
    highlights: ["Seminole Blvd frontage","Outparcel positioning","Ample on-site parking","Newly painted","Signage available","Approx. 263,000+ residents"],
    desc: "Located along Seminole Boulevard at Sun Village Plaza, this 1,870 SF standalone retail outparcel offers strong street presence, convenient access, and ample parking. Positioned between Arby's and Ace Hardware, the property benefits from established national retailers, steady commuter traffic, and a growing residential customer base. With flexible shell space, this location offers an excellent opportunity for businesses looking to establish or expand in the Seminole-Largo market.",
    photos: ["sun-village-1","sun-village-2","sun-village-plaza"], lat: 27.88461, lng: -82.78719, featured: true
  },
  {
    id: "capeview-plaza", title: "Capeview Plaza", headline: "Retail Space Near Port Canaveral",
    subhead: "Ideal for retail, food, or service businesses",
    address: "8167 Canaveral Blvd", city: "Cape Canaveral, FL 32920", county: "Brevard",
    status: "Available", statusNote: "Available Now", deal: "Lease", type: "Retail", typeLabel: "Coastal Retail Space", agent: "joyce",
    space: "1,200 SF (Unit 8117) · 270–720 SF (Units 8113 & 8115)", building: "18,565 SF", unit: "1,200 SF (Unit 8117) · 270–720 SF (Units 8113 & 8115)", sfNum: 1200,
    facts: [["Year Built","1967"],["Unit 8117","$1,500 / month"],["Unit 8113","$850 / month"],["Unit 8115","$1,100 / month"],["Occupancy Status","Available Now"]],
    highlights: ["Established tenant mix","Food, retail & specialty shops","Consistent foot traffic","Ample on-site parking","Walkable to the beach","Near Port Canaveral","Prime coastal location"],
    desc: "Prime retail space at 8167 Canaveral Blvd in Cape Canaveral, located near Port Canaveral and just moments from the beach. The vibrant plaza features 10+ established retail, dining, and specialty businesses, creating a diverse destination for locals and tourists. The property benefits from consistent foot traffic, ample on-site parking, and excellent visibility, making it a strong location for retail or service-oriented businesses.",
    photos: ["capeview-plaza-1"], lat: 28.39256, lng: -80.60404
  },
  {
    id: "art-systems-center", title: "Art Systems Center", headline: "Prime Multi-Use Retail Opportunity in Winter Park",
    address: "1740 State Road 436", city: "Winter Park, FL 32792", county: "Orange",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Retail", typeLabel: "Multi-Use Retail", agent: "joyce",
    space: "1,400 SF", building: "15,042 SF", unit: "1,400 – 2,500 SF", sfNum: 1400,
    facts: [["Zoning","CG"],["Year Built / Renovated","1986 / 2000"],["Base Rent","$22 PSF"],["NNN Expense","$5 PSF"],["Est. Monthly Rent","$3,150"],["Traffic Count","55,000+"],["Median Income","$64,144"]],
    highlights: ["Office or retail","Ample parking","Pylon signage","Bay door available","Professionally managed","Frontage on Hwy 436","Build-out available","Inline space","Open floor plan","Block construction","Great tenant mix"],
    desc: "Art Systems Business Centre is a 15,042-square-foot multi-tenant retail center in Winter Park, Florida. The property is situated on 2.3 acres on the east side of State Road 436 and north of Aloma Avenue. The center benefits from tremendous visibility and exposure to daily traffic on one of the busiest thoroughfares in Orlando. A signal at Winter Woods Boulevard provides full access to the property.",
    photos: ["art-systems-1","art-systems-center"], lat: 28.6040, lng: -81.3094
  },
  {
    id: "colonial-commons-plaza", title: "Colonial Commons Plaza", headline: "Retail Space on E. Colonial Drive",
    address: "7101 E Colonial Dr", city: "Orlando, FL 32807", county: "Orange",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Retail", agent: "joyce",
    space: "3,362 SF", building: "3,362 SF", unit: "3,362 SF", sfNum: 3362,
    facts: [["Zoning","C-3"],["Year Built","2009"],["Leased Use","Church"],["Traffic","~61,338 vehicles/day on E. Colonial Dr"],["5-Mile Population","~320,840 residents"],["5-Mile Median HH Income","~$74,847"]],
    highlights: ["Great exposure","Dedicated turn lane","Pylon signage","Good tenant mix","Ample parking","High job growth","Busy center"],
    desc: "Prime retail opportunity at 7101 E Colonial Dr, strategically positioned at the signalized intersection of E. Colonial Drive and Forsyth Road. The property offers exceptional exposure along one of Orlando's major commercial corridors with approximately 61,338 vehicles per day traveling along E. Colonial Drive. The center features prominent pylon signage, excellent visibility, ample parking, and convenient access with frontage on both Colonial Drive and Forsyth Road. Ideally positioned near Baldwin Park, Orlando Executive Airport, SR-408, SR-436, and major East Orlando destinations.",
    photos: ["colonial-commons-2","colonial-commons-plaza"], lat: 28.55342, lng: -81.32221
  },
  {
    id: "grindle-village", title: "Grindle Village", headline: "Retail Space in Winter Park",
    address: "1555 N Semoran Blvd", city: "Winter Park, FL", county: "Orange",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Retail", agent: "joyce",
    space: "2,400 SF", building: "14,928 SF", unit: "2,400 SF", sfNum: 2400,
    facts: [["Site","2.3 acres"],["Traffic Count","50,752+ vehicles per day"],["Population","269,195+"],["Median HH Income","$79,416"]],
    highlights: ["High-visibility retail/office location","Prime Semoran Blvd frontage","Well-maintained building","Ample parking","Flexible, open layouts"],
    desc: "Exceptional office or retail opportunity in the heart of Winter Park. This 14,928 SF multi-tenant center sits on 2.3 acres with prominent frontage along N Semoran Blvd, offering exceptional visibility and exposure along one of Orlando's busiest corridors. Features include ample parking, a prominent entrance, professional management, and build-out options to accommodate a variety of business needs.",
    photos: ["grindle-village-1","grindle-village-plaza"], lat: 28.5925, lng: -81.3093
  },
  {
    id: "6533-central-ave", title: "6533 Central Ave.", headline: "Retail Space on Central Avenue",
    address: "6533 Central Ave.", city: "St. Petersburg, FL 33710", county: "Pinellas",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Retail", typeLabel: "Construction / Retail", agent: "laurie",
    space: "1,067 SF", building: "6,720 SF", unit: "1,067 SF", sfNum: 1067,
    facts: [], highlights: [],
    desc: "A 1,067 SF construction/retail space in a 6,720 SF building on the Central Avenue corridor in St. Petersburg. Leased by The Outlier Group.",
    photos: ["6533-central-ave-1", "6533-central-ave-2", "6533-central-ave-3", "6533-central-ave-4", "6533-central-ave-5"], lat: 27.7709, lng: -82.72711
  },
  {
    id: "doggy-daycare", title: "Doggy Daycare", headline: "Retail Space on E South Street",
    address: "2417 E South St", city: "Orlando, FL 32803", county: "Orange",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Retail", agent: "joyce",
    space: "4,231 SF", building: "—", unit: "4,231 SF", sfNum: 4231,
    facts: [], highlights: [],
    desc: "4,231 SF of retail space on E South Street in Orlando, leased to a doggy daycare operator by The Outlier Group.",
    photos: ["south-street-plaza"], lat: 28.53876, lng: -81.35156
  },
  {
    id: "2144-duck-slough-blvd", title: "2144 Duck Slough Blvd", headline: "Office / Medical Suite",
    address: "2144 Duck Slough Blvd, 1st Floor, Ste 101", city: "New Port Richey, FL", county: "Pasco",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Medical", typeLabel: "Office / Medical", agent: "mac",
    space: "1st Floor, Ste 101 & 4,000 SF", building: "—", unit: "—", sfNum: 4000,
    facts: [], highlights: [],
    desc: "Former radiology practice, ideal for medical use. Professionally managed and centrally located.",
    photos: ["duck-slough-blvd"], lat: 28.18991, lng: -82.63695
  },
  {
    id: "grandview-plaza", title: "Grandview Plaza", headline: "Neighborhood Plaza in Buenaventura Lakes",
    address: "2676 Simpson Road", city: "Kissimmee, FL", county: "Osceola",
    status: "Leased", statusNote: "Leased Out", deal: "Lease", type: "Retail", agent: "joyce",
    space: "1,150 SF", building: "7,326 SF", unit: "1,150 SF", sfNum: 1150,
    facts: [], highlights: [],
    desc: "Neighborhood plaza fronting Boggy Creek Road in the Buenaventura Lakes community.",
    photos: ["grandview-plaza"], lat: 28.3119, lng: -81.34527
  },

  /* ── SALES LISTINGS (spreadsheet tab "Sales Listings") ── */
  {
    id: "jacksonville-assembly", title: "Jacksonville Assembly", headline: "51.5-Acre Land Assemblage",
    address: "Jacksonville", city: "Jacksonville, FL", county: "Duval",
    status: "Available", statusNote: "Active", deal: "Sale", type: "Land", agent: "jason",
    space: "51.5 Acres (22.5 Acres of Upland)", building: "—", unit: "Total 32.6 Acres (19.3 Acres of Upland)", sfNum: 2243340,
    facts: [], highlights: [],
    desc: "A 51.5-acre land assemblage in Jacksonville with 22.5 acres of upland. Contact the listing advisor for the parcel breakdown, survey, and pricing.",
    photos: ["jacksonville-assembly-3", "jacksonville-assembly-1", "jacksonville-assembly-2"], lat: 30.32622, lng: -81.65792
  },
  {
    id: "5145-gulfport-blvd", title: "5145 Gulfport Blvd S", headline: "2nd Generation Restaurant Space",
    subhead: "Ideal for coffee, QSR, or redevelopment",
    address: "5145 Gulfport Blvd S", city: "Gulfport, FL 33707", county: "Pinellas",
    status: "Available", statusNote: "Active", deal: "Sale", type: "Retail", typeLabel: "Retail Property", agent: "laurie",
    space: "0.32 AC / 110 x 150'", building: "1,396 SF + 783 SF Heated", unit: "1,396 SF + 783 SF Heated", sfNum: 2179,
    facts: [["Asking Price","$750,000"],["Zoning","CL-2"],["Land Size","0.32 AC / 110 x 150'"],["Year Built","1954"],["Occupancy Status","Commercial – Vacant"]],
    highlights: ["Signalized intersection","Air-conditioned space","Ample parking","Retail use","Existing restaurant build-out","Approx. 0.32 acres"],
    desc: "Rare Gulfport opportunity on a high-visibility corner with 110' street frontage. Includes 1,396 SF retail plus endless optionality: expand, redevelop, or live next door. Formerly Smokin' J's BBQ, this site boasts a strong local legacy, premium traffic, and flexible commercial potential for a restaurant, retail, or bold destination concept. High-visibility corner next to Annex Coffee, across from Shell, and near McDonald's, with quick regional access via Tampa Amtrak, St. Pete–Clearwater, and Tampa International Airports.",
    photos: ["gulfport-5145-1","gulfport-5145-3","gulfport-5145-2"], lat: 27.74837, lng: -82.70311, featured: true
  },
  {
    id: "5106-n-armenia-ave", title: "5106 N Armenia Ave", headline: "Medical Office Investment Opportunity",
    subhead: "Ideal for medical or professional use",
    address: "5106 N Armenia Ave, Unit 2", city: "Tampa, FL 33603", county: "Hillsborough",
    status: "Pending", statusNote: "Pending", deal: "Sale", type: "Medical", typeLabel: "Medical Office Condo", agent: "laurie",
    space: "Unit 2 – 2,040 SF", building: "2,202 SF (gross area)", unit: "2,040 SF", sfNum: 2040,
    facts: [["Asking Price","$650,000"],["Zoning","PD"],["Year Built","1982"],["Cap Rate","6.5%"],["Occupancy Status","Commercial – Vacant"]],
    highlights: ["8 offices","5 plumbed exam rooms","Spacious reception area","Signage on Armenia Ave.","16 assigned parking spaces","Courtyard","Staff kitchen","2 bathrooms"],
    desc: "Ideal for medical or professional use, this 2,040 SF office features five plumbed exam rooms, a spacious reception area, a staff kitchen, two bathrooms, and an open space for expansion. It is located across from St. Joseph's Hospital and AdventHealth. Ideal for an owner-occupier or investment at a 6.5 CAP rate.",
    photos: ["armenia-5106-1"], lat: 27.99259, lng: -82.48458
  },
  {
    id: "super-walmart-outparcel", title: "Super Walmart Outparcel", headline: "Buildable Outparcel on Highway 19",
    address: "US Highway 19", city: "Hudson, FL 34667", county: "Pasco",
    status: "Pending", statusNote: "Pending / For Sale", deal: "Sale", type: "Land", agent: "mac",
    space: "0.5 Acres (21,780 SF)", building: "—", unit: "—", sfNum: 21780,
    facts: [], highlights: [],
    desc: "0.5 acres of buildable land fronting Super Walmart and Highway 19.",
    photos: ["walmart-outparcel"], lat: 28.3644, lng: -82.6934
  },
  {
    id: "3662-morris-st-n", title: "3662 & 3612 Morris St N", headline: "Sold by The Outlier Group",
    address: "3662 & 3612 Morris St N", city: "St. Petersburg, FL", county: "Pinellas",
    status: "Sold", statusNote: "Sold", deal: "Sale", type: "Commercial", agent: "mac",
    space: "—", building: "20,557 SF", unit: "—", sfNum: 20557,
    facts: [], highlights: [], desc: "A 20,557 SF property on Morris Street North in St. Petersburg, sold by The Outlier Group.",
    photos: ["morris-st-1", "morris-st-2", "morris-st-3", "morris-st-5", "morris-st-6"], lat: 27.80527, lng: -82.67455
  },
  {
    id: "1962-hawaii-ave-ne", title: "1962 Hawaii Ave NE", headline: "Sold by The Outlier Group",
    address: "1962 Hawaii Ave NE", city: "St. Petersburg, FL", county: "Pinellas",
    status: "Sold", statusNote: "Sold", deal: "Sale", type: "Residential", agent: "laurie",
    space: "—", building: "—", unit: "—", sfNum: 0,
    facts: [], highlights: [], desc: "A residential property in Venetian Isles, St. Petersburg, sold by The Outlier Group.",
    photos: ["hawaii-ave-1", "hawaii-ave-2", "hawaii-ave-4", "hawaii-ave-7", "hawaii-ave-8"], lat: 27.81542, lng: -82.59156
  },
  {
    id: "1322-pelican-creek-crossing", title: "1322 Pelican Creek Crossing, Apt C", headline: "Sold by The Outlier Group",
    address: "1322 Pelican Creek Crossing, Apt C", city: "St. Petersburg, FL", county: "Pinellas",
    status: "Sold", statusNote: "Sold", deal: "Sale", type: "Residential", agent: "laurie",
    space: "1,195 SF", building: "—", unit: "1,195 SF", sfNum: 1195,
    facts: [], highlights: [], desc: "A 1,195 SF residential unit at Pelican Creek Crossing, sold by The Outlier Group.",
    photos: ["pelican-creek-1", "pelican-creek-2", "pelican-creek-5", "pelican-creek-6", "pelican-creek-7"], lat: 27.75439, lng: -82.72439
  },

  /* ── OFF-MARKET (shown in the Client Portal; details released after a signed NDA)
        Keep exact addresses, pricing and financials OUT of this file — anything here
        is readable in the page source. The Apps Script has the internal property names. ── */
  {
    id: "om-largo-office-medical", offMarket: true, title: "Confidential Office / Medical Opportunity",
    region: "Largo · Pinellas County", city: "Largo, FL", county: "Pinellas",
    status: "Off-Market", deal: "Lease", type: "Medical", typeLabel: "Office / Medical", agent: "laurie",
    space: "1,743 SF (Units 201/203)", building: "33,518 SF", unit: "1,743 SF", sfNum: 1743,
    teaser: "Second-floor office/medical suites in an established professional center with ample parking and strong visibility on a major Pinellas corridor.",
    photos: ["largo-professional-center"]
  },
  {
    id: "om-st-pete-development-site", offMarket: true, title: "Confidential Development Site",
    region: "St. Petersburg · Pinellas County", city: "St. Petersburg, FL", county: "Pinellas",
    status: "Off-Market", deal: "Sale", type: "Land", typeLabel: "Development Site", agent: "mac",
    space: "35,653 SF / 0.82 AC", building: "7,812 SF (concrete)", unit: "—", sfNum: 35653,
    teaser: "A 0.82-acre assemblage with an existing 7,812 SF concrete building in one of St. Petersburg's fastest-changing districts.",
    photos: ["svc-developing"]
  },
  {
    id: "om-brooksville-commercial", offMarket: true, title: "Confidential Commercial Opportunity",
    region: "Brooksville · Hernando County", city: "Brooksville, FL", county: "Hernando",
    status: "Off-Market", deal: "Sale", type: "Commercial", agent: "mac",
    space: "—", building: "—", unit: "—", sfNum: 0,
    teaser: "A commercial property on a primary Hernando County corridor, available to qualified buyers before it reaches the open market.",
    photos: []
  },
  {
    id: "om-tampa-downtown-assemblage", offMarket: true, title: "Confidential Downtown Tampa Assemblage",
    region: "Downtown Tampa · Hillsborough County", city: "Tampa, FL", county: "Hillsborough",
    status: "Off-Market", deal: "Sale", type: "Mixed Use", typeLabel: "Multi-Parcel Assemblage", agent: "mac",
    space: "—", building: "—", unit: "—", sfNum: 0,
    teaser: "A multi-parcel opportunity in the Downtown Tampa core, suited to investors and developers.",
    photos: []
  },
  {
    id: "om-tampa-office", offMarket: true, title: "Confidential Office Building",
    region: "Tampa · Hillsborough County", city: "Tampa, FL", county: "Hillsborough",
    status: "Off-Market", deal: "Sale", type: "Office", agent: "mac",
    space: "4,018 SF", building: "4,018 SF", unit: "—", sfNum: 4018,
    teaser: "A freestanding office building in north Tampa, offered quietly to qualified owner-users and investors.",
    photos: ["bullard-parkway"]
  },
  {
    id: "om-downtown-tampa-office", offMarket: true, title: "Confidential Downtown Office Building",
    region: "Downtown Tampa · Hillsborough County", city: "Tampa, FL", county: "Hillsborough",
    status: "Off-Market", deal: "Sale", type: "Office", agent: "mac",
    space: "18,483 RSF", building: "18,483 RSF", unit: "—", sfNum: 18483,
    teaser: "An 18,483 rentable-square-foot building at a Downtown Tampa corner, available to qualified investors under NDA.",
    photos: []
  },

  /* ── PAST PORTFOLIO (from outliergroup.us/outlierportfolio; not on the 2026 spreadsheet) ── */
  { id: "27662-cashford-circle", past: true, title: "27662 Cashford Circle", headline: "Freestanding Medical Space", address: "27662 Cashford Circle", city: "Wesley Chapel, FL", county: "Pasco", status: "Past Listing", statusNote: "100% Occupied", deal: "Lease", type: "Medical", agent: "mac", space: "4,275 SF", building: "4,275 SF", unit: "—", sfNum: 4275, facts: [], highlights: [], desc: "A freestanding medical space in a professional park. 100% occupied.", photos: ["cashford-circle"], lat: 28.2405, lng: -82.3273 },
  { id: "dunkin-outparcel", past: true, title: "Dunkin'® Outparcel", headline: "2+ Acres on Highway 19", address: "US Highway 19", city: "Hudson, FL", county: "Pasco", status: "Past Listing", statusNote: "For Sale", deal: "Sale", type: "Land", agent: "mac", space: "87,120 SF (2+ AC)", building: "—", unit: "—", sfNum: 87120, facts: [], highlights: [], desc: "2+ acres of buildable land adjacent to Dunkin'® with 200 ft of frontage on Highway 19.", photos: ["dunkin-outparcel"], lat: 28.3644, lng: -82.6934 },
  { id: "8680-n-atlantic-ave", past: true, title: "8680 N. Atlantic Avenue", headline: "Freestanding Office on the Space Coast", address: "8680 N. Atlantic Avenue", city: "Cape Canaveral, FL", county: "Brevard", status: "Past Listing", statusNote: "Available", deal: "Lease", type: "Office", agent: "mac", space: "6,338 SF", building: "6,338 SF", unit: "—", sfNum: 6338, facts: [], highlights: [], desc: "A freestanding office plaza on the Space Coast with frontage on Atlantic Avenue.", photos: ["atlantic-avenue"], lat: 28.3922, lng: -80.6077 },
  { id: "la-viva-plaza", past: true, title: "La Viva Plaza", headline: "Mixed-Use Plaza in Brandon", address: "La Viva Plaza", city: "Brandon, FL", county: "Hillsborough", status: "Past Listing", statusNote: "100% Occupied", deal: "Lease", type: "Mixed Use", agent: "mac", space: "60,100 SF", building: "60,100 SF", unit: "—", sfNum: 60100, facts: [], highlights: [], desc: "La Viva Plaza, located in Brandon, Florida — 100% occupied.", photos: ["la-viva-plaza"], lat: 27.9378, lng: -82.2611 },
  { id: "2901-central-ave", past: true, title: "2901 Central Ave.", headline: "Grand Central District Development", address: "2901 Central Ave.", city: "St. Petersburg, FL", county: "Pinellas", status: "Past Listing", statusNote: "For Sale or Lease", deal: "Sale", type: "Mixed Use", agent: "mac", space: "10,000 SF", building: "10,000 SF", unit: "—", sfNum: 10000, facts: [], highlights: [], desc: "Located on the Central Ave. corridor in the Grand Central District, prime for development.", photos: ["2901-central-ave"], lat: 27.7712, lng: -82.6720 },
  { id: "bay-west-plaza", past: true, title: "Bay West Plaza", headline: "Neighborhood Plaza in Town 'N' Country", address: "Bay West Plaza", city: "Tampa, FL", county: "Hillsborough", status: "Past Listing", statusNote: "Available", deal: "Lease", type: "Retail", agent: "mac", space: "7,334 SF", building: "7,334 SF", unit: "—", sfNum: 7334, facts: [], highlights: [], desc: "A neighborhood plaza fronting the Bay West Club community in Town 'N' Country.", photos: ["bay-west-plaza"], lat: 28.0100, lng: -82.5770 },
  { id: "crystal-river-shopping-plaza", past: true, title: "Crystal River Shopping Plaza", headline: "Winn-Dixie Anchored Retail", address: "Crystal River Shopping Plaza", city: "Crystal River, FL", county: "Citrus", status: "Past Listing", statusNote: "For Sale", deal: "Sale", type: "Retail", agent: "mac", space: "54,000 SF", building: "54,000 SF", unit: "—", sfNum: 54000, facts: [], highlights: [], desc: "Winn-Dixie anchored retail plaza with ample parking and excellent visibility.", photos: ["crystal-river-shopping-plaza"], lat: 28.9025, lng: -82.5926 },
  { id: "4180-central-ave", past: true, title: "4180 Central Ave.", headline: "Renovated Mixed-Use Property", address: "4180 Central Ave.", city: "St. Petersburg, FL", county: "Pinellas", status: "Past Listing", statusNote: "For Sale", deal: "Sale", type: "Mixed Use", agent: "mac", space: "2,747 SF", building: "2,747 SF", unit: "—", sfNum: 2747, facts: [], highlights: [], desc: "Fully renovated mixed-use property on the Central Ave. corridor.", photos: ["4180-central-ave"], lat: 27.7710, lng: -82.6887 },
  { id: "south-street-plaza", past: true, title: "South Street Plaza", headline: "Retail Plaza in the Milk District", address: "Bumby Ave & South Street", city: "Orlando, FL", county: "Orange", status: "Past Listing", statusNote: "100% Occupied", deal: "Lease", type: "Retail", agent: "mac", space: "8,209 SF", building: "8,209 SF", unit: "—", sfNum: 8209, facts: [], highlights: [], desc: "A retail plaza on Bumby Avenue and South Street in the Milk District — 100% occupied.", photos: ["south-street-plaza"], lat: 28.5390, lng: -81.3570 },
  { id: "2901-1st-ave-n", past: true, title: "2901 1st Ave. North", headline: "Freestanding Office in Grand Central", address: "2901 1st Ave. North", city: "St. Petersburg, FL", county: "Pinellas", status: "Past Listing", statusNote: "100% Occupied", deal: "Lease", type: "Office", agent: "mac", space: "2,764 SF", building: "2,764 SF", unit: "—", sfNum: 2764, facts: [], highlights: [], desc: "Freestanding office building in the highly-trafficked Grand Central district — 100% occupied.", photos: ["1st-ave-north"], lat: 27.7728, lng: -82.6725 },
  { id: "2828-central-ave", past: true, title: "2828 Central Ave.", headline: "Freestanding Building on Central Ave.", address: "2828 Central Ave.", city: "St. Petersburg, FL", county: "Pinellas", status: "Past Listing", statusNote: "100% Occupied", deal: "Lease", type: "Office", agent: "mac", space: "3,388 SF", building: "3,388 SF", unit: "—", sfNum: 3388, facts: [], highlights: [], desc: "Freestanding building in a high-growth market with frontage on Central Ave. — 100% occupied.", photos: ["2828-central-ave"], lat: 27.7708, lng: -82.6710 }
];

/* Client profiles for the Client Portal (from Outlier's client-needs matrix) */
const CLIENT_PROFILES = [
  { key: "buyer", type: "Buyer / Owner-User", need: "Want to find a location suitable for their business to operate out of.", deal: "Sale" },
  { key: "investor", type: "Investor", need: "Want properties that produce income.", deal: "Sale" },
  { key: "tenant", type: "Tenant", need: "Want to find a location suitable for their business to operate out of.", deal: "Lease" },
  { key: "landlord", type: "Landlord", need: "Want qualified tenants for their space.", deal: "Lease" },
  { key: "developer", type: "Developer", need: "Want land to develop and tenants to lease the finished building.", deal: "Sale" }
];

/* Photo path helper */
function photoPath(name) {
  if (!name) return "";
  const site = ["svc-developing", "svc-consulting", "svc-brokering", "hero"];
  return (site.includes(name) ? "assets/img/site/" : "assets/img/listings/") + name + ".jpg";
}

/* FAQ — text from outliergroup.us */
const FAQ = [
  { q: "Why should I choose The Outlier Group?", a: "Here at The Outlier Group, we take a strategic partnership approach. We treat your investment strategies as if they were our own. At our core, we are very black and white. From consulting to transacting, we keep our model simple. Our partners appreciate our uncomplicated approach." },
  { q: "What does The Outlier Group specialize in?", a: "While the majority of our specialty is on Commercial Real Estate, we understand many of our investors hold a blended portfolio, representing both commercial and residential assets. We want to provide a brokerage that allows our investors to thrive, building on rapport and relationships while managing all aspects of their real estate needs." },
  { q: "What term is required in your Listing Agreement?", a: "Our Listing Agreement does not lock the Seller, Landlord or prospective Tenant into a fixed annual contract. We take a partnership approach. If for any reason you are unhappy with our services, we allow you to cancel for any reason with only 30 days notice. We believe our results speak for themselves, but we'll let you be the judge of that." },
  { q: "How is my property marketed?", a: "We advertise on every major real estate platform, campaigning to top-performing brokers, buyers, tenants, and the like. Our technology allows us to leverage the power of digital advertising. In addition to our cutting edge technology, we also utilize tried and true traditional marketing methods, such as canvassing the streets, cold-calling, and networking to coordinate the best fit for your needs." },
  { q: "What kind of Tenants do you represent?", a: "We represent National, Regional, and Local Tenants. From established corporations to up and coming brands, our Tenant Representatives can help you strategize to find an ideal location that best suits your needs." }
];
