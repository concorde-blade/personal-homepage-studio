import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { site, homeContent, assetPath } from "@/components/personal/data";
import classNames from "classnames";
import { SketchBackground, PointerTrail } from "@/components/personal";
import { editorial } from "@/resources/once-ui.config";

import { Column, Flex, Meta } from "@once-ui-system/core";
import { Footer, Header, RouteGuard, Providers } from "@/components";
import { baseURL, fonts, style, dataStyle, home, person } from "@/resources";

export async function generateMetadata() {
  return {
    title: site.title,
    description: site.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || site.url || "http://127.0.0.1:3307"),
    openGraph: {
      title: site.title,
      description: site.description,
      images: [
        new URL(
          assetPath(homeContent.cover),
          process.env.NEXT_PUBLIC_SITE_URL || site.url || "http://127.0.0.1:3307",
        ).href,
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang={person.locale ?? "en"}
      data-scroll-behavior="smooth"
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
        editorial.variable,
      )}
    >
      <head>
        {process.env.NEXT_PUBLIC_CONTENT_REVISION && (
          <meta
            name="homepage-content-revision"
            content={process.env.NEXT_PUBLIC_CONTENT_REVISION}
          />
        )}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = 'light';
                  
                  // Set defaults from config
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};
                  
                  // Apply default values
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });
                  
                  // Resolve theme
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  // Apply saved theme
                  const savedTheme = localStorage.getItem('data-theme') || defaultTheme;
                  if (!localStorage.getItem('data-theme')) localStorage.setItem('data-theme', savedTheme);
                  const resolvedTheme = resolveTheme(savedTheme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  // Apply any saved style overrides
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <Providers>
        <Column
          as="body"
          background="page"
          fillWidth
          style={{ minHeight: "100vh" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <SketchBackground />
          <PointerTrail />
          <Header name={site.name} tagline={site.tagline} />
          <Flex as="main" className="personal-main" fillWidth horizontal="center" flex={1}>
            <Flex horizontal="center" fillWidth minHeight="0">
              <RouteGuard>{children}</RouteGuard>
            </Flex>
          </Flex>
          <Footer name={site.name} showSampleNotes={site.showSampleNotes} />
        </Column>
      </Providers>
    </Flex>
  );
}
