import type { Schema, Struct } from '@strapi/strapi';

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
      'homepage.hero': HomepageHero;
      'homepage.portfolio-proof-points': HomepagePortfolioProofPoints;
      'homepage.proof-metric': HomepageProofMetric;
      'shared.client-logo': SharedClientLogo;
      'shared.link': SharedLink;
    }
  }
}
