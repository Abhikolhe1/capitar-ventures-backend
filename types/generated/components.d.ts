import type { Schema, Struct } from '@strapi/strapi';

export interface HomepageCapitalBenefit extends Struct.ComponentSchema {
  collectionName: 'components_homepage_capital_benefits';
  info: {
    displayName: 'Capital Benefit';
  };
  attributes: {
    artwork: Schema.Attribute.Media<'images'>;
    artworkWidth: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 20;
        },
        number
      > &
      Schema.Attribute.DefaultTo<94>;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    layout: Schema.Attribute.Enumeration<['standard', 'wide', 'tall']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
    mobileArtwork: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageCapitalEfficiency extends Struct.ComponentSchema {
  collectionName: 'components_homepage_capital_efficiencies';
  info: {
    description: 'Homepage capital benefits and original Figma illustrations';
    displayName: 'Capital Efficiency';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    benefits: Schema.Attribute.Component<'homepage.capital-benefit', true>;
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    sectionLabel: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageCapitarDifference extends Struct.ComponentSchema {
  collectionName: 'components_homepage_capitar_differences';
  info: {
    displayName: 'The Capitar Difference';
  };
  attributes: {
    cardBackground: Schema.Attribute.Media<'images'>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'homepage.difference-card', true>;
    sectionLabel: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageCaseStudy extends Struct.ComponentSchema {
  collectionName: 'components_homepage_case_studies';
  info: {
    displayName: 'Case Study';
  };
  attributes: {
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'homepage.case-study-item', true>;
    sectionLabel: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageCaseStudyItem extends Struct.ComponentSchema {
  collectionName: 'components_homepage_case_study_items';
  info: {
    displayName: 'Case Study Card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.Component<'shared.link', false>;
    logo: Schema.Attribute.Media<'images'>;
    metricLabel: Schema.Attribute.String;
    metricSuffix: Schema.Attribute.String;
    metricValue: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    number: Schema.Attribute.String;
  };
}

export interface HomepageDifferenceCard extends Struct.ComponentSchema {
  collectionName: 'components_homepage_difference_cards';
  info: {
    displayName: 'Capitar Difference Card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    number: Schema.Attribute.String;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface HomepageEditorialCard extends Struct.ComponentSchema {
  collectionName: 'components_homepage_editorial_cards';
  info: {
    displayName: 'Editorial card';
  };
  attributes: {
    category: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageEditorialTab extends Struct.ComponentSchema {
  collectionName: 'components_homepage_editorial_tabs';
  info: {
    displayName: 'Editorial tab';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    emptyMessage: Schema.Attribute.String;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'homepage.editorial-card', true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sectionLabel: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageHero extends Struct.ComponentSchema {
  collectionName: 'components_homepage_heroes';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    announcementLink: Schema.Attribute.Component<'shared.link', false>;
    announcementText: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    backgroundImage: Schema.Attribute.Media<'images'>;
    backgroundImageMobile: Schema.Attribute.Media<'images'>;
    backgroundVideo: Schema.Attribute.Media<'videos'>;
    backgroundVideoMobile: Schema.Attribute.Media<'videos'>;
    description: Schema.Attribute.Text;
    emphasisText: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    mobileEmphasisText: Schema.Attribute.String;
    mobileHeading: Schema.Attribute.Text;
    mobileTrustedClientsTitle: Schema.Attribute.String;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    trustedClients: Schema.Attribute.Component<'shared.client-logo', true>;
    trustedClientsTitle: Schema.Attribute.String;
  };
}

export interface HomepageInsightsNews extends Struct.ComponentSchema {
  collectionName: 'components_homepage_insights_news';
  info: {
    displayName: 'Insights and News';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    insights: Schema.Attribute.Component<'homepage.editorial-tab', false> &
      Schema.Attribute.Required;
    news: Schema.Attribute.Component<'homepage.editorial-tab', false> &
      Schema.Attribute.Required;
  };
}

export interface HomepagePortfolioProofPoints extends Struct.ComponentSchema {
  collectionName: 'components_homepage_portfolio_proof_points';
  info: {
    displayName: 'Portfolio & Proof Points';
  };
  attributes: {
    backgroundLeft: Schema.Attribute.Media<'images'>;
    backgroundRight: Schema.Attribute.Media<'images'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    metrics: Schema.Attribute.Component<'homepage.proof-metric', true> &
      Schema.Attribute.Required;
    mutedText: Schema.Attribute.String;
    sectionLabel: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageProofMetric extends Struct.ComponentSchema {
  collectionName: 'components_homepage_proof_metrics';
  info: {
    displayName: 'Proof Metric';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    prefix: Schema.Attribute.String;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    valueSuffix: Schema.Attribute.String;
  };
}

export interface HomepageTeam extends Struct.ComponentSchema {
  collectionName: 'components_homepage_teams';
  info: {
    displayName: 'Capitar Team';
  };
  attributes: {
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    members: Schema.Attribute.Component<'homepage.team-member', true>;
    sectionLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'CAPITAR TEAM'>;
  };
}

export interface HomepageTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_homepage_team_members';
  info: {
    displayName: 'Team member';
  };
  attributes: {
    description: Schema.Attribute.Text;
    linkedinUrl: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    portrait: Schema.Attribute.Media<'images'>;
    portraitPositionY: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<50>;
    role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_homepage_testimonials';
  info: {
    displayName: 'Client testimonial';
  };
  attributes: {
    company: Schema.Attribute.String;
    companyLogo: Schema.Attribute.Media<'images'>;
    companyLogoMonochrome: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    location: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    portrait: Schema.Attribute.Media<'images'>;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

export interface HomepageTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_homepage_testimonial_sections';
  info: {
    displayName: 'Client testimonials';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'homepage.testimonial', true>;
    sectionLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'CLIENT TESTIMONIALS'>;
  };
}

export interface SharedClientLogo extends Struct.ComponentSchema {
  collectionName: 'components_shared_client_logos';
  info: {
    displayName: 'Client logo';
  };
  attributes: {
    height: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<40>;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<120>;
  };
}

export interface SharedFooter extends Struct.ComponentSchema {
  collectionName: 'components_shared_footers';
  info: {
    displayName: 'Website footer';
  };
  attributes: {
    address: Schema.Attribute.Text;
    aiLinks: Schema.Attribute.Component<'shared.footer-shortcut', true>;
    aiText: Schema.Attribute.Text;
    backgroundImage: Schema.Attribute.Media<'images'>;
    backgroundVideo: Schema.Attribute.Media<'videos'>;
    brandLogo: Schema.Attribute.Media<'images'>;
    copyright: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.link', false>;
    ctaHeading: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    legalLinks: Schema.Attribute.Component<'shared.link', true>;
    logoMonochrome: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    navigation: Schema.Attribute.Component<'shared.link', true>;
    phone: Schema.Attribute.String;
    socialLabel: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Social'>;
    socialLinks: Schema.Attribute.Component<'shared.link', true>;
  };
}

export interface SharedFooterShortcut extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_shortcuts';
  info: {
    displayName: 'Footer AI shortcut';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    showIndicator: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface VentureDebtBefore extends Struct.ComponentSchema {
  collectionName: 'components_vd_before';
  info: {
    displayName: 'Venture Debt before';
  };
  attributes: {
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    glowImage: Schema.Attribute.Media<'images'>;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    items: Schema.Attribute.Component<'venture-debt.signal', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 1;
        },
        number
      >;
    mutedHeading: Schema.Attribute.Text;
    sectionLabel: Schema.Attribute.String;
    signalsHeading: Schema.Attribute.Text;
    signalsLabel: Schema.Attribute.String;
    signalsMutedHeading: Schema.Attribute.Text;
  };
}

export interface VentureDebtChapter extends Struct.ComponentSchema {
  collectionName: 'components_vd_chapter';
  info: {
    displayName: 'Venture Debt chapter';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    section: Schema.Attribute.Enumeration<
      ['before', 'with-capitar', 'in-practice', 'before-you-decide']
    > &
      Schema.Attribute.Required;
  };
}

export interface VentureDebtFaq extends Struct.ComponentSchema {
  collectionName: 'components_vd_faq';
  info: {
    displayName: 'Venture Debt faq';
  };
  attributes: {
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'venture-debt.question', true>;
    sectionLabel: Schema.Attribute.String;
  };
}

export interface VentureDebtHero extends Struct.ComponentSchema {
  collectionName: 'components_vd_hero';
  info: {
    displayName: 'Venture Debt hero';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.Text;
    emphasisText: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    glassImage: Schema.Attribute.Media<'images'>;
    glowImage: Schema.Attribute.Media<'images'>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    secondaryCta: Schema.Attribute.Component<'shared.link', false>;
    sectionLabel: Schema.Attribute.String;
  };
}

export interface VentureDebtOutcome extends Struct.ComponentSchema {
  collectionName: 'components_vd_outcome';
  info: {
    displayName: 'Venture Debt outcome';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VentureDebtPractice extends Struct.ComponentSchema {
  collectionName: 'components_vd_practice';
  info: {
    displayName: 'Venture Debt practice';
  };
  attributes: {
    attribution: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    items: Schema.Attribute.Component<'venture-debt.outcome', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
        },
        number
      >;
    outcomeSprite: Schema.Attribute.Media<'images'>;
    quote: Schema.Attribute.Text;
    sectionLabel: Schema.Attribute.String;
  };
}

export interface VentureDebtProcess extends Struct.ComponentSchema {
  collectionName: 'components_vd_process';
  info: {
    displayName: 'Venture Debt process';
  };
  attributes: {
    decoration: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'venture-debt.step', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 1;
        },
        number
      >;
    sectionLabel: Schema.Attribute.String;
  };
}

export interface VentureDebtQuestion extends Struct.ComponentSchema {
  collectionName: 'components_vd_question';
  info: {
    displayName: 'Venture Debt question';
  };
  attributes: {
    answer: Schema.Attribute.Text;
    question: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface VentureDebtSignal extends Struct.ComponentSchema {
  collectionName: 'components_vd_signal';
  info: {
    displayName: 'Venture Debt signal';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface VentureDebtStep extends Struct.ComponentSchema {
  collectionName: 'components_vd_step';
  info: {
    displayName: 'Venture Debt step';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'homepage.capital-benefit': HomepageCapitalBenefit;
      'homepage.capital-efficiency': HomepageCapitalEfficiency;
      'homepage.capitar-difference': HomepageCapitarDifference;
      'homepage.case-study': HomepageCaseStudy;
      'homepage.case-study-item': HomepageCaseStudyItem;
      'homepage.difference-card': HomepageDifferenceCard;
      'homepage.editorial-card': HomepageEditorialCard;
      'homepage.editorial-tab': HomepageEditorialTab;
      'homepage.hero': HomepageHero;
      'homepage.insights-news': HomepageInsightsNews;
      'homepage.portfolio-proof-points': HomepagePortfolioProofPoints;
      'homepage.proof-metric': HomepageProofMetric;
      'homepage.team': HomepageTeam;
      'homepage.team-member': HomepageTeamMember;
      'homepage.testimonial': HomepageTestimonial;
      'homepage.testimonials': HomepageTestimonials;
      'shared.client-logo': SharedClientLogo;
      'shared.footer': SharedFooter;
      'shared.footer-shortcut': SharedFooterShortcut;
      'shared.link': SharedLink;
      'venture-debt.before': VentureDebtBefore;
      'venture-debt.chapter': VentureDebtChapter;
      'venture-debt.faq': VentureDebtFaq;
      'venture-debt.hero': VentureDebtHero;
      'venture-debt.outcome': VentureDebtOutcome;
      'venture-debt.practice': VentureDebtPractice;
      'venture-debt.process': VentureDebtProcess;
      'venture-debt.question': VentureDebtQuestion;
      'venture-debt.signal': VentureDebtSignal;
      'venture-debt.step': VentureDebtStep;
    }
  }
}
