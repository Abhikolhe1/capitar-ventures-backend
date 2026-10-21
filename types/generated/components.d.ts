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
    description: Schema.Attribute.Text;
    emphasisText: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    trustedClients: Schema.Attribute.Component<'shared.client-logo', true>;
    trustedClientsTitle: Schema.Attribute.String;
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

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'homepage.capital-benefit': HomepageCapitalBenefit;
      'homepage.capital-efficiency': HomepageCapitalEfficiency;
      'homepage.capitar-difference': HomepageCapitarDifference;
      'homepage.case-study': HomepageCaseStudy;
      'homepage.case-study-item': HomepageCaseStudyItem;
      'homepage.difference-card': HomepageDifferenceCard;
      'homepage.hero': HomepageHero;
      'homepage.portfolio-proof-points': HomepagePortfolioProofPoints;
      'homepage.proof-metric': HomepageProofMetric;
      'shared.client-logo': SharedClientLogo;
      'shared.link': SharedLink;
    }
  }
}
