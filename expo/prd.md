# GutScore Product Requirements Document

## Executive Summary

GutScore is a B2C mobile app that leverages AI photo scanning and personalized gut health analytics to help users identify trigger foods, optimize meal choices for digestive wellness, and track microbiome-friendly eating patterns. Unlike calorie trackers, GutScore rates foods for FODMAP levels, fermentation risk, fiber diversity, and probiotic impact—enabling users with IBS, SIBO, and general gut concerns to make real-time food decisions. Target launch: Q1 2026. Revenue target: $10K MRR within 12 months via freemium model with 1,500-2,000 paid subscribers at $4.99-9.99/month.

---

## 1. Product Overview

### 1.1 Problem Statement

- **Primary Pain**: Users with IBS, SIBO, and dysbiosis lack quick, actionable guidance on whether a meal is "gut-safe." Existing calorie trackers (MyFitnessPal, Cronometer) ignore digestive health; specialized FODMAP apps require manual entry.[web:98][web:104]
- **Secondary Pain**: Food triggers vary per individual microbiome. Users waste time experimenting with elimination diets without data linking symptoms to specific foods.[web:101][web:106]
- **Market Signal**: Reddit IBS communities grow 15%+ YoY; TikTok "gut health reset" content hits 2B+ views; similar apps (ZOE, Oh My Gut, Bioma) scale organically to 100K+ downloads.[web:95][web:98][web:101]

### 1.2 Solution

GutScore provides:
- **AI Meal Scanner**: Photo-based food recognition scoring meals on 4 gut health dimensions (FODMAPs, fermentation, diversity, prebiotics)
- **Personalized Trigger Detection**: Symptom logging + meal correlation identifies individual IBS/SIBO triggers
- **Real-Time Alternatives**: Instant safe food swaps ("Swap onion for garlic, bloating risk drops 60%")
- **Social Accountability**: Optional friend sharing for motivation (freemium, not primary)

### 1.3 Market Opportunity

- **TAM**: 77M+ IBS sufferers globally; $8.2B gut health supplement market; 34% of consumers now prioritize digestive wellness.[web:95][web:101][web:109]
- **SAM**: 15M English-speaking IBS sufferers in North America + Europe willing to pay for digital health tools
- **SOM**: Capture 1.5-2K paying users in 12 months = $10K MRR (conservative, based on competitor benchmarks)

---

## 2. Target User

### 2.1 Primary User Persona

**Name**: Sarah, 28, Marketing Manager

- **Profile**: Recently diagnosed with IBS; frustrated with bloating, unpredictable symptoms; tried low-FODMAP diet but struggles with meal planning
- **Goals**: Identify trigger foods fast, feel confident eating out, reduce bloating by 50%
- **Pain Points**: Manual FODMAP app entry takes 5 min/meal; can't scan restaurant menus; misses social eating
- **Willingness to Pay**: $6-10/month for certainty and time savings

### 2.2 Secondary User Personas

- **Wellness Enthusiasts**: Prebiotic/probiotic seekers optimizing microbiome (Gen Z TikTok audience)
- **SIBO Patients**: Severe food restrictions; high willingness to pay ($9.99/month+)
- **Caregivers**: Parents tracking kids' digestive health

### 2.3 User Segmentation Strategy

| Segment | Size | Conversion | Key Feature |
|---------|------|-----------|------------|
| IBS/SIBO Diagnosed | 40% | 25-30% to paid | Trigger detection, symptom logging |
| Wellness Curious | 40% | 8-12% to paid | Trending foods, micro notifications |
| Caregivers/Families | 20% | 15-20% to paid | Family sharing, shared meal planning |

---

## 3. Core Features

### 3.1 MVP Features (Launch, Weeks 1-8)

#### 3.1.1 AI Meal Scanner
- **Functionality**: Users snap photo of meal; OpenAI Vision API identifies foods; outputs 4 gut scores (0-100):
  - **FODMAP Risk**: Red (high trigger), yellow (moderate), green (safe)
  - **Fermentation Index**: Gas/bloat likelihood
  - **Fiber Diversity**: Prebiotic variety score
  - **Probiotic Boost**: Fermented food impact
- **UX**: Single-tap photo, 3-second analysis, color-coded card output
- **Data Source**: Internal DB of 5,000+ foods + micronutrient APIs (USDA, FatSecret)

#### 3.1.2 Meal History & Trends
- **Functionality**: Logs all scanned meals with gut scores; weekly trends showing "Avg Fiber Diversity: 65/100" with charts
- **UX**: Calendar view with color-coded days; exportable PDF for doctors
- **Retention**: Streak counter ("7 days of gut-friendly eating")

#### 3.1.3 Symptom Logger
- **Functionality**: Users optionally log bloating/cramping/energy (1-10 scale); AI correlates meals to symptoms
- **UX**: Quick 10-second symptom check-in post-meal or end-of-day
- **Output**: "Your top triggers: onions, wheat, dairy" (after 50+ logs)

#### 3.1.4 Freemium Paywall
- **Free Tier**: 3 scans/day; basic history (7 days); ads
- **Pro Tier ($4.99/month)**: Unlimited scans, 6-month history, no ads, trigger reports
- **Premium Tier ($9.99/month)**: AI chat coach, symptom integrations, family sharing

### 3.2 Post-Launch Features (Months 3-6)

#### 3.2.1 AI Gut Coach (Premium)
- Chat interface: "Why does dairy make me bloated?" → AI explains lactose + FODMAP interaction
- Proactive alerts: "You're low on fiber this week—eat more leafy greens"
- Personalized meal plans: Auto-generates 3-day plans from scanned pantry items

#### 3.2.2 Safe Food Swaps
- On meal scan, instant alternative suggestions: "High FODMAP detected. Try: low-FODMAP carrots (+95 score)"
- Shopping list integration: Add recommended foods directly

#### 3.2.3 Wearable Integrations (Premium)
- Sync with Fitbit/Apple Health: Correlate stress, sleep, heart rate with gut symptoms
- Example: "High cortisol days = 2x bloating risk"

#### 3.2.4 Social Features (Optional, Low Priority)
- Friend leaderboard: "You: 85 gut score avg this week vs. Friend: 72" (private, opt-in)
- Shared meal planning: Couples/families coordinate gut-safe dinners

---

## 4. Monetization Strategy

### 4.1 Revenue Model: Freemium Subscription

| Tier | Price | Monthly Scans | History | Features | Target Users |
|------|-------|---------------|---------|----------|-------------|
| **Free** | $0 | 3/day (90/mo) | 7 days | Scanner, trends, ads | Awareness, trial |
| **Pro** | $4.99 | Unlimited | 6 months | Scanner, trigger reports, no ads, symptom logs | Core IBS audience (70% of paid) |
| **Premium** | $9.99 | Unlimited | Full history | All Pro + AI coach, integrations, family sharing (3 users) | SIBO, serious optimization, families (30% of paid) |

### 4.2 Conversion Assumptions

- **Free-to-Paid**: 10-15% conversion (conservative vs. health app benchmarks of 15-25%)
- **Downloads to Free Users**: 10K in Year 1 (organic growth via TikTok, Reddit, App Store)
- **Paid Users Target**: 1,500 Pro + 500 Premium = 2,000 total
  - Revenue: (1,500 × $4.99) + (500 × $9.99) = $12,490/month (target: $10K by month 12)

### 4.3 Pricing Justification

- **Pro ($4.99)**: Addresses core need (unlimited scans, 6-month history, triggers) vs. free 3-scan limit
- **Premium ($9.99)**: AI coaching premium; wearable sync justifies 2x price for serious users
- **Annual Discount**: $49.99/year Pro (16% discount), $99.99 Premium (17% discount) to boost LTV

### 4.4 Expansion Revenue (Months 9+)

- **B2B Partnerships**: License trigger data to FODMAP recipe sites, supplement brands (affiliate links)
- **White-label API**: RD/nutritionist tools pay $100/month to embed GutScore scanner in their practices
- **Premium Content**: $2.99 add-on for "IBS Cookbook" (50+ verified gut-safe recipes)

---

## 5. User Journey & Onboarding

### 5.1 Discovery → Activation

**Week 0-1: Awareness**
- Organic channels: Reddit r/IBS, r/SIBO, TikTok (#guthealth, #IBSrelief)
- Messaging: "Snap. Score. Heal. Know your food triggers in 3 seconds."
- Landing page: "See if your breakfast is IBS-safe" (interactive demo)

**Week 1-2: Sign-Up & Onboarding**
- Email/phone signup (minimal friction)
- Permission requests: Camera, health data (optional for premium)
- Guided first scan: "Scan your breakfast" with 2-3 celebrity meals pre-loaded for testing
- Immediate aha moment: "Your oatmeal scores 82/100 (safe!)"

### 5.2 Engagement Loop (Weeks 2-4)

- **Day 3**: Push notification: "You've scanned 5 meals—enable symptom logging to find triggers"
- **Day 7**: Streak notification + first trigger report ("Your top triggers emerging: dairy, high-FODMAP veggies")
- **Day 14**: "Upgrade to Pro to unlock 6-month history & AI coach" (unlock after 90 free scans used)

### 5.3 Retention Loops

- **Weekly**: Trend email: "Your gut health score this week: 78/100 (↑5% from last week)"
- **Monthly**: Premium upsell: "SIBO sufferers save 3 hrs/week with AI meal plans—try Premium free"
- **Quarterly**: New content: "Seasonal low-FODMAP recipes" (push notification)

---

## 6. Product Specifications

### 6.1 Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Frontend** | React Native (Expo) | Cross-platform iOS/Android, fast iteration [web:103] |
| **Backend** | Node.js + Express | Fast API, easy OpenAI integration |
| **Database** | Firebase Firestore | Real-time sync, no ops overhead |
| **AI Vision** | OpenAI Vision API | Accurate food recognition, ~$0.005/scan cost |
| **Nutrition DB** | USDA FoodData Central API | Free, 400K+ foods, FODMAP data |
| **Payments** | Stripe | Standard SaaS subscriptions |
| **Hosting** | Firebase/AWS | Scalable, serverless |

### 6.2 MVP Data Model (Simplified)

User
├─ id, email, phone
├─ subscription_tier (free/pro/premium)
├─ microbiome_profile (optional: allergies, IBS type, age)
└─ created_at

Meal
├─ id, user_id
├─ photo_url
├─ food_list (from Vision API)
├─ gut_scores {fodmap, fermentation, fiber_diversity, probiotic}
├─ overall_score (0-100)
├─ logged_at
└─ optional_symptoms {bloating, cramping, energy}

Trigger (derived from ML analysis)
├─ user_id, food_name
├─ confidence_score (0-100, requires 20+ logs)
├─ avg_symptom_response (bloating_intensity, etc.)

### 6.3 AI Scoring Logic (Simplified)

**FODMAP Risk (0-100 safe → 100 high risk)**
- Low-FODMAP foods (carrots, rice, chicken): 20-30
- Moderate (garlic, wheat, beans): 60-75
- High (onions, honey, stone fruits): 85-100
- AI adjusts based on portion size detected in photo

**Fermentation Index (likelihood of gas)**
- High-fiber foods → +20 (if also high-FODMAP)
- Legumes → +40
- Cruciferous veggies → +30
- Fermented foods (yogurt, kimchi) → -10 (probiotic benefit)

**Fiber Diversity**
- Points for plant variety (5+ plant families per week = 80+)
- Low diversity = red flag for dysbiosis risk

---

## 7. Success Metrics & KPIs

### 7.1 Growth Metrics

| Metric | Month 3 | Month 6 | Month 12 | Target/Threshold |
|--------|---------|---------|----------|-----------------|
| Downloads | 2K | 5K | 10K+ | 10K+ for viral |
| Active Users (DAU) | 500 | 1.2K | 2.5K | 25% of downloads |
| Free-to-Paid Conversion | 8% | 12% | 15% | 10%+ is healthy |
| Paid Users | 160 | 600 | 2K | 1.5K minimum |
| MRR | $800 | $3K | $10K | $10K target |

### 7.2 Engagement Metrics

| Metric | Target | Threshold |
|--------|--------|-----------|
| Daily Active Users / Monthly Active | 40%+ | Retention strength |
| Scans per User / Week | 3-4 (free), 8+ (pro) | Heavy usage = stickiness |
| Day 7 Retention | 50%+ | Most apps 20-30% |
| Day 30 Retention | 30%+ | Churn baseline |
| Symptom Logging Rate | 30% of users | Personalization driver |

### 7.3 Monetization Metrics

| Metric | Target |
|--------|--------|
| Lifetime Value (LTV): CAC Ratio | 3:1+ |
| Average Revenue Per User (ARPU) | $2.50 (blended) |
| Churn Rate (Monthly) | <7% (SaaS standard) |
| Expansion Revenue (add-ons, API) | 15%+ of MRR by month 12 |

---

## 8. Go-to-Market Strategy

### 8.1 Launch Phase (Month 1-2)

**Soft Launch (Beta, Week 1-2)**
- 500 invite-only iOS (TestFlight) + Android (Google Play internal testing)
- Recruit from: Reddit r/IBS, r/SIBO, Twitter gut health community
- Goal: 50+ daily active testers, feedback on UX/AI accuracy

**Public Launch (Week 3-4)**
- App Store + Google Play release
- Day 1: PR outreach to health tech blogs, Reddit AMAs in r/IBS, r/SIBO
- Landing page optimization for "food trigger scanner" + "FODMAP app"
- Messaging: "Know if your food triggers IBS in 3 seconds"

### 8.2 Growth Phase (Month 2-6)

**Organic Channels (Zero CAC)**
- **Reddit**: 2-3 posts/week in r/IBS, r/GutHealth with genuine advice + soft CTA ("I built this because I have IBS too")
- **TikTok**: 2 videos/week (30-60 sec demos: "Scanning foods IBS sufferers avoid," "My stomach after using this app")
- **Keyword SEO**: Target "low FODMAP app," "IBS food tracker," "gut health scanner" (3-6 month window)
- **Influencers (Micro)**: Partner with 5-10K follower IBS/wellness creators; free Premium tier; ask for honest review

**Paid Channels (Month 3+, if organic plateaus)**
- TikTok Ads: $500-1K/week targeting "wellness" + "health" audiences; goal: $3-5 CAC for iOS downloads
- Reddit Ads: $200-300/week in r/IBS; lower volume but high-intent users
- Google App Campaigns: Automatic targeting on "FODMAP," "IBS tracker" keywords

### 8.3 Retention & Expansion (Month 6+)

- **Email Nurture**: Weekly trend reports for free users ("Your gut health score this week + tips")
- **Push Notifications**: Trigger-based ("Low on fiber," "Haven't scanned today," "Streak anniversary")
- **Content Marketing**: Blog posts (12-15/year): "5 High-FODMAP Foods You Didn't Know" (organic traffic to landing page)
- **Partnerships**: Approach FODMAP diet apps, IBS support groups for cross-promotion

---

## 9. Competitive Landscape

### 9.1 Direct Competitors

| App | Strengths | Weaknesses | GutScore Advantage |
|-----|-----------|-----------|-------------------|
| [nav_link:ZOE] | Premium blood work integration, personalized | $200+ upfront, B2C niche | Faster onboarding, FODMAP-focused |
| [nav_link:Oh My Gut] | IBS-specific, FODMAP scanner | Limited food DB, UI clunky | Better UX, AI coach (premium) |
| [nav_link:Bioma] | Microbiome testing | Expensive ($130), requires stool kit | No upfront cost, instant feedback |
| Low-FODMAP Apps (My FODMAP, Spoonful) | Cheap, simple | No AI, manual entry tedious | AI photo scanning, personalization |

### 9.2 Competitive Advantages

1. **AI Photo Scanning**: Instant 3-second analysis vs. 5-min manual entry (time = money for busy users)
2. **Gut-Specific Scoring**: 4-dimensional gut health vs. generic nutrition (addresses real pain)
3. **Trigger Detection**: Symptom correlation finds individual triggers vs. generic FODMAP lists
4. **Price Point**: $4.99/month vs. $9.99-20+/month competitors; $29.99/year undercuts yearly subscriptions
5. **No Upfront Cost**: Unlike Bioma/ZOE, start free, no blood tests needed (lower friction)

---

## 10. Risk & Mitigation

### 10.1 Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **AI Misidentifies Foods** | High | User distrust, 1-star reviews | Accuracy testing (500 meals, RD validation) before launch; feedback loop to improve Vision API prompts |
| **Low Conversion (<5%)** | Medium | Miss $10K MRR target | A/B test paywall placement; run cohort analysis; optimize onboarding funnel (Day 3 CTR) |
| **High Churn (>10%/mo)** | Medium | Unsustainable LTV | Engagement loops (streaks, weekly emails); premium feature lock-in; community building |
| **Privacy Concerns** (photo data) | Medium | Regulatory, user loss | HIPAA-like handling; data deletion on request; transparent privacy policy; no third-party sharing |
| **Competitors Launch Better UX** | Medium | Market share loss | Fast iteration (2-week sprints); user feedback loop; focus on gut-specific niche vs. generic wellness |
| **Trademark/FODMAP Patent** | Low | Legal friction | FODMAP data from public USDA DB; trademark check early; avoid claims like "medically proven" |

### 10.2 Mitigation Roadmap

- **Pre-Launch**: RD review of scoring logic; HIPAA compliance audit; trademark search
- **Month 1-3**: Weekly user interviews (10-15 users); churn cohort analysis; competitor monitoring
- **Month 4-6**: Scale paid ads only if organic CAC < $3; freeze feature development if churn >10%

---

## 11. Roadmap

### Phase 1: MVP Launch (Now → Month 2)

**Goals**: 500 active users, 10-15 paid subscribers, validate AI accuracy

- Week 1-4: Core features (scanner, history, freemium paywall)
- Week 5-6: Beta testing & RD validation
- Week 7-8: Public launch, Reddit/TikTok seeding

**Deliverables**:
- iOS & Android apps (Expo build)
- 5K+ food DB with FODMAP data
- OpenAI Vision API integration
- Stripe subscriptions

### Phase 2: Growth & Engagement (Month 3-6)

**Goals**: 5K downloads, 600+ paid users, $3K MRR, refine onboarding

- Add trigger detection (after 50 logs per user)
- Symptom logging UI
- Weekly trend email
- TikTok/Reddit organic growth

**Deliverables**:
- Trigger detection ML model
- Email template system
- Analytics dashboard (retention, conversion)

### Phase 3: Premium Features (Month 7-12)

**Goals**: 10K+ downloads, 2K paid users, $10K MRR, launch AI coach

- AI gut coach (ChatGPT integration)
- Wearable integrations (Apple Health, Fitbit)
- Family sharing
- Paid content (recipe book)

**Deliverables**:
- Chat interface & prompt engineering
- HealthKit/Fitbit OAuth
- Content management system

### Phase 4: Expansion (Month 13+)

**Goals**: 15K+ paid users, $20K+ MRR, B2B partnerships

- White-label API for RD apps
- B2B partnerships (supplement brands, telemedicine platforms)
- Advanced personalization (ML on user trigger patterns)

---

## 12. Resource & Budget Estimate

### 12.1 Development Team

| Role | Headcount | Monthly Cost | Duration (Months) |
|------|-----------|-------------|-------------------|
| Founder/PM | 1 | $0 (equity) | Full-time, 12+ |
| Full-stack Engineer (React Native + Node) | 1 | $4K-6K | 12+ |
| AI/ML Engineer (Vision API, scoring) | 0.5 | $3K-4K (contract) | Months 1-3, then part-time |
| UI/UX Designer | 0.5 | $2K-3K | Months 1-2, then on-demand |

**Total**: ~$9-13K/month for core team

### 12.2 Operating Costs

| Item | Monthly | Annual |
|------|---------|--------|
| Hosting (Firebase) | $500 | $6K |
| OpenAI Vision API | $200 (estimated 40K calls/month at Month 12) | $2.4K |
| App Store/Play Fees | $200 | $2.4K |
| Cloud & Misc | $300 | $3.6K |
| **Total Opex** | **$1.2K** | **$14.4K** |

### 12.3 Budget Summary

| Phase | Cost | Funding Method |
|-------|------|-----------------|
| MVP (Months 1-3) | $35K | Founder bootstrap or $25K SAFE round |
| Growth (Months 4-6) | $25K | Revenue + small angel |
| Scale (Months 7-12) | $60K | Revenue + seed funding if churn <10% |

**Break-Even**: Month 10-12 ($10K MRR - $1.2K opex - $3K salary = $5.8K free cash, covers $9-13K payroll once team scales)

---

## 13. Success Criteria & Exit Scenarios

### 13.1 Success Milestones

- ✅ **Month 3**: 500 active users, 15+ paid (validates problem-market fit)
- ✅ **Month 6**: 5K downloads, 600 paid, $3K MRR, <8% churn (growth trajectory confirmed)
- ✅ **Month 12**: 10K+ downloads, 2K paid, $10K MRR (original goal achieved; Series A ready)

### 13.2 Success Definition

**Successful**: $10K MRR, 40%+ DAU/MAU, <7% churn, organic growth sustaining

**Pivot Indicators** (if missed):
- Downloads <5K by Month 6 → Pivot to B2B (sell to RD platforms, hospitals)
- Conversion <5% despite optimization → Pivot to education (sell recipes, courses) vs. SaaS
- Churn >10% → Lower price point to $2.99, increase engagement content

---

## 14. Appendix: Assumptions & Notes

### 14.1 Key Assumptions

- 77M IBS sufferers, 0.02% convert = 15K TAM; capture 2K = 13% of TAM (aggressive but reasonable for niche)
- Free-to-paid conversion: 10-15% (health apps average 15-25%, conservative for edge case IBS niche)
- LTV: $200-300 (assuming 18-month average lifespan, $4.99 blended ARPU); CAC: $20-50 (organic + limited paid)
- API costs: $0.005/scan, trending to $0.001 with volume discounts

### 14.2 Definitions

- **MRR**: Monthly Recurring Revenue from subscriptions only (excludes one-time purchases)
- **DAU/MAU**: Daily/Monthly Active Users (logged in, scanned at least once)
- **Churn**: Percentage of paid subscribers canceling monthly
- **Gut Score**: Proprietary 0-100 metric combining FODMAP, fermentation, diversity, prebiotics

### 14.3 Future Enhancements (Post-MVP)

- Genetic microbiome insights (partner with Viome, Everlywell)
- Augmented Reality mode (scan restaurant menu in real-time)
- Offline mode (cached food DB for travel)
- TeleRD integration (book consultations in-app)
- Non-English languages (Spanish, French, German)